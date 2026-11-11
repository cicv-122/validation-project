from rest_framework import serializers
from apps.certification.models import (
    CertificationApplication,
    ApplicationDocument,
    CallbackRequest,
    Profession,
    Specialization,
)


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'title_ru', 'title_ky', 'order']


class ProfessionSerializer(serializers.ModelSerializer):
    specializations = SpecializationSerializer(many=True, read_only=True)

    class Meta:
        model = Profession
        fields = [
            'id',
            'okz_code',
            'name_ru',
            'name_ky',
            'section',
            'qual_level_min',
            'qual_level_max',
            'specializations',
        ]


class ApplicationDocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)

    class Meta:
        model = ApplicationDocument
        fields = ['id', 'doc_type', 'doc_type_display', 'file', 'description', 'uploaded_at']


class CertificationApplicationSerializer(serializers.ModelSerializer):
    documents = ApplicationDocumentSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_application_type_display', read_only=True)
    short_registration_number = serializers.CharField(read_only=True)
    is_foreign_citizen = serializers.BooleanField(required=False, default=False, write_only=True)
    citizenship = serializers.CharField(required=False, allow_blank=True, default='', write_only=True)

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
            'profession_ref',
            'profession',
            'specialization_ref',
            'specialization',
            'qualification_level',
            'structured_resume',
            'inn',
            'is_foreign_citizen',
            'citizenship',
            'phone',
            'whatsapp',
            'email',
            'address',
            'data_consent',
            'status',
            'status_display',
            'scheduled_date',
            'scheduled_location',
            'created_at',
            'documents',
        ]
        read_only_fields = [
            'registration_number',
            'short_registration_number',
            'status',
            'scheduled_date',
            'scheduled_location',
            'created_at',
        ]

    def validate_data_consent(self, value):
        if not value:
            raise serializers.ValidationError(
                'Необходимо дать согласие на обработку персональных данных.'
            )
        return value

    def validate_birth_year(self, value):
        if value is not None:
            from django.utils import timezone
            current_year = timezone.now().year
            if value < 1935 or value > current_year - 14:
                raise serializers.ValidationError(
                    f'Укажите корректный год рождения (от 1935 до {current_year - 14}).'
                )
        return value

    def validate(self, attrs):
        is_foreign = attrs.pop('is_foreign_citizen', False)
        citizenship = attrs.pop('citizenship', '')
        full_name = attrs.get('full_name', '')
        if full_name:
            from apps.document.kyrgyz_name_normalizer import normalize_kyrgyz_full_name
            full_name = normalize_kyrgyz_full_name(full_name)
            attrs['full_name'] = full_name

        inn = attrs.get('inn', '')
        if inn:
            from apps.document.kyrgyz_pin_validator import validate_kyrgyz_pin
            is_ok, clean_or_err, parsed_info = validate_kyrgyz_pin(
                inn,
                full_name=full_name,
                is_foreign=bool(is_foreign),
                citizenship=citizenship,
            )
            if not is_ok:
                raise serializers.ValidationError({'inn': clean_or_err})
            attrs['inn'] = clean_or_err

            if parsed_info and parsed_info.get('birth_year'):
                pin_year = parsed_info['birth_year']
                if not attrs.get('birth_year'):
                    attrs['birth_year'] = pin_year
                elif int(attrs['birth_year']) != int(pin_year):
                    raise serializers.ValidationError({
                        'birth_year': f'Указанный год рождения ({attrs["birth_year"]}) не совпадает с годом рождения в ПИН ({pin_year}).'
                    })
        return attrs


class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public status check"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_application_type_display', read_only=True)

    class Meta:
        model = CertificationApplication
        fields = [
            'registration_number',
            'short_registration_number',
            'full_name',
            'profession',
            'specialization',
            'application_type',
            'type_display',
            'status',
            'status_display',
            'scheduled_date',
            'scheduled_location',
            'created_at',
        ]


class CallbackRequestSerializer(serializers.ModelSerializer):
    """Serializer for the simple lead-gen callback form."""

    class Meta:
        model = CallbackRequest
        fields = [
            'id',
            'name',
            'phone',
            'profession',
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
        ]

    def validate_phone(self, value):
        cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
        if len(cleaned) < 9:
            raise serializers.ValidationError('Введите корректный номер телефона.')
        return value
