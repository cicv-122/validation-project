from rest_framework import serializers
from apps.news.models import News, NewsImages, NewsVideo


class NewsImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = NewsImages
        fields = ['id', 'image', 'created']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class NewsVideoSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = NewsVideo
        fields = ['id', 'file', 'created']

    def get_file(self, obj):
        return obj.file.url if obj.file else None


from apps.document.api.serializers import CertifiedUserSerializer


class NewsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    images = NewsImageSerializer(many=True, read_only=True)
    videos = NewsVideoSerializer(many=True, read_only=True)
    certified_users = CertifiedUserSerializer(many=True, read_only=True)

    class Meta:
        model = News
        fields = ['id', 'title', 'slug', 'description', 'image', 'created', 'images', 'videos', 'certified_users']

    def get_image(self, obj):
        return obj.image.url if obj.image else None
