from django.urls import path
from .views import (
    ProfStandardListView, DevelopmentPartnerListView, DevelopmentPartnerDetailView,
    AssessmentCenterListView, AssessmentCenterDetailView, AppraisersExpertListView, CertifiedUserListView, CertifiedUserVerifyView
)

urlpatterns = [
    path('prof-standards/', ProfStandardListView.as_view(), name='api-prof-standards'),
    path('partners/', DevelopmentPartnerListView.as_view(), name='api-partners'),
    path('partners/<int:pk>/', DevelopmentPartnerDetailView.as_view(), name='api-partners-detail'),
    path('assessment-centers/', AssessmentCenterListView.as_view(), name='api-assessment-centers'),
    path('assessment-centers/<int:pk>/', AssessmentCenterDetailView.as_view(), name='api-assessment-centers-detail'),
    path('experts/', AppraisersExpertListView.as_view(), name='api-experts'),
    path('certified-users/', CertifiedUserListView.as_view(), name='api-certified-users'),
    path('certified-users/verify/<str:registration_number>/', CertifiedUserVerifyView.as_view(), name='api-certified-user-verify'),
]
