"""
Management command: import_certified_users
Usage:
    python manage.py import_certified_users /path/to/file.xlsx [--clear]

Options:
    --clear     Удалить все существующие записи перед импортом
    --dry-run   Только показать что будет импортировано, без записи в БД
"""

import os
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError

from apps.document.models import CertifiedUser


def split_full_name(full_name: str):
    """
    Разбивает ФИО на составляющие.
    Стандартный формат: 'Фамилия Имя Отчество'
    Примеры:
      'Романенко Илья Антонович'   → ('Романенко', 'Илья', 'Антонович')
      'Абдилова Светлана'          → ('Абдилова', 'Светлана', None)
      'Шергазы уулу Тилктеш'       → ('Шергазы', 'уулу', 'Тилктеш')
    """
    parts = full_name.strip().split()
    if len(parts) == 0:
        return '', '', None
    if len(parts) == 1:
        return parts[0], '', None
    # parts[0] = Фамилия, parts[1] = Имя, parts[2:] = Отчество
    last_name  = parts[0]
    first_name = parts[1]
    sur_name   = ' '.join(parts[2:]) if len(parts) > 2 else None
    return last_name, first_name, sur_name


class Command(BaseCommand):
    help = 'Импортирует сертифицированных пользователей из Excel файла ЦНСВ'

    def add_arguments(self, parser):
        parser.add_argument('xlsx_path', type=str, help='Путь к Excel файлу')
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Удалить все существующие записи перед импортом',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Только показать статистику, не записывать в БД',
        )

    def handle(self, *args, **options):
        xlsx_path = options['xlsx_path']

        if not os.path.exists(xlsx_path):
            raise CommandError(f'Файл не найден: {xlsx_path}')

        try:
            import openpyxl
        except ImportError:
            raise CommandError('Установите openpyxl: pip install openpyxl')

        self.stdout.write(f'📂 Читаю файл: {xlsx_path}')

        wb = openpyxl.load_workbook(xlsx_path)
        ws = wb.active

        # Считываем все строки начиная с 3-й (пропускаем заголовок и название)
        rows = list(ws.iter_rows(min_row=3, values_only=True))

        # Фильтруем: нужны строки где есть ФИО И рег. номер
        valid_rows = []
        for row in rows:
            fio_raw = row[2]
            reg_raw = row[4]
            fio = str(fio_raw).strip() if fio_raw else ''
            reg = str(reg_raw).strip() if reg_raw else ''
            if fio and fio != 'None' and reg and reg != 'None':
                valid_rows.append(row)

        self.stdout.write(f'📊 Найдено валидных записей: {len(valid_rows)}')

        if options['dry_run']:
            self.stdout.write(self.style.WARNING('🔍 DRY-RUN режим — в БД ничего не записывается'))
            self.stdout.write('\nПервые 10 записей:')
            for row in valid_rows[:10]:
                fio = str(row[2]).strip()
                last, first, sur = split_full_name(fio)
                reg = str(row[4]).strip()
                prof = str(row[3]).strip() if row[3] else ''
                self.stdout.write(f'  [{reg}] {last} | {first} | {sur} — {prof}')
            return

        # Опционально очищаем таблицу
        if options['clear']:
            count = CertifiedUser.objects.count()
            CertifiedUser.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'🗑️  Удалено {count} существующих записей'))

        created = 0
        skipped = 0
        duplicate = 0
        errors = 0

        seen_reg_numbers = set()

        for idx, row in enumerate(valid_rows, start=1):
            try:
                import re
                fio_raw   = re.sub(r'\s+', ' ', str(row[2])).strip()
                reg_raw   = re.sub(r'\s+', ' ', str(row[4])).strip()
                reg_raw   = re.sub(r'\s*-\s*', '-', reg_raw)
                prof_raw  = str(row[3]).strip() if row[3] else ''

                # Дата выдачи (колонка 8, индекс 7)
                issued_raw = row[7]
                issued_date = None
                if issued_raw and isinstance(issued_raw, datetime):
                    issued_date = issued_raw.date()
                elif issued_raw and isinstance(issued_raw, str):
                    for fmt in ('%d.%m.%Y', '%Y-%m-%d'):
                        try:
                            issued_date = datetime.strptime(issued_raw.strip(), fmt).date()
                            break
                        except ValueError:
                            pass

                # Дата сертификации (колонка 7, индекс 6) — используем как запасной вариант
                if not issued_date:
                    cert_raw = row[6]
                    if cert_raw and isinstance(cert_raw, datetime):
                        issued_date = cert_raw.date()

                # Пропускаем дубли рег. номеров внутри файла
                if reg_raw in seen_reg_numbers:
                    duplicate += 1
                    continue
                seen_reg_numbers.add(reg_raw)

                last_name, first_name, sur_name = split_full_name(fio_raw)

                # Чистим профессию от лишних пробелов
                if prof_raw and prof_raw != 'None':
                    profession = re.sub(r'\s+', ' ', prof_raw).strip()
                    profession = re.sub(r'\s*-\s*', '-', profession)
                else:
                    profession = None

                obj, created_flag = CertifiedUser.objects.get_or_create(
                    registration_number=reg_raw,
                    defaults={
                        'last_name': last_name,
                        'first_name': first_name,
                        'sur_name': sur_name,
                        'profession': profession,
                        'issued_date': issued_date,
                        'order': idx,
                    }
                )

                if created_flag:
                    created += 1
                else:
                    skipped += 1

            except Exception as e:
                errors += 1
                self.stdout.write(self.style.ERROR(f'  ❌ Ошибка в строке {idx}: {e} | Данные: {row}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ Создано новых записей: {created}'))
        if skipped:
            self.stdout.write(self.style.WARNING(f'⏭️  Пропущено (уже есть в БД): {skipped}'))
        if duplicate:
            self.stdout.write(self.style.WARNING(f'🔁 Пропущено дублей рег. номера в файле: {duplicate}'))
        if errors:
            self.stdout.write(self.style.ERROR(f'❌ Ошибок: {errors}'))
        self.stdout.write(f'🏁 Итого в БД: {CertifiedUser.objects.count()} записей')
