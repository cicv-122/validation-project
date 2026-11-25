# apps/certification/api/staff_serializers.py
from rest_framework import serializers
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from apps.certification.models import (
    StaffProfile,
    Profession,
    CertificationApplication,
    ApplicationDocument,
)
from apps.document.models import CertifiedUser


class StaffProfessionMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profession
        fields = ['id', 'name_ru', 'name_ky', 'okz_code', 'section']


class StaffProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    assigned_professions = StaffProfessionMiniSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    stats = serializers.SerializerMethodField()
    is_telegram_connected = serializers.SerializerMethodField()
    telegram_bot_url = serializers.SerializerMethodField()

    class Meta:
        model = StaffProfile
        fields = [
            'id',
            'username',
            'full_name',
            'phone',
            'role',
            'role_display',
            'is_active',
            'assigned_professions',
            'stats',
            'telegram_chat_id',
            'telegram_username',
            'is_telegram_connected',
            'telegram_bot_url',
        ]

    def get_is_telegram_connected(self, obj):
        return bool(obj.telegram_chat_id)

    def get_telegram_bot_url(self, obj):
        code = obj.get_or_create_auth_code()
        bot_username = getattr(settings, 'TELEGRAM_BOT_USERNAME', 'cicv_staff_bot')
        return f"https://t.me/{bot_username}?start=auth_{code}"

    def get_stats(self, obj):
        qs = CertificationApplication.objects.filter(deleted_at__isnull=True).exclude(origin='registry_archive')

        # Статистика оцифровки Государственного реестра (759 специалистов)
        from apps.document.models import CertifiedUser
        total_registry = CertifiedUser.objects.count()
        with_inn_count = CertifiedUser.objects.filter(inn__isnull=False).exclude(inn='').count()
        without_inn_count = total_registry - with_inn_count
        digitized_percent = round((with_inn_count / total_registry * 100), 1) if total_registry > 0 else 0

        # Для "На рассмотрении":
        # Руководитель видит все дела в работе по Центру.
        # Рядовой сотрудник видит СТРОГО только те дела, которые ведет лично сам!
        if obj.user.is_superuser or obj.role == 'supervisor':
            under_review_qs = qs
        else:
            under_review_qs = qs.filter(assigned_staff=obj)

        under_review_count = under_review_qs.filter(
            status__in=['under_review', 'assessment_scheduled', 'assessment_in_progress', 'approved']
        ).count()
        scheduled_count = under_review_qs.filter(status__in=['assessment_scheduled', 'assessment_in_progress']).count()
        docs_review_count = under_review_qs.filter(status='under_review').count()
        rejected_exam_count = qs.filter(status='rejected').count()
        rejected_cancelled_count = qs.filter(status='cancelled').count()
        online_count = qs.filter(status='submitted', origin='online').count()
        in_person_count = qs.filter(status='submitted', origin='in_person').count()

        return {
            'total': qs.count(),
            'submitted': qs.filter(status='submitted').count(),
            'submitted_online': online_count,
            'submitted_in_person': in_person_count,
            'under_review': under_review_count,
            'under_review_docs': docs_review_count,
            'scheduled': scheduled_count,
            'approved': under_review_qs.filter(status='approved').count(),
            'completed': qs.filter(status='completed').count(),
            'rejected': qs.filter(status__in=['rejected', 'cancelled']).count(),
            'rejected_exam': rejected_exam_count,
            'rejected_cancelled': rejected_cancelled_count,
            'validation_count': qs.filter(application_type='validation').count(),
            'certification_count': qs.filter(application_type='certification').count(),
            # Счётчики оцифровки архива
            'registry_total': total_registry,
            'registry_with_inn': with_inn_count,
            'registry_without_inn': without_inn_count,
            'registry_digitized_percent': digitized_percent,
        }


class StaffApplicationDocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationDocument
        fields = [
            'id',
            'doc_type',
            'doc_type_display',
            'file',
            'file_url',
            'description',
            'uploaded_at',
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


class StaffApplicationListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_application_type_display', read_only=True)
    short_registration_number = serializers.CharField(read_only=True)
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.full_name', read_only=True, default='')
    assigned_staff_phone = serializers.CharField(source='assigned_staff.phone', read_only=True, default='')

    class Meta:
        model = CertificationApplication
        fields = [
            'id',
            'registration_number',
            'short_registration_number',
            'application_type',
            'type_display',
            'full_name',
            'phone',
            'whatsapp',
            'email',
            'inn',
            'profession',
            'qualification_level',
            'status',
            'status_display',
            'scheduled_date',
            'scheduled_location',
            'assigned_staff_name',
            'assigned_staff_phone',
            'documents_count',
            'certificate_number_issued',
            'is_labor_migrant',
            'migration_country',
            'migration_category',
            'created_at',
            'submitted_at',
        ]


class StaffApplicationDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_application_type_display', read_only=True)
    short_registration_number = serializers.CharField(read_only=True)
    documents = StaffApplicationDocumentSerializer(many=True, read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.full_name', read_only=True, default='')
    assigned_staff_phone = serializers.CharField(source='assigned_staff.phone', read_only=True, default='')
    certified_user_id = serializers.SerializerMethodField()

    class Meta:
        model = CertificationApplication
        fields = [
            'id',
            'registration_number',
            'short_registration_number',
            'application_type',
            'type_display',
            'full_name',
            'birth_year',
            'inn',
            'phone',
            'whatsapp',
            'email',
            'address',
            'profession',
            'specialization',
            'qualification_level',
            'experience_years',
            'experience_desc',
            'structured_resume',
            'status',
            'status_display',
            'assessor_name',
            'assigned_staff_name',
            'assigned_staff_phone',
            'scheduled_date',
            'scheduled_location',
            'admin_notes',
            'certificate_number_issued',
            'certified_user_id',
            'is_labor_migrant',
            'migration_country',
            'migration_category',
            'documents',
            'created_at',
            'submitted_at',
            'reviewed_at',
        ]

    def get_certified_user_id(self, obj):
        try:
            return obj.certified_profile.id if hasattr(obj, 'certified_profile') and obj.certified_profile else None
        except Exception:
            return None


class StaffIssueCertificateSerializer(serializers.Serializer):
    certificate_number = serializers.CharField(
        max_length=50,
        required=True,
        help_text="Официальный номер бланка (например: ЦС № 000760 или 000760)"
    )
    inn = serializers.CharField(
        max_length=14,
        required=False,
        allow_blank=True,
        help_text="14-значный ИНН/ПИН"
    )
    is_foreign_citizen = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Иностранный гражданин (не применять строгую проверку ПИН КР)"
    )
    citizenship = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
        help_text="Код гражданства (KG, RU, KZ, UZ, OTHER)"
    )
    issued_date = serializers.DateField(
        required=False,
        help_text="Дата выдачи документа (по умолчанию сегодня)"
    )

    def validate_certificate_number(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Номер сертификата обязателен")
        return val

    def validate(self, attrs):
        inn = attrs.get('inn')
        is_foreign = attrs.get('is_foreign_citizen', False)
        citizenship = attrs.get('citizenship', '')
        full_name = self.context.get('full_name', '')
        if inn:
            from apps.document.kyrgyz_pin_validator import validate_kyrgyz_pin
            is_ok, clean_or_err, _ = validate_kyrgyz_pin(
                inn,
                full_name=full_name,
                is_foreign=bool(is_foreign),
                citizenship=citizenship,
            )
            if not is_ok:
                raise serializers.ValidationError({'inn': clean_or_err})
            attrs['inn'] = clean_or_err
        return attrs


class StaffCertifiedUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    image_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    has_inn = serializers.SerializerMethodField()
    application_id = serializers.SerializerMethodField()
    scheduled_location = serializers.SerializerMethodField()
    scheduled_date = serializers.SerializerMethodField()
    assessor_name = serializers.SerializerMethodField()
    qualification_level = serializers.SerializerMethodField()
    specialization = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    whatsapp = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CertifiedUser
        fields = [
            'id',
            'registration_number',
            'full_name',
            'last_name',
            'first_name',
            'sur_name',
            'inn',
            'has_inn',
            'profession',
            'issued_date',
            'image',
            'image_url',
            'qr_code',
            'qr_code_url',
            'application',
            'application_id',
            'scheduled_location',
            'scheduled_date',
            'assessor_name',
            'qualification_level',
            'specialization',
            'phone',
            'whatsapp',
            'documents',
            'updated_by_name',
            'created_at',
            'updated_at',
        ]

    def _get_app(self, obj):
        app = getattr(obj, 'application', None)
        if not app and obj.registration_number:
            from apps.certification.models import CertificationApplication
            clean_digits = ''.join(c for c in obj.registration_number if c.isdigit())
            app = (
                CertificationApplication.objects.filter(certificate_number_issued=obj.registration_number, deleted_at__isnull=True).first() or
                (CertificationApplication.objects.filter(certificate_number_issued__icontains=clean_digits, deleted_at__isnull=True).first() if clean_digits else None) or
                CertificationApplication.objects.filter(full_name__iexact=obj.get_full_name(), deleted_at__isnull=True).first()
            )
        return app

    def get_application_id(self, obj):
        app = self._get_app(obj)
        return app.id if app else None

    def get_scheduled_location(self, obj):
        app = self._get_app(obj)
        return app.scheduled_location if app else ''

    def get_scheduled_date(self, obj):
        app = self._get_app(obj)
        if app and app.scheduled_date:
            return str(app.scheduled_date)
        return str(obj.issued_date) if obj.issued_date else None

    def get_assessor_name(self, obj):
        app = self._get_app(obj)
        return app.assessor_name if app else ''

    def get_qualification_level(self, obj):
        app = self._get_app(obj)
        return app.qualification_level if app else ''

    def get_specialization(self, obj):
        app = self._get_app(obj)
        return app.specialization if app else ''

    def get_phone(self, obj):
        app = self._get_app(obj)
        if app and app.phone and app.phone != '—':
            return app.phone
        return ''

    def get_whatsapp(self, obj):
        app = self._get_app(obj)
        if app and app.whatsapp and app.whatsapp != '—':
            return app.whatsapp
        return ''

    def get_documents(self, obj):
        app = self._get_app(obj)
        if app:
            return StaffApplicationDocumentSerializer(
                app.documents.all().order_by('-uploaded_at'),
                many=True,
                context=self.context
            ).data
        return []

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        # Если в CertifiedUser нет фото, пробуем взять из привязанной заявки
        app = self._get_app(obj)
        if app:
            photo_doc = app.documents.filter(doc_type='photo').first()
            if photo_doc and photo_doc.file:
                return request.build_absolute_uri(photo_doc.file.url) if request else photo_doc.file.url
        return None

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code:
            return request.build_absolute_uri(obj.qr_code.url) if request else obj.qr_code.url
        return None

    def get_has_inn(self, obj):
        return bool(obj.inn and len(str(obj.inn).strip()) >= 8)

    def get_updated_by_name(self, obj):
        app = self._get_app(obj)
        if app and app.assigned_staff:
            return app.assigned_staff.full_name
        return None


class StaffCertifiedUserUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, write_only=True)
    is_foreign_citizen = serializers.BooleanField(required=False, default=False, write_only=True)
    citizenship = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)
    remove_image = serializers.BooleanField(required=False, write_only=True)
    scheduled_location = serializers.CharField(required=False, allow_blank=True, write_only=True)
    scheduled_date = serializers.DateField(required=False, allow_null=True, write_only=True)
    assessor_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    qualification_level = serializers.CharField(required=False, allow_blank=True, write_only=True)
    specialization = serializers.CharField(required=False, allow_blank=True, write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, write_only=True)
    whatsapp = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = CertifiedUser
        fields = [
            'registration_number',
            'full_name',
            'last_name',
            'first_name',
            'sur_name',
            'inn',
            'is_foreign_citizen',
            'citizenship',
            'profession',
            'issued_date',
            'image',
            'remove_image',
            'scheduled_location',
            'scheduled_date',
            'assessor_name',
            'qualification_level',
            'specialization',
            'phone',
            'whatsapp',
        ]

    def validate_inn(self, value):
        if value:
            return "".join(filter(str.isdigit, str(value)))
        return value

    def validate_profession(self, value):
        if value:
            from apps.document.profession_cleaner import clean_profession_name
            return clean_profession_name(value)
        return value

    def validate(self, attrs):
        is_foreign = attrs.pop('is_foreign_citizen', False)
        citizenship = attrs.pop('citizenship', '')
        inn = attrs.get('inn')
        if inn:
            from apps.document.kyrgyz_name_normalizer import normalize_kyrgyz_full_name
            from apps.document.kyrgyz_pin_validator import validate_kyrgyz_pin

            raw_name = attrs.get('full_name') or (self.instance.get_full_name() if self.instance else '')
            is_ok, clean_or_err, _ = validate_kyrgyz_pin(
                inn,
                full_name=raw_name,
                is_foreign=bool(is_foreign),
                citizenship=citizenship,
            )
            if not is_ok:
                raise serializers.ValidationError({'inn': clean_or_err})
            inn = clean_or_err
            attrs['inn'] = inn

            target_name = normalize_kyrgyz_full_name(raw_name).strip().lower()
            qs = CertifiedUser.objects.filter(inn=inn)
            if self.instance and self.instance.pk:
                qs = qs.exclude(pk=self.instance.pk)
            for other in qs:
                other_name = normalize_kyrgyz_full_name(other.get_full_name()).strip().lower()
                if target_name and other_name and other_name != target_name:
                    raise serializers.ValidationError({
                        'inn': (
                            f"Этот ИНН ({inn}) уже привязан к другому специалисту: "
                            f"{other.get_full_name()} ({other.registration_number}). "
                            f"Проверьте правильность ввода!"
                        )
                    })
        return attrs

    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        remove_image = validated_data.pop('remove_image', False)
        scheduled_location = validated_data.pop('scheduled_location', None)
        scheduled_date = validated_data.pop('scheduled_date', None)
        assessor_name = validated_data.pop('assessor_name', None)
        qualification_level = validated_data.pop('qualification_level', None)
        specialization = validated_data.pop('specialization', None)
        phone = validated_data.pop('phone', None)
        whatsapp = validated_data.pop('whatsapp', None)

        if remove_image:
            if instance.image:
                try:
                    instance.image.delete(save=False)
                except Exception:
                    pass
            instance.image = None

        if full_name:
            from apps.document.kyrgyz_name_normalizer import split_kyrgyz_fio
            instance.last_name, instance.first_name, instance.sur_name = split_kyrgyz_fio(full_name)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        # Синхронизация с привязанной заявкой кандидата
        from apps.certification.api.staff_views import get_or_create_app_for_certified_user
        app = get_or_create_app_for_certified_user(instance)
        if app:
            if scheduled_location is not None:
                app.scheduled_location = scheduled_location
            if scheduled_date is not None:
                app.scheduled_date = scheduled_date
            if assessor_name is not None:
                app.assessor_name = assessor_name
            if qualification_level is not None:
                app.qualification_level = qualification_level
            if specialization is not None:
                app.specialization = specialization
            if phone is not None:
                app.phone = phone
            if whatsapp is not None:
                app.whatsapp = whatsapp

            staff = self.context.get('staff')
            if staff:
                app.assigned_staff = staff

            # Также синхронизируем имя, ИНН, профессию и номер сертификата
            app.full_name = instance.get_full_name()
            app.inn = instance.inn or ''
            app.profession = instance.profession or ''
            app.certificate_number_issued = instance.registration_number or ''
            app.save()

        return instance

