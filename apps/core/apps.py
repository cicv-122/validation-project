from django.apps import AppConfig
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache


@receiver([post_save, post_delete])
def auto_clear_cache_on_model_change(sender, **kwargs):
    if sender._meta.app_label in ['news', 'document', 'core', 'certification']:
        try:
            cache.clear()
        except Exception:
            pass


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Прочее'
