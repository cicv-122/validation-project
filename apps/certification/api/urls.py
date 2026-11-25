from django.urls import path
from apps.certification.api.views import (
    ApplicationCreateView,
    ApplicationStatusView,
    ApplicationRecoverView,
    CallbackRequestCreateView,
    ProfessionListView,
)
from apps.certification.api.staff_views import (
    StaffAuthLoginView,
    StaffCurrentProfileView,
    StaffProfileDisconnectTelegramView,
    StaffApplicationsListView,
    StaffApplicationDetailView,
    StaffApplicationStatusUpdateView,
    StaffApplicationUploadDocumentView,
    StaffApplicationDeleteDocumentView,
    StaffIssueCertificateView,
    StaffCertifiedUsersListView,
    StaffCertifiedUserClustersView,
    StaffCertifiedUserDetailView,
    StaffCertifiedUserUploadDocumentView,
    StaffCertifiedUserDeleteDocumentView,
    StaffCertifiedUserQRCodeDownloadView,
    StaffApplicationQRCodeDownloadView,
    StaffProfessionsManageView,
    StaffProfessionDetailManageView,
    StaffExpertsManageView,
    StaffExpertDetailManageView,
    StaffExpertsRenameOrganizationView,
    StaffIndicators2026View,
)

urlpatterns = [
    path('professions/', ProfessionListView.as_view(), name='certification-professions'),
    path('apply/', ApplicationCreateView.as_view(), name='certification-apply'),
    path('status/<uuid:registration_number>/', ApplicationStatusView.as_view(), name='certification-status'),
    path('recover/', ApplicationRecoverView.as_view(), name='certification-recover'),
    path('callback/', CallbackRequestCreateView.as_view(), name='certification-callback'),

    # Кабинет сотрудника ЦНСВ (Staff Workspace)
    path('staff/auth/login/', StaffAuthLoginView.as_view(), name='staff-auth-login'),
    path('staff/profile/', StaffCurrentProfileView.as_view(), name='staff-current-profile'),
    path('staff/profile/telegram/disconnect/', StaffProfileDisconnectTelegramView.as_view(), name='staff-profile-telegram-disconnect'),
    path('staff/applications/', StaffApplicationsListView.as_view(), name='staff-applications-list'),
    path('staff/applications/<int:pk>/', StaffApplicationDetailView.as_view(), name='staff-application-detail'),
    path('staff/applications/<int:pk>/status/', StaffApplicationStatusUpdateView.as_view(), name='staff-application-status-update'),
    path('staff/applications/<int:pk>/upload-document/', StaffApplicationUploadDocumentView.as_view(), name='staff-application-upload-document'),
    path('staff/applications/<int:pk>/documents/<int:doc_id>/', StaffApplicationDeleteDocumentView.as_view(), name='staff-application-delete-document'),
    path('staff/applications/<int:pk>/issue-certificate/', StaffIssueCertificateView.as_view(), name='staff-issue-certificate'),
    path('staff/applications/<int:pk>/qr/', StaffApplicationQRCodeDownloadView.as_view(), name='staff-application-qr-download'),

    # Справочники ЦНСВ (Профессии и Эксперты)
    path('staff/professions/', StaffProfessionsManageView.as_view(), name='staff-professions-manage'),
    path('staff/professions/<int:pk>/', StaffProfessionDetailManageView.as_view(), name='staff-profession-detail-manage'),
    path('staff/experts/', StaffExpertsManageView.as_view(), name='staff-experts-manage'),
    path('staff/experts/rename-organization/', StaffExpertsRenameOrganizationView.as_view(), name='staff-experts-rename-org'),
    path('staff/experts/<int:expert_id>/', StaffExpertDetailManageView.as_view(), name='staff-expert-detail-manage'),
    path('staff/indicators-2026/', StaffIndicators2026View.as_view(), name='staff-indicators-2026'),

    # Управление архивом сертифицированных специалистов (Реестр)
    path('staff/certified-users/clusters/', StaffCertifiedUserClustersView.as_view(), name='staff-certified-users-clusters'),
    path('staff/certified-users/', StaffCertifiedUsersListView.as_view(), name='staff-certified-users-list'),
    path('staff/certified-users/<int:pk>/', StaffCertifiedUserDetailView.as_view(), name='staff-certified-user-detail'),
    path('staff/certified-users/<int:pk>/upload-document/', StaffCertifiedUserUploadDocumentView.as_view(), name='staff-certified-user-upload-document'),
    path('staff/certified-users/<int:pk>/documents/<int:doc_id>/', StaffCertifiedUserDeleteDocumentView.as_view(), name='staff-certified-user-delete-document'),
    path('staff/certified-users/<int:pk>/qr/', StaffCertifiedUserQRCodeDownloadView.as_view(), name='staff-certified-user-qr-download'),
]
