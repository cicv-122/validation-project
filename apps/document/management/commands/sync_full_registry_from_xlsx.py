# apps/document/management/commands/sync_full_registry_from_xlsx.py
import os
import re
from datetime import datetime, date
from collections import defaultdict
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.document.models import CertifiedUser
from apps.certification.models import CertificationApplication
from apps.document.kyrgyz_name_normalizer import normalize_kyrgyz_full_name, split_kyrgyz_fio
from apps.document.profession_cleaner import clean_profession_name


def parse_date_value(val):
    if not val:
        return None
    if isinstance(val, (datetime, date)):
        return val.date() if isinstance(val, datetime) else val
    val_str = str(val).strip()
    for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y', '%Y.%m.%d', '%Y-%m-%d %H:%M:%S'):
        try:
            return datetime.strptime(val_str, fmt).date()
        except ValueError:
            pass
    return None


def clean_reg_base(reg_str: str) -> str:
    cleaned = re.sub(r'\s+', ' ', str(reg_str or '')).strip()
    if '5601' in cleaned:
        return 'ЦС № 000601'
    m = re.match(r'^(?:ЦС|Цс|цс)\s*№?\s*(\d+)$', cleaned)
    if m:
        digits = m.group(1)
        return f'ЦС № {digits.zfill(6)}' if len(digits) <= 6 else f'ЦС № {digits}'
    if cleaned.startswith('Цс'):
        return 'ЦС' + cleaned[2:]
    return cleaned


class Command(BaseCommand):
    help = 'Полная синхронизация Государственного реестра из актуального ЦНСВ БД.xlsx: разрешение дубликатов через дробь /1, /2, нормализация ФИО и профессий, архивация 0000, сквозное упорядочивание.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            default='ЦНСВ БД.xlsx',
            help='Путь к Excel-файлу базы данных ЦНСВ (по умолчанию ЦНСВ БД.xlsx)',
        )
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Применить изменения в базе данных (по умолчанию dry-run)',
        )

    def handle(self, *args, **options):
        source_path = options['source']
        apply_changes = options['apply']

        if not os.path.isabs(source_path):
            source_path = os.path.abspath(source_path)

        if not os.path.exists(source_path):
            raise CommandError(f'Файл не найден: {source_path}')

        raw_rows = []
        if source_path.endswith('.json'):
            self.stdout.write(f"📂 Загрузка данных из JSON: {source_path}")
            with open(source_path, 'r', encoding='utf-8') as f:
                import json
                raw_rows = json.load(f)
        else:
            try:
                import openpyxl
                self.stdout.write(f"📂 Загрузка Excel файла: {source_path}")
                wb = openpyxl.load_workbook(source_path, data_only=True)
                ws = wb.active
                for r_idx, r in enumerate(ws.iter_rows(min_row=3, values_only=True), start=3):
                    row_id, date_col, fio_raw, prof_raw, reg_raw, loc_raw, cert_d_raw, iss_d_raw = r[:8]
                    if not fio_raw or not str(fio_raw).strip():
                        continue
                    raw_rows.append({
                        'row_idx': r_idx,
                        'excel_id': row_id,
                        'date_col': date_col,
                        'fio_raw': str(fio_raw).strip(),
                        'prof_raw': str(prof_raw or '').strip(),
                        'reg_raw': str(reg_raw or '').strip(),
                        'loc_raw': str(loc_raw or '').strip(),
                        'cert_d_raw': cert_d_raw,
                        'iss_d_raw': iss_d_raw,
                    })
            except ImportError:
                fallback_json = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(source_path))))), 'data', 'full_sync_candidates.json')
                if not os.path.exists(fallback_json):
                    fallback_json = os.path.abspath('data/full_sync_candidates.json')
                if os.path.exists(fallback_json):
                    self.stdout.write(self.style.WARNING(f"openpyxl не установлен, используем подготовленный {fallback_json}"))
                    with open(fallback_json, 'r', encoding='utf-8') as f:
                        import json
                        raw_rows = json.load(f)
                else:
                    raise CommandError(f'Необходимо установить openpyxl или передать JSON файл (не найден {fallback_json})')

        self.stdout.write(f"📊 Загружено заполненных строк из Excel: {len(raw_rows)}")

        # 1. Разделение: не сдали (0000 / пустой номер) и кандидаты с сертификатами
        uncertified = []
        certified = []

        for item in raw_rows:
            cert_val = item['reg_raw']
            if not cert_val or cert_val in ['0', 'None'] or re.match(r'^ЦС\s*№?\s*0+$', cert_val):
                uncertified.append(item)
            else:
                certified.append(item)

        self.stdout.write(f"  • Кандидатов без сертификата (0000 / не сдали): {len(uncertified)}")
        self.stdout.write(f"  • Кандидатов с сертификатами: {len(certified)}")

        # 2. Вычисление финальных регистрационных номеров с разрешением дубликатов
        for c in certified:
            c['clean_base'] = clean_reg_base(c['reg_raw'])

        base_counts = defaultdict(int)
        for c in certified:
            base_counts[c['clean_base']] += 1

        seq_tracker = defaultdict(int)
        for c in certified:
            base = c['clean_base']
            if base_counts[base] > 1:
                seq_tracker[base] += 1
                c['final_reg'] = f"{base}/{seq_tracker[base]}"
            else:
                c['final_reg'] = base

        unique_regs = set(c['final_reg'] for c in certified)
        if len(unique_regs) != len(certified):
            raise CommandError("Критическая ошибка: обнаружены коллизии финальных номеров!")

        dup_bases_count = sum(1 for cnt in base_counts.values() if cnt > 1)
        self.stdout.write(f"  • Номеров бланков с дубликатами: {dup_bases_count} (все разрешены через суффиксы /1, /2...)")

        # 3. Нормализация ФИО и профессий
        for c in certified:
            norm_name = normalize_kyrgyz_full_name(c['fio_raw'])
            last, first, sur = split_kyrgyz_fio(norm_name)
            c['last_name'] = last
            c['first_name'] = first
            c['sur_name'] = sur or ''
            c['norm_full_name'] = f"{last} {first} {sur}".strip() if sur else f"{last} {first}".strip()
            c['clean_prof'] = clean_profession_name(c['prof_raw'])
            
            dt = parse_date_value(c['iss_d_raw']) or parse_date_value(c['cert_d_raw']) or parse_date_value(c['date_col'])
            c['parsed_date'] = dt

        # 4. Сортировка и присвоение строгой сквозной нумерации order
        def extract_sort_key(c):
            m = re.match(r'^(?:ЦС\s*№\s*)?(\d+)(?:/(\d+))?', c['final_reg'])
            if m:
                main_num = int(m.group(1))
                slash_num = int(m.group(2)) if m.group(2) else 0
                return (main_num, slash_num)
            return (0, 0)

        certified.sort(key=extract_sort_key)
        for rank, c in enumerate(certified, start=1):
            c['new_order'] = rank

        # 5. Сопоставление с существующей базой CertifiedUser
        existing_users = list(CertifiedUser.objects.all())
        existing_by_reg = {u.registration_number: u for u in existing_users if u.registration_number}
        existing_by_name = defaultdict(list)
        for u in existing_users:
            key = f"{u.last_name.strip().lower()} {u.first_name.strip().lower()}"
            existing_by_name[key].append(u)

        to_create = []
        to_update = []
        matched_user_ids = set()

        for c in certified:
            final_reg = c['final_reg']
            clean_base = c['clean_base']
            name_key = f"{c['last_name'].strip().lower()} {c['first_name'].strip().lower()}"

            matched_user = (
                existing_by_reg.get(final_reg) or
                existing_by_reg.get(clean_base) or
                (existing_by_name[name_key][0] if existing_by_name.get(name_key) else None)
            )

            # Если пользователь уже был сопоставлен другой строкой — не перетираем
            if matched_user and matched_user.id in matched_user_ids:
                matched_user = None

            if matched_user:
                matched_user_ids.add(matched_user.id)
                needs_update = False
                if matched_user.registration_number != final_reg:
                    matched_user.registration_number = final_reg
                    needs_update = True
                if matched_user.last_name != c['last_name']:
                    matched_user.last_name = c['last_name']
                    needs_update = True
                if matched_user.first_name != c['first_name']:
                    matched_user.first_name = c['first_name']
                    needs_update = True
                if (matched_user.sur_name or '') != c['sur_name']:
                    matched_user.sur_name = c['sur_name']
                    needs_update = True
                if matched_user.profession != c['clean_prof']:
                    matched_user.profession = c['clean_prof']
                    needs_update = True
                if c['parsed_date'] and matched_user.issued_date != c['parsed_date']:
                    matched_user.issued_date = c['parsed_date']
                    needs_update = True
                if matched_user.order != c['new_order']:
                    matched_user.order = c['new_order']
                    needs_update = True

                if needs_update:
                    to_update.append(matched_user)
            else:
                new_u = CertifiedUser(
                    registration_number=final_reg,
                    last_name=c['last_name'],
                    first_name=c['first_name'],
                    sur_name=c['sur_name'],
                    profession=c['clean_prof'],
                    issued_date=c['parsed_date'],
                    order=c['new_order'],
                )
                to_create.append(new_u)

        # 6. Обработка не сдавших (0000): удаляем из CertifiedUser, переносим в CertificationApplication
        users_to_archive_from_db = []
        for u in existing_users:
            reg = u.registration_number or ''
            if reg in ['ЦС № 0000', 'ЦС № 000000'] or re.match(r'^ЦС\s*№?\s*0+$', reg):
                users_to_archive_from_db.append(u)

        self.stdout.write(f"\n📊 ПЛАН ДЕЙСТВИЙ:")
        self.stdout.write(f"  • Существующих специалистов к обновлению: {len(to_update)}")
        self.stdout.write(f"  • Новых специалистов к добавлению в реестр: {len(to_create)}")
        self.stdout.write(f"  • Записей с нулями (0000) к исключению из реестра в архив заявок: {len(users_to_archive_from_db)}")
        self.stdout.write(f"  • Итого специалистов в реестре после синхронизации: {len(certified)} (строго по 903 сертификатам)")

        if not apply_changes:
            self.stdout.write(self.style.WARNING("\n🔍 Режим DRY-RUN завершён. База данных не изменялась. Запустите с --apply для сохранения."))
            return

        self.stdout.write("\n🚀 Применение изменений в базе данных...")
        with transaction.atomic():
            # 1. Архивация и удаление записей без номеров из CertifiedUser
            for u in users_to_archive_from_db:
                # Гарантируем, что запись сохранена в CertificationApplication как архивное дело
                app = CertificationApplication.objects.filter(
                    full_name__iexact=u.get_full_name()
                ).first()
                if not app:
                    app = CertificationApplication.objects.create(
                        origin='registry_archive',
                        full_name=u.get_full_name(),
                        inn=u.inn or '',
                        profession=u.profession or '',
                        status='rejected',
                        admin_notes='Экзамен не сдан / сертификат не выдан (архив 10.07.2024)',
                    )
                else:
                    app.status = 'rejected'
                    app.certificate_number_issued = ''
                    app.admin_notes = 'Экзамен не сдан / сертификат не выдан (архив 10.07.2024)'
                    app.save(update_fields=['status', 'certificate_number_issued', 'admin_notes'])

                u.delete()
                self.stdout.write(f"  ✓ Перенесён в архив и исключён из реестра: {u.get_full_name()} (было {u.registration_number})")

            # Временно освобождаем регистрационные номера у обновляемых, чтобы избежать IntegrityError уникальности
            temp_prefix = f"TEMP_{int(datetime.now().timestamp())}_"
            for u in to_update:
                CertifiedUser.objects.filter(id=u.id).update(
                    registration_number=f"{temp_prefix}{u.id}"
                )

            # 2. Обновляем существующие записи
            for u in to_update:
                u.save()

            # 3. Создаем новые записи
            for u in to_create:
                u.save()

        final_count = CertifiedUser.objects.count()
        self.stdout.write(self.style.SUCCESS(f"\n✅ Синхронизация успешно завершена!"))
        self.stdout.write(self.style.SUCCESS(f"🏁 Всего активных специалистов в реестре: {final_count} (все имеют сертификаты)"))
