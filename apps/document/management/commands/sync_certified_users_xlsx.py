import os
import json
import re
from datetime import datetime, date
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.document.models import CertifiedUser
from apps.document.profession_cleaner import clean_profession_name


def split_full_name(full_name: str):
    from apps.document.kyrgyz_name_normalizer import split_kyrgyz_fio
    last_name, first_name, sur_name = split_kyrgyz_fio(full_name)
    return last_name, first_name, sur_name or None


def parse_date_value(val):
    if not val:
        return None
    if isinstance(val, (datetime, date)):
        return val.date() if isinstance(val, datetime) else val
    val_str = str(val).strip()
    for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y', '%Y.%m.%d'):
        try:
            return datetime.strptime(val_str, fmt).date()
        except ValueError:
            pass
    return None


class Command(BaseCommand):
    help = 'Синхронизирует и безопасно добавляет специалистов из обновленного файла/JSON базы ЦНСВ'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            default='data/sync_candidates.json',
            help='Путь к файлу (JSON или XLSX, по умолчанию data/sync_candidates.json)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Режим предпросмотра без внесения изменений в БД',
        )

    def load_candidates(self, source_path):
        if source_path.endswith('.json'):
            self.stdout.write(f'📂 Загрузка данных из JSON: {source_path}')
            with open(source_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data

        # Иначе пробуем через openpyxl
        try:
            import openpyxl
        except ImportError:
            # Если openpyxl не установлен, но есть подготовленный sync_candidates.json
            fallback = os.path.join(os.path.dirname(source_path), 'data', 'sync_candidates.json')
            if os.path.exists(fallback):
                self.stdout.write(self.style.WARNING(f'openpyxl не установлен, используем подготовленный {fallback}'))
                with open(fallback, 'r', encoding='utf-8') as f:
                    return json.load(f)
            raise CommandError('Необходимо установить openpyxl или передать JSON файл через --source')

        self.stdout.write(f'📂 Чтение Excel файла: {source_path}')
        wb = openpyxl.load_workbook(source_path, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(min_row=3, values_only=True))

        candidates = []
        for idx, r in enumerate(rows, start=3):
            row_id, date_col, fio_raw, prof_raw, reg_raw, loc_raw, cert_d_raw, iss_d_raw = r[:8]
            if not fio_raw or not str(fio_raw).strip() or not reg_raw or not str(reg_raw).strip():
                continue
            fio = re.sub(r'\s+', ' ', str(fio_raw)).strip()
            reg_clean = re.sub(r'\s+', ' ', str(reg_raw)).strip()
            digits = ''.join(c for c in reg_clean if c.isdigit())
            std_reg = f'ЦС № {digits.zfill(6)}' if digits and len(digits) <= 6 else (f'ЦС № {digits}' if digits else reg_clean)

            last, first, sur = split_full_name(fio)
            prof = clean_profession_name(str(prof_raw or '')) if prof_raw else ''
            dt = parse_date_value(iss_d_raw) or parse_date_value(cert_d_raw) or parse_date_value(date_col)

            candidates.append({
                'row_idx': idx,
                'registration_number': std_reg,
                'raw_registration_number': reg_clean,
                'digits': digits,
                'last_name': last,
                'first_name': first,
                'sur_name': sur,
                'profession': prof,
                'issued_date': dt.strftime('%Y-%m-%d') if dt else None,
                'location': str(loc_raw or '').strip(),
            })
        return candidates

    def handle(self, *args, **options):
        source_path = options['source']
        dry_run = options['dry_run']

        if not os.path.isabs(source_path):
            source_path = os.path.abspath(source_path)

        candidates = self.load_candidates(source_path)
        self.stdout.write(f'📊 Загружено кандидатов: {len(candidates)}')

        # Текущее состояние базы данных
        existing_users = list(CertifiedUser.objects.all())
        existing_by_reg = {}
        for u in existing_users:
            existing_by_reg[u.registration_number] = u
            digits = ''.join(c for c in u.registration_number if c.isdigit())
            if digits:
                existing_by_reg[f'ЦС № {digits.zfill(6)}'] = u
                existing_by_reg[digits] = u

        max_order = max([u.order for u in existing_users] or [0])
        current_db_count = len(existing_users)
        self.stdout.write(f'💾 Текущих записей в базе данных: {current_db_count}')

        to_create = []
        to_update = []
        skipped_existing = 0
        duplicate_in_source = 0

        seen_in_source = set()

        for c in candidates:
            std_reg = c['registration_number']
            reg_raw = c.get('raw_registration_number', std_reg)
            digits = c.get('digits', '')
            last_name = c['last_name']
            first_name = c['first_name']
            sur_name = c['sur_name']
            profession = clean_profession_name(c.get('profession') or '')
            issued_date = parse_date_value(c.get('issued_date'))

            source_key = (f"{last_name} {first_name}".lower(), std_reg)
            if source_key in seen_in_source:
                duplicate_in_source += 1
                continue
            seen_in_source.add(source_key)

            existing_user = existing_by_reg.get(std_reg) or existing_by_reg.get(reg_raw) or (existing_by_reg.get(digits) if digits else None)

            if existing_user:
                # Проверяем совпадение фамилии
                if existing_user.last_name.strip().lower() == last_name.strip().lower():
                    needs_update = False
                    if not existing_user.issued_date and issued_date:
                        existing_user.issued_date = issued_date
                        needs_update = True
                    if needs_update:
                        to_update.append(existing_user)
                    else:
                        skipped_existing += 1
                else:
                    # Исторический дубликат номера сертификата у другого специалиста
                    skipped_existing += 1
            else:
                max_order += 1
                new_user = CertifiedUser(
                    registration_number=std_reg,
                    last_name=last_name,
                    first_name=first_name,
                    sur_name=sur_name,
                    profession=profession,
                    issued_date=issued_date,
                    order=max_order,
                )
                to_create.append(new_user)
                existing_by_reg[std_reg] = new_user
                if digits:
                    existing_by_reg[digits] = new_user

        self.stdout.write(f'Новых специалистов к добавлению: {len(to_create)}')
        self.stdout.write(f'Существующих специалистов (без изменений): {skipped_existing}')
        self.stdout.write(f'Существующих специалистов к обновлению дат: {len(to_update)}')
        self.stdout.write(f'Повторяющихся записей пропущено: {duplicate_in_source}')

        if dry_run:
            self.stdout.write(self.style.WARNING('\n🔍 РЕЖИМ DRY-RUN: база данных не изменялась.'))
            self.stdout.write('Примеры первых 5 новых специалистов:')
            for u in to_create[:5]:
                self.stdout.write(f'  + [{u.registration_number}] {u.get_full_name()} — {u.profession} ({u.issued_date})')
            if len(to_create) > 5:
                self.stdout.write('Примеры последних 5 новых специалистов:')
                for u in to_create[-5:]:
                    self.stdout.write(f'  + [{u.registration_number}] {u.get_full_name()} — {u.profession} ({u.issued_date})')
            return

        self.stdout.write('\n🚀 Запись данных в базу...')
        with transaction.atomic():
            created_count = 0
            for u in to_create:
                u.save()  # генерирует токен верификации, нормализует профессию и генерирует QR
                created_count += 1

            for u in to_update:
                u.save(update_fields=['issued_date'])

        final_count = CertifiedUser.objects.count()
        self.stdout.write(self.style.SUCCESS(f'✅ Успешно добавлено новых записей: {created_count}'))
        if to_update:
            self.stdout.write(self.style.SUCCESS(f'✅ Обновлено записей: {len(to_update)}'))
        self.stdout.write(self.style.SUCCESS(f'🏁 Итого специалистов в реестре: {final_count}'))
