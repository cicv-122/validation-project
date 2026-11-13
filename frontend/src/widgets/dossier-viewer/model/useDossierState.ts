import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	staffApi,
	StaffApplicationDocument,
	StaffCertifiedUser,
	StaffProfile,
} from '../../../api/staff';
import {
	analyzeKyrgyzPin,
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
	detectCitizenshipFromExistingInn,
} from '../../../utils/kyrgyzPinValidator';

export function useDossierState(id: string | undefined, returnUrl: string) {
	const navigate = useNavigate();

	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [candidate, setCandidate] = useState<StaffCertifiedUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Editable Form Fields
	const [fullName, setFullName] = useState('');
	const [inn, setInn] = useState('');
	const [citizenship, setCitizenship] = useState<CitizenshipCode>('');
	const [certNumberDigits, setCertNumberDigits] = useState('');
	const [profession, setProfession] = useState('');
	const [issuedDate, setIssuedDate] = useState('');
	const [scheduledLocation, setScheduledLocation] = useState('');
	const [scheduledDate, setScheduledDate] = useState('');
	const [assessorName, setAssessorName] = useState('');
	const [qualificationLevel, setQualificationLevel] = useState('');
	const [specialization, setSpecialization] = useState('');
	const [phone, setPhone] = useState('');
	const [whatsapp, setWhatsapp] = useState('');
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
	const [removePhoto, setRemovePhoto] = useState(false);
	const [showPhotoModal, setShowPhotoModal] = useState(false);

	// Documents
	const [documents, setDocuments] = useState<StaffApplicationDocument[]>([]);
	const [selectedDoc, setSelectedDoc] = useState<StaffApplicationDocument | null>(null);
	const [uploadingDocSlot, setUploadingDocSlot] = useState<string | null>(null);

	// Upload Modal / Form for Personal Documents
	const [showAddPersonalDoc, setShowAddPersonalDoc] = useState(false);
	const [newPersonalDocType, setNewPersonalDocType] = useState('passport');
	const [newPersonalDocDesc, setNewPersonalDocDesc] = useState('');
	const [newPersonalDocFile, setNewPersonalDocFile] = useState<File | null>(null);
	const [uploadingPersonalDoc, setUploadingPersonalDoc] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletingCandidate, setDeletingCandidate] = useState(false);

	const [downloadingQR, setDownloadingQR] = useState<string | null>(null);
	const [linkCopied, setLinkCopied] = useState(false);

	const photoInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		loadProfileAndCandidate();
	}, [id]);

	const loadProfileAndCandidate = async () => {
		setLoading(true);
		setErrorMsg(null);
		try {
			const prof = await staffApi.getProfile();
			setProfile(prof);

			if (!id) {
				setErrorMsg('Идентификатор специалиста не указан');
				setLoading(false);
				return;
			}

			const data = await staffApi.getCertifiedUserDetail(Number(id));
			setCandidate(data);
			setFullName(data.full_name || '');
			setInn(data.inn || '');
			setCitizenship(detectCitizenshipFromExistingInn(data.inn || '', data.full_name || ''));
			const rawReg = data.registration_number || '';
			const extractedDigits = rawReg.replace(/^[^\d]*/, '').trim();
			setCertNumberDigits(extractedDigits || rawReg);
			const rawProf = (data.profession || '').trim();
			const normalizedProf =
				rawProf && rawProf === rawProf.toUpperCase() && /[А-ЯЁA-Z]/.test(rawProf)
					? rawProf.charAt(0).toUpperCase() + rawProf.slice(1).toLowerCase()
					: rawProf;
			setProfession(normalizedProf);
			setIssuedDate(data.issued_date || '');
			setScheduledLocation(data.scheduled_location || '');
			setScheduledDate(data.scheduled_date || data.issued_date || '');
			setAssessorName(data.assessor_name || '');
			setQualificationLevel(data.qualification_level || '');
			setSpecialization(data.specialization || '');
			setPhone(data.phone || '');
			setWhatsapp(data.whatsapp || '');
			setPhotoPreview(data.image_url || data.image || null);
			setDocuments(data.documents || []);

			if (data.documents && data.documents.length > 0) {
				setSelectedDoc(data.documents[0]);
			}
		} catch (err: any) {
			console.error('Failed to load candidate dossier:', err);
			if (err?.response?.status === 401 || err?.response?.status === 403) {
				navigate('/staff/login');
			} else {
				setErrorMsg(err?.response?.data?.detail || 'Не удалось загрузить дело кандидата');
			}
		} finally {
			setLoading(false);
		}
	};

	const pinAnalysis = analyzeKyrgyzPin(inn, fullName, citizenship);
	const currentCitizenshipMeta = CITIZENSHIP_OPTIONS.find((c) => c.value === citizenship);

	const cleanCertDigits = certNumberDigits.replace(/[^0-9]/g, '');
	const fullRegistrationNumber = certNumberDigits.trim()
		? `ЦС № ${certNumberDigits.trim()}`
		: candidate?.registration_number || '';
	const publicVerifyUrl = `/verify/${cleanCertDigits || candidate?.id}`;

	const handleSaveDossier = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!candidate) return;

		setSaveSuccessMsg(null);
		setErrorMsg(null);

		if (inn.trim() && !citizenship) {
			setErrorMsg('Выберите гражданство специалиста перед сохранением ПИН / ИНН');
			return;
		}

		if (inn.trim() && !pinAnalysis.isValid) {
			setErrorMsg('Неправильный ПИН / ИНН');
			return;
		}

		setSaving(true);

		try {
			const fullRegNumber = certNumberDigits.trim()
				? `ЦС № ${certNumberDigits.trim()}`
				: candidate?.registration_number || '';
			const formData = new FormData();
			formData.append('full_name', fullName.trim());
			formData.append('inn', inn.trim());
			formData.append('citizenship', citizenship);
			formData.append('is_foreign_citizen', citizenship && citizenship !== 'KG' ? 'true' : 'false');
			formData.append('registration_number', fullRegNumber);
			formData.append('profession', profession.trim());
			if (issuedDate) formData.append('issued_date', issuedDate);
			if (scheduledLocation) formData.append('scheduled_location', scheduledLocation.trim());
			if (scheduledDate) formData.append('scheduled_date', scheduledDate);
			if (assessorName) formData.append('assessor_name', assessorName.trim());
			if (qualificationLevel) formData.append('qualification_level', qualificationLevel.trim());
			if (specialization) formData.append('specialization', specialization.trim());
			formData.append('phone', phone.trim());
			formData.append('whatsapp', whatsapp.trim());

			if (removePhoto) {
				formData.append('remove_image', 'true');
			} else if (newPhotoFile) {
				formData.append('image', newPhotoFile);
			}

			const updated = await staffApi.updateCertifiedUser(candidate.id, formData);
			setCandidate(updated);
			if (updated.full_name) {
				setFullName(updated.full_name);
			}
			setNewPhotoFile(null);
			setRemovePhoto(false);
			setSaveSuccessMsg('Дело кандидата успешно сохранено! Возврат к реестру...');
			const targetReturnUrl = returnUrl.includes('target=')
				? returnUrl
				: `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}target=${candidate.id}`;
			setTimeout(() => {
				navigate(targetReturnUrl);
			}, 350);
		} catch (err: any) {
			console.error('Failed to save candidate dossier:', err);
			const respData = err?.response?.data;
			const specificErr =
				(Array.isArray(respData?.inn) ? respData.inn[0] : respData?.inn) ||
				(Array.isArray(respData?.registration_number)
					? respData.registration_number[0]
					: respData?.registration_number) ||
				(Array.isArray(respData?.non_field_errors)
					? respData.non_field_errors[0]
					: respData?.non_field_errors) ||
				respData?.detail ||
				'Ошибка сохранения дела. Проверьте правильность полей.';
			setErrorMsg(specificErr);
		} finally {
			setSaving(false);
		}
	};

	const handleCopyLink = () => {
		const url = `https://validation.kg${publicVerifyUrl}`;
		navigator.clipboard.writeText(url);
		setLinkCopied(true);
		setTimeout(() => setLinkCopied(false), 2000);
	};

	const handleDownloadQR = async (format: 'svg' | 'png') => {
		if (!candidate) return;
		setDownloadingQR(format);
		try {
			const cleanReg = (fullRegistrationNumber || `id_${candidate.id}`).replace(
				/[^a-zA-Z0-9_-]/g,
				'_'
			);
			const cleanName = (fullName || candidate.full_name || 'specialist').replace(/\s+/g, '_');
			const filename = `QR_${cleanReg}_${cleanName}.${format}`;
			await staffApi.downloadCertifiedUserQR(candidate.id, format, filename);
		} catch (err: any) {
			console.error('Ошибка скачивания QR-кода:', err);
			let msg = 'Не удалось скачать QR-код. Пожалуйста, попробуйте снова.';
			if (err?.response?.data instanceof Blob) {
				try {
					const text = await err.response.data.text();
					const json = JSON.parse(text);
					if (json.detail) msg = json.detail;
				} catch (_) {}
			} else if (err?.response?.data?.detail) {
				msg = err.response.data.detail;
			}
			alert(msg);
		} finally {
			setDownloadingQR(null);
		}
	};

	const handleDeleteCandidate = async () => {
		if (!candidate) return;
		setDeletingCandidate(true);
		try {
			await staffApi.deleteCertifiedUser(candidate.id);
			navigate(returnUrl);
		} catch (err: any) {
			console.error('Failed to delete candidate:', err);
			setErrorMsg(err?.response?.data?.detail || 'Ошибка при удалении дела специалиста');
			setDeletingCandidate(false);
			setShowDeleteModal(false);
		}
	};

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setNewPhotoFile(file);
		setRemovePhoto(false);
		const reader = new FileReader();
		reader.onload = () => {
			setPhotoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleSlotFileUpload = async (
		slotType: string,
		fileOrFiles: File | FileList | File[],
		description?: string
	) => {
		if (!candidate) return;
		const filesArray =
			fileOrFiles instanceof File ? [fileOrFiles] : Array.from(fileOrFiles);
		if (filesArray.length === 0) return;

		setUploadingDocSlot(slotType);
		setErrorMsg(null);

		try {
			const formData = new FormData();
			formData.append('doc_type', slotType);
			for (const f of filesArray) {
				formData.append('files', f);
			}
			if (description) {
				formData.append('description', description);
			}

			const createdDocs = await staffApi.uploadCertifiedUserDocument(candidate.id, formData);
			const updatedDetail = await staffApi.getCertifiedUserDetail(candidate.id);
			setDocuments(updatedDetail.documents || []);

			if (createdDocs && createdDocs.length > 0) {
				setSelectedDoc(createdDocs[createdDocs.length - 1]);
			}
			setSaveSuccessMsg(
				filesArray.length > 1
					? `Успешно добавлено фотографий: ${filesArray.length}!`
					: 'Документ успешно добавлен в дело!'
			);
			setTimeout(() => setSaveSuccessMsg(null), 3000);
		} catch (err: any) {
			console.error('Failed to upload document slot:', err);
			setErrorMsg(err?.response?.data?.detail || 'Ошибка при загрузке документа');
		} finally {
			setUploadingDocSlot(null);
		}
	};

	const handleDeleteDoc = async (docId: number) => {
		if (!candidate) return;
		if (!window.confirm('Вы уверены, что хотите удалить этот документ из дела кандидата?')) return;

		try {
			await staffApi.deleteCertifiedUserDocument(candidate.id, docId);
			const updatedDocs = documents.filter((d) => d.id !== docId);
			setDocuments(updatedDocs);
			if (selectedDoc?.id === docId) {
				setSelectedDoc(updatedDocs[0] || null);
			}
			setSaveSuccessMsg('Документ удален');
			setTimeout(() => setSaveSuccessMsg(null), 2500);
		} catch (err: any) {
			console.error('Failed to delete document:', err);
			setErrorMsg('Не удалось удалить документ');
		}
	};

	const handleUploadPersonalDoc = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!candidate || !newPersonalDocFile) return;

		setUploadingPersonalDoc(true);
		setErrorMsg(null);

		try {
			const formData = new FormData();
			formData.append('doc_type', newPersonalDocType);
			formData.append('file', newPersonalDocFile);
			if (newPersonalDocDesc) {
				formData.append('description', newPersonalDocDesc);
			}

			const created = await staffApi.uploadCertifiedUserDocument(candidate.id, formData);
			const updatedDetail = await staffApi.getCertifiedUserDetail(candidate.id);
			setDocuments(updatedDetail.documents || []);
			if (created && created.length > 0) {
				setSelectedDoc(created[0]);
			}

			setShowAddPersonalDoc(false);
			setNewPersonalDocDesc('');
			setNewPersonalDocFile(null);
			setSaveSuccessMsg('Документ заявителя успешно прикреплен!');
			setTimeout(() => setSaveSuccessMsg(null), 3000);
		} catch (err: any) {
			console.error('Failed to upload personal doc:', err);
			setErrorMsg('Ошибка при прикреплении документа');
		} finally {
			setUploadingPersonalDoc(false);
		}
	};

	return {
		profile,
		candidate,
		loading,
		saving,
		saveSuccessMsg,
		errorMsg,
		fullName,
		setFullName,
		inn,
		setInn,
		citizenship,
		setCitizenship,
		certNumberDigits,
		setCertNumberDigits,
		profession,
		setProfession,
		issuedDate,
		setIssuedDate,
		scheduledLocation,
		setScheduledLocation,
		scheduledDate,
		setScheduledDate,
		assessorName,
		setAssessorName,
		qualificationLevel,
		setQualificationLevel,
		specialization,
		setSpecialization,
		phone,
		setPhone,
		whatsapp,
		setWhatsapp,
		photoPreview,
		setPhotoPreview,
		newPhotoFile,
		setNewPhotoFile,
		removePhoto,
		setRemovePhoto,
		showPhotoModal,
		setShowPhotoModal,
		documents,
		selectedDoc,
		setSelectedDoc,
		uploadingDocSlot,
		showAddPersonalDoc,
		setShowAddPersonalDoc,
		newPersonalDocType,
		setNewPersonalDocType,
		newPersonalDocDesc,
		setNewPersonalDocDesc,
		newPersonalDocFile,
		setNewPersonalDocFile,
		uploadingPersonalDoc,
		showDeleteModal,
		setShowDeleteModal,
		deletingCandidate,
		downloadingQR,
		linkCopied,
		photoInputRef,
		pinAnalysis,
		currentCitizenshipMeta,
		cleanCertDigits,
		fullRegistrationNumber,
		publicVerifyUrl,
		handleSaveDossier,
		handleCopyLink,
		handleDownloadQR,
		handleDeleteCandidate,
		handlePhotoChange,
		handleSlotFileUpload,
		handleDeleteDoc,
		handleUploadPersonalDoc,
	};
}
