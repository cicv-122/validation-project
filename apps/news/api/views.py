from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from apps.news.models import News
from .serializers import NewsSerializer

class NewsListView(generics.ListAPIView):
    serializer_class = NewsSerializer

    def get_queryset(self):
        queryset = News.active.all()
        try:
            offset = int(self.request.query_params.get('offset', 0))
            limit = int(self.request.query_params.get('limit', 0))
        except (ValueError, TypeError):
            return queryset

        if offset:
            queryset = queryset[offset:]
        if limit:
            queryset = queryset[:limit]
        return queryset

class NewsDetailView(generics.RetrieveAPIView):
    queryset = News.active.all()
    serializer_class = NewsSerializer
    lookup_field = 'slug'

    def get_object(self):
        """Safe lookup by slug: returns first match to avoid MultipleObjectsReturned."""
        slug = self.kwargs.get('slug')
        obj = News.active.filter(slug=slug).first()
        if obj is None:
            raise NotFound(detail='Новость не найдена.')
        return obj
