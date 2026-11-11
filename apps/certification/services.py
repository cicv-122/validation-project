# apps/certification/services.py
"""
Domain business logic for certification workflows.
Mutations and state transitions wrapped in transaction.atomic.
"""
from typing import List, Optional
from io import BytesIO
from django.db import transaction
from django.utils import timezone
from django.core.files.base import ContentFile
import qrcode
import qrcode.image.svg

from apps.certification.models import (
    CertificationApplication,
    ApplicationDocument,
    StaffProfile,
)


@transaction.atomic
def update_application_status(
    application: CertificationApplication,
    new_status: str,
    comment: Optional[str] = None,
    actor: Optional[StaffProfile] = None,
) -> CertificationApplication:
    """
    Изменение статуса заявки кандидата с фиксацией аудиторского следа.
    """
    application.status = new_status
    if comment:
        application.staff_notes = f"{application.staff_notes or ''}\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {comment}".strip()
    if actor:
        application.updated_by_staff = actor

    application.save(update_fields=['status', 'staff_notes', 'updated_at'])
    return application


@transaction.atomic
def issue_certificate_for_application(
    application: CertificationApplication,
    certificate_number: str,
    issued_date=None,
    actor: Optional[StaffProfile] = None,
) -> CertificationApplication:
    """
    Официальная выдача сертификата строгой отчетности по заявке.
    """
    application.certificate_number_issued = certificate_number.strip()
    application.issued_date = issued_date or timezone.now().date()
    application.status = 'approved'
    if actor:
        application.updated_by_staff = actor

    application.save(update_fields=[
        'certificate_number_issued',
        'issued_date',
        'status',
        'updated_at',
    ])
    return application


@transaction.atomic
def attach_documents_to_application(
    application: CertificationApplication,
    files: List,
    doc_type: str,
    description: str = '',
    actor: Optional[StaffProfile] = None,
) -> List[ApplicationDocument]:
    """
    Прикрепление документов (акты, фотофиксация, протоколы) к заявке.
    """
    created_docs = []
    for f in files:
        doc = ApplicationDocument.objects.create(
            application=application,
            doc_type=doc_type,
            file=f,
            description=description or f.name,
        )
        created_docs.append(doc)

    application.updated_at = timezone.now()
    application.save(update_fields=['updated_at'])
    return created_docs


@transaction.atomic
def delete_application_document(
    application: CertificationApplication,
    doc_id: int,
    actor: Optional[StaffProfile] = None,
) -> bool:
    """
    Удаление документа из дела кандидата.
    """
    doc = ApplicationDocument.objects.filter(
        application=application,
        pk=doc_id,
    ).first()
    if not doc:
        return False

    doc.delete()
    application.updated_at = timezone.now()
    application.save(update_fields=['updated_at'])
    return True


def generate_qr_buffer(target_url: str, format_type: str = 'svg') -> BytesIO:
    """
    Генерация буфера QR-кода в формате SVG (вектор) или PNG (растр 300 DPI).
    """
    buf = BytesIO()
    if format_type == 'svg':
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=2,
            image_factory=qrcode.image.svg.SvgPathImage,
        )
        qr.add_data(target_url)
        qr.make(fit=True)
        img = qr.make_image()
        img.save(buf)
    else:
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=20,
            border=2,
        )
        qr.add_data(target_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        img.save(buf, format='PNG')

    buf.seek(0)
    return buf
