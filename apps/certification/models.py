import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def application_document_upload(instance, filename):
    return f'certification/applications/{instance.application.registration_number}/{filename}'


def certificate_file_upload(instance, filename):
    return f'certification/certificates/{instance.certificate_number}/{filename}'


def certificate_qr_upload(instance, filename):
    return f'certification/certificates/{instance.certificate_number}/qr_{filename}'


# ---------------------------------------------------------------------------
# Профессии и уровни квалификации
# ---------------------------------------------------------------------------

class Profession(models.Model):
    """Профессия / специальность"""

    name_ru = models.CharField(max_length=255, verbose_name=_('Название (рус)'))
    name_ky = models.CharField(max_length=255, blank=True, verbose_name=_('Название (кыр)'))
    code = models.CharField(
        max_length=50, unique=True,
        verbose_name=_('Код профессии'),
        help_text=_('Например: COOK-001'),
    )
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    category = models.CharField(max_length=100, blank=True, verbose_name=_('Категория'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активна'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name_ru',)
        verbose_name = _('Профессия')
        verbose_name_plural = _('Профессии')

    def __str__(self):
        return f'{self.name_ru} ({self.code})'


class QualificationLevel(models.Model):
    """Уровень квалификации для профессии"""

    profession = models.ForeignKey(
        Profession,
        on_delete=models.CASCADE,
        related_name='levels',
        verbose_name=_('Профессия'),
    )
    level = models.PositiveSmallIntegerField(verbose_name=_('Уровень'), help_text=_('Число: 1, 2, 3…'))
    name_ru = models.CharField(max_length=255, verbose_name=_('Название (рус)'))
    name_ky = models.CharField(max_length=255, blank=True, verbose_name=_('Название (кыр)'))
    requirements = models.TextField(blank=True, verbose_name=_('Требования для получения'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('profession', 'level')
        ordering = ('profession', 'level')
        verbose_name = _('Уровень квалификации')
        verbose_name_plural = _('Уровни квалификации')

    def __str__(self):
        return f'{self.profession.name_ru} — Уровень {self.level} ({self.name_ru})'


# ---------------------------------------------------------------------------
# Заявка на сертификацию / валидацию
# ---------------------------------------------------------------------------

class CertificationApplication(models.Model):
    """Заявление кандидата на сертификацию/валидацию"""

    TYPE_CHOICES = [
        ('certification', _('Сертификация')),
        ('validation', _('Валидация')),
    ]

    STATUS_CHOICES = [
        ('draft',                   _('Черновик')),
        ('submitted',               _('Подана')),
        ('under_review',            _('На рассмотрении')),
        ('assessment_scheduled',    _('Оценка назначена')),
        ('assessment_in_progress',  _('Оценка проводится')),
        ('approved',                _('Одобрена')),
        ('rejected',                _('Отклонена')),
        ('cancelled',               _('Отменена')),
        ('completed',               _('Завершена')),
    ]

    # Уникальный регистрационный номер
    registration_number = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        verbose_name=_('Регистрационный номер'),
    )

    # Тип процедуры
    application_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='certification',
        verbose_name=_('Тип заявки'),
    )

    # Профессия (связь с справочником или свободный текст)
    profession_ref = models.ForeignKey(
        Profession,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='applications',
        verbose_name=_('Профессия (справочник)'),
    )
    profession = models.CharField(max_length=255, verbose_name=_('Профессия'))
    qualification_level = models.CharField(
        max_length=100, blank=True,
        verbose_name=_('Квалификационный уровень'),
    )

    # Назначенный оценщик
    assessor_name = models.CharField(
        max_length=255, blank=True,
        verbose_name=_('Оценщик'),
    )

    # Данные кандидата
    full_name = models.CharField(max_length=255, verbose_name=_('ФИО кандидата'))
    birth_year = models.PositiveSmallIntegerField(
        null=True, blank=True,
        verbose_name=_('Год рождения'),
    )
    inn = models.CharField(
        max_length=14,
        default='',
        verbose_name=_('ИНН / ПИН'),
        help_text=_('14-значный ПИН/ИНН'),
    )

    # Опыт
    experience_years = models.PositiveSmallIntegerField(
        null=True, blank=True,
        verbose_name=_('Лет опыта'),
    )
    experience_desc = models.TextField(
        blank=True,
        verbose_name=_('Описание опыта'),
    )

    # Контактные данные
    phone = models.CharField(max_length=50, verbose_name=_('Телефон'))
    email = models.EmailField(verbose_name=_('E-mail'))
    address = models.TextField(blank=True, verbose_name=_('Адрес проживания'))

    # Согласие на обработку данных
    data_consent = models.BooleanField(
        default=False,
        verbose_name=_('Согласие на обработку данных'),
    )

    # Статус
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_('Статус'),
        db_index=True,
    )

    # Даты жизненного цикла
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата подачи'))
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата рассмотрения'))
    scheduled_date = models.DateField(null=True, blank=True, verbose_name=_('Дата проведения оценки'))
    scheduled_location = models.CharField(max_length=255, blank=True, verbose_name=_('Место проведения'))

    # Служебные поля
    admin_notes = models.TextField(blank=True, verbose_name=_('Примечания администратора'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Дата создания'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Дата обновления'))

    # Soft delete
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата удаления'))

    class Meta:
        ordering = ('-created_at',)
        verbose_name = _('Заявка на сертификацию/валидацию')
        verbose_name_plural = _('Заявки на сертификацию/валидацию')
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['inn']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f'{self.full_name} — {self.profession} ({self.get_status_display()})'

    @property
    def short_registration_number(self):
        return str(self.registration_number).upper()[:8]

    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def soft_delete(self):
        """Мягкое удаление: помечает запись как удалённую."""
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    def submit(self):
        """Подача заявки — переводит статус в 'submitted'."""
        self.status = 'submitted'
        self.submitted_at = timezone.now()
        self.save(update_fields=['status', 'submitted_at'])


# ---------------------------------------------------------------------------
# Документы к заявке
# ---------------------------------------------------------------------------

class ApplicationDocument(models.Model):
    """Документы портфолио, прикреплённые к заявке"""

    DOC_TYPE_CHOICES = [
        ('id_card',            _('Удостоверение личности')),
        ('resume',             _('Резюме')),
        ('passport',           _('Паспорт (копия)')),
        ('photo',              _('Фото 3.5×4.5')),
        ('diploma',            _('Диплом / Сертификат / Свидетельство')),
        ('work_experience',    _('Трудовая книжка / Справка об опыте')),
        ('course_certificate', _('Сертификат о курсах')),
        ('work_sample',        _('Образец работы / Фото / Видео')),
        ('portfolio',          _('Портфолио')),
        ('other',              _('Другое')),
    ]

    application = models.ForeignKey(
        CertificationApplication,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name=_('Заявка'),
    )
    doc_type = models.CharField(
        max_length=25,
        choices=DOC_TYPE_CHOICES,
        verbose_name=_('Тип документа'),
    )
    file = models.FileField(
        upload_to=application_document_upload,
        verbose_name=_('Файл'),
    )
    file_name = models.CharField(max_length=255, blank=True, verbose_name=_('Имя файла'))
    file_size = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Размер файла (байт)'))
    description = models.CharField(max_length=255, blank=True, verbose_name=_('Описание'))
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Документ заявки')
        verbose_name_plural = _('Документы заявки')

    def __str__(self):
        return f'{self.get_doc_type_display()} — {self.application.full_name}'

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = self.file.name.split('/')[-1]
        if self.file and not self.file_size:
            try:
                self.file_size = self.file.size
            except Exception:
                pass
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Оценка (Assessment)
# ---------------------------------------------------------------------------

class Assessment(models.Model):
    """Результаты оценки по заявке"""

    RESULT_CHOICES = [
        ('pending', _('Ожидается')),
        ('passed',  _('Пройдена')),
        ('failed',  _('Не пройдена')),
        ('partial', _('Частично пройдена')),
    ]

    application = models.OneToOneField(
        CertificationApplication,
        on_delete=models.CASCADE,
        related_name='assessment',
        verbose_name=_('Заявка'),
    )
    assessor_name = models.CharField(max_length=255, verbose_name=_('Оценщик'))
    scheduled_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата/время оценки (план)'))
    conducted_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата/время оценки (факт)'))
    location = models.CharField(max_length=255, blank=True, verbose_name=_('Место проведения'))
    result = models.CharField(
        max_length=10,
        choices=RESULT_CHOICES,
        default='pending',
        verbose_name=_('Результат'),
        db_index=True,
    )
    score = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        verbose_name=_('Балл'),
    )
    max_score = models.DecimalField(
        max_digits=5, decimal_places=2,
        default=100,
        verbose_name=_('Максимальный балл'),
    )
    conclusion = models.TextField(blank=True, verbose_name=_('Заключение оценщика'))
    recommendations = models.TextField(blank=True, verbose_name=_('Рекомендации'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Оценка')
        verbose_name_plural = _('Оценки')

    def __str__(self):
        return f'Оценка: {self.application.full_name} — {self.get_result_display()}'

    @property
    def score_percent(self):
        if self.score and self.max_score:
            return round(float(self.score) / float(self.max_score) * 100, 1)
        return None


class AssessmentCriteria(models.Model):
    """Критерии оценки (детализация по пунктам)"""

    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='criteria',
        verbose_name=_('Оценка'),
    )
    criterion_name = models.CharField(max_length=255, verbose_name=_('Критерий'))
    max_points = models.DecimalField(max_digits=5, decimal_places=2, verbose_name=_('Максимум баллов'))
    earned_points = models.DecimalField(max_digits=5, decimal_places=2, verbose_name=_('Набрано баллов'))
    comment = models.TextField(blank=True, verbose_name=_('Комментарий'))

    class Meta:
        verbose_name = _('Критерий оценки')
        verbose_name_plural = _('Критерии оценки')

    def __str__(self):
        return f'{self.criterion_name}: {self.earned_points}/{self.max_points}'


# ---------------------------------------------------------------------------
# Сертификат
# ---------------------------------------------------------------------------

class Certificate(models.Model):
    """Выданный сертификат"""

    STATUS_CHOICES = [
        ('active',    _('Действующий')),
        ('expired',   _('Истёк')),
        ('revoked',   _('Аннулирован')),
        ('suspended', _('Приостановлен')),
    ]

    application = models.OneToOneField(
        CertificationApplication,
        on_delete=models.CASCADE,
        related_name='certificate',
        verbose_name=_('Заявка'),
    )
    certificate_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Номер сертификата'),
        help_text=_('Пример: CERT-2024-000001'),
        db_index=True,
    )
    issued_at = models.DateField(verbose_name=_('Дата выдачи'))
    expires_at = models.DateField(null=True, blank=True, verbose_name=_('Дата истечения (NULL = бессрочный)'))
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name=_('Статус'),
        db_index=True,
    )

    # Аннулирование
    revoked_reason = models.TextField(blank=True, verbose_name=_('Причина аннулирования'))
    revoked_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата аннулирования'))
    revoked_by = models.CharField(max_length=255, blank=True, verbose_name=_('Аннулировал'))

    # Файлы
    file = models.FileField(
        upload_to=certificate_file_upload,
        null=True, blank=True,
        verbose_name=_('PDF сертификата'),
    )
    qr_code = models.ImageField(
        upload_to=certificate_qr_upload,
        null=True, blank=True,
        verbose_name=_('QR-код'),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-issued_at',)
        verbose_name = _('Сертификат')
        verbose_name_plural = _('Сертификаты')

    def __str__(self):
        return f'{self.certificate_number} — {self.application.full_name}'

    @property
    def is_valid(self):
        if self.status != 'active':
            return False
        if self.expires_at and self.expires_at < timezone.now().date():
            return False
        return True


class CertificateVerification(models.Model):
    """Журнал публичных проверок сертификатов"""

    certificate = models.ForeignKey(
        Certificate,
        on_delete=models.CASCADE,
        related_name='verifications',
        verbose_name=_('Сертификат'),
    )
    verified_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Дата проверки'))
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name=_('IP адрес'))
    user_agent = models.TextField(blank=True, verbose_name=_('User-Agent'))

    class Meta:
        ordering = ('-verified_at',)
        verbose_name = _('Проверка сертификата')
        verbose_name_plural = _('Проверки сертификатов')

    def __str__(self):
        return f'Проверка {self.certificate.certificate_number} — {self.verified_at:%d.%m.%Y %H:%M}'


# ---------------------------------------------------------------------------
# Журнал действий (Audit Log)
# ---------------------------------------------------------------------------

class AuditLog(models.Model):
    """Журнал всех значимых действий в системе"""

    action = models.CharField(max_length=100, verbose_name=_('Действие'), db_index=True)
    entity_type = models.CharField(max_length=100, verbose_name=_('Тип объекта'))
    entity_id = models.CharField(max_length=100, verbose_name=_('ID объекта'))
    performed_by = models.CharField(max_length=255, blank=True, verbose_name=_('Выполнил'))
    old_value = models.JSONField(null=True, blank=True, verbose_name=_('Было'))
    new_value = models.JSONField(null=True, blank=True, verbose_name=_('Стало'))
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name=_('IP адрес'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Дата'))

    class Meta:
        ordering = ('-created_at',)
        verbose_name = _('Запись аудита')
        verbose_name_plural = _('Журнал аудита')

    def __str__(self):
        return f'[{self.created_at:%d.%m.%Y %H:%M}] {self.action} — {self.entity_type}:{self.entity_id}'


# ---------------------------------------------------------------------------
# Заявка на консультацию (Lead Gen / Callback Request)
# ---------------------------------------------------------------------------

class CallbackRequest(models.Model):
    """
    Упрощённая форма первичного обращения кандидата.
    Менеджер связывается с кандидатом и помогает оформить полную заявку.
    """

    STATUS_CHOICES = [
        ('new',         _('Новая')),
        ('in_progress', _('В работе')),
        ('completed',   _('Завершена')),
        ('rejected',    _('Отказ')),
    ]

    # Данные кандидата
    name       = models.CharField(max_length=255, verbose_name=_('Имя'))
    phone      = models.CharField(max_length=50, verbose_name=_('Телефон'))
    profession = models.CharField(max_length=255, blank=True, verbose_name=_('Профессия'))

    # Статус обработки
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        verbose_name=_('Статус'),
        db_index=True,
    )

    # Для работы менеджеров
    assigned_to  = models.ForeignKey(
        'auth.User',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='callback_requests',
        verbose_name=_('Ответственный менеджер'),
    )
    contacted_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Дата/время звонка'))
    manager_note = models.TextField(blank=True, verbose_name=_('Заметка менеджера'))

    # Маркетинговые метки (UTM)
    utm_source   = models.CharField(max_length=100, blank=True, verbose_name=_('UTM Source'))
    utm_medium   = models.CharField(max_length=100, blank=True, verbose_name=_('UTM Medium'))
    utm_campaign = models.CharField(max_length=100, blank=True, verbose_name=_('UTM Campaign'))
    utm_term     = models.CharField(max_length=100, blank=True, verbose_name=_('UTM Term'))
    utm_content  = models.CharField(max_length=100, blank=True, verbose_name=_('UTM Content'))

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Дата создания'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Дата обновления'))

    class Meta:
        ordering = ('-created_at',)
        verbose_name = _('Заявка на консультацию')
        verbose_name_plural = _('Заявки на консультацию')
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['phone']),
        ]

    def __str__(self):
        return f'{self.name} ({self.phone}) — {self.get_status_display()}'
