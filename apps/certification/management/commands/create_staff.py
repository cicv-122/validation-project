# apps/certification/management/commands/create_staff.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.certification.models import StaffProfile, Profession


class Command(BaseCommand):
    help = 'Создать учетную запись сотрудника ЦНСВ для входа в кабинет /staff'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Логин для входа')
        parser.add_argument('--password', type=str, required=True, help='Пароль')
        parser.add_argument('--full-name', type=str, required=True, help='ФИО сотрудника')
        parser.add_argument('--phone', type=str, default='', help='Рабочий телефон')
        parser.add_argument('--role', type=str, default='officer', choices=['officer', 'senior_officer', 'supervisor'], help='Роль сотрудника')
        parser.add_argument('--all-professions', action='store_true', help='Закрепить за сотрудником ВСЕ профессии')
        parser.add_argument('--professions', type=str, default='', help='Список профессий через запятую (поиск по названию)')

    def handle(self, *args, **options):
        username = options['username'].strip()
        password = options['password']
        full_name = options['full_name'].strip()
        phone = options['phone'].strip()
        role = options['role']

        user, created = User.objects.get_or_create(
            username=username,
            defaults={'first_name': full_name.split()[0] if full_name else ''}
        )
        user.set_password(password)
        user.is_staff = True
        user.save()

        profile, prof_created = StaffProfile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': full_name,
                'phone': phone,
                'role': role,
                'is_active': True,
            }
        )
        profile.full_name = full_name
        profile.phone = phone
        profile.role = role
        profile.is_active = True
        profile.save()

        if options['all_professions']:
            all_profs = Profession.objects.filter(is_active=True)
            profile.assigned_professions.set(all_profs)
            self.stdout.write(self.style.SUCCESS(f'Закреплены ВСЕ активные профессии ({all_profs.count()} шт.)'))
        elif options['professions']:
            prof_names = [p.strip() for p in options['professions'].split(',') if p.strip()]
            matched = []
            for name in prof_names:
                found = Profession.objects.filter(name_ru__icontains=name)
                matched.extend(list(found))
            profile.assigned_professions.set(matched)
            self.stdout.write(self.style.SUCCESS(f'Закреплено профессий: {len(matched)}'))

        action = 'создан' if created else 'обновлен'
        self.stdout.write(self.style.SUCCESS(
            f'Успешно! Сотрудник "{username}" ({full_name}) {action}.\n'
            f'Вход в кабинет: /staff/login с логином "{username}" и указанным паролем.'
        ))
