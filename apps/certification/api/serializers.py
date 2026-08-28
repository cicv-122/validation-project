from rest_framework import serializers
from apps.certification.models import CertificationApplication, ApplicationDocument, CallbackRequest


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
            'profession',
            'qualification_level',
            'inn',
            'phone',
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
