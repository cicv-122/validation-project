from django.db.models import Prefetch
from django.shortcuts import render, redirect
from django.views.generic import TemplateView, FormView, ListView, DetailView
from django.utils.translation import gettext_lazy as _

from apps.core.models import MainSlider, ImageGallery, VideoGallery
from apps.news.models import News


class IndexView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs) -> dict:
        context: dict = super().get_context_data(**kwargs)
        context['news'] = News.objects.all()[:10]
        context['sliders'] = MainSlider.objects.all()
        return context


class ImageGalleryListView(ListView):
    model = ImageGallery
    context_object_name = 'galleries'
    template_name = 'galleries/images.html'


class VideoGalleryListView(ListView):
    model = VideoGallery
    context_object_name = 'galleries'
    template_name = 'galleries/videos.html'
