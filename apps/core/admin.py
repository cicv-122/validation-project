import logging

from django.contrib import admin
from django.db import transaction
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from modeltranslation.admin import TranslationAdmin
from apps.core.models import MainSlider, ImageGallery, VideoGallery, ManagementMember


@admin.register(MainSlider)
class MainSliderAdmin(admin.ModelAdmin):
    list_display = ('get_photo', 'created', 'id', 'move_up_down_links')
    readonly_fields = ('get_photo_big',)
    ordering = ('id',)

    def get_photo(self, obj):
        return mark_safe(f'<img src="{obj.image.url}" width="{75}">')

    def get_photo_big(self, obj):
        return mark_safe(f'<img src="{obj.image.url}" width="{920}">')

    get_photo.short_description = "Миниатюра"

    def move_up_down_links(self, obj):
        return format_html(
            '<a href="{}">Up</a> / <a href="{}">Down</a>',
            self.get_admin_url('move_up', obj.pk),
            self.get_admin_url('move_down', obj.pk),
        )

    def get_admin_url(self, action, obj_id):
        return reverse(
            f'admin:{self.model._meta.app_label}_{self.model._meta.model_name}_move_sequence',
            args=[obj_id, action]
        )

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                'move_sequence/<path:object_id>/<str:type_move>/',
                self.admin_site.admin_view(self.move_sequence),
                name=f'{self.model._meta.app_label}_{self.model._meta.model_name}_move_sequence'
            ),
        ]
        return custom_urls + urls

    @transaction.atomic
    def move_sequence(self, request, object_id: int, type_move: str) -> redirect:
        obj = self.get_object(request, object_id)
        if obj:
            position = None
            if type_move == 'move_up':
                position = self.model.objects.filter(id__lt=obj.id).order_by('-id').first()
            elif type_move == 'move_down':
                position = self.model.objects.filter(id__gt=obj.id).order_by('id').first()
            if position:
                obj.id, position.id = position.id, obj.id
                obj.save()
                position.save()
        return redirect(request.META.get('HTTP_REFERER', 'admin:index'))

    move_up_down_links.short_description = 'Move'


@admin.register(ImageGallery)
class ImageGalleryAdmin(admin.ModelAdmin):
    list_display = ('get_tag_image', 'created')
    readonly_fields = ('get_photo_big',)

    def get_tag_image(self, obj):
        return mark_safe(f'<img src="{obj.image.url}" width="{75}">')

    get_tag_image.short_description = _("Фото")

    def get_photo_big(self, obj):
        return mark_safe(f'<img src="{obj.image.url}" width="{920}">')

    get_photo_big.short_description = _("Фото")


@admin.register(VideoGallery)
class VideoGalleryAdmin(admin.ModelAdmin):
    list_display = ('url', 'created')
    readonly_fields = ('get_ytframe',)

    def get_ytframe(self, obj):
        return mark_safe(obj.convert_ytframe())

    get_ytframe.short_description = _("Видео")


@admin.register(ManagementMember)
class ManagementMemberAdmin(TranslationAdmin):
    list_display = ('full_name', 'position', 'order', 'is_management', 'is_active', 'get_photo')
    list_editable = ('order', 'is_management', 'is_active')
    search_fields = ('full_name', 'position')
    list_filter = ('is_management', 'is_active')

    def get_photo(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="50" style="border-radius:4px;">')
        return "-"
    
    get_photo.short_description = _("Фото")
