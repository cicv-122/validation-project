from django.apps import AppConfig


class CertificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.certification'
    verbose_name = 'Сертификация и валидация'

    def ready(self):
        import apps.certification.signals  # noqa: F401
