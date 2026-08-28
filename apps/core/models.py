import re

from django.db import models
from django.utils.translation import gettext_lazy as _

from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill

from common.upload_to_files import slider_main_img, image_gallery, management_member_img


class MainSlider(models.Model):
    image = ProcessedImageField(verbose_name=_('Фото'), upload_to=slider_main_img, format='webp',
                                processors=[ResizeToFill((920 * 2), (580 * 2))], options={'quality': 90})

    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        ordering = ('id',)
        verbose_name = _('Слайдер')
        verbose_name_plural = _('Слайдер')


class ImageGallery(models.Model):
    image = ProcessedImageField(
        verbose_name=_('Фото'),
        upload_to=image_gallery,
        format='webp',
        options={'quality': 90}
    )
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

    class Meta:
        ordering = ('-id',)
        verbose_name = _('Фотогалерея')
        verbose_name_plural = _('Фотогалерея')


class VideoGallery(models.Model):
    url = models.URLField(verbose_name=_('Ссылка от youtube'))
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

    def convert_ytframe(self):
        _yt = re.compile(r'(https?://)?(www\.)?((youtu\.be/)|(youtube\.com/watch/?\?v=))([A-Za-z0-9-_]+)', re.I)
        _frame_format = '<iframe width="394" height="257" src="https://www.youtube.com/embed/{0}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'

        def replace(match):
            groups = match.groups()
            return _frame_format.format(groups[5])

        return _yt.sub(replace, self.url)

    class Meta:
        ordering = ('-id',)
        verbose_name = _('Видео галерея')
        verbose_name_plural = _('Видео галерея')


class ManagementMember(models.Model):
    full_name = models.CharField(verbose_name=_('ФИО'), max_length=255)
    position = models.CharField(verbose_name=_('Должность'), max_length=255)
    description = models.TextField(verbose_name=_('Описание'), blank=True, null=True)
    image = ProcessedImageField(
        verbose_name=_('Фото'),
        upload_to=management_member_img,
        format='webp',
        processors=[ResizeToFill(500, 625)],
        options={'quality': 90}
    )
    order = models.PositiveIntegerField(verbose_name=_('Порядок сортировки'), default=0)
    is_active = models.BooleanField(verbose_name=_('Активен'), default=True)
    is_management = models.BooleanField(verbose_name=_('Является руководством'), default=True, help_text=_('Снимите галочку, если это обычный сотрудник'))

    class Meta:
        ordering = ('order', 'id')
        verbose_name = _('Представитель руководства')
        verbose_name_plural = _('Представители руководства')

    def __str__(self):
        return self.full_name
