from rest_framework import generics, filters
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from apps.document.models import (
    ProfStandard, DevelopmentPartner, AssessmentCenter, AppraisersExpert, CertifiedUser
)
from apps.document.professions_dict import PROFESSIONS_DICTIONARY
from .serializers import (
    ProfStandardSerializer, DevelopmentPartnerSerializer,
    AssessmentCenterSerializer, AppraisersExpertSerializer, CertifiedUserSerializer
)


class CertifiedUserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProfStandardListView(generics.ListAPIView):
    queryset = ProfStandard.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = ProfStandardSerializer

class DevelopmentPartnerListView(generics.ListAPIView):
    queryset = DevelopmentPartner.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = DevelopmentPartnerSerializer

class DevelopmentPartnerDetailView(generics.RetrieveAPIView):
    queryset = DevelopmentPartner.objects.filter(is_active=True)
    serializer_class = DevelopmentPartnerSerializer

class AssessmentCenterListView(generics.ListAPIView):
    queryset = AssessmentCenter.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = AssessmentCenterSerializer

class AssessmentCenterDetailView(generics.RetrieveAPIView):
    queryset = AssessmentCenter.objects.filter(is_active=True)
    serializer_class = AssessmentCenterSerializer

class AppraisersExpertListView(generics.ListAPIView):
    queryset = AppraisersExpert.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = AppraisersExpertSerializer

class CertifiedUserListView(generics.ListAPIView):
    serializer_class = CertifiedUserSerializer
    pagination_class = CertifiedUserPagination

    def get_queryset(self):
        queryset = CertifiedUser.objects.all().order_by('-order', '-created_at')
        search = self.request.query_params.get('search', '').strip()
        if search:
            # Multilingual profession matching
            matching_professions = []
            search_lower = search.lower()
            for ru_key, translations in PROFESSIONS_DICTIONARY.items():
                if (search_lower in ru_key.lower() or 
                    search_lower in translations.get('ru', '').lower() or 
                    search_lower in translations.get('ky', '').lower() or 
                    search_lower in translations.get('en', '').lower()):
                    matching_professions.append(ru_key)

            # Construct query
            q_filter = (
                Q(last_name__icontains=search) |
                Q(first_name__icontains=search) |
                Q(sur_name__icontains=search) |
                Q(registration_number__icontains=search)
            )
            if matching_professions:
                q_filter |= Q(profession__in=matching_professions)
            else:
                q_filter |= Q(profession__icontains=search)

            queryset = queryset.filter(q_filter)
        return queryset

class CertifiedUserVerifyView(generics.RetrieveAPIView):
    queryset = CertifiedUser.objects.all()
    serializer_class = CertifiedUserSerializer
    lookup_field = 'registration_number'
