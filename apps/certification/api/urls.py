from django.urls import path
from apps.certification.api.views import (
    ApplicationCreateView,
    ApplicationStatusView,
    ApplicationRecoverView,
    CallbackRequestCreateView,
)

urlpatterns = [
    path('apply/', ApplicationCreateView.as_view(), name='certification-apply'),
    path('status/<uuid:registration_number>/', ApplicationStatusView.as_view(), name='certification-status'),
    path('recover/', ApplicationRecoverView.as_view(), name='certification-recover'),
    path('callback/', CallbackRequestCreateView.as_view(), name='certification-callback'),
]
