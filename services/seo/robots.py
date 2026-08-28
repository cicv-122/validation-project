from django.views.decorators.http import require_GET
from django.http import HttpResponse


@require_GET
def robots_txt(request):
    lines = [
        'User-Agent: *',
        'Allow: /',
        'Disallow: /api/',
        'Disallow: /admin/',
        'Disallow: /ckeditor/',
        '',
        'Sitemap: https://validation.kg/sitemap.xml',
    ]
    return HttpResponse('\n'.join(lines), content_type='text/plain')