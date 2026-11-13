from django.db.models import Q
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
            'whatsapp_url', 'tiktok_url', 'youtube_url', 'twitter_url', 'threads_url'
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
    has_inn = serializers.SerializerMethodField()
    assessment_details = serializers.SerializerMethodField()

    class Meta:
        model = CertifiedUser
        fields = [
            'id', 'registration_number', 'full_name', 'image', 'profession',
            'issued_date', 'qr_code', 'created_at', 'updated_at',
            'news_articles', 'has_inn', 'assessment_details'
        ]

    def get_has_inn(self, obj):
        return bool(obj.inn)

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        # Если в CertifiedUser нет фото, берем цифровое фото 3x4 из привязанной заявки
        app = getattr(obj, 'application', None)
        if not app and obj.registration_number:
            from apps.certification.models import CertificationApplication
            app = CertificationApplication.objects.filter(
                certificate_number_issued=obj.registration_number,
                deleted_at__isnull=True
            ).first()

        if app:
            photo_doc = app.documents.filter(doc_type='photo').exclude(
                description='Фото процесса прохождения практического экзамена'
            ).first()
            if photo_doc and photo_doc.file:
                return request.build_absolute_uri(photo_doc.file.url) if request else photo_doc.file.url
        return None

    def get_qr_code(self, obj):
        import os
        has_file = False
        try:
            if obj.qr_code and hasattr(obj.qr_code, 'path'):
                has_file = os.path.exists(obj.qr_code.path)
        except Exception:
            has_file = False

        if not has_file and obj.registration_number:
            try:
                obj.generate_qr_code(force=True)
                obj.save(update_fields=['qr_code', 'verification_token'])
            except Exception:
                pass

        if obj.qr_code:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.qr_code.url) if request else obj.qr_code.url
        return None

    def get_assessment_details(self, obj):
        app = getattr(obj, 'application', None)
        if not app and obj.registration_number:
            from apps.certification.models import CertificationApplication
            clean_digits = ''.join(c for c in obj.registration_number if c.isdigit())
            app = (
                CertificationApplication.objects.filter(certificate_number_issued=obj.registration_number, deleted_at__isnull=True).first() or
                (CertificationApplication.objects.filter(certificate_number_issued__icontains=clean_digits, deleted_at__isnull=True).first() if clean_digits else None) or
                CertificationApplication.objects.filter(full_name__iexact=obj.get_full_name(), deleted_at__isnull=True).first()
            )

        request = self.context.get('request')
        def build_url(f):
            if not f:
                return None
            try:
                return request.build_absolute_uri(f.url) if request else f.url
            except Exception:
                return None

        if not app:
            # Для архивных специалистов из реестра возвращаем официальные архивные реквизиты
            return {
                'is_archived_record': True,
                'application_type': 'certification',
                'application_type_display': 'Независимая сертификация',
                'qualification_level': 'Квалификация подтверждена',
                'specialization': None,
                'scheduled_date': str(obj.issued_date) if obj.issued_date else None,
                'scheduled_location': 'Государственная аттестационная площадка ЦНСВ МП КР',
                'assessor_name': 'Отраслевая квалификационная комиссия ЦНСВ при МП КР',
                'evaluation_documents': [],
                'exam_photos': [],
                'candidate_documents': [],
                'certificate_scan_url': None,
            }

        docs = app.documents.all()

        # 1. Оценочные листы, протоколы комиссии, экзаменационные задания
        evaluation_docs = []
        for d in docs.filter(doc_type__in=['evaluation_sheet', 'exam_protocol', 'exam_task']):
            url = build_url(d.file)
            if url:
                evaluation_docs.append({
                    'id': d.id,
                    'doc_type': d.doc_type,
                    'doc_type_display': d.get_doc_type_display(),
                    'file_url': url,
                    'file_name': d.file_name or d.file.name.split('/')[-1],
                    'description': d.description,
                })

        # 2. Фотофиксация с места экзамена (практика)
        exam_photos = []
        for d in docs.filter(
            Q(doc_type__in=['assessment_photo', 'work_sample']) |
            Q(doc_type='photo', description='Фото процесса прохождения практического экзамена')
        ):
            url = build_url(d.file)
            if url:
                exam_photos.append({
                    'id': d.id,
                    'file_url': url,
                    'description': d.description,
                })

        # 3. Личные документы кандидата (заявление, диплом, резюме, портфолио, договор)
        candidate_docs = []
        for d in docs.filter(doc_type__in=['application_form', 'diploma', 'resume', 'portfolio', 'contract', 'payment_receipt', 'other']):
            url = build_url(d.file)
            if url:
                candidate_docs.append({
                    'id': d.id,
                    'doc_type': d.doc_type,
                    'doc_type_display': d.get_doc_type_display(),
                    'file_url': url,
                    'file_name': d.file_name or d.file.name.split('/')[-1],
                    'description': d.description,
                })

        # 4. Скан выданного сертификата
        cert_scan = docs.filter(doc_type='certificate_scan').first()

        has_digital_materials = bool(
            evaluation_docs or exam_photos or candidate_docs or cert_scan or
            app.scheduled_location or app.assessor_name
        )

        return {
            'is_archived_record': not has_digital_materials,
            'application_type': app.application_type,
            'application_type_display': app.get_application_type_display(),
            'qualification_level': app.qualification_level or 'Квалификация подтверждена',
            'specialization': app.specialization,
            'scheduled_date': str(app.scheduled_date) if app.scheduled_date else (str(obj.issued_date) if obj.issued_date else None),
            'scheduled_location': app.scheduled_location or 'Центр независимой сертификации и валидации МП КР',
            'assessor_name': app.assessor_name or 'Квалификационная комиссия ЦНСВ при МП КР',
            'evaluation_documents': evaluation_docs,
            'exam_photos': exam_photos,
            'candidate_documents': candidate_docs,
            'certificate_scan_url': build_url(cert_scan.file) if cert_scan else None,
        }

