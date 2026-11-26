# apps/document/management/commands/reorder_registry_by_cert_number.py
import re
from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.document.models import CertifiedUser


class Command(BaseCommand):
    help = 'Пересчитывает поле order для всех специалистов реестра по возрастанию номера сертификата (чтобы сортировка -order была строгой от максимального к минимальному номеру)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Применить изменения в базе данных (по умолчанию dry-run)',
        )

    def extract_cert_number(self, reg_str: str) -> int:
        if not reg_str:
            return 0
        digits = re.findall(r'\d+', reg_str)
        if not digits:
            return 0
        return int(digits[0])

    def handle(self, *args, **options):
        apply_changes = options.get('apply', False)
        mode = "ПРИМЕНЕНИЕ" if apply_changes else "ТЕСТОВЫЙ РЕЖИМ (DRY-RUN)"
        self.stdout.write(self.style.MIGRATE_HEADING(f"=== Упорядочивание реестра специалистов: {mode} ==="))

        users = list(CertifiedUser.objects.all())
        total_count = len(users)
        self.stdout.write(f"Всего записей в реестре: {total_count}")

        # Сортируем: сначала записи без номеров (0), затем по возрастанию номера сертификата от 1 до MAX
        # Внутри одинаковых номеров сортируем по дате выдачи
        def sort_key(u):
            num = self.extract_cert_number(u.registration_number)
            dt = u.issued_date or date.min
            return (1 if num > 0 else 0, num, dt, u.id)

        sorted_users = sorted(users, key=sort_key)

        # Анализ пропущенных номеров
        numbered_users = [u for u in sorted_users if self.extract_cert_number(u.registration_number) > 0]
        unassigned_users = [u for u in sorted_users if self.extract_cert_number(u.registration_number) == 0]

        nums_map = {}
        for u in numbered_users:
            num = self.extract_cert_number(u.registration_number)
            nums_map[num] = u

        min_val = min(nums_map.keys()) if nums_map else 0
        max_val = max(nums_map.keys()) if nums_map else 0

        self.stdout.write(f"\nДиапазон номеров: от {min_val} до {max_val}")
        self.stdout.write(f"С номерами: {len(numbered_users)}, без номеров: {len(unassigned_users)}")

        all_expected = set(range(1, max_val + 1))
        missing = sorted(all_expected - set(nums_map.keys()))

        self.stdout.write(self.style.WARNING(f"\n--- ПРОПУЩЕННЫЕ НОМЕРА В РЕЕСТРЕ ({len(missing)} шт.) ---"))
        for m in missing:
            prev_u = nums_map.get(m - 1)
            next_u = nums_map.get(m + 1)
            p_str = f"{prev_u.registration_number} ({prev_u.get_full_name()}, {prev_u.issued_date})" if prev_u else "Начало"
            n_str = f"{next_u.registration_number} ({next_u.get_full_name()}, {next_u.issued_date})" if next_u else "Конец"
            self.stdout.write(f"  ❌ ЦС № {str(m).zfill(6)} (№ {m}) — между {p_str} и {n_str}")

        # Назначаем новый order: от 1 до total_count
        to_update = []
        for new_order, u in enumerate(sorted_users, start=1):
            if u.order != new_order:
                to_update.append((u, u.order, new_order))

        self.stdout.write(f"\nЗаписей с изменением порядка (order): {len(to_update)} из {total_count}")

        if not apply_changes:
            self.stdout.write(self.style.WARNING("\n🔍 Режим DRY-RUN завершён. Изменения не сохранены. Запустите с --apply для сохранения."))
            return

        with transaction.atomic():
            for u, old_order, new_order in to_update:
                u.order = new_order
                u.save(update_fields=['order'])

        self.stdout.write(self.style.SUCCESS(f"\n✅ Успешно обновлено поле order у {len(to_update)} специалистов!"))
        self.stdout.write(self.style.SUCCESS("🏁 Реестр теперь строго упорядочен по номерам сертификатов!"))
