from django.urls import path, include
from apps.core import views

urlpatterns = [
    path('', views.IndexView.as_view(), name='index'),
    path('galleries/images/', views.ImageGalleryListView.as_view(), name='image-gallery'),
    path('galleries/videos/', views.VideoGalleryListView.as_view(), name='video-gallery'),
]
