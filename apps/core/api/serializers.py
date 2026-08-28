from rest_framework import serializers
from apps.core.models import MainSlider, ImageGallery, VideoGallery, ManagementMember


class MainSliderSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MainSlider
        fields = ['id', 'image', 'created']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class ImageGallerySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ImageGallery
        fields = ['id', 'image', 'created']

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class VideoGallerySerializer(serializers.ModelSerializer):
    embed_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoGallery
        fields = ['id', 'url', 'embed_url', 'created']

    def get_embed_url(self, obj):
        import re
        _yt = re.compile(r'(https?://)?(www\.)?((youtu\.be/)|(youtube\.com/watch\?v=))([A-Za-z0-9-_]+)', re.I)
        match = _yt.search(obj.url)
        if match:
            return f"https://www.youtube.com/embed/{match.groups()[5]}"
        return obj.url

class ManagementMemberSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ManagementMember
        fields = ['id', 'full_name', 'position', 'description', 'image', 'order', 'is_management']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
