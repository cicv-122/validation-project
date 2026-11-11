import os
import sys
import django

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.document.models import CertifiedUser

def run():
    users = CertifiedUser.objects.all()
    total = users.count()
    print(f"Starting QR code regeneration for {total} certified users...")

    count = 0
    for u in users:
        try:
            u.generate_qr_code(force=True)
            u.save(update_fields=['qr_code', 'verification_token'])
            count += 1
            if count % 50 == 0 or count == total:
                print(f"Processed {count}/{total}...")
        except Exception as e:
            print(f"Error for {u.registration_number}: {e}")

    print(f"Completed! Successfully regenerated {count} QR codes.")

if __name__ == '__main__':
    run()
