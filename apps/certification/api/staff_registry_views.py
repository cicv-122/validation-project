# apps/certification/api/staff_registry_views.py
import urllib.parse
from io import BytesIO
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
import qrcode
import qrcode.image.svg

from apps.certification.models import ApplicationDocument
from apps.document.models import CertifiedUser
from .staff_serializers import (
    StaffCertifiedUserSerializer,
    StaffCertifiedUserUpdateSerializer,
    StaffApplicationDocumentSerializer,
)
from apps.certification.selectors import (
    PROFESSION_CLUSTERS,
    get_or_create_staff_for_user,
)
from apps.document.services import get_or_create_app_for_certified_user
from apps.document.kyrgyz_translit import transliterate_kyrgyz_ascii


class StaffCertifiedUserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class StaffCertifiedUsersListView(APIView):
    """
    GET /api/v1/staff/certified-users/
    Список всех выданных сертификатов для сотрудников (поиск по ФИО, ЦС №, ИНН, профессии, фильтр по наличию ИНН).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        qs = CertifiedUser.objects.select_related('application').all().order_by('-order', '-created_at')

        # Фильтр по наличию ИНН (например, для отбора тех, кому еще не заполнили ИНН)
        has_inn = request.query_params.get('has_inn')
        if has_inn == 'true':
            qs = qs.exclude(inn__isnull=True).exclude(inn='')
        elif has_inn == 'false':
            qs = qs.filter(Q(inn__isnull=True) | Q(inn=''))

        # Фильтр по кластеру профессий
        cluster_key = request.query_params.get('cluster', '').strip()
        if cluster_key and cluster_key in PROFESSION_CLUSTERS:
            cluster_stems = PROFESSION_CLUSTERS[cluster_key]['stems']
            cluster_q = Q()
            for stem in cluster_stems:
                cluster_q |= Q(profession__icontains=stem)
            qs = qs.filter(cluster_q)

        # Поиск с поддержкой умного стемминга профессий
        q = request.query_params.get('q', '').strip()
        if q:
            q_lower = q.lower()
            expanded_stems = set()
            for group in PROFESSION_CLUSTERS.values():
                for stem in group['stems']:
                    if stem in q_lower or (len(q_lower) >= 3 and q_lower.startswith(stem[:3])):
                        expanded_stems.update(group['stems'])
                        break

            base_match = (
                Q(last_name__icontains=q) |
                Q(first_name__icontains=q) |
                Q(sur_name__icontains=q) |
                Q(registration_number__icontains=q) |
                Q(inn__icontains=q) |
                Q(profession__icontains=q) |
                Q(application__phone__icontains=q) |
                Q(application__whatsapp__icontains=q)
            )

            if expanded_stems:
                profession_matches = Q()
                for stem in expanded_stems:
                    profession_matches |= Q(profession__icontains=stem)
                qs = qs.filter(base_match | profession_matches)
            else:
                qs = qs.filter(base_match)

        paginator = StaffCertifiedUserPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = StaffCertifiedUserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)


class StaffCertifiedUserDetailView(APIView):
    """
    GET /api/v1/staff/certified-users/<int:pk>/
    PATCH /api/v1/staff/certified-users/<int:pk>/
    Просмотр и редактирование дела сертифицированного специалиста.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_user_object(self, pk):
        user_obj = CertifiedUser.objects.filter(pk=pk).first()
        if not user_obj:
            clean_digits = ''.join(c for c in str(pk) if c.isdigit())
            if clean_digits:
                user_obj = CertifiedUser.objects.filter(registration_number__icontains=clean_digits).first()
        if not user_obj:
            raise Http404("Дело специалиста не найдено")
        return user_obj

    def get(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        user_obj = self.get_user_object(pk)
        get_or_create_app_for_certified_user(user_obj)
        serializer = StaffCertifiedUserSerializer(user_obj, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        user_obj = self.get_user_object(pk)
        serializer = StaffCertifiedUserUpdateSerializer(
            user_obj,
            data=request.data,
            partial=True,
            context={'request': request, 'staff': staff},
        )
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()

        # Если обновлена фотография через multipart
        if 'image' in request.FILES:
            updated_user.image = request.FILES['image']
            updated_user.save()
            app = get_or_create_app_for_certified_user(updated_user)
            if app:
                photo_doc = app.documents.filter(doc_type='photo').first()
                if photo_doc:
                    photo_doc.file = updated_user.image
                    photo_doc.save(update_fields=['file'])
                else:
                    ApplicationDocument.objects.create(
                        application=app,
                        doc_type='photo',
                        file=updated_user.image,
                        description='Цифровое фото 3×4',
                    )

        output_serializer = StaffCertifiedUserSerializer(updated_user, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        user_obj = self.get_user_object(pk)
        if user_obj.application:
            user_obj.application.deleted_at = timezone.now()
            user_obj.application.save(update_fields=['deleted_at'])
        user_obj.delete()
        return Response({'status': 'ok', 'message': 'Дело специалиста успешно удалено из реестра'})


class StaffCertifiedUserUploadDocumentView(APIView):
    """
    POST /api/v1/staff/certified-users/<int:pk>/upload-document/
    Загрузка документов (оценочный лист, экзаменационный билет, фото с экзамена, скан сертификата и др.)
    непосредственно в дело сертифицированного специалиста.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        user_obj = get_object_or_404(CertifiedUser, pk=pk)
        app = get_or_create_app_for_certified_user(user_obj)

        files = request.FILES.getlist('files') or request.FILES.getlist('file')
        if not files:
            single = request.FILES.get('file')
            if single:
                files = [single]

        if not files:
            return Response({'detail': 'Выберите хотя бы один файл для загрузки'}, status=status.HTTP_400_BAD_REQUEST)

        doc_type = request.data.get('doc_type', 'evaluation_sheet')
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

        # Синхронизация фото 3×4 и фиксация сотрудника, обновившего дело
        if doc_type == 'photo' and created_docs:
            user_obj.image = created_docs[-1].file
            user_obj.save(update_fields=['image', 'updated_at'])
        else:
            user_obj.save(update_fields=['updated_at'])

        if app:
            app.assigned_staff = staff
            app.save(update_fields=['assigned_staff', 'updated_at'])

        serializer = StaffApplicationDocumentSerializer(created_docs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StaffCertifiedUserDeleteDocumentView(APIView):
    """
    DELETE /api/v1/staff/certified-users/<int:pk>/documents/<int:doc_id>/
    Удаление документа из дела сертифицированного специалиста.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, doc_id):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        user_obj = get_object_or_404(CertifiedUser, pk=pk)
        app = get_or_create_app_for_certified_user(user_obj)

        doc = get_object_or_404(ApplicationDocument, pk=doc_id, application=app)
        doc.delete()

        if app:
            app.assigned_staff = staff
            app.save(update_fields=['assigned_staff', 'updated_at'])
        user_obj.save(update_fields=['updated_at'])

        return Response({'message': 'Документ успешно удален'}, status=status.HTTP_200_OK)


class StaffCertifiedUserClustersView(APIView):
    """
    GET /api/v1/staff/certified-users/clusters/
    Возвращает список отраслевых кластеров профессий с количеством специалистов в каждом.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        result = []
        total_all = CertifiedUser.objects.count()
        result.append({
            'key': '',
            'title': 'Все специальности',
            'count': total_all,
        })
        for key, data in PROFESSION_CLUSTERS.items():
            cluster_q = Q()
            for stem in data['stems']:
                cluster_q |= Q(profession__icontains=stem)
            count = CertifiedUser.objects.filter(cluster_q).count()
            if count > 0:
                result.append({
                    'key': key,
                    'title': data['title'],
                    'count': count,
                })
        return Response(result)


class StaffCertifiedUserQRCodeDownloadView(APIView):
    """
    GET /api/v1/certification/staff/certified-users/<int:pk>/qr/?qr_format=svg|png
    Генерирует и отдает на скачивание официальный QR-код сертификата специалиста из реестра:
    - qr_format=svg (по умолчанию): векторный SVG для CorelDraw (100% четкость кривых без пикселизации).
    - qr_format=png: растровый PNG в ультравысоком разрешении (300 DPI, 1000x1000) для печати и Word.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_content_negotiation(self, request, force=False):
        return (None, None)

    def get(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        user_obj = CertifiedUser.objects.filter(pk=pk).first()
        if not user_obj:
            clean_digits = ''.join(c for c in str(pk) if c.isdigit())
            if clean_digits:
                user_obj = CertifiedUser.objects.filter(registration_number__icontains=clean_digits).first()
        if not user_obj:
            raise Http404("Дело специалиста не найдено")

        if not user_obj.verification_token:
            import uuid
            user_obj.verification_token = uuid.uuid4()
            user_obj.save(update_fields=['verification_token'])

        base_url = 'https://validation.kg'
        safe_reg = user_obj.registration_number or f'id_{user_obj.pk}'
        encoded_reg = urllib.parse.quote(safe_reg)
        verify_url = f"{base_url}/verify/{encoded_reg}?token={user_obj.verification_token}"

        full_name = user_obj.get_full_name() or 'specialist'
        try:
            latin_name = transliterate_kyrgyz_ascii(full_name)
            latin_name = "".join(c for c in latin_name if c.isascii() and (c.isalnum() or c in ('_', '-')))
        except Exception:
            latin_name = "specialist"

        clean_digits = "".join(c for c in safe_reg if c.isdigit()) or str(user_obj.pk)
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
