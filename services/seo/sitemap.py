from django.http import HttpResponse
from django.utils import timezone


def sitemap_xml(request):
    base_url = 'https://validation.kg'

    static_pages = [
        ('', '1.0', 'weekly'),
        ('/news', '0.8', 'daily'),
        ('/gallery/images', '0.6', 'monthly'),
        ('/gallery/videos', '0.6', 'monthly'),
        ('/about/management', '0.6', 'monthly'),
        ('/about/additional-info', '0.5', 'monthly'),
        ('/documents/partners', '0.7', 'weekly'),
        ('/documents/assessment-centers', '0.6', 'monthly'),
        ('/documents/experts', '0.6', 'monthly'),
        ('/documents/certified-users', '0.6', 'monthly'),
        ('/documents/prof-standards', '0.6', 'monthly'),
        ('/apply', '0.8', 'weekly'),
        ('/apply/status', '0.5', 'monthly'),
    ]

    urls = []
    today = timezone.now().date()

    # Статичные страницы
    for page, priority, changefreq in static_pages:
        urls.append({
            'loc': f'{base_url}{page}',
            'lastmod': today,
            'changefreq': changefreq,
            'priority': priority,
        })

    # Динамические новости
    try:
        from apps.news.models import News
        news_items = News.active.values('slug', 'created')
        for item in news_items:
            urls.append({
                'loc': f'{base_url}/news/{item["slug"]}',
                'lastmod': item['created'].date() if item.get('created') else today,
                'changefreq': 'monthly',
                'priority': '0.7',
            })
    except Exception:
        pass

    # Динамические страницы партнёров
    try:
        from apps.document.models import DevelopmentPartner
        partners = DevelopmentPartner.objects.filter(is_active=True).values('id', 'updated_at')
        for partner in partners:
            urls.append({
                'loc': f'{base_url}/documents/partners/{partner["id"]}',
                'lastmod': partner['updated_at'].date() if partner.get('updated_at') else today,
                'changefreq': 'monthly',
                'priority': '0.6',
            })
    except Exception:
        pass

    # Генерация XML
    url_tags = '\n'.join([
        f"""  <url>
    <loc>{u['loc']}</loc>
    <lastmod>{u['lastmod']}</lastmod>
    <changefreq>{u['changefreq']}</changefreq>
    <priority>{u['priority']}</priority>
  </url>"""
        for u in urls
    ])

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{url_tags}
</urlset>"""

    return HttpResponse(xml, content_type='application/xml')