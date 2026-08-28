from django.urls import path, include
from apps.document import views

urlpatterns = [
    path('prof-standards/', views.ProfStandardListView.as_view(), name='prof_standards'),
    path('development_partners/', views.DevelopmentPartnerListView.as_view(), name='development_partners'),
    path('assessment_centers/', views.AssessmentCenterListView.as_view(), name='assessment_centers'),
    path('appraisers_expert/', views.AppraisersExpertListView.as_view(), name='appraisers_expert'),
    path('certified_users/', views.CertifiedUserListView.as_view(), name='certified_user'),
]
