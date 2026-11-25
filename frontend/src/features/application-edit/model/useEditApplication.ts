import { useEffect, useState } from 'react';
import { staffApi, StaffApplicationDetail } from '../../../api/staff';
import {
	analyzeKyrgyzPin,
	CitizenshipCode,
	detectCitizenshipFromExistingInn,
} from '../../../utils/kyrgyzPinValidator';

interface UseEditApplicationProps {
	applicationId: number | null;
	isOpen: boolean;
	onSaved?: () => void;
	onDeleted?: () => void;
	onClose: () => void;
}

export function useEditApplication({
	applicationId,
	isOpen,
	onSaved,
	onDeleted,
	onClose,
}: UseEditApplicationProps) {
	const [appDetail, setAppDetail] = useState<StaffApplicationDetail | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	// Editable candidate fields
	const [editAppFullName, setEditAppFullName] = useState('');
	const [editAppPhone, setEditAppPhone] = useState('');
	const [editAppWhatsapp, setEditAppWhatsapp] = useState('');
	const [editAppEmail, setEditAppEmail] = useState('');
	const [editAppInn, setEditAppInn] = useState('');
	const [appCitizenship, setAppCitizenship] = useState<CitizenshipCode>('');
	const [editAppType, setEditAppType] = useState<'certification' | 'validation'>('certification');
	const [editAppProfession, setEditAppProfession] = useState('');
	const [editAppQualLevel, setEditAppQualLevel] = useState('');
	const [editAppExpYears, setEditAppExpYears] = useState<number | string>(0);
	const [editAppExpDesc, setEditAppExpDesc] = useState('');
	const [editAppAddress, setEditAppAddress] = useState('');
	const [isLaborMigrant, setIsLaborMigrant] = useState(false);
	const [migrationCountry, setMigrationCountry] = useState('Россия (РФ)');
	const [migrationCategory, setMigrationCategory] = useState<'returned' | 'planning'>('returned');
	const [editAppAssessor, setEditAppAssessor] = useState('');
	const [editAppDate, setEditAppDate] = useState('');
	const [editAppLocation, setEditAppLocation] = useState('');
	const [editAppNotes, setEditAppNotes] = useState('');
	const [editAppStatus, setEditAppStatus] = useState('submitted');

	// Certificate issue form state
	const [certNumber, setCertNumber] = useState('');
	const [certInn, setCertInn] = useState('');
	const [issuingCert, setIssuingCert] = useState(false);
	const [issueResult, setIssueResult] = useState<{
		message: string;
		registration_number: string;
		verify_url: string;
	} | null>(null);

	// Saving & deleting state
	const [savingAppDetail, setSavingAppDetail] = useState(false);
	const [appSaveSuccessMsg, setAppSaveSuccessMsg] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeletingApp, setIsDeletingApp] = useState(false);
	const [uploadingDoc, setUploadingDoc] = useState(false);

	const loadDetail = async (id: number) => {
		setLoadingDetail(true);
		setAppSaveSuccessMsg(null);
		setIssueResult(null);
		try {
			const data = await staffApi.getApplicationDetail(id);
			setAppDetail(data);

			setCertNumber(data.certificate_number_issued || '');
			setCertInn(data.inn || '');

			setEditAppFullName(data.full_name || '');
			setEditAppPhone(data.phone || '');
			setEditAppWhatsapp(data.whatsapp || '');
			setEditAppEmail(data.email || '');
			setEditAppInn(data.inn || '');
			setAppCitizenship(detectCitizenshipFromExistingInn(data.inn || '', data.full_name || ''));
			setEditAppType(data.application_type || 'certification');
			setEditAppProfession(data.profession || '');
			setEditAppQualLevel(data.qualification_level || '');
			setEditAppExpYears(data.experience_years ?? 0);
			setEditAppExpDesc(data.experience_desc || '');
			setEditAppAddress(data.address || '');
			setIsLaborMigrant(Boolean(data.is_labor_migrant));
			setMigrationCountry(data.migration_country || 'Россия (РФ)');
			setMigrationCategory((data.migration_category as any) || 'returned');
			setEditAppAssessor(data.assessor_name || '');
			setEditAppDate(data.scheduled_date ? data.scheduled_date.split('T')[0] : '');
			setEditAppLocation(data.scheduled_location || '');
			setEditAppNotes(data.admin_notes || '');
			setEditAppStatus(data.status || 'submitted');
		} catch (err) {
			alert('Не удалось загрузить данные заявки');
		} finally {
			setLoadingDetail(false);
		}
	};

	useEffect(() => {
		if (isOpen && applicationId) {
			loadDetail(applicationId);
		} else {
			setAppDetail(null);
			setAppSaveSuccessMsg(null);
			setIssueResult(null);
		}
	}, [isOpen, applicationId]);

	const editAppPinAnalysis = analyzeKyrgyzPin(editAppInn, editAppFullName, appCitizenship);
	const certPinAnalysis = analyzeKyrgyzPin(certInn, editAppFullName || appDetail?.full_name || '', appCitizenship || 'KG');

	const handleSaveAppDetail = async () => {
		if (!applicationId) return;
		if (editAppInn.trim() && !appCitizenship) {
			alert('Выберите гражданство кандидата');
			return;
		}
		if (editAppInn.trim() && !editAppPinAnalysis.isValid) {
			alert('Неправильный ПИН / ИНН');
			return;
		}
		setSavingAppDetail(true);
		setAppSaveSuccessMsg(null);
		try {
			const updated = await staffApi.updateApplicationDetail(applicationId, {
				full_name: editAppFullName.trim(),
				phone: editAppPhone.trim(),
				whatsapp: editAppWhatsapp.trim(),
				email: editAppEmail.trim(),
				inn: editAppInn.trim(),
				citizenship: appCitizenship,
				is_foreign_citizen: Boolean(appCitizenship && appCitizenship !== 'KG'),
				application_type: editAppType,
				profession: editAppProfession.trim(),
				qualification_level: editAppQualLevel.trim(),
				experience_years: editAppExpYears,
				experience_desc: editAppExpDesc.trim(),
				address: editAppAddress.trim(),
				assessor_name: editAppAssessor.trim(),
				scheduled_date: editAppDate || null,
				scheduled_location: editAppLocation.trim(),
				admin_notes: editAppNotes.trim(),
				status: editAppStatus,
				is_labor_migrant: isLaborMigrant,
				migration_country: isLaborMigrant ? migrationCountry : '',
				migration_category: isLaborMigrant ? migrationCategory : 'returned',
			} as any);
			setAppDetail(updated);
			setAppSaveSuccessMsg('Данные кандидата и статус дела успешно сохранены!');
			onSaved?.();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при сохранении данных кандидата');
		} finally {
			setSavingAppDetail(false);
		}
	};

	const handleTakeInWork = async () => {
		if (!applicationId) return;
		setSavingAppDetail(true);
		setAppSaveSuccessMsg(null);
		try {
			const updated = await staffApi.updateApplicationDetail(applicationId, {
				status: 'under_review',
				assign_to_me: true,
			} as any);
			setAppDetail(updated);
			setEditAppStatus('under_review');
			setAppSaveSuccessMsg('Заявка успешно взята вами на рассмотрение!');
			onSaved?.();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при взятии заявки в работу');
		} finally {
			setSavingAppDetail(false);
		}
	};

	const handleRejectApplication = async (reason?: string) => {
		if (!applicationId) return;
		setSavingAppDetail(true);
		setAppSaveSuccessMsg(null);
		try {
			const currentNotes = editAppNotes.trim();
			const reasonText = reason ? `[Отказ / Архив: ${reason}]` : '[Перемещено в архив]';
			const newNotes = currentNotes ? `${currentNotes}\n${reasonText}` : reasonText;

			const updated = await staffApi.updateApplicationDetail(applicationId, {
				status: 'rejected',
				admin_notes: newNotes,
			} as any);
			setAppDetail(updated);
			setEditAppStatus('rejected');
			setEditAppNotes(newNotes);
			setAppSaveSuccessMsg('Дело перемещено в архив (не завершено / отказ)!');
			onSaved?.();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при перемещении дела в архив');
		} finally {
			setSavingAppDetail(false);
		}
	};

	const handleRestoreFromArchive = async () => {
		if (!applicationId) return;
		setSavingAppDetail(true);
		setAppSaveSuccessMsg(null);
		try {
			const currentNotes = editAppNotes.trim();
			const restoreText = `[${new Date().toLocaleDateString('ru-RU')}] Дело возвращено из архива в работу (пересдача / донос документов).`;
			const newNotes = currentNotes ? `${currentNotes}\n${restoreText}` : restoreText;

			const updated = await staffApi.updateApplicationDetail(applicationId, {
				status: 'under_review',
				assign_to_me: true,
				admin_notes: newNotes,
			} as any);
			setAppDetail(updated);
			setEditAppStatus('under_review');
			setEditAppNotes(newNotes);
			setAppSaveSuccessMsg('Дело возвращено в работу! Статус обновлён на «На рассмотрении».');
			onSaved?.();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при возврате дела в работу');
		} finally {
			setSavingAppDetail(false);
		}
	};

	const handleDeleteApplication = async () => {
		if (!applicationId) return;
		setIsDeletingApp(true);
		try {
			await staffApi.deleteApplication(applicationId);
			setShowDeleteConfirm(false);
			onDeleted?.();
			onClose();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при удалении заявки');
		} finally {
			setIsDeletingApp(false);
		}
	};

	const uploadFilesDirectly = async (docType: string, fileList: FileList | File[], description?: string) => {
		if (!applicationId || !fileList || fileList.length === 0) return;
		setUploadingDoc(true);
		try {
			const filesArray = Array.from(fileList);
			const formData = new FormData();
			formData.append('doc_type', docType);
			if (description?.trim()) formData.append('description', description.trim());
			filesArray.forEach((file) => {
				formData.append('files', file);
			});

			await staffApi.uploadDocument(applicationId, formData);
			const refreshed = await staffApi.getApplicationDetail(applicationId);
			setAppDetail(refreshed);
			setAppSaveSuccessMsg(`Файлы успешно загружены (${filesArray.length} шт.)`);
			onSaved?.();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при загрузке файлов');
		} finally {
			setUploadingDoc(false);
		}
	};

	const handleDeleteDoc = async (docId: number) => {
		if (!applicationId) return;
		if (!confirm('Вы уверены, что хотите удалить этот файл из дела?')) return;
		try {
			await staffApi.deleteDocument(applicationId, docId);
			const refreshed = await staffApi.getApplicationDetail(applicationId);
			setAppDetail(refreshed);
			onSaved?.();
		} catch (err: any) {
			alert('Ошибка при удалении файла');
		}
	};

	const handleIssueCertificate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!applicationId || !certNumber.trim()) {
			alert('Укажите номер сертификата');
			return;
		}

		if (certInn.trim() && !certPinAnalysis.isValid) {
			alert('Неправильный ПИН / ИНН');
			return;
		}

		if (
			!confirm(
				`Подтверждаете внесение специалиста ${appDetail?.full_name} в государственный реестр с номером бланка: ${certNumber.trim()}?`
			)
		) {
			return;
		}

		setIssuingCert(true);
		setIssueResult(null);
		try {
			const res = await staffApi.issueCertificate(applicationId, {
				certificate_number: certNumber.trim(),
				inn: certInn.trim() || undefined,
				citizenship: appCitizenship || 'KG',
				is_foreign_citizen: Boolean(appCitizenship && appCitizenship !== 'KG'),
			} as any);
			setIssueResult(res);
			loadDetail(applicationId);
			onSaved?.();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при выпуске сертификата');
		} finally {
			setIssuingCert(false);
		}
	};

	return {
		appDetail,
		loadingDetail,
		editAppFullName,
		setEditAppFullName,
		editAppPhone,
		setEditAppPhone,
		editAppWhatsapp,
		setEditAppWhatsapp,
		editAppEmail,
		setEditAppEmail,
		editAppInn,
		setEditAppInn,
		appCitizenship,
		setAppCitizenship,
		editAppType,
		setEditAppType,
		editAppProfession,
		setEditAppProfession,
		editAppQualLevel,
		setEditAppQualLevel,
		editAppExpYears,
		setEditAppExpYears,
		editAppExpDesc,
		setEditAppExpDesc,
		editAppAddress,
		setEditAppAddress,
		isLaborMigrant,
		setIsLaborMigrant,
		migrationCountry,
		setMigrationCountry,
		migrationCategory,
		setMigrationCategory,
		editAppAssessor,
		setEditAppAssessor,
		editAppDate,
		setEditAppDate,
		editAppLocation,
		setEditAppLocation,
		editAppNotes,
		setEditAppNotes,
		editAppStatus,
		setEditAppStatus,
		certNumber,
		setCertNumber,
		certInn,
		setCertInn,
		issuingCert,
		issueResult,
		savingAppDetail,
		appSaveSuccessMsg,
		setAppSaveSuccessMsg,
		showDeleteConfirm,
		setShowDeleteConfirm,
		isDeletingApp,
		uploadingDoc,
		editAppPinAnalysis,
		handleTakeInWork,
		handleRejectApplication,
		handleRestoreFromArchive,
		handleSaveAppDetail,
		handleDeleteApplication,
		uploadFilesDirectly,
		handleDeleteDoc,
		handleIssueCertificate,
	};
}
