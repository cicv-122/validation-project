from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from services.seo.urls import urlpatterns as seo_urlpatterns

from django.urls import re_path
from .react_view import ReactAppView


api_patterns = [
    path('', include('apps.core.api.urls')),
    path('news/', include('apps.news.api.urls')),
    path('documents/', include('apps.document.api.urls')),
    path('certification/', include('apps.certification.api.urls')),
]
urlpatterns = [
    path('api/v1/', include(api_patterns)),
    path('', include(seo_urlpatterns)),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('admin/', admin.site.urls),
    path('i18n/', include('django.conf.urls.i18n')),
]

# Catch-all for React frontend
urlpatterns += [
    re_path(r'^(?!api|admin|ckeditor|media|static|assets|robots\.txt|sitemap\.xml).*', ReactAppView.as_view(), name='react-app'),
]

if settings.DEBUG:
    urlpatterns += (
        static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    )
    import debug_toolbar
    urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]

