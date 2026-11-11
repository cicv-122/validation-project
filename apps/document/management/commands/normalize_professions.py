# apps/document/management/commands/normalize_professions.py
import sys
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.document.models import CertifiedUser
from apps.certification.models import CertificationApplication, Profession
from apps.document.profession_cleaner import clean_profession_name


class Command(BaseCommand):
    help = 'Очистка, исправление опечаток и нормализация названий профессий в базе данных реестра ЦНСВ'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Применить изменения в базе данных (по умолчанию только dry-run)',
        )

    def handle(self, *args, **options):
        apply_changes = options.get('apply', False)

        mode_str = "ПРИМЕНЕНИЕ ИЗМЕНЕНИЙ" if apply_changes else "ТЕСТОВЫЙ РЕЖИМ (DRY-RUN)"
        self.stdout.write(self.style.MIGRATE_HEADING(f"=== Нормализация профессий ЦНСВ: {mode_str} ==="))

        # 1. Обработка CertifiedUser (Реестр выданных сертификатов)
        users = CertifiedUser.objects.all().order_by('id')
        user_changes = []
        for u in users:
            old_prof = u.profession or ''
            new_prof = clean_profession_name(old_prof)
            if old_prof != new_prof:
                user_changes.append((u, old_prof, new_prof))

        self.stdout.write(f"\nНайдено записей CertifiedUser для обновления: {len(user_changes)} из {users.count()}")
        for u, old_prof, new_prof in user_changes[:30]:
            self.stdout.write(f"  [{u.registration_number}] '{old_prof}' ➔ '{new_prof}'")
        if len(user_changes) > 30:
            self.stdout.write(f"  ... и ещё {len(user_changes) - 30} записей")

        # 2. Обработка CertificationApplication (Онлайн-заявки)
        apps = CertificationApplication.objects.all().order_by('id')
        app_changes = []
        for app in apps:
            old_prof = app.profession or ''
            new_prof = clean_profession_name(old_prof)
            if old_prof != new_prof:
                app_changes.append((app, old_prof, new_prof))

        self.stdout.write(f"\nНайдено записей CertificationApplication для обновления: {len(app_changes)} из {apps.count()}")
        for app, old_prof, new_prof in app_changes[:15]:
            self.stdout.write(f"  [№ {app.registration_number}] '{old_prof}' ➔ '{new_prof}'")

        # 3. Обработка справочника Profession (ПКМ № 252 - Закреплённые профессии в админке и на сайте)
        import re
        professions = Profession.objects.all().order_by('id')
        prof_changes = []
        for p in professions:
            old_ru = p.name_ru or ''
            old_ky = p.name_ky or ''
            old_sec = p.section or ''

            new_ru = clean_profession_name(old_ru)
            new_ky = re.sub(r'\s+', ' ', re.sub(r'\s*-\s*', '-', old_ky)).strip()
            new_sec = re.sub(r'\s+', ' ', old_sec.replace('(**)', '')).strip()
            new_sec = re.sub(r'Камнеперерабатывающее производств\b', 'Камнеперерабатывающее производство', new_sec)

            if old_ru != new_ru or old_ky != new_ky or old_sec != new_sec:
                prof_changes.append((p, old_ru, new_ru, old_ky, new_ky, old_sec, new_sec))

        self.stdout.write(f"\nНайдено записей справочника Profession (ПКМ № 252) для обновления: {len(prof_changes)} из {professions.count()}")
        for p, old_ru, new_ru, old_ky, new_ky, old_sec, new_sec in prof_changes:
            if old_ru != new_ru:
                self.stdout.write(f"  [ID {p.id} RU] '{old_ru}' ➔ '{new_ru}'")
            if old_ky != new_ky:
                self.stdout.write(f"  [ID {p.id} KY] '{old_ky}' ➔ '{new_ky}'")
            if old_sec != new_sec:
                self.stdout.write(f"  [ID {p.id} SEC] '{old_sec}' ➔ '{new_sec}'")

        if not apply_changes:
            self.stdout.write(self.style.WARNING(
                "\n[DRY-RUN] Изменения НЕ сохранены. Чтобы применить их в базе данных, запустите команду с флагом --apply."
            ))
            return

        # Применяем в транзакции
        with transaction.atomic():
            for u, _, new_prof in user_changes:
                u.profession = new_prof
                u.save(update_fields=['profession'])

            for app, _, new_prof in app_changes:
                app.profession = new_prof
                app.save(update_fields=['profession'])

            for p, _, new_ru, _, new_ky, _, new_sec in prof_changes:
                p.name_ru = new_ru
                p.name_ky = new_ky
                p.section = new_sec
                p.save(update_fields=['name_ru', 'name_ky', 'section', 'updated_at'])

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ УСПЕШНО ОБНОВЛЕНО:\n"
            f"  - Справочник профессий (Profession ПКМ № 252): {len(prof_changes)}\n"
            f"  - Специалистов в реестре (CertifiedUser): {len(user_changes)}\n"
            f"  - Заявок кандидатов (CertificationApplication): {len(app_changes)}\n"
        ))
