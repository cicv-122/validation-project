from django.urls import path
from services.seo.robots import robots_txt
from services.seo.sitemap import sitemap_xml

urlpatterns = [
    path('robots.txt', robots_txt),    # убрали слэш в конце
    path('sitemap.xml', sitemap_xml),  # добавили sitemap
]