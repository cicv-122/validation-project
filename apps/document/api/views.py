import re
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from apps.document.models import (
    ProfStandard, DevelopmentPartner, AssessmentCenter, AppraisersExpert, CertifiedUser
)
from apps.document.professions_dict import PROFESSIONS_DICTIONARY
from .serializers import (
    ProfStandardSerializer, DevelopmentPartnerSerializer,
    AssessmentCenterSerializer, AppraisersExpertSerializer, CertifiedUserSerializer
)


class CertifiedUserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProfStandardListView(generics.ListAPIView):
    queryset = ProfStandard.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = ProfStandardSerializer

class DevelopmentPartnerListView(generics.ListAPIView):
    queryset = DevelopmentPartner.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = DevelopmentPartnerSerializer

class DevelopmentPartnerDetailView(generics.RetrieveAPIView):
    queryset = DevelopmentPartner.objects.filter(is_active=True)
    serializer_class = DevelopmentPartnerSerializer

class AssessmentCenterListView(generics.ListAPIView):
    queryset = AssessmentCenter.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = AssessmentCenterSerializer

class AssessmentCenterDetailView(generics.RetrieveAPIView):
    queryset = AssessmentCenter.objects.filter(is_active=True)
    serializer_class = AssessmentCenterSerializer

class AppraisersExpertListView(generics.ListAPIView):
    queryset = AppraisersExpert.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = AppraisersExpertSerializer

class CertifiedUserListView(generics.ListAPIView):
    serializer_class = CertifiedUserSerializer
    pagination_class = CertifiedUserPagination

    def get_queryset(self):
        queryset = CertifiedUser.objects.all().order_by('-order', '-created_at')
        search = self.request.query_params.get('search', '').strip()
        if search:
            # Multilingual profession matching
            matching_professions = []
            search_lower = search.lower()
            for ru_key, translations in PROFESSIONS_DICTIONARY.items():
                if (search_lower in ru_key.lower() or 
                    search_lower in translations.get('ru', '').lower() or 
                    search_lower in translations.get('ky', '').lower() or 
                    search_lower in translations.get('en', '').lower()):
                    matching_professions.append(ru_key)

            # Construct query
            q_filter = (
                Q(last_name__icontains=search) |
                Q(first_name__icontains=search) |
                Q(sur_name__icontains=search) |
                Q(registration_number__icontains=search)
            )
            if matching_professions:
                q_filter |= Q(profession__in=matching_professions)
            else:
                q_filter |= Q(profession__icontains=search)

            queryset = queryset.filter(q_filter)
        return queryset

class CertifiedUserVerifyView(APIView):
    """
    Проверка подлинности сертификата:
    1. По прямому GET-запросу из QR-кода: /verify/<registration_number>/ или ?token=...
    2. По публичному поиску: /verify/?reg=...&inn=...
    """
    def get(self, request, registration_number=None, *args, **kwargs):
        reg = (registration_number or request.query_params.get('reg', '')).strip()
        inn = request.query_params.get('inn', '').strip()
        token = request.query_params.get('token', '').strip()

        if not reg:
            return Response(
                {'detail': 'Укажите номер документа о признании квалификации.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize search: allow '000026', 'ЦС № 000026', 'ЦС-000026', '000001/1', 'ЦС № 000001/1'
        q_reg = Q(registration_number__iexact=reg)
        if '/' in reg:
            m = re.search(r'(\d+)\s*/\s*([0-9\-]+)', reg)
            if m:
                d1, d2 = m.group(1), m.group(2)
                q_reg |= Q(registration_number__icontains=f"{d1.zfill(6)}/{d2}") | Q(registration_number__icontains=f"{d1}/{d2}")
        else:
            digits_only = ''.join(c for c in reg if c.isdigit())
            if digits_only:
                q_reg |= Q(registration_number__iexact=f'ЦС № {digits_only.zfill(6)}')
                q_reg |= Q(registration_number__startswith=f'ЦС № {digits_only.zfill(6)}/')
                q_reg |= Q(registration_number__icontains=digits_only)

        user = CertifiedUser.objects.filter(q_reg).first()

        if not user:
            return Response(
                {'detail': 'Документ с указанным номером не найден в официальном реестре.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Прямой переход по ссылке / QR-сканирование:
        # 1) token совпадает
        # 2) номер передан в URL пути
        # 3) параметр direct=1 (прямой просмотр из QR / реестра)
        # 4) у записи в реестре нет ИНН (архивные документы 2024-2025)
        is_direct = bool(
            (token and user.verification_token and str(user.verification_token).lower() == token.lower()) or
            (registration_number and not inn) or
            request.query_params.get('direct') == '1' or
            not user.inn
        )

        clean_inn = ''.join(c for c in inn if c.isdigit())

        # Если ИНН указан в форме поиска — сверяем
        if clean_inn:
            if user.inn:
                user_clean_inn = ''.join(c for c in user.inn if c.isdigit())
                if user_clean_inn != clean_inn:
                    return Response(
                        {'detail': 'Документ с указанным номером и ИНН не найден в официальном реестре.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
        elif not is_direct and user.inn:
            # Требуем ИНН только для ручного поиска новых документов, где в базе внесен ИНН
            return Response(
                {'detail': 'Для подтверждения документа укажите 14-значный ИНН/ПИН владельца.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CertifiedUserSerializer(user, context={'request': request})
        data = dict(serializer.data)

        # Отображение ИНН
        target_inn = ''.join(c for c in (user.inn or inn) if c.isdigit())
        if len(target_inn) == 14:
            data['inn'] = target_inn
            data['inn_masked'] = f"{target_inn[:3]}••••••••{target_inn[-3:]}"
        else:
            data['inn'] = user.inn
            data['inn_masked'] = None

        data['is_qr_scan'] = is_direct
        return Response(data)
