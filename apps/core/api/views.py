from rest_framework import generics
from apps.core.models import MainSlider, ImageGallery, VideoGallery, ManagementMember
from .serializers import MainSliderSerializer, ImageGallerySerializer, VideoGallerySerializer, ManagementMemberSerializer

class MainSliderListView(generics.ListAPIView):
    queryset = MainSlider.objects.all()
    serializer_class = MainSliderSerializer

from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from operator import itemgetter
from apps.news.models import News, NewsImages

class GalleryPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

class ImageGalleryListView(generics.ListAPIView):
    serializer_class = ImageGallerySerializer
    pagination_class = GalleryPagination

    def list(self, request, *args, **kwargs):
        galleries = ImageGallery.objects.all()
        gallery_data = [
            {'id': f"g_{g.id}", 'image': g.image.url if g.image else None, 'created': g.created}
            for g in galleries if g.image
        ]
        
        news = News.active.all()
        news_data = [
            {'id': f"n_{n.id}", 'image': n.image.url if n.image else None, 'created': n.created}
            for n in news if n.image
        ]
        
        news_images = NewsImages.objects.all()
        news_images_data = [
            {'id': f"ni_{ni.id}", 'image': ni.image.url if ni.image else None, 'created': ni.created}
            for ni in news_images if ni.image
        ]
        
        combined = gallery_data + news_data + news_images_data
        combined.sort(key=itemgetter('created'), reverse=True)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(combined, request, view=self)
        if page is not None:
            return paginator.get_paginated_response(page)
        
        return Response(combined)

from apps.news.models import News, NewsImages, NewsVideo
import re

def get_youtube_embed_url(url):
    _yt = re.compile(r'(https?://)?(www\.)?((youtu\.be/)|(youtube\.com/watch\?v=))([A-Za-z0-9-_]+)', re.I)
    match = _yt.search(url)
    if match:
        return f"https://www.youtube.com/embed/{match.groups()[5]}"
    return url

class VideoGalleryListView(generics.ListAPIView):
    serializer_class = VideoGallerySerializer
    pagination_class = GalleryPagination

    def list(self, request, *args, **kwargs):
        videos = VideoGallery.objects.all()
        video_data = [
            {
                'id': f"v_{v.id}", 
                'url': v.url, 
                'embed_url': get_youtube_embed_url(v.url),
                'file_url': None,
                'created': v.created
            }
            for v in videos
        ]
        
        news_videos = NewsVideo.objects.all()
        news_video_data = [
            {
                'id': f"nv_{nv.id}", 
                'url': None, 
                'embed_url': None,
                'file_url': nv.file.url if nv.file else None,
                'created': nv.created
            }
            for nv in news_videos if nv.file
        ]
        
        combined = video_data + news_video_data
        combined.sort(key=itemgetter('created'), reverse=True)
        
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(combined, request, view=self)
        if page is not None:
            return paginator.get_paginated_response(page)
        
        return Response(combined)

class ManagementMemberListView(generics.ListAPIView):
    serializer_class = ManagementMemberSerializer

    def get_queryset(self):
        return ManagementMember.objects.filter(is_active=True).order_by('order', 'id')
