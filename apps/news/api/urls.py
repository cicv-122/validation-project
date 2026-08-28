from django.urls import path
from .views import NewsListView, NewsDetailView

urlpatterns = [
    path('', NewsListView.as_view(), name='api-news-list'),
    path('<slug:slug>/', NewsDetailView.as_view(), name='api-news-detail'),
]
