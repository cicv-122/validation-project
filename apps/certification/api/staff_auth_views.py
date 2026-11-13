# apps/certification/api/staff_auth_views.py
import secrets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .staff_serializers import StaffProfileSerializer
from apps.certification.selectors import get_or_create_staff_for_user


class StaffAuthLoginView(APIView):
    """
    POST /api/v1/staff/auth/login/
    Вход сотрудника ЦНСВ в рабочий кабинет.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        if not username or not password:
            return Response(
                {'detail': 'Укажите логин и пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Поддержка нечувствительности к регистру логина (admin / Admin / test_staff / Test_staff)
        matched_user = User.objects.filter(username__iexact=username).first()
        lookup_username = matched_user.username if matched_user else username

        user = authenticate(username=lookup_username, password=password)
        if not user:
            return Response(
                {'detail': 'Неверный логин или пароль'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'Учетная запись отключена'},
                status=status.HTTP_403_FORBIDDEN
            )

        staff_profile = get_or_create_staff_for_user(user)
        if not staff_profile or not staff_profile.is_active:
            return Response(
                {'detail': 'Доступ к кабинету сотрудника не предоставлен'},
                status=status.HTTP_403_FORBIDDEN
            )

        token, _ = Token.objects.get_or_create(user=user)
        serializer = StaffProfileSerializer(staff_profile, context={'request': request})

        return Response({
            'token': token.key,
            'profile': serializer.data,
        }, status=status.HTTP_200_OK)


class StaffCurrentProfileView(APIView):
    """
    GET /api/v1/staff/profile/
    Получение данных текущего авторизованного сотрудника.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Профиль сотрудника не найден'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StaffProfileSerializer(staff, context={'request': request})
        return Response(serializer.data)


class StaffProfileDisconnectTelegramView(APIView):
    """
    POST /api/v1/staff/profile/telegram/disconnect/
    Отвязка Telegram-аккаунта сотрудника и генерация нового кода привязки.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        staff = get_or_create_staff_for_user(request.user)
        if not staff or not staff.is_active:
            return Response({'detail': 'Профиль сотрудника не найден'}, status=status.HTTP_403_FORBIDDEN)

        staff.telegram_chat_id = None
        staff.telegram_username = None
        staff.telegram_auth_code = secrets.token_hex(8)
        staff.save(update_fields=['telegram_chat_id', 'telegram_username', 'telegram_auth_code'])
        return Response({'status': 'ok', 'message': 'Telegram успешно отключен'})
