import re
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.document.models import CertifiedUser
from apps.certification.models import CertificationApplication
from apps.document.kyrgyz_name_normalizer import normalize_kyrgyz_full_name, split_kyrgyz_fio


class Command(BaseCommand):
    help = "Нормализация кыргызских имен (кызы/уулу, сокращения) и связывание дубликатов заявок с выданными сертификатами"

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Прогон без сохранения изменений в БД'
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        self.stdout.write(self.style.NOTICE(f"=== ЗАПУСК НОРМАЛИЗАЦИИ ИМЕН (dry_run={dry_run}) ==="))

        # 1. Нормализация CertifiedUser
        users = CertifiedUser.objects.all().order_by('id')
        updated_users_count = 0

        for u in users:
            try:
                raw_full = u.get_full_name()
                norm_full = normalize_kyrgyz_full_name(raw_full)
                new_last, new_first, new_sur = split_kyrgyz_fio(norm_full)

                current_tuple = (u.last_name or '', u.first_name or '', u.sur_name or '')
                new_tuple = (new_last, new_first, new_sur)

                if current_tuple != new_tuple or raw_full != norm_full:
                    self.stdout.write(
                        f"CertifiedUser #{u.id} ({u.registration_number}): '{raw_full}' -> '{norm_full}' | "
                        f"fields: {current_tuple} -> {new_tuple}"
                    )
                    if not dry_run:
                        u.last_name = new_last
                        u.first_name = new_first
                        u.sur_name = new_sur
                        u.save(update_fields=['last_name', 'first_name', 'sur_name', 'updated_at'])
                    updated_users_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Ошибка при обработке CertifiedUser #{u.id}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Обработано CertifiedUser: изменено {updated_users_count} из {users.count()}"))

        # 2. Нормализация CertificationApplication
        apps = CertificationApplication.objects.filter(deleted_at__isnull=True)
        updated_apps_count = 0
        for a in apps:
            try:
                raw_name = a.full_name or ''
                norm_name = normalize_kyrgyz_full_name(raw_name)
                if raw_name != norm_name:
                    self.stdout.write(f"Application #{a.id}: '{raw_name}' -> '{norm_name}'")
                    if not dry_run:
                        a.full_name = norm_name
                        a.save(update_fields=['full_name', 'updated_at'])
                    updated_apps_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Ошибка при обработке Application #{a.id}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Обработано Application: обновлено имен {updated_apps_count} из {apps.count()}"))

        # 3. Синхронизация активных заявок, чьи сертификаты уже в реестре
        linked_count = 0
        for a in apps:
            try:
                norm_app_name = normalize_kyrgyz_full_name(a.full_name).strip().lower()
                clean_inn = "".join(filter(str.isdigit, a.inn or ""))

                cert_user = None
                if clean_inn and len(clean_inn) == 14:
                    cert_user = CertifiedUser.objects.filter(inn=clean_inn).first()

                if not cert_user:
                    for cu in CertifiedUser.objects.all():
                        cu_norm = normalize_kyrgyz_full_name(cu.get_full_name()).strip().lower()
                        if cu_norm == norm_app_name:
                            cert_user = cu
                            break

                if cert_user:
                    changed_fields_cu = []
                    changed_fields_app = []

                    # Переносим ИНН в CertifiedUser, если там не было
                    if clean_inn and (not cert_user.inn or cert_user.inn != clean_inn):
                        self.stdout.write(f"Переносим ИНН {clean_inn} из заявки #{a.id} в CertifiedUser #{cert_user.id}")
                        cert_user.inn = clean_inn
                        changed_fields_cu.append('inn')

                    # Безопасно связываем application <-> certified_user
                    if cert_user.application_id != a.id:
                        existing_other = CertifiedUser.objects.filter(application=a).exclude(id=cert_user.id).first()
                        if existing_other:
                            self.stdout.write(f"Внимание: заявка #{a.id} уже привязана к CertifiedUser #{existing_other.id}")
                        else:
                            cert_user.application = a
                            changed_fields_cu.append('application')

                    # Копируем фото из заявки, если у сертификата нет фото
                    if not cert_user.image:
                        photo_doc = a.documents.filter(doc_type='photo').first()
                        if photo_doc and photo_doc.file:
                            self.stdout.write(f"Копируем фото из заявки #{a.id} в CertifiedUser #{cert_user.id}")
                            cert_user.image = photo_doc.file
                            changed_fields_cu.append('image')

                    # Обновляем статус заявки на completed и указываем номер сертификата
                    if a.status != 'completed':
                        self.stdout.write(f"Заявка #{a.id} ({a.full_name}) переведена из '{a.status}' в 'completed'")
                        a.status = 'completed'
                        changed_fields_app.append('status')

                    if not a.certificate_number_issued or a.certificate_number_issued != cert_user.registration_number:
                        a.certificate_number_issued = cert_user.registration_number
                        changed_fields_app.append('certificate_number_issued')

                    if not dry_run:
                        if changed_fields_cu:
                            changed_fields_cu.append('updated_at')
                            cert_user.save(update_fields=changed_fields_cu)
                        if changed_fields_app:
                            changed_fields_app.append('updated_at')
                            a.save(update_fields=changed_fields_app)

                    if changed_fields_cu or changed_fields_app:
                        linked_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Ошибка при связывании Application #{a.id}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"Синхронизировано связок заявка <-> реестр: {linked_count}"))
        self.stdout.write(self.style.SUCCESS("=== ЗАВЕРШЕНО ==="))
