# apps/certification/api/staff_views.py
"""
Staff workspace views barrel module.
Decomposed into:
- staff_auth_views: authentication, profile, telegram
- staff_application_views: applications queue, candidate dossier, status transitions, certificate issuance
- staff_registry_views: certified specialists registry, clusters, documents, QR codes
"""

from .staff_auth_views import (
    StaffAuthLoginView,
    StaffCurrentProfileView,
    StaffProfileDisconnectTelegramView,
)

from .staff_application_views import (
    StaffApplicationsListView,
    StaffApplicationDetailView,
    StaffApplicationStatusUpdateView,
    StaffApplicationUploadDocumentView,
    StaffApplicationDeleteDocumentView,
    StaffIssueCertificateView,
    StaffApplicationQRCodeDownloadView,
)

from .staff_registry_views import (
    StaffCertifiedUserPagination,
    StaffCertifiedUsersListView,
    StaffCertifiedUserDetailView,
    StaffCertifiedUserUploadDocumentView,
    StaffCertifiedUserDeleteDocumentView,
    StaffCertifiedUserClustersView,
    StaffCertifiedUserQRCodeDownloadView,
)

from .staff_directory_views import (
    StaffProfessionsManageView,
    StaffProfessionDetailManageView,
    StaffExpertsManageView,
    StaffExpertDetailManageView,
    StaffExpertsRenameOrganizationView,
    StaffIndicators2026View,
)

from apps.document.services import get_or_create_app_for_certified_user

__all__ = [
    'StaffAuthLoginView',
    'StaffCurrentProfileView',
    'StaffProfileDisconnectTelegramView',
    'StaffApplicationsListView',
    'StaffApplicationDetailView',
    'StaffApplicationStatusUpdateView',
    'StaffApplicationUploadDocumentView',
    'StaffApplicationDeleteDocumentView',
    'StaffIssueCertificateView',
    'StaffApplicationQRCodeDownloadView',
    'StaffProfessionsManageView',
    'StaffProfessionDetailManageView',
    'StaffExpertsManageView',
    'StaffExpertDetailManageView',
    'StaffExpertsRenameOrganizationView',
    'StaffIndicators2026View',
    'StaffCertifiedUserPagination',
    'StaffCertifiedUsersListView',
    'StaffCertifiedUserDetailView',
    'StaffCertifiedUserUploadDocumentView',
    'StaffCertifiedUserDeleteDocumentView',
    'StaffCertifiedUserClustersView',
    'StaffCertifiedUserQRCodeDownloadView',
    'get_or_create_app_for_certified_user',
]
