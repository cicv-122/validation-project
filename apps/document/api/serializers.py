from rest_framework import serializers
from apps.document.models import (
    ProfStandard, DevelopmentPartner, AssessmentCenter, AssessmentCenterDirector, AppraisersExpert, CertifiedUser
)


class ProfStandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfStandard
        fields = ['id', 'title', 'file', 'created_at']


class DevelopmentPartnerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = DevelopmentPartner
        fields = [
            'id', 'title', 'description', 'url', 'address', 'map_url', 'phone', 'email', 
            'image', 'file', 'created_at',
            'facebook_url', 'instagram_url', 'linkedin_url', 'telegram_url',
            'whatsapp_url', 'tiktok_url', 'youtube_url'
        ]

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class AssessmentCenterDirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentCenterDirector
        fields = ['id', 'name', 'phone']


class AssessmentCenterExpertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppraisersExpert
        fields = ['id', 'profession', 'appraisers', 'appraiser_employer', 'consultant']


class AssessmentCenterSerializer(serializers.ModelSerializer):
    directors = AssessmentCenterDirectorSerializer(many=True, read_only=True)
    experts = AssessmentCenterExpertSerializer(source='assessment_centers', many=True, read_only=True)

    class Meta:
        model = AssessmentCenter
        fields = ['id', 'organization', 'address', 'map_url', 'phone', 'email', 'website', 'directors', 'experts', 'created_at']


class AppraisersExpertSerializer(serializers.ModelSerializer):
    assessment_center = AssessmentCenterSerializer(read_only=True)

    class Meta:
        model = AppraisersExpert
        fields = ['id', 'assessment_center', 'profession', 'appraisers', 'appraiser_employer', 'consultant', 'created_at']


class CertifiedUserNewsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        from apps.news.models import News
        model = News
        fields = ['id', 'title', 'slug', 'image', 'created']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class CertifiedUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    image = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()
    news_articles = CertifiedUserNewsSerializer(many=True, read_only=True)

    class Meta:
        model = CertifiedUser
        fields = ['id', 'registration_number', 'full_name', 'image', 'profession', 'issued_date', 'qr_code', 'created_at', 'news_articles']

    def get_image(self, obj):
        return obj.image.url if obj.image else None

    def get_qr_code(self, obj):
        return obj.qr_code.url if obj.qr_code else None
