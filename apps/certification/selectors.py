# apps/certification/selectors.py
"""
Data selectors and query encapsulation for the certification domain.
Read-only queries without side effects.
"""
from typing import Optional, Dict, Any
from django.db.models import QuerySet, Q
from apps.certification.models import StaffProfile, CertificationApplication, ApplicationDocument

# ---------------------------------------------------------------------------
# Профессиональные отраслевые кластеры для умного поиска и фильтрации
# ---------------------------------------------------------------------------
PROFESSION_CLUSTERS: Dict[str, Dict[str, Any]] = {
    'welding': {
        'title': 'Сварочные технологии (газо-/электросварка)',
        'stems': ['свар', 'газоэлектросвар', 'электрогазосвар', 'газорез'],
    },
    'textile': {
        'title': 'Швейное производство и дизайн одежды',
        'stems': ['шве', 'портн', 'закрой', 'модельер'],
    },
    'culinary': {
        'title': 'Общепит, кулинария и кондитеры',
        'stems': ['повар', 'кулинар', 'кондитер', 'пекар', 'шеф-повар'],
    },
    'electrical': {
        'title': 'Электромонтаж и электрооборудование',
        'stems': ['электр', 'электромонт', 'электромонтаж', 'энергет'],
    },
    'construction': {
        'title': 'Строительство, отделка и монтаж',
        'stems': ['строит', 'маляр', 'штукатур', 'арматур', 'бетон', 'каменщик', 'плиточн', 'гипсокартон', 'отделоч'],
    },
    'automotive': {
        'title': 'Автосервис, ремонт и диагностика',
        'stems': ['автослесар', 'автомехан', 'автоэлектр', 'ремонт авто', 'диагност', 'слесарь по ремонту'],
    },
    'sanitary': {
        'title': 'Сантехника и водоснабжение',
        'stems': ['сантех', 'слесарь-сантех', 'водопровод'],
    },
    'metallurgy': {
        'title': 'Металлообработка (токари, слесари)',
        'stems': ['токар', 'фрезер', 'слесар', 'жестян', 'станоч'],
    },
    'beauty': {
        'title': 'Индустрия красоты и парикмахерское дело',
        'stems': ['парикмах', 'барбер', 'стилист', 'косметол', 'визаж'],
    },
}


def get_or_create_staff_for_user(user) -> Optional[StaffProfile]:
    """
    Возвращает StaffProfile для пользователя.
    Для суперпользователя создает профиль руководителя автоматически.
    """
    if not user or not user.is_authenticated:
        return None

    if hasattr(user, 'staff_profile'):
        return user.staff_profile

    if user.is_superuser:
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        profile = StaffProfile.objects.create(
            user=user,
            full_name=full_name,
            role='supervisor',
            is_active=True,
        )
        return profile
    return None


def get_staff_applications_queryset(staff_profile: Optional[StaffProfile] = None) -> QuerySet[CertificationApplication]:
    """
    Базовый QuerySet для списка заявок с учетом прав доступа и закрепленных профессий сотрудника.
    """
    qs = CertificationApplication.objects.filter(deleted_at__isnull=True).select_related(
        'profession',
        'specialist_record',
    ).prefetch_related('documents')

    if not staff_profile or staff_profile.role == 'supervisor':
        return qs

    assigned_profs = staff_profile.assigned_professions.all()
    if assigned_profs.exists():
        qs = qs.filter(profession__in=assigned_profs)

    return qs


def get_application_by_id(pk: int) -> Optional[CertificationApplication]:
    """
    Получение заявки по первичному ключу.
    """
    return CertificationApplication.objects.filter(
        pk=pk,
        deleted_at__isnull=True,
    ).select_related('profession', 'specialist_record').prefetch_related('documents').first()
