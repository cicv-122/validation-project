from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone

from apps.certification.models import (
    Profession,
    QualificationLevel,
    CertificationApplication,
    ApplicationDocument,
    Assessment,
    AssessmentCriteria,
    Certificate,
    CertificateVerification,
    AuditLog,
    CallbackRequest,
)

# ---------------------------------------------------------------------------
# Вспомогательные функции
# ---------------------------------------------------------------------------

STATUS_COLORS = {
    'draft':                   ('#6b7280', '#f3f4f6'),
    'submitted':               ('#1d4ed8', '#dbeafe'),
    'under_review':            ('#92400e', '#fef3c7'),
    'assessment_scheduled':    ('#0e7490', '#cffafe'),
    'assessment_in_progress':  ('#7c3aed', '#ede9fe'),
    'approved':                ('#065f46', '#d1fae5'),
    'rejected':                ('#991b1b', '#fee2e2'),
    'cancelled':               ('#374151', '#e5e7eb'),
    'completed':               ('#4c1d95', '#ede9fe'),
}

CERT_STATUS_COLORS = {
    'active':    ('#065f46', '#d1fae5'),
    'expired':   ('#92400e', '#fef3c7'),
    'revoked':   ('#991b1b', '#fee2e2'),
    'suspended': ('#374151', '#e5e7eb'),
}

ASSESS_RESULT_COLORS = {
    'pending': ('#6b7280', '#f3f4f6'),
    'passed':  ('#065f46', '#d1fae5'),
    'failed':  ('#991b1b', '#fee2e2'),
    'partial': ('#92400e', '#fef3c7'),
}


def make_status_action(new_status, label):
    def action(modeladmin, request, queryset):
        # Use obj.save() instead of queryset.update() so that
        # pre_save / post_save signals fire correctly:
        # — email notifications are sent to candidates
        # — AuditLog entries are created
        for obj in queryset:
            if obj.status != new_status:
                obj.status = new_status
                obj.save()
    action.short_description = label
    action.__name__ = f'mark_{new_status}'
    return action


def badge(label, color, bg):
    return format_html(
        '<span style="color:{};background:{};padding:2px 10px;border-radius:99px;'
        'font-size:12px;font-weight:600;">{}</span>',
        color, bg, label,
    )


# ---------------------------------------------------------------------------
# Профессии
# ---------------------------------------------------------------------------

class QualificationLevelInline(admin.TabularInline):
    model = QualificationLevel
    extra = 1
    fields = ['level', 'name_ru', 'name_ky', 'requirements']


@admin.register(Profession)
class ProfessionAdmin(admin.ModelAdmin):
    list_display = ['name_ru', 'code', 'category', 'is_active', 'levels_count']
    list_filter = ['is_active', 'category']
    search_fields = ['name_ru', 'name_ky', 'code']
    inlines = [QualificationLevelInline]

    def levels_count(self, obj):
        return obj.levels.count()
    levels_count.short_description = 'Уровней'


# ---------------------------------------------------------------------------
# Заявки
# ---------------------------------------------------------------------------

class ApplicationDocumentInline(admin.TabularInline):
    model = ApplicationDocument
    extra = 0
    readonly_fields = ['doc_type', 'file', 'file_name', 'file_size', 'description', 'uploaded_at']
    can_delete = False


class AssessmentInline(admin.StackedInline):
    model = Assessment
    extra = 0
    fields = [
        'assessor_name', 'scheduled_at', 'conducted_at', 'location',
        'result', 'score', 'max_score', 'conclusion', 'recommendations',
    ]
    can_delete = False


@admin.register(CertificationApplication)
class CertificationApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'short_reg_number',
        'full_name',
        'profession',
        'application_type',
        'status_badge',
        'experience_years',
        'submitted_at',
        'created_at',
    ]
    list_filter = ['application_type', 'status', 'created_at', 'submitted_at']
    search_fields = ['full_name', 'profession', 'email', 'phone', 'inn', 'registration_number']
    readonly_fields = ['registration_number', 'created_at', 'updated_at', 'submitted_at', 'reviewed_at', 'deleted_at']
    inlines = [ApplicationDocumentInline, AssessmentInline]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    actions = [
        make_status_action('submitted',            '📬 Отметить как поданные'),
        make_status_action('under_review',         '🔍 На рассмотрение'),
        make_status_action('assessment_scheduled', '📅 Назначить оценку'),
        make_status_action('approved',             '✅ Одобрить'),
        make_status_action('rejected',             '❌ Отклонить'),
        make_status_action('completed',            '🏆 Завершить'),
        make_status_action('cancelled',            '🚫 Отменить'),
    ]

    fieldsets = (
        ('Регистрация', {
            'fields': ('registration_number', 'application_type', 'status', 'created_at', 'updated_at', 'deleted_at')
        }),
        ('Данные кандидата', {
            'fields': ('full_name', 'birth_year', 'inn', 'phone', 'email', 'address')
        }),
        ('Профессия', {
            'fields': ('profession_ref', 'profession', 'qualification_level')
        }),
        ('Опыт', {
            'fields': ('experience_years', 'experience_desc')
        }),
        ('Оценщик', {
            'fields': ('assessor_name',)
        }),
        ('Планирование оценки', {
            'fields': ('scheduled_date', 'scheduled_location', 'submitted_at', 'reviewed_at')
        }),
        ('Согласие и примечания', {
            'fields': ('data_consent', 'admin_notes')
        }),
    )

    def short_reg_number(self, obj):
        return obj.short_registration_number
    short_reg_number.short_description = 'Рег. №'

    def status_badge(self, obj):
        color, bg = STATUS_COLORS.get(obj.status, ('#374151', '#f3f4f6'))
        return badge(obj.get_status_display(), color, bg)
    status_badge.short_description = 'Статус'


@admin.register(ApplicationDocument)
class ApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ['application', 'doc_type', 'file_name', 'uploaded_at']
    list_filter = ['doc_type']
    search_fields = ['application__full_name']


# ---------------------------------------------------------------------------
# Оценки
# ---------------------------------------------------------------------------

class AssessmentCriteriaInline(admin.TabularInline):
    model = AssessmentCriteria
    extra = 1
    fields = ['criterion_name', 'max_points', 'earned_points', 'comment']


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['application', 'assessor_name', 'result_badge', 'score_display', 'conducted_at']
    list_filter = ['result', 'conducted_at']
    search_fields = ['application__full_name', 'assessor_name']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [AssessmentCriteriaInline]

    def result_badge(self, obj):
        color, bg = ASSESS_RESULT_COLORS.get(obj.result, ('#374151', '#f3f4f6'))
        return badge(obj.get_result_display(), color, bg)
    result_badge.short_description = 'Результат'

    def score_display(self, obj):
        if obj.score is not None:
            pct = obj.score_percent
            return format_html('{} / {} <small style="color:#6b7280">({}%)</small>', obj.score, obj.max_score, pct)
        return '—'
    score_display.short_description = 'Балл'


# ---------------------------------------------------------------------------
# Сертификаты
# ---------------------------------------------------------------------------

class CertificateVerificationInline(admin.TabularInline):
    model = CertificateVerification
    extra = 0
    readonly_fields = ['verified_at', 'ip_address', 'user_agent']
    can_delete = False


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = [
        'certificate_number',
        'applicant_name',
        'status_badge',
        'issued_at',
        'expires_at',
        'is_valid_display',
        'verifications_count',
    ]
    list_filter = ['status', 'issued_at', 'expires_at']
    search_fields = ['certificate_number', 'application__full_name', 'application__inn']
    readonly_fields = ['created_at', 'updated_at', 'revoked_at']
    inlines = [CertificateVerificationInline]
    ordering = ['-issued_at']

    fieldsets = (
        ('Основные данные', {
            'fields': ('application', 'certificate_number', 'status', 'issued_at', 'expires_at')
        }),
        ('Аннулирование', {
            'classes': ('collapse',),
            'fields': ('revoked_reason', 'revoked_at', 'revoked_by')
        }),
        ('Файлы', {
            'fields': ('file', 'qr_code')
        }),
        ('Служебные поля', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at')
        }),
    )

    def applicant_name(self, obj):
        return obj.application.full_name
    applicant_name.short_description = 'Кандидат'

    def status_badge(self, obj):
        color, bg = CERT_STATUS_COLORS.get(obj.status, ('#374151', '#f3f4f6'))
        return badge(obj.get_status_display(), color, bg)
    status_badge.short_description = 'Статус'

    def is_valid_display(self, obj):
        if obj.is_valid:
            return format_html('<span style="color:#065f46;font-weight:bold;">✓ Действующий</span>')
        return format_html('<span style="color:#991b1b;font-weight:bold;">✗ Недействителен</span>')
    is_valid_display.short_description = 'Действующий?'

    def verifications_count(self, obj):
        return obj.verifications.count()
    verifications_count.short_description = 'Проверок'


# ---------------------------------------------------------------------------
# Журнал аудита
# ---------------------------------------------------------------------------

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'action', 'entity_type', 'entity_id', 'performed_by', 'ip_address']
    list_filter = ['action', 'entity_type', 'created_at']
    search_fields = ['action', 'entity_type', 'entity_id', 'performed_by']
    readonly_fields = ['action', 'entity_type', 'entity_id', 'performed_by', 'old_value', 'new_value', 'ip_address', 'created_at']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# ---------------------------------------------------------------------------
# Заявки на консультацию (Lead Gen)
# ---------------------------------------------------------------------------

CALLBACK_STATUS_COLORS = {
    'new':         ('#1d4ed8', '#dbeafe'),  # синий
    'in_progress': ('#92400e', '#fef3c7'),  # жёлтый
    'completed':   ('#065f46', '#d1fae5'),  # зелёный
    'rejected':    ('#991b1b', '#fee2e2'),  # красный
}


def make_callback_status_action(new_status, label):
    def action(modeladmin, request, queryset):
        queryset.update(status=new_status)
    action.short_description = label
    action.__name__ = f'callback_mark_{new_status}'
    return action


@admin.register(CallbackRequest)
class CallbackRequestAdmin(admin.ModelAdmin):
    list_display = [
        'created_at',
        'name',
        'phone',
        'profession',
        'status_badge',
        'assigned_to',
        'contacted_at',
    ]
    list_filter   = ['status', 'created_at', 'assigned_to']
    search_fields = ['name', 'phone', 'profession']
    ordering      = ['-created_at']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
    actions = [
        make_callback_status_action('in_progress', '📞 В работе'),
        make_callback_status_action('completed',   '✅ Завершена'),
        make_callback_status_action('rejected',    '❌ Отказ'),
        make_callback_status_action('new',         '🔄 Вернуть в новые'),
    ]

    fieldsets = (
        ('Данные кандидата', {
            'fields': ('name', 'phone', 'profession'),
        }),
        ('Обработка', {
            'fields': ('status', 'assigned_to', 'contacted_at', 'manager_note'),
        }),
        ('UTM / Источник трафика', {
            'classes': ('collapse',),
            'fields': ('utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'),
        }),
        ('Служебные поля', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def status_badge(self, obj):
        color, bg = CALLBACK_STATUS_COLORS.get(obj.status, ('#374151', '#f3f4f6'))
        return badge(obj.get_status_display(), color, bg)
    status_badge.short_description = 'Статус'

