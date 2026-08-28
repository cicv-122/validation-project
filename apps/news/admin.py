from django.contrib import admin
from django.utils.safestring import mark_safe

from modeltranslation.admin import TabbedTranslationAdmin

from apps.news.models import NewsImages, News, NewsVideo

class AdminNewsImages(admin.TabularInline):
    model = NewsImages
    extra = 1
    readonly_fields = ('get_photo',)

    def get_photo(self, obj):
        if obj and obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="75">')
        return "—"

    get_photo.short_description = "Миниатюра"

class AdminNewsVideo(admin.TabularInline):
    model = NewsVideo
    extra = 1

@admin.register(News)
class AdminNews(TabbedTranslationAdmin):
    model = News
    list_display = ('title', 'is_active', 'get_photo')
    inlines = [AdminNewsImages, AdminNewsVideo]
    readonly_fields = ('get_photo',)
    filter_horizontal = ('certified_users',)

    exclude = ('slug',)

    class Media:
        js = ('admin/js/prevent_double_submit.js',)

    def get_photo(self, obj):
        if obj and obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="75">')
        return "—"

    get_photo.short_description = "Миниатюра"
