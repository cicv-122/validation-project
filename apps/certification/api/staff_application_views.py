# apps/certification/api/staff_application_views.py
import urllib.parse
from io import BytesIO
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authentication import TokenAuthentication
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import qrcode
import qrcode.image.svg

from apps.certification.models import (
    CertificationApplication,
    ApplicationDocument,
    Profession,
)
from apps.document.models import CertifiedUser
from .staff_serializers import (
    StaffApplicationListSerializer,
    StaffApplicationDetailSerializer,
    StaffApplicationDocumentSerializer,
    StaffIssueCertificateSerializer,
)
from apps.certification.selectors import get_or_create_staff_for_user
from apps.document.kyrgyz_name_normalizer import normalize_kyrgyz_full_name, split_kyrgyz_fio
from apps.document.kyrgyz_pin_validator import validate_kyrgyz_pin
from apps.document.kyrgyz_translit import transliterate_kyrgyz_ascii


class StaffApplicationsListView(APIView):
    """
    GET /api/v1/staff/applications/
    Список заявок для сотрудника с фильтрацией по статусу и поиском.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        # Суперпользователь и руководитель видят все заявки
        if request.user.is_superuser or staff.role == 'supervisor':
            staff_id = request.query_params.get('staff_id')
            if staff_id:
                qs = CertificationApplication.objects.filter(assigned_staff_id=staff_id)
            else:
                qs = CertificationApplication.objects.all()
        else:
            if staff.assigned_professions.exists():
                qs = CertificationApplication.objects.filter(
                    Q(assigned_staff=staff) | Q(profession_ref__in=staff.assigned_professions.all()) | Q(assigned_staff__isnull=True)
                ).distinct()
            else:
                qs = CertificationApplication.objects.filter(
                    Q(assigned_staff=staff) | Q(assigned_staff__isnull=True)
                ).distinct()

        # Исключаем мягко удаленные и архивные теневые дела реестра
        qs = qs.filter(deleted_at__isnull=True).exclude(origin='registry_archive')

        # Фильтр по статусу
        status_filter = request.query_params.get('status')
        if status_filter:
            if status_filter == 'under_review':
                qs = qs.filter(status__in=['under_review', 'assessment_scheduled', 'assessment_in_progress', 'approved'])
            else:
                qs = qs.filter(status=status_filter)

        # Поиск по ФИО, ИНН, телефону, профессии, номеру
        q = request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(full_name__icontains=q) |
                Q(inn__icontains=q) |
                Q(phone__icontains=q) |
                Q(profession__icontains=q) |
                Q(registration_number__icontains=q) |
                Q(certificate_number_issued__icontains=q)
            )

        qs = qs.select_related('assigned_staff', 'profession_ref').prefetch_related('documents').order_by('-created_at')

        serializer = StaffApplicationListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class StaffApplicationDetailView(APIView):
    """
    GET /api/v1/staff/applications/<int:pk>/
    PATCH /api/v1/staff/applications/<int:pk>/
    Полная информация по заявке кандидата и редактирование любых полей.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_application(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff:
            return None
        if request.user.is_superuser or staff.role == 'supervisor':
            return get_object_or_404(CertificationApplication, pk=pk, deleted_at__isnull=True)
        else:
            if staff.assigned_professions.exists():
                return get_object_or_404(
                    CertificationApplication,
                    Q(assigned_staff=staff) | Q(profession_ref__in=staff.assigned_professions.all()) | Q(assigned_staff__isnull=True),
                    pk=pk,
                    deleted_at__isnull=True
                )
            else:
                return get_object_or_404(
                    CertificationApplication,
                    Q(assigned_staff=staff) | Q(assigned_staff__isnull=True),
                    pk=pk,
                    deleted_at__isnull=True
                )

    def get(self, request, pk):
        app = self.get_application(request, pk)
        if not app:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)
        serializer = StaffApplicationDetailSerializer(app, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        app = self.get_application(request, pk)
        if not app:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        # Полное редактирование личных данных кандидата и дела:
        # ФИО, телефон, whatsapp, email, инн, тип процедуры, профессия, разряд, стаж, адрес, экзамен, статус
        fields = [
            'full_name', 'phone', 'whatsapp', 'email', 'inn',
            'application_type', 'profession', 'qualification_level',
            'experience_years', 'experience_desc', 'address',
            'assessor_name', 'scheduled_date', 'scheduled_location',
            'admin_notes', 'status', 'certificate_number_issued'
        ]

        for field in fields:
            if field in request.data:
                val = request.data[field]
                if field == 'scheduled_date':
                    app.scheduled_date = val or None
                elif field == 'experience_years':
                    try:
                        app.experience_years = int(val) if val is not None and str(val).strip() != '' else 0
                    except (ValueError, TypeError):
                        pass
                elif isinstance(val, str):
                    setattr(app, field, val.strip())
                else:
                    setattr(app, field, val)

        if 'status' in request.data:
            new_status = request.data['status']
            if new_status == 'under_review' and not app.reviewed_at:
                app.reviewed_at = timezone.now()
            if request.data.get('assign_to_me') or (new_status in ('under_review', 'assessment_scheduled') and not app.assigned_staff):
                app.assigned_staff = staff
        elif request.data.get('assign_to_me'):
            app.assigned_staff = staff

        # Если обновлена профессия - привязать Profession если есть
        if 'profession' in request.data:
            prof_str = request.data['profession'].strip()
            p_obj = Profession.objects.filter(name_ru__iexact=prof_str).first() or \
                    Profession.objects.filter(name_ru__icontains=prof_str).first()
            if p_obj:
                app.profession_ref = p_obj

        # Нормализация ФИО при сохранении
        if app.full_name:
            app.full_name = normalize_kyrgyz_full_name(app.full_name)

        # Проверка структуры ИНН / ПИН и конфликта с другим ФИО в реестре
        if 'inn' in request.data and app.inn:
            raw_foreign = request.data.get('is_foreign_citizen', False)
            is_foreign = str(raw_foreign).lower() in ('true', '1', 'yes')
            citizenship = str(request.data.get('citizenship', '') or '').strip()
            is_ok, clean_or_err, _ = validate_kyrgyz_pin(
                app.inn,
                full_name=app.full_name,
                is_foreign=is_foreign,
                citizenship=citizenship,
            )
            if not is_ok:
                return Response(
                    {'detail': clean_or_err, 'inn': [clean_or_err]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            app.inn = clean_or_err

        clean_inn = "".join(filter(str.isdigit, str(app.inn or "")))
        if len(clean_inn) >= 8:
            target_name = normalize_kyrgyz_full_name(app.full_name).strip().lower()
            for other in CertifiedUser.objects.filter(inn=clean_inn).exclude(application=app):
                other_name = normalize_kyrgyz_full_name(other.get_full_name()).strip().lower()
                if target_name and other_name and other_name != target_name:
                    return Response(
                        {'detail': f'Этот ИНН ({clean_inn}) уже привязан к другому специалисту: {other.get_full_name()} ({other.registration_number}).'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        staff = get_or_create_staff_for_user(request.user)
        if staff:
            app.assigned_staff = staff

        app.save()
        serializer = StaffApplicationDetailSerializer(app, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        app = self.get_application(request, pk)
        if not app:
            return Response({'detail': 'Заявка не найдена или уже удалена'}, status=status.HTTP_404_NOT_FOUND)

        # Разрешено удаление на любом этапе по требованию руководства
        app.deleted_at = timezone.now()
        app.save(update_fields=['deleted_at'])

        # Если есть связанный сертифицированный профиль в реестре - удаляем его
        if hasattr(app, 'certified_profile') and app.certified_profile:
            app.certified_profile.delete()

        return Response({'status': 'ok', 'message': 'Заявка успешно перемещена в архив'})


class StaffApplicationStatusUpdateView(APIView):
    """
    PATCH /api/v1/staff/applications/<int:pk>/status/
    Обновление статуса заявки, назначение даты/места экзамена, добавление заметок.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        app = get_object_or_404(CertificationApplication, pk=pk, deleted_at__isnull=True)

        new_status = request.data.get('status')
        if new_status:
            valid_statuses = [choice[0] for choice in CertificationApplication.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return Response({'detail': f'Недопустимый статус: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)
            app.status = new_status
            if new_status == 'under_review' and not app.reviewed_at:
                app.reviewed_at = timezone.now()
            if not app.assigned_staff or request.data.get('assign_to_me'):
                app.assigned_staff = staff
        elif request.data.get('assign_to_me'):
            app.assigned_staff = staff

        if 'scheduled_date' in request.data:
            app.scheduled_date = request.data['scheduled_date'] or None

        if 'scheduled_location' in request.data:
            app.scheduled_location = request.data['scheduled_location'].strip()

        if 'admin_notes' in request.data:
            app.admin_notes = request.data['admin_notes'].strip()

        if 'assessor_name' in request.data:
            app.assessor_name = request.data['assessor_name'].strip()

        app.save()

        serializer = StaffApplicationDetailSerializer(app, context={'request': request})
        return Response(serializer.data)


class StaffApplicationUploadDocumentView(APIView):
    """
    POST /api/v1/staff/applications/<int:pk>/upload-document/
    Загрузка оценочного листа или множества фотографий экзамена сотрудником.
    Поддерживает один файл или пачку файлов (files / file).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        app = get_object_or_404(CertificationApplication, pk=pk, deleted_at__isnull=True)

        files = request.FILES.getlist('files') or request.FILES.getlist('file')
        if not files:
            single = request.FILES.get('file')
            if single:
                files = [single]

        if not files:
            return Response({'detail': 'Выберите хотя бы один файл для загрузки'}, status=status.HTTP_400_BAD_REQUEST)

        doc_type = request.data.get('doc_type', 'assessment_photo')
        description = request.data.get('description', '').strip()

        created_docs = []
        for f in files:
            doc = ApplicationDocument.objects.create(
                application=app,
                doc_type=doc_type,
                file=f,
                description=description,
            )
            created_docs.append(doc)

        # Синхронизация фото 3×4 с профилем в реестре CertifiedUser
        if doc_type == 'photo' and created_docs:
            latest = created_docs[-1]
            try:
                cert_profile = getattr(app, 'certified_profile', None)
                if not cert_profile and app.certificate_number_issued:
                    cert_profile = CertifiedUser.objects.filter(registration_number=app.certificate_number_issued).first()
                if cert_profile:
                    cert_profile.image = latest.file
                    cert_profile.save(update_fields=['image', 'updated_at'])
            except Exception:
                pass

        serializer = StaffApplicationDocumentSerializer(created_docs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StaffApplicationDeleteDocumentView(APIView):
    """
    DELETE /api/v1/staff/applications/<int:pk>/documents/<int:doc_id>/
    Удаление документа или фотографии из дела кандидата.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, doc_id):
        staff = get_or_create_staff_for_user(request.user)
        if not staff:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        doc = get_object_or_404(ApplicationDocument, pk=doc_id, application_id=pk)
        doc.delete()
        return Response({'message': 'Документ успешно удален'}, status=status.HTTP_200_OK)


class StaffIssueCertificateView(APIView):
    """
    POST /api/v1/staff/applications/<int:pk>/issue-certificate/
    Внесение сертифицированного специалиста в единый реестр CertifiedUser
    и присвоение официального номера бланка ЦС № XXXXXX с генерацией QR-кода.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        if request.user.is_superuser:
            app = get_object_or_404(CertificationApplication, pk=pk, deleted_at__isnull=True)
        else:
            app = get_object_or_404(CertificationApplication, pk=pk, assigned_staff=staff, deleted_at__isnull=True)

        serializer = StaffIssueCertificateSerializer(
            data=request.data,
            context={'full_name': app.full_name},
        )
        serializer.is_valid(raise_exception=True)

        raw_number = serializer.validated_data['certificate_number'].strip()
        # Стандартизация формата "ЦС № 000123" или сохранение введенного номера
        if raw_number.isdigit():
            normalized_reg = f"ЦС № {raw_number.zfill(6)}"
        elif not raw_number.startswith("ЦС"):
            normalized_reg = f"ЦС № {raw_number}"
        else:
            normalized_reg = raw_number

        # Проверка уникальности номера в реестре выданных сертификатов
        existing_cert = CertifiedUser.objects.filter(
            Q(registration_number__iexact=normalized_reg) |
            Q(registration_number__icontains=raw_number)
        ).exclude(application=app).first()

        if existing_cert:
            return Response(
                {'detail': f'Сертификат с номером {normalized_reg} уже зарегистрирован за {existing_cert.get_full_name()}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        inn_val = serializer.validated_data.get('inn') or app.inn
        issued_date_val = serializer.validated_data.get('issued_date') or timezone.now().date()

        clean_inn = "".join(filter(str.isdigit, str(inn_val or "")))
        if len(clean_inn) == 14:
            target_name = normalize_kyrgyz_full_name(app.full_name).strip().lower()
            for other in CertifiedUser.objects.filter(inn=clean_inn).exclude(application=app):
                other_name = normalize_kyrgyz_full_name(other.get_full_name()).strip().lower()
                if target_name and other_name and other_name != target_name:
                    return Response(
                        {'detail': f'Этот ИНН ({clean_inn}) уже привязан к другому специалисту: {other.get_full_name()} ({other.registration_number}).'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # Поиск загруженной ранее фотографии кандидата
        photo_doc = app.documents.filter(doc_type='photo').first()
        last_name, first_name, sur_name = split_kyrgyz_fio(app.full_name)

        # Создание или обновление записи CertifiedUser
        certified_user, created = CertifiedUser.objects.get_or_create(
            application=app,
            defaults={
                'registration_number': normalized_reg,
                'last_name': last_name,
                'first_name': first_name,
                'sur_name': sur_name,
                'inn': inn_val,
                'profession': app.profession,
                'issued_date': issued_date_val,
            }
        )

        if not created:
            certified_user.registration_number = normalized_reg
            certified_user.last_name = last_name
            certified_user.first_name = first_name
            certified_user.sur_name = sur_name
            certified_user.inn = inn_val
            certified_user.profession = app.profession
            certified_user.issued_date = issued_date_val

        # Если у кандидата есть фото из заявки и еще нет фото в реестре
        if photo_doc and photo_doc.file and not certified_user.image:
            try:
                certified_user.image.save(
                    f"cert_{certified_user.registration_number.replace(' ', '_')}.jpg",
                    photo_doc.file,
                    save=False
                )
            except Exception:
                pass

        certified_user.save()  # Вызывает генерацию официального QR-кода

        # Обновление заявки
        app.status = 'completed'
        app.certificate_number_issued = normalized_reg
        app.assigned_staff = staff
        if inn_val:
            app.inn = inn_val
        app.save(update_fields=['status', 'certificate_number_issued', 'assigned_staff', 'inn', 'updated_at'])

        return Response({
            'success': True,
            'message': f'Специалист {certified_user.get_full_name()} успешно внесен в государственный реестр!',
            'certified_user_id': certified_user.id,
            'registration_number': certified_user.registration_number,
            'qr_code_url': certified_user.qr_code.url if certified_user.qr_code else None,
            'verify_url': f'/verify/{certified_user.registration_number}',
        }, status=status.HTTP_200_OK)


class StaffApplicationQRCodeDownloadView(APIView):
    """
    GET /api/v1/certification/staff/applications/<int:pk>/qr/?qr_format=svg|png
    Генерирует и отдает на скачивание официальный QR-код сертификата для онлайн-заявки:
    - qr_format=svg (по умолчанию): векторный SVG для CorelDraw.
    - qr_format=png: растровый PNG 300 DPI.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_content_negotiation(self, request, force=False):
        return (None, None)

    def get(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        app = get_object_or_404(CertificationApplication, pk=pk)

        reg_num = app.certificate_number_issued or app.registration_number or f'app_{app.pk}'
        base_url = 'https://validation.kg'
        encoded_reg = urllib.parse.quote(str(reg_num))
        token = getattr(app, 'verification_token', None) or app.registration_number or app.pk
        verify_url = f"{base_url}/verify/{encoded_reg}?token={token}"

        full_name = app.full_name or 'candidate'
        try:
            latin_name = transliterate_kyrgyz_ascii(full_name)
            latin_name = "".join(c for c in latin_name if c.isascii() and (c.isalnum() or c in ('_', '-')))
        except Exception:
            latin_name = "candidate"

        clean_digits = "".join(c for c in str(reg_num) if c.isdigit()) or str(app.pk)
        fmt = (request.query_params.get('qr_format') or request.query_params.get('fmt') or request.query_params.get('format', 'svg')).lower()

        if fmt == 'svg':
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=2,
                image_factory=qrcode.image.svg.SvgPathImage,
            )
            qr.add_data(verify_url)
            qr.make(fit=True)
            img = qr.make_image()
            buffer = BytesIO()
            img.save(buffer)
            data = buffer.getvalue()

            filename = f"QR_CS_{clean_digits}_{latin_name}.svg"
            response = HttpResponse(data, content_type='image/svg+xml; charset=utf-8')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        else:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=25,
                border=3,
            )
            qr.add_data(verify_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            data = buffer.getvalue()

            filename = f"QR_CS_{clean_digits}_{latin_name}.png"
            response = HttpResponse(data, content_type='image/png')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
