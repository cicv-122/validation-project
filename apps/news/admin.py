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
    list_display = ('title', 'is_active', 'created', 'get_photo')
    list_filter = ('is_active', 'created')
    search_fields = ('title', 'title_ru', 'title_ky')
    date_hierarchy = 'created'
    list_per_page = 20
    inlines = [AdminNewsImages, AdminNewsVideo]
    readonly_fields = ('get_photo',)

    exclude = ('slug', 'certified_users')

    class Media:
        js = ('custom_admin/js/prevent_double_submit.js',)

    def get_queryset(self, request):
        return super().get_queryset(request).defer('description', 'description_ru', 'description_ky')

    def get_photo(self, obj):
        if obj and obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="75">')
        return "—"

    get_photo.short_description = "Миниатюра"
