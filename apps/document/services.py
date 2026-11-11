# apps/document/services.py
"""
Domain business services for certified specialists and archive digitization.
Mutations wrapped in transaction.atomic.
"""
from typing import Optional, List, Dict, Any
from io import BytesIO
from django.db import transaction
from django.utils import timezone
from django.core.files.base import ContentFile
import qrcode
import qrcode.image.svg

from apps.document.models import CertifiedUser
from apps.certification.models import CertificationApplication, ApplicationDocument, StaffProfile
from apps.document.kyrgyz_name_normalizer import split_kyrgyz_fio, normalize_kyrgyz_full_name


def get_or_create_app_for_certified_user(user_obj: CertifiedUser) -> CertificationApplication:
    """
    Возвращает или создает связанное дело (CertificationApplication) для специалиста из реестра.
    Гарантирует, что к любому специалисту из архива можно прикреплять акты, протоколы,
    фото экзаменов и сканы сертификатов.
    """
    app = getattr(user_obj, 'application', None)
    if not app and user_obj.registration_number:
        clean_digits = ''.join(c for c in user_obj.registration_number if c.isdigit())
        app = (
            CertificationApplication.objects.filter(
                certificate_number_issued=user_obj.registration_number,
                deleted_at__isnull=True,
            ).first() or
            (CertificationApplication.objects.filter(
                certificate_number_issued__icontains=clean_digits,
                deleted_at__isnull=True,
            ).first() if clean_digits else None) or
            CertificationApplication.objects.filter(
                full_name__iexact=user_obj.get_full_name(),
                deleted_at__isnull=True,
            ).first()
        )

    if not app:
        app = CertificationApplication.objects.create(
            origin='registry_archive',
            full_name=user_obj.get_full_name(),
            inn=user_obj.inn or '',
            profession=user_obj.profession or '',
            certificate_number_issued=user_obj.registration_number or '',
            status='completed',
            application_type='certification',
            scheduled_date=user_obj.issued_date,
            phone=getattr(user_obj, 'phone', '') or '—',
        )
    else:
        if app.origin != 'registry_archive' and (not app.phone or app.phone == '—'):
            app.origin = 'registry_archive'
            app.save(update_fields=['origin'])

    if user_obj.application != app:
        user_obj.application = app
        user_obj.save(update_fields=['application'])

    return app


@transaction.atomic
def update_certified_user_dossier(
    user_obj: CertifiedUser,
    validated_data: Dict[str, Any],
    files: Optional[Dict[str, Any]] = None,
    remove_image: bool = False,
    actor: Optional[StaffProfile] = None,
) -> CertifiedUser:
    """
    Обновление реквизитов специалиста и синхронизация с привязанным делом CertificationApplication.
    """
    app = get_or_create_app_for_certified_user(user_obj)

    # 1. ФИО
    if 'full_name' in validated_data:
        full_name = validated_data['full_name'].strip()
        last_name, first_name, sur_name = split_kyrgyz_fio(full_name)
        user_obj.last_name = last_name
        user_obj.first_name = first_name
        user_obj.sur_name = sur_name
        app.full_name = full_name

    # 2. ПИН / ИНН
    if 'inn' in validated_data:
        inn_clean = validated_data['inn'].strip()
        user_obj.inn = inn_clean
        app.inn = inn_clean

    # 3. Гражданство
    if 'citizenship' in validated_data:
        app.citizenship = validated_data['citizenship']
    if 'is_foreign_citizen' in validated_data:
        app.is_foreign_citizen = validated_data['is_foreign_citizen']

    # 4. Регистрационный номер сертификата
    if 'registration_number' in validated_data:
        reg_num = validated_data['registration_number'].strip()
        user_obj.registration_number = reg_num
        app.certificate_number_issued = reg_num

    # 5. Профессия
    if 'profession' in validated_data:
        prof = validated_data['profession'].strip()
        user_obj.profession = prof
        app.profession = prof

    # 6. Дата выдачи
    if 'issued_date' in validated_data:
        dt = validated_data['issued_date']
        user_obj.issued_date = dt
        app.issued_date = dt

    # 7. Экзаменационные данные
    if 'scheduled_location' in validated_data:
        app.scheduled_location = validated_data['scheduled_location'].strip()
    if 'scheduled_date' in validated_data:
        app.scheduled_date = validated_data['scheduled_date']
    if 'assessor_name' in validated_data:
        app.assessor_name = validated_data['assessor_name'].strip()
    if 'qualification_level' in validated_data:
        app.qualification_level = validated_data['qualification_level'].strip()
    if 'specialization' in validated_data:
        app.specialization = validated_data['specialization'].strip()

    # 8. Контакты
    if 'phone' in validated_data:
        ph = validated_data['phone'].strip()
        user_obj.phone = ph
        app.phone = ph
    if 'whatsapp' in validated_data:
        wa = validated_data['whatsapp'].strip()
        user_obj.whatsapp = wa
        app.whatsapp = wa

    # 9. Фото 3x4
    if remove_image:
        user_obj.image = None
        user_obj.photo = None
        app.documents.filter(doc_type='photo').delete()
    elif files and 'image' in files:
        img_file = files['image']
        user_obj.image = img_file
        photo_doc = app.documents.filter(doc_type='photo').first()
        if photo_doc:
            photo_doc.file = img_file
            photo_doc.save()
        else:
            ApplicationDocument.objects.create(
                application=app,
                doc_type='photo',
                file=img_file,
                description='Фотография специалиста 3x4',
            )

    if actor:
        app.updated_by_staff = actor

    app.updated_at = timezone.now()
    app.save()
    user_obj.save()

    return user_obj


@transaction.atomic
def delete_certified_user_record(
    user_obj: CertifiedUser,
    actor: Optional[StaffProfile] = None,
) -> None:
    """
    Удаление записи специалиста и соответствующего архивного дела.
    """
    app = getattr(user_obj, 'application', None)
    if app and app.origin == 'registry_archive':
        app.deleted_at = timezone.now()
        app.save(update_fields=['deleted_at'])

    user_obj.delete()


@transaction.atomic
def attach_documents_to_certified_user(
    user_obj: CertifiedUser,
    files: List,
    doc_type: str,
    description: str = '',
    actor: Optional[StaffProfile] = None,
) -> List[ApplicationDocument]:
    """
    Прикрепление документов к делу специалиста из реестра.
    """
    app = get_or_create_app_for_certified_user(user_obj)
    created_docs = []

    for f in files:
        doc = ApplicationDocument.objects.create(
            application=app,
            doc_type=doc_type,
            file=f,
            description=description or f.name,
        )
        created_docs.append(doc)

    if doc_type == 'certificate_scan' and created_docs:
        user_obj.certificate_scan = created_docs[0].file
        user_obj.save(update_fields=['certificate_scan'])

    app.updated_at = timezone.now()
    if actor:
        app.updated_by_staff = actor
    app.save(update_fields=['updated_at'])

    return created_docs


@transaction.atomic
def remove_certified_user_document(
    user_obj: CertifiedUser,
    doc_id: int,
    actor: Optional[StaffProfile] = None,
) -> bool:
    """
    Удаление документа из дела сертифицированного специалиста.
    """
    app = get_or_create_app_for_certified_user(user_obj)
    doc = ApplicationDocument.objects.filter(application=app, pk=doc_id).first()
    if not doc:
        return False

    if doc.doc_type == 'certificate_scan':
        user_obj.certificate_scan = None
        user_obj.save(update_fields=['certificate_scan'])

    doc.delete()
    app.updated_at = timezone.now()
    app.save(update_fields=['updated_at'])
    return True
