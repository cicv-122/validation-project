import os
import re
from typing import Optional
from django.conf import settings
from django.http import HttpResponse, Http404
from django.views import View

BASE_URL = 'https://validation.kg'

# Default fallback values
DEFAULT_TITLE = 'Центр независимой сертификации и валидации при МП КР'
DEFAULT_DESC = (
    'Центр независимой сертификации и валидации при Министерстве просвещения '
    'Кыргызской Республики. Подтверждение и признание профессиональных компетенций '
    'с выдачей документа о квалификации.'
)
DEFAULT_IMAGE = f'{BASE_URL}/static/dist/images/og-default.jpg'


def _strip_html(text: str) -> str:
    """Remove HTML tags from a string."""
    return re.sub(r'<[^>]+>', '', text or '').strip()


def _get_news_meta(slug: str) -> Optional[dict]:
    """Fetch SEO data for a single news article by slug."""
    try:
        from apps.news.models import News
        news = News.active.values('title', 'description', 'image').get(slug=slug)
        title = news['title'] or DEFAULT_TITLE
        raw_desc = _strip_html(news.get('description') or '')
        description = raw_desc[:160] if raw_desc else DEFAULT_DESC
        image = (
            f"{settings.CURRENT_SITE_URL}/media/{news['image']}"
            if news.get('image') else DEFAULT_IMAGE
        )
        return {
            'title': f"{title} — ЦНСВ при МП КР",
            'description': description,
            'image': image,
        }
    except Exception:
        return None


def _get_partner_meta(pk: str) -> Optional[dict]:
    """Fetch SEO data for a single development partner by pk."""
    try:
        from apps.document.models import DevelopmentPartner
        partner = DevelopmentPartner.objects.values('title', 'description', 'image').get(pk=pk)
        title = partner['title'] or DEFAULT_TITLE
        raw_desc = (partner.get('description') or '').strip()
        description = raw_desc[:160] if raw_desc else f"{title} — Партнер по развитию ЦНСВ"
        image = (
            f"{settings.CURRENT_SITE_URL}/media/{partner['image']}"
            if partner.get('image') else DEFAULT_IMAGE
        )
        return {
            'title': f"{title} — Партнеры | ЦНСВ при МП КР",
            'description': description,
            'image': image,
        }
    except Exception:
        return None


def _get_page_meta(path: str) -> dict:
    """
    Try to resolve per-route meta. Falls back to defaults.
    Supports:
      /news/<slug>  or  /<lang>/news/<slug>
      /documents/partners/<pk>  or  /<lang>/documents/partners/<pk>
    """
    # News detail: /news/<slug> or /<lang>/news/<slug>
    news_match = re.match(r'^(?:/[a-z]{2})?/news/([^/]+)/?$', path)
    if news_match:
        slug = news_match.group(1)
        meta = _get_news_meta(slug)
        if meta:
            return meta

    # Partner detail: /documents/partners/<pk> or /<lang>/documents/partners/<pk>
    partner_match = re.match(r'^(?:/[a-z]{2})?/documents/partners/(\d+)/?$', path)
    if partner_match:
        pk = partner_match.group(1)
        meta = _get_partner_meta(pk)
        if meta:
            return meta

    return {
        'title': DEFAULT_TITLE,
        'description': DEFAULT_DESC,
        'image': DEFAULT_IMAGE,
    }


def _inject_meta(html: str, path: str) -> str:
    """Inject server-side OG/Twitter/canonical meta tags into the HTML <head>."""
    meta = _get_page_meta(path)
    canonical = f"{BASE_URL}{path}"

    injected = f"""
    <!-- SSR meta injected by Django -->
    <title>{meta['title']}</title>
    <meta name="description" content="{meta['description']}" />
    <link rel="canonical" href="{canonical}" />
    <meta property="og:title" content="{meta['title']}" />
    <meta property="og:description" content="{meta['description']}" />
    <meta property="og:image" content="{meta['image']}" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{meta['title']}" />
    <meta name="twitter:description" content="{meta['description']}" />
    <meta name="twitter:image" content="{meta['image']}" />
    <!-- /SSR meta -->"""

    # Remove the old static default <title> tag from index.html to avoid duplicates
    html = re.sub(r'<title>[^<]*</title>', '', html, count=1)

    # Inject right after <head>
    return html.replace('<head>', f'<head>{injected}', 1)


class ReactAppView(View):
    """
    Serves the compiled frontend index.html.
    Provides a catch-all for React Router.
    Injects server-side OG meta tags for dynamic pages (news, partners)
    so social bots (WhatsApp, Telegram, Facebook) see correct previews.
    """
    _cached_html: Optional[str] = None  # raw HTML cache (prod only)

    def get(self, request, *args, **kwargs):
        try:
            # In production: cache the raw HTML, but always inject fresh meta per request
            if not settings.DEBUG and ReactAppView._cached_html:
                raw_html = ReactAppView._cached_html
            else:
                with open(os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')) as f:
                    raw_html = f.read()
                if not settings.DEBUG:
                    ReactAppView._cached_html = raw_html

            html = _inject_meta(raw_html, request.path)
            return HttpResponse(html)

        except FileNotFoundError:
            if settings.DEBUG:
                return HttpResponse("""
                <h1>Frontend Not Built</h1>
                <p>The React frontend has not been built yet.</p>
                <p>Run <code>cd frontend &amp;&amp; npm run build</code> to generate the index.html file.</p>
                """)
            raise Http404("React frontend not found.")