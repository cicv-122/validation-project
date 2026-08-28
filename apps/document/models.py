from django.db import models
from django.utils.translation import gettext_lazy as _

from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill, ResizeToFit

from common.upload_to_files import document_files, certified_user_img, development_partner_img


class BaseDocument(models.Model):
    title = models.CharField(verbose_name=_("Название"), max_length=255)
    file = models.FileField(verbose_name=_("Файл"), upload_to=document_files)
    order = models.PositiveIntegerField(verbose_name=_('Порядок сортировки'), default=0)
    is_active = models.BooleanField(verbose_name=_("Публичный"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return self.title

    class Meta:
        abstract = True
        ordering = ('order', '-created_at')


class ProfStandard(BaseDocument):

    class Meta:
        verbose_name = _('Проф. стандарт')
        verbose_name_plural = _('Проф. стандарт')


class DevelopmentPartner(models.Model):
    title = models.CharField(verbose_name=_("Название"), max_length=255)
    file = models.FileField(verbose_name=_("Файл"), upload_to=document_files, blank=True, null=True)
    description = models.TextField(verbose_name=_('Описание'), blank=True, null=True)
    url = models.URLField(verbose_name=_('Ссылка на сайт'), blank=True, null=True)
    address = models.TextField(verbose_name=_('Адрес(а) (каждый с новой строки)'), blank=True, null=True)
    map_url = models.URLField(verbose_name=_('Ссылка на карту (2GIS / Google Maps)'), blank=True, null=True, help_text=_('Опционально. Прямая ссылка на карту (2GIS или Google Maps).'))
    phone = models.TextField(verbose_name=_('Телефон(ы) (каждый с новой строки)'), blank=True, null=True)
    email = models.TextField(verbose_name=_('Email(ы) (каждый с новой строки)'), blank=True, null=True)
    facebook_url = models.URLField(verbose_name=_('Facebook (ссылка)'), blank=True, null=True)
    instagram_url = models.URLField(verbose_name=_('Instagram (ссылка)'), blank=True, null=True)
    linkedin_url = models.URLField(verbose_name=_('LinkedIn (ссылка)'), blank=True, null=True)
    telegram_url = models.URLField(verbose_name=_('Telegram (ссылка)'), blank=True, null=True)
    whatsapp_url = models.URLField(verbose_name=_('WhatsApp (ссылка)'), blank=True, null=True)
    tiktok_url = models.URLField(verbose_name=_('TikTok (ссылка)'), blank=True, null=True)
    youtube_url = models.URLField(verbose_name=_('YouTube (ссылка)'), blank=True, null=True)
    image = ProcessedImageField(
        verbose_name=_('Логотип (Фото)'),
        upload_to=development_partner_img,
        format='webp',
        processors=[ResizeToFit(500, 500)],
        options={'quality': 90},
        blank=True, null=True
    )
    order = models.PositiveIntegerField(verbose_name=_('Порядок сортировки'), default=0)
    is_active = models.BooleanField(verbose_name=_("Публичный"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return self.title

    class Meta:
        ordering = ('order', '-created_at')
        verbose_name = _('Партнер по развитию')
        verbose_name_plural = _('Партнеры по развитию')


class AssessmentCenter(models.Model):
    organization = models.CharField(_('Название организации'), max_length=255)
    order = models.PositiveIntegerField(verbose_name=_('Порядок сортировки'), default=0)

    address = models.CharField(_('Адрес'), max_length=255, blank=True, null=True)
    map_url = models.URLField(_('Ссылка на карту (2GIS / Google Maps)'), blank=True, null=True, help_text=_('Опционально. Прямая ссылка на карту (2GIS или Google Maps). Если не заполнено, поиск будет происходить по адресу.'))
    phone = models.TextField(_('Телефон(ы) (городские, сотовые и др. — каждый с новой строки)'), blank=True, null=True)
    email = models.EmailField(_('Email'), blank=True, null=True)
    website = models.URLField(_('Сайт'), blank=True, null=True)

    is_active = models.BooleanField(verbose_name=_("Публичный"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return self.organization

    class Meta:
        ordering = ('order', '-created_at')
        verbose_name = _('Центр оценки')
        verbose_name_plural = _('Центры оценки')

class AssessmentCenterDirector(models.Model):
    center = models.ForeignKey(AssessmentCenter, on_delete=models.CASCADE, related_name='directors')
    name = models.CharField('Ф.И.О. руководителя', max_length=255)
    phone = models.CharField(_('Телефон'), max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Руководитель Центра оценки')
        verbose_name_plural = _('Руководители Центра оценки')


class AppraisersExpert(models.Model):
    assessment_center = models.ForeignKey(AssessmentCenter, on_delete=models.PROTECT, related_name='assessment_centers')
    profession = models.CharField(_('Профессия'), max_length=255)
    appraisers = models.TextField(_('Оценщики'))
    appraiser_employer = models.TextField(_('Оценщик работодатель'))
    consultant = models.CharField(_('консультант'), max_length=255)
    order = models.PositiveIntegerField(verbose_name=_('Порядок сортировки'), default=0)

    is_active = models.BooleanField(verbose_name=_("Публичный"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return self.profession

    class Meta:
        ordering = ('order', '-created_at')
        verbose_name = _('Эксперт оценщика')
        verbose_name_plural = _('Эксперты оценщиков')


class CertifiedUser(models.Model):
    """ Сертифицированный пользователь """
    registration_number = models.CharField("Регистрационный номер", max_length=255, unique=True)
    last_name = models.CharField(_("Фамилия"), max_length=55)
    first_name = models.CharField(_("Имя"), max_length=55)
    sur_name = models.CharField(_("Отчество"), max_length=55, blank=True, null=True)
    profession = models.CharField(_("Профессия / Квалификация"), max_length=255, blank=True, null=True)
    issued_date = models.DateField(_("Дата выдачи сертификата"), blank=True, null=True)
    image = ProcessedImageField(
        verbose_name=_('Фото'),
        upload_to=certified_user_img,
        format='webp',
        processors=[
            ResizeToFill(500, 500)
        ],
        options={'quality': 90},
        blank=True, null=True
    )
    qr_code = models.ImageField(_("QR-код"), upload_to='certified_users/qr/', blank=True, null=True)
    order = models.PositiveIntegerField(verbose_name=_('Порядок сортировки'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    def __str__(self):
        return self.get_full_name()

    def get_full_name(self):
        if self.sur_name:
            return f"{self.last_name} {self.first_name} {self.sur_name}"
        return f"{self.last_name} {self.first_name}"

    def save(self, *args, **kwargs):
        # Если QR код еще не сгенерирован, но есть рег. номер
        if not self.qr_code and self.registration_number:
            import qrcode
            from io import BytesIO
            from django.core.files import File
            
            # URL для сканирования: страница верификации конкретного человека
            from django.conf import settings
            base_url = getattr(settings, 'CURRENT_SITE_URL', None) or 'https://validation.kg'
            if settings.DEBUG and not getattr(settings, 'CURRENT_SITE_URL', None):
                base_url = 'http://localhost:5173'
            qr_data = f"{base_url}/verify/{self.registration_number}"
            
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=2,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            
            file_name = f'qr_{self.registration_number}.png'
            self.qr_code.save(file_name, File(buffer), save=False)
            
        super().save(*args, **kwargs)

    class Meta:
        ordering = ('order', '-created_at')
        verbose_name = _("Сертифицированный пользователь")
        verbose_name_plural = _("Сертифицированные пользователи")
