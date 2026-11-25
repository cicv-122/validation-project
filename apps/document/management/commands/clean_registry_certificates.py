# apps/document/management/commands/clean_registry_certificates.py
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.document.models import CertifiedUser
from apps.certification.models import CertificationApplication


class Command(BaseCommand):
    help = 'Исправление опечаток в номерах сертификатов, нормализация регистра (Цс -> ЦС) и пробелов в реестре ЦНСВ'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Применить изменения в базе данных (по умолчанию только dry-run)',
        )

    def normalize_reg(self, reg_str: str) -> str:
        if not reg_str:
            return reg_str
        cleaned = reg_str.strip()

        # Явная опечатка оператора: ввели 5601 вместо 000601 между 000600 и 000602
        if '5601' in cleaned:
            return 'ЦС № 000601'

        # Случаи с нулями (архив без номера) - стандартизируем к 6-значному ЦС № 000000
        if re.match(r'^(?:ЦС|Цс|цс)\s*№?\s*0+$', cleaned):
            return 'ЦС № 000000'

        # Стандартизация формата ЦС № XXXXXX
        m = re.match(r'^(?:ЦС|Цс|цс)\s*№?\s*(\d+)$', cleaned)
        if m:
            digits = m.group(1)
            if len(digits) <= 6:
                return f'ЦС № {digits.zfill(6)}'
            return f'ЦС № {digits}'

        # Если начинается с Цс, заменить на ЦС
        if cleaned.startswith('Цс'):
            return 'ЦС' + cleaned[2:]

        return cleaned

    def handle(self, *args, **options):
        apply_changes = options.get('apply', False)
        mode_str = "ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ" if apply_changes else "ТЕСТОВЫЙ РЕЖИМ (DRY-RUN)"
        self.stdout.write(self.style.MIGRATE_HEADING(f"=== Очистка номеров сертификатов ЦНСВ: {mode_str} ==="))

        users = CertifiedUser.objects.all().order_by('id')
        user_changes = []

        for u in users:
            old_reg = u.registration_number or ''
            new_reg = self.normalize_reg(old_reg)
            if old_reg != new_reg:
                user_changes.append((u, old_reg, new_reg))

        self.stdout.write(f"\nНайдено записей CertifiedUser для обновления: {len(user_changes)} из {users.count()}")
        for u, old_reg, new_reg in user_changes:
            self.stdout.write(f"  [{u.id}] {u.get_full_name()}: '{old_reg}' ➔ '{new_reg}'")

        # Проверка заявок CertificationApplication
        apps_to_update = []
        for app in CertificationApplication.objects.exclude(certificate_number_issued__isnull=True).exclude(certificate_number_issued=''):
            old_app_reg = app.certificate_number_issued or ''
            new_app_reg = self.normalize_reg(old_app_reg)
            if old_app_reg != new_app_reg:
                apps_to_update.append((app, old_app_reg, new_app_reg))

        if apps_to_update:
            self.stdout.write(f"\nНайдено заявок CertificationApplication для обновления: {len(apps_to_update)}")
            for app, old_app_reg, new_app_reg in apps_to_update:
                self.stdout.write(f"  [App {app.id}] {app.full_name}: '{old_app_reg}' ➔ '{new_app_reg}'")

        if not apply_changes:
            self.stdout.write(self.style.WARNING("\n🔍 Режим DRY-RUN завершён. Изменения не сохранены. Запустите с флагом --apply для применения."))
            return

        with transaction.atomic():
            for u, old_reg, new_reg in user_changes:
                u.registration_number = new_reg
                u.save(update_fields=['registration_number'])

            for app, old_app_reg, new_app_reg in apps_to_update:
                app.certificate_number_issued = new_app_reg
                app.save(update_fields=['certificate_number_issued'])

        self.stdout.write(self.style.SUCCESS(f"\n✅ Успешно обновлено записей CertifiedUser: {len(user_changes)}"))
        if apps_to_update:
            self.stdout.write(self.style.SUCCESS(f"✅ Успешно обновлено заявок CertificationApplication: {len(apps_to_update)}"))
        self.stdout.write(self.style.SUCCESS("🏁 Очистка номеров сертификатов завершена!"))
