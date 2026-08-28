from django.urls import path
from .views import MainSliderListView, ImageGalleryListView, VideoGalleryListView, ManagementMemberListView

urlpatterns = [
    path('sliders/', MainSliderListView.as_view(), name='api-sliders'),
    path('gallery/images/', ImageGalleryListView.as_view(), name='api-gallery-images'),
    path('gallery/videos/', VideoGalleryListView.as_view(), name='api-gallery-videos'),
    path('management/', ManagementMemberListView.as_view(), name='api-management-list'),
]
