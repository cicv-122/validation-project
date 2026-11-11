import logging
from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q

logger = logging.getLogger(__name__)

from apps.certification.models import (
    CertificationApplication,
    ApplicationDocument,
    CallbackRequest,
    Profession,
)
from apps.certification.api.serializers import (
    CertificationApplicationSerializer,
    ApplicationDocumentSerializer,
    ApplicationStatusSerializer,
    CallbackRequestSerializer,
    ProfessionSerializer,
)


class ProfessionListView(APIView):
    """
    GET /api/v1/certification/professions/?q=&lang=ru&active=true
    Выбор профессий из справочника ПКМ КР № 252 с поиском и специализациями.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        q = request.query_params.get('q', '').strip()
        lang = request.query_params.get('lang', 'ru').lower()
        active = request.query_params.get('active', 'true').lower() == 'true'

        qs = Profession.objects.prefetch_related('specializations').all()
        if active:
            qs = qs.filter(is_active=True)

        if q:
            # Note: SQLite LIKE is case-sensitive for non-ASCII characters; query both lower, title and upper variants
            q_lower = q.lower()
            q_title = q.title()
            q_upper = q.upper()

            qs = qs.filter(
                Q(name_ru__icontains=q_lower) | Q(name_ru__icontains=q_title) | Q(name_ru__icontains=q_upper) |
                Q(name_ky__icontains=q_lower) | Q(name_ky__icontains=q_title) | Q(name_ky__icontains=q_upper) |
                Q(okz_code__icontains=q) |
                Q(section__icontains=q_lower) | Q(section__icontains=q_title)
            )

        # Ordering
        if lang == 'ky':
            qs = qs.order_by('name_ky', 'name_ru')
        else:
            qs = qs.order_by('name_ru')

        serializer = ProfessionSerializer(qs, many=True)
        return Response(serializer.data)


class ApplicationCreateView(generics.CreateAPIView):
    """
    POST /api/v1/certification/apply/
    Кандидат подаёт заявку на сертификацию/валидацию.
    """
    queryset = CertificationApplication.objects.all()
    serializer_class = CertificationApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(status='submitted', submitted_at=timezone.now())

        # Handle document uploads (multipart)
        doc_files = request.FILES
        doc_types = request.data.getlist('doc_types', [])

        for i, doc_type in enumerate(doc_types):
            file_key = f'doc_file_{i}'
            if file_key in doc_files:
                ApplicationDocument.objects.create(
                    application=application,
                    doc_type=doc_type,
                    file=doc_files[file_key],
                    description=request.data.get(f'doc_desc_{i}', ''),
                )

        # Автоматическое распределение ответственному сотруднику по профессии
        assigned = application.auto_assign_staff()
        try:
            from services.telegram import notify_staff_new_application
            if assigned and assigned.telegram_chat_id:
                notify_staff_new_application(application, assigned)
            else:
                # Если конкретный сотрудник еще не закреплен за профессией в админке,
                # отправляем заявку активным сотрудникам с подключенным Telegram
                connected_staff = StaffProfile.objects.filter(is_active=True).exclude(telegram_chat_id__isnull=True).exclude(telegram_chat_id='')
                for st in connected_staff:
                    notify_staff_new_application(application, st)
        except Exception as tg_err:
            logger.error('Failed to send Telegram notification to staff: %s', tg_err)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ApplicationStatusView(APIView):
    """
    GET /api/v1/certification/status/<registration_number>/
    Публичная проверка статуса заявки по регистрационному номеру.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, registration_number, *args, **kwargs):
        try:
            application = CertificationApplication.objects.get(
                registration_number=registration_number
            )
        except (CertificationApplication.DoesNotExist, ValueError):
            return Response(
                {'detail': 'Заявка не найдена. Проверьте правильность регистрационного номера.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ApplicationStatusSerializer(application)
        return Response(serializer.data)


class ApplicationRecoverView(APIView):
    """
    POST /api/v1/certification/recover/
    Восстановление регистрационного номера по ИНН и E-mail.
    Отправляет номера всех подходящих заявок на указанную почту.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        inn = request.data.get('inn')
        email = request.data.get('email')

        if not inn or not email:
            return Response(
                {'detail': 'Укажите ПИН/ИИН и E-mail для восстановления.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        applications = CertificationApplication.objects.filter(
            inn=inn,
            email__iexact=email
        )

        if not applications.exists():
            return Response(
                {'detail': 'Заявок с такими данными не найдено.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Подготовка письма
        subject = 'Восстановление регистрационного номера заявки (CICV)'
        message_lines = [
            'Здравствуйте!',
            'Вы запросили восстановление регистрационного(ых) номера(ов) ваших заявок на сайте Центра независимой сертификации и валидации (CICV).\n',
            'Ваши заявки:'
        ]
        
        for app in applications:
            message_lines.append(f'- Профессия: {app.profession}')
            message_lines.append(f'  Регистрационный номер: {app.registration_number}')
            message_lines.append(f'  Дата подачи: {app.created_at.strftime("%d.%m.%Y")}\n')

        message_lines.append('Вы можете отслеживать статус ваших заявок на нашем сайте.')
        message = '\n'.join(message_lines)

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(
                'Recovery email send failed for email=%s inn=%s: %s',
                email, inn, str(e),
                exc_info=True,
            )
            return Response(
                {
                    'detail': (
                        'Ошибка отправки письма. '
                        'Пожалуйста, свяжитесь с администратором: '
                        'Тел: +996 703 047 535 | icvccentre@gmail.com'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {'detail': 'Регистрационные номера успешно отправлены на вашу почту.'},
            status=status.HTTP_200_OK
        )


class CallbackRequestCreateView(APIView):
    """
    POST /api/v1/certification/callback/
    Упрощённая форма: кандидат оставляет имя, телефон, профессию.
    Менеджер связывается с кандидатом сам.
    Дедупликация: если активная заявка с таким телефоном уже есть — не дублируем.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = CallbackRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data['phone']

        # Дедупликация: проверяем наличие активной необработанной заявки
        active_statuses = ('new', 'in_progress')
        if CallbackRequest.objects.filter(phone=phone, status__in=active_statuses).exists():
            # Возвращаем успех (не сообщаем о дубликате пользователю, чтобы не путать)
            return Response(
                {'detail': 'Ваша заявка уже принята. Мы скоро с вами свяжемся!'},
                status=status.HTTP_200_OK,
            )

        callback = serializer.save()

        # Telegram-уведомление менеджеру
        try:
            from services.telegram import notify_new_callback
            notify_new_callback(callback)
        except Exception as exc:
            logger.error('Failed to send Telegram notification: %s', exc)

        return Response(
            {'detail': 'Заявка принята! Наш менеджер свяжется с вами в ближайшее время.'},
            status=status.HTTP_201_CREATED,
        )

