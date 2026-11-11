from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class CaseInsensitiveModelBackend(ModelBackend):
    """
    Аутентификация пользователя без учета регистра имени пользователя (username).
    Позволяет входить как 'admin', так и 'Admin' или 'ADMIN'.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        if not username or password is None:
            return None

        try:
            user = UserModel._default_manager.get(**{f"{UserModel.USERNAME_FIELD}__iexact": username.strip()})
        except (UserModel.DoesNotExist, UserModel.MultipleObjectsReturned):
            UserModel().set_password(password)
            return None
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
