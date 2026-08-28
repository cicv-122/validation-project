from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from apps.certification.models import CertificationApplication, AuditLog


# ---------------------------------------------------------------------------
# Email-уведомления при смене статуса
# ---------------------------------------------------------------------------

STATUS_MESSAGES = {
    'submitted': {
        'subject': 'Заявка принята — ЦНСВ при МП КР',
        'body': (
            'Здравствуйте, {name}!\n\n'
            'Ваша заявка на {type} по профессии «{profession}» ПРИНЯТА и зарегистрирована.\n\n'
            'Регистрационный номер: {reg}\n'
            'Следите за статусом по этому номеру на нашем сайте.\n\n'
            'Центр независимой сертификации и валидации при МП КР\n'
            'Тел: +996 703 047 535 | icvccentre@gmail.com'
        ),
    },
    'approved': {
        'subject': 'Ваша заявка одобрена — ЦНСВ при МП КР',
        'body': (
            'Здравствуйте, {name}!\n\n'
            'Ваша заявка на {type} по профессии «{profession}» была ОДОБРЕНА.\n\n'
            'Дата и место проведения оценки будут сообщены дополнительно.\n'
            'Следите за статусом по регистрационному номеру: {reg}\n\n'
            'Центр независимой сертификации и валидации при МП КР\n'
            'Тел: +996 703 047 535 | icvccentre@gmail.com'
        ),
    },
    'rejected': {
        'subject': 'Информация по вашей заявке — ЦНСВ при МП КР',
        'body': (
            'Здравствуйте, {name}!\n\n'
            'К сожалению, ваша заявка на {type} по профессии «{profession}» была ОТКЛОНЕНА.\n\n'
            'Для уточнения причин свяжитесь с нами:\n'
            'Тел: +996 703 047 535 | icvccentre@gmail.com\n\n'
            'Регистрационный номер вашей заявки: {reg}\n\n'
            'Центр независимой сертификации и валидации при МП КР'
        ),
    },
    'assessment_scheduled': {
        'subject': 'Дата оценки назначена — ЦНСВ при МП КР',
        'body': (
            'Здравствуйте, {name}!\n\n'
            'Оценка по вашей заявке на {type} (профессия: «{profession}») НАЗНАЧЕНА.\n\n'
            'Дата: {scheduled_date}\n'
            'Место: {scheduled_location}\n\n'
            'Пожалуйста, приходите вовремя. Опоздание не допускается.\n'
            'Регистрационный номер: {reg}\n\n'
            'Центр независимой сертификации и валидации при МП КР\n'
            'Тел: +996 703 047 535 | icvccentre@gmail.com'
        ),
    },
    'completed': {
        'subject': 'Оценка завершена — ЦНСВ при МП КР',
        'body': (
            'Здравствуйте, {name}!\n\n'
            'Процедура оценки по вашей заявке на {type} (профессия: «{profession}») ЗАВЕРШЕНА.\n\n'
            'Результаты будут оформлены и переданы вам в установленные сроки.\n'
            'По вопросам обращайтесь: Тел: +996 703 047 535 | icvccentre@gmail.com\n\n'
            'Регистрационный номер: {reg}\n\n'
            'Центр независимой сертификации и валидации при МП КР'
        ),
    },
    'cancelled': {
        'subject': 'Заявка отменена — ЦНСВ при МП КР',
        'body': (
            'Здравствуйте, {name}!\n\n'
            'Ваша заявка на {type} по профессии «{profession}» была ОТМЕНЕНА.\n\n'
            'Если это произошло по ошибке или у вас есть вопросы, свяжитесь с нами:\n'
            'Тел: +996 703 047 535 | icvccentre@gmail.com\n\n'
            'Регистрационный номер: {reg}\n\n'
            'Центр независимой сертификации и валидации при МП КР'
        ),
    },
}


@receiver(pre_save, sender=CertificationApplication)
def send_status_change_email(sender, instance, **kwargs):
    """Отправляет email кандидату при изменении статуса заявки."""
    if not instance.pk:
        return  # новая заявка — пропускаем

    try:
        previous = CertificationApplication.objects.get(pk=instance.pk)
    except CertificationApplication.DoesNotExist:
        return

    if previous.status == instance.status:
        return  # статус не изменился

    # Сохраняем старый статус для аудита
    instance._previous_status = previous.status

    template = STATUS_MESSAGES.get(instance.status)
    if not template or not instance.email:
        return

    type_display = dict(CertificationApplication.TYPE_CHOICES).get(
        instance.application_type, instance.application_type
    )

    body = template['body'].format(
        name=instance.full_name,
        type=type_display,
        profession=instance.profession,
        reg=str(instance.registration_number).upper(),
        scheduled_date=instance.scheduled_date or '—',
        scheduled_location=instance.scheduled_location or '—',
    )

    try:
        send_mail(
            subject=template['subject'],
            message=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@icvc.kg'),
            recipient_list=[instance.email],
            fail_silently=True,
        )
    except Exception:
        pass  # не блокируем сохранение при ошибке отправки


@receiver(post_save, sender=CertificationApplication)
def write_audit_log_on_status_change(sender, instance, created, **kwargs):
    """Записывает в AuditLog изменение статуса заявки."""
    if created:
        AuditLog.objects.create(
            action='APPLICATION_CREATED',
            entity_type='CertificationApplication',
            entity_id=str(instance.pk),
            new_value={'status': instance.status, 'full_name': instance.full_name},
        )
        return

    previous_status = getattr(instance, '_previous_status', None)
    if previous_status and previous_status != instance.status:
        AuditLog.objects.create(
            action='STATUS_CHANGED',
            entity_type='CertificationApplication',
            entity_id=str(instance.pk),
            old_value={'status': previous_status},
            new_value={'status': instance.status},
        )
