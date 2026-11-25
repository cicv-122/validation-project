# apps/certification/api/staff_directory_views.py
import json
import os
from django.conf import settings
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.certification.models import Profession
from apps.certification.selectors import get_or_create_staff_for_user
from apps.document.models import AssessmentCenter, AppraisersExpert


EXPERTS_DB_PATH = os.path.join(settings.BASE_DIR, 'frontend', 'src', 'data', 'experts_database.json')
EXPERTS_OVERRIDE_PATH = os.path.join(settings.BASE_DIR, 'data', 'experts_custom_bindings.json')
EXPERTS_CUSTOM_ADDED_PATH = os.path.join(settings.BASE_DIR, 'data', 'experts_custom_added.json')


def load_custom_added_experts():
    if os.path.exists(EXPERTS_CUSTOM_ADDED_PATH):
        try:
            with open(EXPERTS_CUSTOM_ADDED_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_custom_added_experts(added_list):
    os.makedirs(os.path.dirname(EXPERTS_CUSTOM_ADDED_PATH), exist_ok=True)
    with open(EXPERTS_CUSTOM_ADDED_PATH, 'w', encoding='utf-8') as f:
        json.dump(added_list, f, ensure_ascii=False, indent=2)


def load_experts_data():
    """Загружает официальную базу экспертов и применяет пользовательские привязки к центрам."""
    base_experts = []
    if os.path.exists(EXPERTS_DB_PATH):
        try:
            with open(EXPERTS_DB_PATH, 'r', encoding='utf-8') as f:
                base_experts = json.load(f)
        except Exception:
            base_experts = []

    # Добавляем новых экспертов, созданных сотрудниками ЦНСВ
    custom_added = load_custom_added_experts()
    if custom_added:
        base_experts.extend(custom_added)

    # Загружаем кастомные привязки (center_id, custom professions)
    overrides = {}
    if os.path.exists(EXPERTS_OVERRIDE_PATH):
        try:
            with open(EXPERTS_OVERRIDE_PATH, 'r', encoding='utf-8') as f:
                overrides = json.load(f)
        except Exception:
            overrides = {}

    centers_map = {c.id: c.organization for c in AssessmentCenter.objects.all()}

    # Обогащаем экспертов актуальными привязками к центрам и кастомными правками
    for exp in base_experts:
        exp_id_str = str(exp.get('id'))
        if exp_id_str in overrides:
            ov = overrides[exp_id_str]
            for key in ('assessment_center_id', 'profession_ru', 'profession_kg', 'organization', 'name', 'role_ru', 'role_kg', 'city_ru', 'phone'):
                if key in ov:
                    exp[key] = ov[key]

        c_id = exp.get('assessment_center_id')
        exp['assessment_center_name'] = centers_map.get(c_id, '') if c_id else ''

    return base_experts, overrides, centers_map


def save_experts_overrides(overrides):
    os.makedirs(os.path.dirname(EXPERTS_OVERRIDE_PATH), exist_ok=True)
    with open(EXPERTS_OVERRIDE_PATH, 'w', encoding='utf-8') as f:
        json.dump(overrides, f, ensure_ascii=False, indent=2)


def sync_assessment_center_experts(center_id=None):
    """
    Автоматически синхронизирует записи AppraisersExpert для AssessmentCenter,
    чтобы на публичной странице центра (/documents/assessment-centers/:id)
    сразу отображались актуальные направления и прикреплённые эксперты.
    """
    try:
        experts, _, _ = load_experts_data()

        centers_to_sync = (
            AssessmentCenter.objects.filter(id=center_id)
            if center_id else
            AssessmentCenter.objects.all()
        )

        for center in centers_to_sync:
            # Находим всех экспертов, закреплённых за данным центром
            center_experts = [
                e for e in experts
                if e.get('assessment_center_id') == center.id
            ]

            # Группируем экспертов по профессиям
            prof_groups = {}
            for e in center_experts:
                prof_name = (e.get('profession_ru') or '').strip()
                if not prof_name:
                    continue
                if prof_name not in prof_groups:
                    prof_groups[prof_name] = []
                prof_groups[prof_name].append(e)

            # Деактивируем направления, у которых больше нет прикреплённых экспертов
            existing_aes = AppraisersExpert.objects.filter(assessment_center=center)
            for ae in existing_aes:
                if ae.profession not in prof_groups:
                    ae.is_active = False
                    ae.save(update_fields=['is_active'])

            # Для каждой профессии обновляем или создаём запись
            for prof_name, exp_list in prof_groups.items():
                appraisers_list = []
                employers_list = []
                consultants_list = []

                for e in exp_list:
                    role = (e.get('role_ru') or '').lower()
                    name_with_org = f"{e['name']} ({e['organization']})" if e.get('organization') else e['name']
                    if 'работодател' in role:
                        employers_list.append(name_with_org)
                    elif 'консультант' in role:
                        consultants_list.append(name_with_org)
                    else:
                        appraisers_list.append(name_with_org)

                ae, _ = AppraisersExpert.objects.get_or_create(
                    assessment_center=center,
                    profession=prof_name,
                    defaults={
                        'appraisers': ', '.join(appraisers_list) or 'Комиссия ЦНСВ',
                        'appraiser_employer': ', '.join(employers_list) or 'Представитель профильного предприятия',
                        'consultant': ', '.join(consultants_list) or 'Консультант ЦНСВ',
                        'is_active': True,
                    }
                )
                ae.appraisers = ', '.join(appraisers_list) or 'Комиссия ЦНСВ'
                ae.appraiser_employer = ', '.join(employers_list) or 'Представитель профильного предприятия'
                ae.consultant = ', '.join(consultants_list) or 'Консультант ЦНСВ'
                ae.is_active = True
                ae.save()
    except Exception as exc:
        pass


class StaffProfessionsManageView(APIView):
    """
    GET /api/v1/certification/staff/professions/ - список всех профессий ЦНСВ
    POST /api/v1/certification/staff/professions/ - добавление новой профессии
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        qp = getattr(request, 'query_params', getattr(request, 'GET', {}))
        q = qp.get('q', '').strip()
        qs = Profession.objects.filter(is_active=True)
        if q:
            qs = qs.filter(
                Q(name_ru__icontains=q) |
                Q(name_ky__icontains=q) |
                Q(okz_code__icontains=q)
            )

        qs = qs.order_by('name_ru')

        # Загружаем базу экспертов для подсчета прикрепленных специалистов
        experts, _, _ = load_experts_data()

        result = []
        for prof in qs:
            prof_name_lower = prof.name_ru.strip().lower()
            matched_experts = [
                {'id': e['id'], 'name': e['name'], 'role_ru': e.get('role_ru', ''), 'organization': e.get('organization', '')}
                for e in experts
                if (e.get('profession_ru') or '').strip().lower() == prof_name_lower
            ]

            result.append({
                'id': prof.id,
                'okz_code': prof.okz_code,
                'name_ru': prof.name_ru,
                'name_ky': prof.name_ky,
                'section': prof.section,
                'is_active': prof.is_active,
                'experts_count': len(matched_experts),
                'experts': matched_experts,
            })

        return Response(result)

    def post(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        name_ru = data.get('name_ru', '').strip()
        if not name_ru:
            return Response({'detail': 'Укажите название профессии на русском языке'}, status=status.HTTP_400_BAD_REQUEST)

        name_ky = data.get('name_ky', '').strip()
        okz_code = data.get('okz_code', '').strip()
        section = data.get('section', '').strip()

        prof = Profession.objects.create(
            name_ru=name_ru,
            name_ky=name_ky,
            okz_code=okz_code,
            section=section,
            is_active=True,
        )

        # Если переданы ID экспертов для привязки к профессии
        assigned_expert_ids = data.get('assigned_expert_ids', [])
        if assigned_expert_ids:
            _, overrides, _ = load_experts_data()
            for exp_id in assigned_expert_ids:
                exp_key = str(exp_id)
                if exp_key not in overrides:
                    overrides[exp_key] = {}
                overrides[exp_key]['profession_ru'] = prof.name_ru
            save_experts_overrides(overrides)

        return Response({
            'id': prof.id,
            'name_ru': prof.name_ru,
            'name_ky': prof.name_ky,
            'okz_code': prof.okz_code,
            'section': prof.section,
            'is_active': prof.is_active,
            'experts_count': len(assigned_expert_ids),
        }, status=status.HTTP_201_CREATED)


class StaffProfessionDetailManageView(APIView):
    """
    PATCH /api/v1/certification/staff/professions/<int:pk>/ - редактирование профессии
    DELETE /api/v1/certification/staff/professions/<int:pk>/ - удаление профессии
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        prof = get_object_or_404(Profession, pk=pk)
        data = request.data

        old_name = prof.name_ru

        if 'name_ru' in data:
            val = data['name_ru'].strip()
            if val:
                prof.name_ru = val
        if 'name_ky' in data:
            prof.name_ky = data['name_ky'].strip()
        if 'okz_code' in data:
            prof.okz_code = data['okz_code'].strip()
        if 'section' in data:
            prof.section = data['section'].strip()
        if 'is_active' in data:
            prof.is_active = bool(data['is_active'])

        prof.save()

        # Если обновлены эксперты, закреплённые за этой профессией
        if 'assigned_expert_ids' in data:
            new_ids = set(str(x) for x in data.get('assigned_expert_ids', []))
            experts, overrides, _ = load_experts_data()
            for e in experts:
                ek = str(e['id'])
                if ek in new_ids:
                    if ek not in overrides:
                        overrides[ek] = {}
                    overrides[ek]['profession_ru'] = prof.name_ru
                elif (e.get('profession_ru') or '').strip().lower() == old_name.strip().lower():
                    # Открепили от этой профессии
                    if ek in overrides and 'profession_ru' in overrides[ek]:
                        del overrides[ek]['profession_ru']
            save_experts_overrides(overrides)

        return Response({
            'id': prof.id,
            'name_ru': prof.name_ru,
            'name_ky': prof.name_ky,
            'okz_code': prof.okz_code,
            'section': prof.section,
            'is_active': prof.is_active,
        })

    def delete(self, request, pk):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        prof = get_object_or_404(Profession, pk=pk)
        prof.is_active = False
        prof.save(update_fields=['is_active'])
        return Response({'detail': f'Профессия {prof.name_ru} архивирована'}, status=status.HTTP_204_NO_CONTENT)


class StaffExpertsManageView(APIView):
    """
    GET /api/v1/certification/staff/experts/ - список экспертов ЦНСВ
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        experts, _, centers_map = load_experts_data()

        qp = getattr(request, 'query_params', getattr(request, 'GET', {}))
        q = qp.get('q', '').strip().lower()
        center_id = qp.get('center_id')
        role = qp.get('role', '').strip().lower()
        prof = qp.get('profession', '').strip().lower()
        org = qp.get('organization', '').strip().lower()

        filtered = []
        for e in experts:
            if q:
                search_str = f"{e.get('name', '')} {e.get('organization', '')} {e.get('profession_ru', '')} {e.get('city_ru', '')}".lower()
                if q not in search_str:
                    continue
            if center_id:
                try:
                    if int(center_id) != e.get('assessment_center_id'):
                        continue
                except ValueError:
                    pass
            if role:
                if role not in (e.get('role_ru') or '').lower():
                    continue
            if prof:
                if prof not in (e.get('profession_ru') or '').lower():
                    continue
            if org:
                if org not in (e.get('organization') or '').lower():
                    continue

            filtered.append(e)

        return Response(filtered)

    def post(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        name = data.get('name', '').strip()
        if not name:
            return Response({'detail': 'Укажите ФИО эксперта'}, status=status.HTTP_400_BAD_REQUEST)

        role_ru = data.get('role_ru', 'Оценщик').strip() or 'Оценщик'
        profession_ru = data.get('profession_ru', '').strip()
        organization = data.get('organization', '').strip()
        city_ru = data.get('city_ru', 'г. Бишкек').strip() or 'г. Бишкек'
        phone = data.get('phone', '').strip()
        center_id = data.get('assessment_center_id')

        experts, overrides, centers_map = load_experts_data()
        new_id = max([e.get('id', 0) for e in experts] or [0]) + 1

        new_expert = {
            'id': new_id,
            'name': name,
            'role_ru': role_ru,
            'role_kg': role_ru,
            'profession_ru': profession_ru,
            'profession_kg': profession_ru,
            'organization': organization,
            'city_ru': city_ru,
            'phone': phone,
            'assessment_center_id': int(center_id) if center_id else None,
            'assessment_center_name': centers_map.get(int(center_id), '') if center_id else '',
            'is_custom_added': True,
        }

        added = load_custom_added_experts()
        added.append(new_expert)
        save_custom_added_experts(added)

        if center_id:
            overrides[str(new_id)] = {'assessment_center_id': int(center_id)}
            save_experts_overrides(overrides)
            sync_assessment_center_experts(int(center_id))

        return Response(new_expert, status=status.HTTP_201_CREATED)


class StaffExpertDetailManageView(APIView):
    """
    PATCH /api/v1/certification/staff/experts/<int:expert_id>/ - закрепление за центром оценки
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, expert_id):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        experts, overrides, centers_map = load_experts_data()
        target = next((e for e in experts if e.get('id') == expert_id), None)
        if not target:
            return Response({'detail': 'Эксперт не найден'}, status=status.HTTP_404_NOT_FOUND)

        exp_key = str(expert_id)
        if exp_key not in overrides:
            overrides[exp_key] = {}

        data = request.data
        prev_center_id = target.get('assessment_center_id')

        if 'assessment_center_id' in data:
            c_id = data['assessment_center_id']
            if c_id in (None, '', 0, '0', 'null'):
                overrides[exp_key]['assessment_center_id'] = None
                target['assessment_center_id'] = None
                target['assessment_center_name'] = ''
            else:
                try:
                    c_id_int = int(c_id)
                    overrides[exp_key]['assessment_center_id'] = c_id_int
                    target['assessment_center_id'] = c_id_int
                    target['assessment_center_name'] = centers_map.get(c_id_int, '')
                except (ValueError, TypeError):
                    pass

        for key in ('organization', 'name', 'role_ru', 'profession_ru', 'city_ru', 'phone'):
            if key in data:
                val = data[key].strip() if isinstance(data[key], str) else data[key]
                overrides[exp_key][key] = val
                target[key] = val

        # Сохраняем обновленные привязки на диск
        save_experts_overrides(overrides)

        # Если эксперт находится в custom_added - обновляем и там тоже
        custom_added = load_custom_added_experts()
        if custom_added:
            for e in custom_added:
                if e.get('id') == expert_id:
                    for key in ('organization', 'name', 'role_ru', 'profession_ru', 'city_ru', 'phone', 'assessment_center_id'):
                        if key in target:
                            e[key] = target[key]
            save_custom_added_experts(custom_added)

        # Синхронизируем направления для центров оценки (старого и нового)
        if prev_center_id and prev_center_id != target.get('assessment_center_id'):
            sync_assessment_center_experts(prev_center_id)
        if target.get('assessment_center_id'):
            sync_assessment_center_experts(target['assessment_center_id'])

        return Response(target)


class StaffExpertsRenameOrganizationView(APIView):
    """
    POST /api/v1/certification/staff/experts/rename-organization/
    Переименование организации / пула экспертов для всех специалистов этого пула.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        old_name = request.data.get('old_name', '').strip()
        new_name = request.data.get('new_name', '').strip()
        if not old_name or not new_name:
            return Response({'detail': 'Укажите старое и новое название организации'}, status=status.HTTP_400_BAD_REQUEST)

        experts, overrides, _ = load_experts_data()
        updated_count = 0

        # Обновляем в overrides
        for exp in experts:
            if exp.get('organization', '').strip() == old_name:
                exp_key = str(exp.get('id'))
                if exp_key not in overrides:
                    overrides[exp_key] = {}
                overrides[exp_key]['organization'] = new_name
                exp['organization'] = new_name
                updated_count += 1

        save_experts_overrides(overrides)

        # Также обновляем в custom_added если есть
        custom_added = load_custom_added_experts()
        if custom_added:
            for exp in custom_added:
                if exp.get('organization', '').strip() == old_name:
                    exp['organization'] = new_name
            save_custom_added_experts(custom_added)

        return Response({
            'message': f'Организация успешно переименована в «{new_name}»',
            'old_name': old_name,
            'new_name': new_name,
            'updated_experts_count': updated_count,
        })


class StaffIndicators2026View(APIView):
    """
    GET /api/v1/certification/staff/indicators-2026/
    Новые динамические показатели Центра с 1 декабря 2026 года.
    Связаны напрямую с реестром сертифицированных специалистов, делами кандидатов
    и базой аттестованных экспертов ЦНСВ.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Доступ запрещен'}, status=status.HTTP_403_FORBIDDEN)

        from datetime import date
        from django.utils import timezone
        from apps.certification.models import CertificationApplication
        from apps.document.models import CertifiedUser, ProfStandard, AssessmentCenter

        START_DATE = date(2026, 12, 1)
        today = timezone.localdate()
        days_tracked = max(0, (today - START_DATE).days)
        is_started = today >= START_DATE

        # 1. Заявки и сертификация (новый поток с 1 декабря 2026 г.)
        apps_qs = CertificationApplication.objects.filter(deleted_at__isnull=True).exclude(origin='registry_archive')
        if today >= START_DATE:
            apps_since_start = apps_qs.filter(created_at__date__gte=START_DATE)
        else:
            # Режим предварительного тестирования до 1 декабря 2026 г.: считаем созданные заявки
            apps_since_start = apps_qs

        completed_since_start = apps_since_start.filter(status='completed').count()
        candidates_since_start = apps_since_start.count()
        total_historical_registry = 1434
        total_completed_all_time = total_historical_registry + apps_qs.filter(status='completed').count()

        # 2. Трудовые мигранты (отсчёт по новой с 1 декабря 2026 г.)
        migrants_since_start = apps_since_start.filter(is_labor_migrant=True).count()
        migrants_completed_since_start = apps_since_start.filter(status='completed', is_labor_migrant=True).count()
        total_migrants_candidates = apps_qs.filter(is_labor_migrant=True).count()

        # Разбивка по странам миграции
        from django.db.models import Count
        countries_qs = apps_since_start.filter(is_labor_migrant=True).exclude(migration_country='').values('migration_country').annotate(count=Count('id')).order_by('-count')
        countries_breakdown = [{'country': item['migration_country'], 'count': item['count']} for item in countries_qs]

        # Категории миграции (вернувшиеся / планирующие)
        returned_count = apps_since_start.filter(is_labor_migrant=True, migration_category='returned').count()
        planning_count = apps_since_start.filter(is_labor_migrant=True, migration_category='planning').count()

        # 3. Профессии (отсчёт по новой с 1 декабря 2026 г. по охвату в реестре)
        professions_since_start = apps_since_start.exclude(profession='').values('profession').distinct().count()
        active_professions = Profession.objects.filter(is_active=True).count()
        professions_count = max(active_professions, 31)

        # 4. Инструменты оценки (GIZ, АБР, МОТ)
        assessment_tools_count = 1767

        # 5. Оценщики в базе (живой подсчёт)
        experts, _, _ = load_experts_data()
        assessors_count = len(experts)

        # 6. Утверждённые профстандарты
        standards_db_count = ProfStandard.objects.count()
        standards_count = max(standards_db_count, 29)

        # 7. Лаборатории / центры оценки
        labs_db_count = AssessmentCenter.objects.count()
        labs_count = max(labs_db_count, 18)

        # 8. Стоимость услуги
        service_cost = 10000

        return Response({
            'start_date': '2026-12-01',
            'start_date_display': '1 декабря 2026 г.',
            'today': today.strftime('%Y-%m-%d'),
            'days_tracked': days_tracked,
            'is_started': is_started,
            'metrics': {
                'certified_since_start': completed_since_start,
                'candidates_since_start': candidates_since_start,
                'certified_all_time': total_completed_all_time,
                'migrants_since_start': migrants_since_start,
                'migrants_completed_since_start': migrants_completed_since_start,
                'migrants_total_registered': total_migrants_candidates,
                'migrants_countries': countries_breakdown,
                'migrants_categories': {
                    'returned': returned_count,
                    'planning': planning_count,
                },
                'professions_since_start': professions_since_start,
                'professions_count': professions_count,
                'assessment_tools_count': assessment_tools_count,
                'assessors_count': assessors_count,
                'standards_count': standards_count,
                'labs_count': labs_count,
                'service_cost': service_cost,
            }
        })

