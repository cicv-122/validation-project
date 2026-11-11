# scripts/update_registry_from_xlsx.py
"""
Скрипт синхронизации и обновления государственного реестра ЦНСВ из Excel-файла 'ЦНСВ БД1.xlsx'.
Обновляет существующие записи, добавляет новые (до 892+), очищает профессии и нормализует даты.
"""
import os
import re
import sys
from datetime import datetime, date

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import openpyxl
from apps.document.models import CertifiedUser
from apps.certification.models import CertificationApplication
from apps.document.profession_cleaner import clean_profession_name


def split_full_name(full_name: str):
    parts = full_name.strip().split()
    if not parts:
        return '', '', None
    if len(parts) == 1:
        return parts[0], '', None
    last_name = parts[0]
    first_name = parts[1]
    sur_name = ' '.join(parts[2:]) if len(parts) > 2 else None
    return last_name, first_name, sur_name


def parse_date(val):
    if not val:
        return None
    if isinstance(val, (datetime, date)):
        return val.date() if isinstance(val, datetime) else val
    s = str(val).strip()
    # Очистка опечаток вида '05.03.206', '16.032026', '2.10.2026.'
    s = s.rstrip('.')
    if s == '05.03.206':
        return date(2026, 3, 5)
    if s == '16.032026':
        return date(2026, 3, 16)

    for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%Y.%m.%d', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S'):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    return None


def normalize_reg_number(raw_reg: str) -> str:
    s = re.sub(r'\s+', ' ', str(raw_reg)).strip()
    digits = ''.join(c for c in s if c.isdigit())
    if digits:
        padded = digits.zfill(6)
        return f"ЦС № {padded}"
    return s


def run_sync(xlsx_path='ЦНСВ БД1.xlsx', dry_run=False):
    print(f"📂 Открываем файл: {xlsx_path}")
    wb = openpyxl.load_workbook(xlsx_path)
    ws = wb.active

    rows = list(ws.iter_rows(min_row=3, values_only=True))
    valid_rows = [r for r in rows if r[2] and str(r[2]).strip() and r[4] and str(r[4]).strip()]
    print(f"📊 Всего строк в файле: {len(rows)}, валидных с ФИО и номером: {len(valid_rows)}")

    created_count = 0
    updated_count = 0
    seen_regs = set()

    for idx, row in enumerate(valid_rows, start=1):
        num_col = row[0]
        date_col = row[1]
        fio_raw = re.sub(r'\s+', ' ', str(row[2])).strip()
        prof_raw = str(row[3]).strip() if row[3] else ''
        reg_raw = str(row[4]).strip()
        location_raw = str(row[5]).strip() if row[5] else ''
        cert_date_raw = row[6]
        issue_date_raw = row[7]

        reg_norm = normalize_reg_number(reg_raw)
        if reg_norm in seen_regs:
            continue
        seen_regs.add(reg_norm)

        last_name, first_name, sur_name = split_full_name(fio_raw)
        clean_prof = clean_profession_name(prof_raw)

        issued_d = parse_date(issue_date_raw) or parse_date(cert_date_raw) or parse_date(date_col)

        # Поиск по базе (по нормализованному номеру или чистым цифрам)
        digits_only = ''.join(c for c in reg_norm if c.isdigit())
        user = CertifiedUser.objects.filter(registration_number=reg_norm).first()
        if not user and digits_only:
            user = CertifiedUser.objects.filter(registration_number__icontains=digits_only).first()

        if user:
            # Обновление существующей записи
            changed = False
            if user.last_name != last_name:
                user.last_name = last_name
                changed = True
            if user.first_name != first_name:
                user.first_name = first_name
                changed = True
            if user.sur_name != sur_name:
                user.sur_name = sur_name
                changed = True
            if clean_prof and user.profession != clean_prof:
                user.profession = clean_prof
                changed = True
            if issued_d and user.issued_date != issued_d:
                user.issued_date = issued_d
                changed = True
            if user.registration_number != reg_norm:
                user.registration_number = reg_norm
                changed = True

            if changed and not dry_run:
                user.save()
            updated_count += 1
        else:
            # Создание новой записи
            if not dry_run:
                new_user = CertifiedUser.objects.create(
                    registration_number=reg_norm,
                    last_name=last_name,
                    first_name=first_name,
                    sur_name=sur_name,
                    profession=clean_prof,
                    issued_date=issued_d,
                    order=idx,
                )
                # Создаем связанную заявку в архиве
                CertificationApplication.objects.create(
                    registration_number=f"ARCH-{digits_only}",
                    full_name=fio_raw,
                    profession=clean_prof,
                    certificate_number_issued=reg_norm,
                    status='completed',
                    application_type='certification',
                    scheduled_date=issued_d,
                    scheduled_location=location_raw or 'ЦНСВ',
                    origin='registry_archive',
                    phone='—',
                )
            created_count += 1

    mode = "DRY-RUN" if dry_run else "ВЫПОЛНЕНО"
    print(f"\n[{mode}] Итоги синхронизации:")
    print(f"  ✓ Новых записей добавлено: {created_count}")
    print(f"  ✓ Существующих записей проверено/обновлено: {updated_count}")
    print(f"  ✓ Всего уникальных специалистов: {len(seen_regs)}")


if __name__ == '__main__':
    dry = '--dry-run' in sys.argv
    run_sync('ЦНСВ БД1.xlsx', dry_run=dry)
