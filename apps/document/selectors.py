# apps/document/selectors.py
"""
Data selectors and query builders for the document / certified specialists domain.
Read-only queries without side effects.
"""
from typing import Optional, Dict, Any
from django.db.models import QuerySet, Q, Count
from apps.document.models import CertifiedUser
from apps.certification.selectors import PROFESSION_CLUSTERS


def get_certified_users_queryset(
    has_inn: Optional[str] = None,
    cluster_key: Optional[str] = None,
    search_query: Optional[str] = None,
) -> QuerySet[CertifiedUser]:
    """
    Построение QuerySet сертифицированных специалистов с поддержкой умного стемминга профессий.
    """
    qs = CertifiedUser.objects.select_related('application').all().order_by('-order', '-created_at')

    if has_inn == 'true':
        qs = qs.exclude(inn__isnull=True).exclude(inn='')
    elif has_inn == 'false':
        qs = qs.filter(Q(inn__isnull=True) | Q(inn=''))

    if cluster_key and cluster_key in PROFESSION_CLUSTERS:
        cluster_stems = PROFESSION_CLUSTERS[cluster_key]['stems']
        cluster_q = Q()
        for stem in cluster_stems:
            cluster_q |= Q(profession__icontains=stem)
        qs = qs.filter(cluster_q)

    if search_query:
        q_clean = search_query.strip()
        q_lower = q_clean.lower()
        expanded_stems = set()

        for group in PROFESSION_CLUSTERS.values():
            for stem in group['stems']:
                if stem in q_lower or (len(q_lower) >= 3 and q_lower.startswith(stem[:3])):
                    expanded_stems.update(group['stems'])
                    break

        base_match = (
            Q(last_name__icontains=q_clean) |
            Q(first_name__icontains=q_clean) |
            Q(sur_name__icontains=q_clean) |
            Q(registration_number__icontains=q_clean) |
            Q(inn__icontains=q_clean) |
            Q(profession__icontains=q_clean) |
            Q(application__phone__icontains=q_clean) |
            Q(application__whatsapp__icontains=q_clean)
        )

        if expanded_stems:
            profession_matches = Q()
            for stem in expanded_stems:
                profession_matches |= Q(profession__icontains=stem)
            qs = qs.filter(base_match | profession_matches)
        else:
            qs = qs.filter(base_match)

    return qs


def get_certified_user_detail(pk: int) -> Optional[CertifiedUser]:
    """
    Получение сертифицированного специалиста с предзагрузкой дела и документов.
    """
    return CertifiedUser.objects.filter(pk=pk).select_related('application').first()


def get_clusters_statistics() -> list:
    """
    Расчет количества специалистов по отраслевым кластерам профессий.
    """
    clusters_data = []
    for key, info in PROFESSION_CLUSTERS.items():
        stems = info['stems']
        q_filter = Q()
        for stem in stems:
            q_filter |= Q(profession__icontains=stem)

        count = CertifiedUser.objects.filter(q_filter).count()
        clusters_data.append({
            'key': key,
            'title': info['title'],
            'count': count,
        })
    return clusters_data
