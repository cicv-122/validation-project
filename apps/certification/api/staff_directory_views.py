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


def load_experts_data():
    """Загружает официальную базу экспертов и применяет пользовательские привязки к центрам."""
    base_experts = []
    if os.path.exists(EXPERTS_DB_PATH):
        try:
            with open(EXPERTS_DB_PATH, 'r', encoding='utf-8') as f:
                base_experts = json.load(f)
        except Exception:
            base_experts = []

    # Загружаем кастомные привязки (center_id, custom professions)
    overrides = {}
    if os.path.exists(EXPERTS_OVERRIDE_PATH):
        try:
            with open(EXPERTS_OVERRIDE_PATH, 'r', encoding='utf-8') as f:
                overrides = json.load(f)
        except Exception:
            overrides = {}

    centers_map = {c.id: c.organization for c in AssessmentCenter.objects.all()}

    # Обогащаем экспертов актуальными привязками к центрам
    for exp in base_experts:
        exp_id_str = str(exp.get('id'))
        if exp_id_str in overrides:
            ov = overrides[exp_id_str]
            if 'assessment_center_id' in ov:
                exp['assessment_center_id'] = ov['assessment_center_id']
            if 'profession_ru' in ov:
                exp['profession_ru'] = ov['profession_ru']

        c_id = exp.get('assessment_center_id')
        exp['assessment_center_name'] = centers_map.get(c_id, '') if c_id else ''

    return base_experts, overrides, centers_map


def save_experts_overrides(overrides):
    os.makedirs(os.path.dirname(EXPERTS_OVERRIDE_PATH), exist_ok=True)
    with open(EXPERTS_OVERRIDE_PATH, 'w', encoding='utf-8') as f:
        json.dump(overrides, f, ensure_ascii=False, indent=2)


def sync_assessment_center_experts(center_id, profession_name):
    """
    Автоматически обновляет или создаёт запись AppraisersExpert для AssessmentCenter,
    чтобы на публичной странице центра (/documents/assessment-centers/:id)
    сразу отображалась официальная таблица направлений и закреплённой комиссии.
    """
    if not center_id or not profession_name:
        return

    try:
        center = AssessmentCenter.objects.filter(id=center_id).first()
        if not center:
            return

        experts, _, _ = load_experts_data()
        center_profs = [
            e for e in experts
            if e.get('assessment_center_id') == center_id and
            e.get('profession_ru', '').strip().lower() == profession_name.strip().lower()
        ]

        appraisers_list = []
        employers_list = []
        consultants_list = []

        for e in center_profs:
            role = (e.get('role_ru') or '').lower()
            name_with_org = f"{e['name']} ({e['organization']})" if e.get('organization') else e['name']
            if 'работодател' in role:
                employers_list.append(name_with_org)
            elif 'консультант' in role:
                consultants_list.append(name_with_org)
            else:
                appraisers_list.append(name_with_org)

        if not center_profs:
            # Если экспертов больше нет, запись можно оставить или деактивировать
            return

        ae, _ = AppraisersExpert.objects.get_or_create(
            assessment_center=center,
            profession=profession_name,
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

            filtered.append(e)

        return Response(filtered)


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
                    # Синхронизируем таблицу сертифицируемых направлений колледжа
                    sync_assessment_center_experts(c_id_int, target.get('profession_ru', ''))
                except (ValueError, TypeError):
                    pass

        if 'profession_ru' in data:
            prof_val = data['profession_ru'].strip()
            if prof_val:
                overrides[exp_key]['profession_ru'] = prof_val
                target['profession_ru'] = prof_val
                if target.get('assessment_center_id'):
                    sync_assessment_center_experts(target['assessment_center_id'], prof_val)

        save_experts_overrides(overrides)

        return Response(target)
