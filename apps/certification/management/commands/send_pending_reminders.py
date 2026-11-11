"""
Management command to check and send reminders to staff about pending applications.
Can be executed via cron or scheduler.
"""
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.certification.models import CertificationApplication, StaffProfile
from services.telegram import notify_staff_pending_reminder

class Command(BaseCommand):
    help = 'Sends Telegram reminders to staff about applications pending for > 24 hours'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=24)
        pending_apps = CertificationApplication.objects.filter(
            status='submitted',
            created_at__lte=cutoff,
            deleted_at__isnull=True
        ).order_by('created_at')

        if not pending_apps.exists():
            self.stdout.write(self.style.SUCCESS('No pending applications older than 24 hours found.'))
            return

        self.stdout.write(f'Found {pending_apps.count()} pending applications older than 24 hours.')

        staff_members = StaffProfile.objects.filter(is_active=True).exclude(telegram_chat_id__isnull=True).exclude(telegram_chat_id='')
        for staff in staff_members:
            assigned_profs = staff.assigned_professions.all()
            if assigned_profs.exists():
                staff_apps = list(pending_apps.filter(profession_ref__in=assigned_profs))
            else:
                staff_apps = list(pending_apps)

            if staff_apps:
                sent = notify_staff_pending_reminder(staff, staff_apps)
                if sent:
                    self.stdout.write(self.style.SUCCESS(f'Sent reminder to {staff.full_name} for {len(staff_apps)} applications.'))
