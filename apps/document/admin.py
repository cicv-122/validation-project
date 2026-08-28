from django.contrib import admin
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from modeltranslation.admin import TabbedTranslationAdmin, TranslationTabularInline

from .models import (
    ProfStandard,
    DevelopmentPartner,
    AssessmentCenter, AssessmentCenterDirector,
    AppraisersExpert, CertifiedUser
)


@admin.register(ProfStandard)
class ProfStandardAdmin(TabbedTranslationAdmin):
    list_display = ('title', 'order', 'is_active', 'created_at')
    list_editable = ('order',)


@admin.register(DevelopmentPartner)
class DevelopmentPartnerAdmin(TabbedTranslationAdmin):
    list_display = ('title', 'get_tag_image', 'order', 'is_active', 'created_at')
    list_editable = ('order',)
    search_fields = ('title',)
    list_filter = ('is_active',)

    def get_tag_image(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="50" style="border-radius:4px;">')
        return "-"
    
    get_tag_image.short_description = _("Лого")


class AssessmentCenterDirectorInline(TranslationTabularInline):
    model = AssessmentCenterDirector
    extra = 1

@admin.register(AssessmentCenter)
class AssessmentCenterAdmin(TabbedTranslationAdmin):
    list_display = ('organization', 'order', 'is_active', 'created_at')
    list_editable = ('order',)
    inlines = [AssessmentCenterDirectorInline]


@admin.register(AppraisersExpert)
class AppraisersExpertAdmin(TabbedTranslationAdmin):
    list_display = ('profession', 'appraisers', 'order', 'is_active', 'created_at')
    list_editable = ('order',)


@admin.register(CertifiedUser)
class CertifiedUserAdmin(admin.ModelAdmin):
    list_display = ('get_tag_image', 'get_full_name', 'registration_number', 'profession', 'issued_date', 'order', 'created_at')
    list_editable = ('order',)
    search_fields = ('last_name', 'first_name', 'registration_number', 'profession')
    readonly_fields = ('qr_code_display',)
    
    fieldsets = (
        ('Основные данные', {
            'fields': ('registration_number', 'last_name', 'first_name', 'sur_name', 'profession', 'issued_date', 'image')
        }),
        ('Настройки', {
            'fields': ('order',)
        }),
        ('QR-код (Генерируется автоматически)', {
            'fields': ('qr_code', 'qr_code_display')
        }),
    )

    def get_tag_image(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="50" style="border-radius: 4px;">')
        return "-"
    get_tag_image.short_description = _("Фото")

    def qr_code_display(self, obj):
        if obj.qr_code:
            return mark_safe(f'<img src="{obj.qr_code.url}" width="150" style="border: 1px solid #ccc; padding: 5px; background: #fff;">')
        return "Будет сгенерирован при сохранении"
    qr_code_display.short_description = "Просмотр QR-кода"
