// frontend/src/pages/staff/StaffCandidateDossier.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
	staffApi,
	StaffCertifiedUser,
	StaffApplicationDocument,
	StaffProfile,
} from '../../api/staff';
import StaffHeader from '../../components/staff/StaffHeader';
import {
	analyzeKyrgyzPin,
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
	detectCitizenshipFromExistingInn,
} from '../../utils/kyrgyzPinValidator';

import {
	OFFICIAL_EXAM_SLOTS,
	PERSONAL_DOC_SLOTS,
} from '../../entities/candidate';

const PERSONAL_DOC_TYPES = [
	{ id: 'passport', label: 'Копия паспорта заявителя (ПИН / ID)' },
	{ id: 'application_form', label: 'Скан заявления кандидата' },
	{ id: 'diploma', label: 'Копия диплома / свидетельства' },
	{ id: 'resume', label: 'Резюме / Трудовая книжка' },
	{ id: 'contract', label: 'Копия договора на сертификацию' },
	{ id: 'payment_receipt', label: 'Квитанция об оплате процедуры' },
	{ id: 'portfolio', label: 'Портфолио кандидата' },
	{ id: 'other', label: 'Иной документ дела' },
];

export default function StaffCandidateDossier() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const returnUrl = (location.state as any)?.returnUrl || `/staff/dashboard?tab=registry${id ? `&target=${id}` : ''}`;

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

	// File input ref for 3x4 photo
	const photoInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		loadProfileAndCandidate();
	}, [id]);

	const loadProfileAndCandidate = async () => {
		setLoading(true);
		setErrorMsg(null);
		try {
			// Check authentication
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
			const normalizedProf = (rawProf && rawProf === rawProf.toUpperCase() && /[А-ЯЁA-Z]/.test(rawProf))
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

			// Preselect first document if available
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
			const fullRegNumber = certNumberDigits.trim() ? `ЦС № ${certNumberDigits.trim()}` : (candidate?.registration_number || '');
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
				(Array.isArray(respData?.registration_number) ? respData.registration_number[0] : respData?.registration_number) ||
				(Array.isArray(respData?.non_field_errors) ? respData.non_field_errors[0] : respData?.non_field_errors) ||
				respData?.detail ||
				'Ошибка сохранения дела. Проверьте правильность полей.';
			setErrorMsg(specificErr);
		} finally {
			setSaving(false);
		}
	};

	const [downloadingQR, setDownloadingQR] = useState<string | null>(null);
	const [linkCopied, setLinkCopied] = useState(false);

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
			const cleanReg = (fullRegistrationNumber || `id_${candidate.id}`).replace(/[^a-zA-Z0-9_-]/g, '_');
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

	// Upload official qualification acts (evaluation sheet, tasks, protocol, certificate scan, exam photos)
	const handleSlotFileUpload = async (
		slotType: string,
		fileOrFiles: File | FileList | File[],
		description?: string
	) => {
		if (!candidate) return;
		const filesArray =
			fileOrFiles instanceof File
				? [fileOrFiles]
				: Array.from(fileOrFiles);
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

			// Reload documents
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

	// Delete document
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

	// Upload personal document
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

	const cleanCertDigits = certNumberDigits.replace(/[^0-9]/g, '');
	const fullRegistrationNumber = certNumberDigits.trim() ? `ЦС № ${certNumberDigits.trim()}` : (candidate?.registration_number || '');
	const publicVerifyUrl = `/verify/${cleanCertDigits || candidate?.id}`;

	// Completeness stats for checklist
	const evalSheetDoc = documents.find((d) => d.doc_type === 'evaluation_sheet');
	const examTaskDoc = documents.find((d) => d.doc_type === 'exam_task');
	const examProtocolDoc = documents.find((d) => d.doc_type === 'exam_protocol');
	const certScanDoc = documents.find((d) => d.doc_type === 'certificate_scan');
	const examPhotos = documents.filter((d) => ['photo', 'assessment_photo', 'work_sample'].includes(d.doc_type));
	const personalDocs = documents.filter(
		(d) => !['evaluation_sheet', 'exam_task', 'exam_protocol', 'certificate_scan', 'photo', 'assessment_photo', 'work_sample'].includes(d.doc_type)
	);

	const filledRequiredCount = [
		certScanDoc,
		examProtocolDoc,
		evalSheetDoc,
		examTaskDoc,
		personalDocs.length > 0 ? true : null,
	].filter(Boolean).length;
	const completenessPercent = Math.round((filledRequiredCount / 5) * 100);

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-700">
				<div className="text-center space-y-3">
					<div className="w-10 h-10 border-4 border-[#283375] border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-sm font-bold">Загрузка электронного дела кандидата...</p>
				</div>
			</div>
		);
	}

	if (!candidate) {
		return (
			<div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
				<div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md text-center space-y-4">
					<h3 className="text-lg font-bold text-slate-900">Дело не найдено</h3>
					<p className="text-xs text-slate-500">Запрашиваемый кандидат не существует в базе данных или был перемещен.</p>
					<button
						type="button"
						onClick={() => navigate(returnUrl)}
						className="inline-block px-5 py-2.5 rounded-xl bg-[#283375] text-white font-bold text-xs cursor-pointer"
					>
						Вернуться в реестр
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
			{/* ЕДИНАЯ СЛУЖЕБНАЯ ШАПКА ЦНСВ МП КР */}
			<StaffHeader
				profile={profile}
				isDossier={true}
				candidateNumber={candidate?.registration_number}
				onProfileUpdated={setProfile}
			/>

			{/* ОСНОВНОЙ КОНТЕНТ ДЕЛА */}
			<div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
				{/* НАВИГАЦИОННАЯ СТРОКА И КНОПКИ ДЕЙСТВИЙ (STICKY TOP) */}
				<div className="sticky top-[68px] sm:top-[74px] z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm transition-all">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => navigate(returnUrl)}
							className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
							title="Назад к списку специалистов"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
									Дело сертифицированного специалиста
								</span>
								<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
									✓ В реестре (Выдано)
								</span>
								<span className="text-xs font-mono font-bold text-[#283375] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
									{fullRegistrationNumber}
								</span>
							</div>
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
								{fullName || candidate.full_name}
							</h1>
							{(candidate.updated_at || candidate.updated_by_name) && (
								<div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-0.5 flex-wrap">
									<span>
										Обновлено:{' '}
										{candidate.updated_at
											? new Date(candidate.updated_at).toLocaleString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})
											: '—'}
									</span>
									{candidate.updated_by_name && (
										<>
											<span className="text-slate-300">•</span>
											<span className="font-semibold text-slate-700">
												Сотрудник: {candidate.updated_by_name}
											</span>
										</>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2.5 flex-wrap">
						<button
							type="button"
							onClick={() => window.print()}
							className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
							title="Распечатать карточку дела специалиста"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
							</svg>
							<span>Печать</span>
						</button>

						<button
							type="button"
							onClick={() => handleSaveDossier()}
							disabled={saving}
							className="px-5 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-md shadow-[#283375]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
						>
							{saving ? (
								<>
									<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
									</svg>
									<span>Сохранение...</span>
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									<span>Сохранить дело</span>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={() => setShowDeleteModal(true)}
							className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
							title="Удалить дело специалиста"
						>
							<svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							<span>Удалить дело</span>
						</button>
					</div>
				</div>

				{/* Уведомления об успехе или ошибке */}
				{saveSuccessMsg && (
					<div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
						<span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
							✓
						</span>
						<span>{saveSuccessMsg}</span>
					</div>
				)}

				{errorMsg && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2.5">
						<span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
							✕
						</span>
						<span>{errorMsg}</span>
					</div>
				)}

				{/* ДВУХКОЛОНОЧНЫЙ СПЛИТ-ИНТЕРФЕЙС (7 КОЛОНОК - ДЕЛО, 5 КОЛОНОК - ИНСПЕКТОР ДОКУМЕНТОВ) */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
					{/* ЛЕВАЯ КОЛОНКА: ОСНОВНЫЕ РАЗДЕЛЫ ДЕЛА (7 cols) */}
					<div className="lg:col-span-7 space-y-6">
						{/* 1. ЛИЧНЫЕ И РЕГИСТРАЦИОННЫЕ РЕКВИЗИТЫ */}
						<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
							<div className="flex items-center justify-between border-b border-slate-100 pb-3">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
										1
									</div>
									<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
										Личные и регистрационные реквизиты
									</h2>
								</div>
								<span className="text-[11px] font-mono font-bold text-slate-400">ID: {candidate.id}</span>
							</div>

							<div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
								{/* Фото 3×4 */}
								<div className="flex flex-col items-center gap-2 flex-shrink-0">
									<div
										onClick={() => {
											if (photoPreview) {
												setShowPhotoModal(true);
											} else {
												photoInputRef.current?.click();
											}
										}}
										className="w-28 h-36 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden relative shadow-inner group cursor-pointer transition-all hover:border-[#283375]/40 hover:shadow-md"
										title={photoPreview ? "Нажмите для просмотра фото в полном размере" : "Нажмите для загрузки фото"}
									>
										{photoPreview ? (
											<>
												<img src={photoPreview} alt={fullName} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
												<div className="absolute inset-0 bg-slate-900/40 text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
													<svg className="w-6 h-6 mb-1 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
													</svg>
													<span>Просмотр</span>
												</div>
											</>
										) : (
											<div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center group-hover:text-[#283375] group-hover:bg-slate-200/50 transition-all">
												<svg className="w-10 h-10 mb-1 opacity-40 group-hover:opacity-80 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
												</svg>
												<span className="text-[10px] font-bold">+ Добавить фото</span>
											</div>
										)}
									</div>

									<input
										ref={photoInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handlePhotoChange}
									/>

									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => photoInputRef.current?.click()}
											className="text-[11px] font-bold text-[#283375] hover:underline cursor-pointer"
										>
											{photoPreview ? 'Изменить фото' : 'Загрузить фото 3×4'}
										</button>

										{photoPreview && (
											<>
												<span className="text-slate-300">•</span>
												<button
													type="button"
													onClick={() => {
														setPhotoPreview(null);
														setNewPhotoFile(null);
														setRemovePhoto(true);
														if (photoInputRef.current) photoInputRef.current.value = '';
													}}
													className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
													title="Удалить фотографию из дела кандидата"
												>
													Удалить
												</button>
											</>
										)}
									</div>
								</div>

								{/* Поля ввода реквизитов */}
								<div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
									<div className="sm:col-span-2">
										<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											ФИО специалиста
										</label>
										<input
											type="text"
											required
											value={fullName}
											onChange={(e) => setFullName(e.target.value)}
											placeholder="Фамилия Имя Отчество"
											className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-bold text-slate-900 text-sm"
										/>
									</div>

									<div>
										<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Гражданство
										</label>
										<select
											value={citizenship}
											onChange={(e) => {
												setErrorMsg(null);
												setCitizenship(e.target.value as CitizenshipCode);
											}}
											className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-semibold text-xs bg-white transition-colors cursor-pointer ${
												inn && !citizenship
													? 'border-red-400 bg-red-50/40 text-red-700'
													: 'border-slate-200 focus:border-[#283375] text-slate-900'
											}`}
										>
											<option value="">— Выберите гражданство —</option>
											{CITIZENSHIP_OPTIONS.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											ПИН / ИНН
										</label>
										<input
											type="text"
											maxLength={currentCitizenshipMeta?.maxLength || 14}
											value={inn}
											onChange={(e) => {
												setErrorMsg(null);
												setInn(e.target.value.replace(/[^0-9]/g, ''));
											}}
											placeholder={currentCitizenshipMeta?.placeholder || 'Сначала выберите гражданство'}
											className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono font-bold text-slate-900 transition-colors ${
												inn && pinAnalysis.errorMessage
													? 'border-red-400 bg-red-50/40 focus:border-red-600'
													: inn && pinAnalysis.isValid && pinAnalysis.isComplete
													? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
													: 'border-slate-200 focus:border-[#283375]'
											}`}
										/>
										{inn && pinAnalysis.errorMessage && (
											<p className="mt-1 text-[11px] font-bold text-red-600">
												{pinAnalysis.errorMessage}
											</p>
										)}
									</div>

									<div>
										<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Серийный номер бланка
										</label>
										<div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:border-[#283375] focus-within:ring-2 focus-within:ring-[#283375]/10 transition-all bg-white">
											<span
												className="px-3.5 py-2.5 bg-slate-100 text-slate-700 font-mono font-bold text-xs select-none border-r border-slate-200 flex-shrink-0"
												title="Префикс бланка строгой отчетности"
											>
												ЦС №
											</span>
											<input
												type="text"
												required
												value={certNumberDigits}
												onChange={(e) => {
													const val = e.target.value.replace(/^ЦС\s*№\s*/i, '').trim();
													setCertNumberDigits(val);
												}}
												placeholder="000761"
												className="w-full px-3.5 py-2.5 outline-none font-mono font-bold text-slate-900 text-xs bg-transparent"
											/>
										</div>
									</div>

									<div>
										<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Дата выдачи сертификата
										</label>
										<input
											type="date"
											value={issuedDate}
											onChange={(e) => setIssuedDate(e.target.value)}
											className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-semibold text-slate-900"
										/>
									</div>

									<div className="sm:col-span-2">
										<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
											Квалификация / Профессия
										</label>
										<input
											type="text"
											required
											value={profession}
											onChange={(e) => setProfession(e.target.value)}
											placeholder="Например: Мастер столярного и мебельного производства"
											className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-semibold text-slate-900"
										/>
									</div>

									{/* Контакты для обратной связи (только для сотрудников ЦНСВ) */}
									<div>
										<div className="flex items-center justify-between mb-1">
											<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
												Телефон для связи
											</label>
											<span className="text-[10px] font-semibold text-slate-400" title="Не отображается работодателям на публичной странице проверки QR">
												🔒 Только для ЦНСВ
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											<input
												type="tel"
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												placeholder="+996 700 000 000"
												className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-mono font-semibold text-slate-900"
											/>
											{phone.trim() && (
												<a
													href={`tel:${phone.replace(/[^\d+]/g, '')}`}
													className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex-shrink-0 transition-colors"
													title="Позвонить специалисту"
												>
													📞
												</a>
											)}
										</div>
									</div>

									<div>
										<div className="flex items-center justify-between mb-1">
											<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
												Номер WhatsApp
											</label>
											{phone.trim() && whatsapp !== phone && (
												<button
													type="button"
													onClick={() => setWhatsapp(phone)}
													className="text-[10px] font-bold text-[#283375] hover:underline cursor-pointer"
												>
													Как телефон
												</button>
											)}
										</div>
										<div className="flex items-center gap-1.5">
											<input
												type="tel"
												value={whatsapp}
												onChange={(e) => setWhatsapp(e.target.value)}
												placeholder="+996 700 000 000"
												className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-mono font-semibold text-slate-900"
											/>
											{(whatsapp.trim() || phone.trim()) && (
												<a
													href={`https://wa.me/${(whatsapp.trim() || phone.trim()).replace(/\D/g, '')}`}
													target="_blank"
													rel="noopener noreferrer"
													className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1 flex-shrink-0 transition-colors whitespace-nowrap"
													title="Написать специалисту в WhatsApp"
												>
													<span>💬</span>
													<span>WhatsApp</span>
												</a>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* 2. КВАЛИФИКАЦИОННЫЙ ЭКЗАМЕН И КОМИССИЯ */}
						<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
							<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
								<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
									2
								</div>
								<div>
									<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
										Сведения о квалификационном экзамене
									</h2>
									<p className="text-[11px] text-slate-500">
										Отображаются в первом официальном блоке на странице проверки QR-кода
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
								<div className="sm:col-span-2">
									<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
										Место проведения оценки (аттестационная площадка)
									</label>
									<input
										type="text"
										value={scheduledLocation}
										onChange={(e) => setScheduledLocation(e.target.value)}
										placeholder="Например: Государственная аттестационная площадка ЦНСВ МП КР (г. Бишкек)"
										className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
									/>
								</div>

								<div className="flex flex-col">
									<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 leading-tight">
										Дата проведения экзамена
									</label>
									<input
										type="date"
										value={scheduledDate}
										onChange={(e) => setScheduledDate(e.target.value)}
										className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
									/>
								</div>

								<div className="flex flex-col">
									<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 leading-tight">
										Разряд / Уровень
									</label>
									<input
										type="text"
										value={qualificationLevel}
										onChange={(e) => setQualificationLevel(e.target.value)}
										placeholder="Например: 3-й разряд"
										className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
									/>
								</div>

								<div className="sm:col-span-2">
									<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
										Экзаменационная комиссия (Председатель и эксперты)
									</label>
									<input
										type="text"
										value={assessorName}
										onChange={(e) => setAssessorName(e.target.value)}
										placeholder="Например: Председатель комиссии: Чалов Н.С., Эксперт: Асанов Б."
										className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
									/>
								</div>

								<div className="sm:col-span-2">
									<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
										Специализация (при наличии)
									</label>
									<input
										type="text"
										value={specialization}
										onChange={(e) => setSpecialization(e.target.value)}
										placeholder="Например: Изготовление корпусной мебели, Санитарно-ветеринарный надзор"
										className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
									/>
								</div>
							</div>
						</div>

						{/* 3. ИТОГОВЫЙ СЕРТИФИКАТ СТРОГОЙ ОТЧЕТНОСТИ */}
						<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
							<div className="flex items-center justify-between border-b border-slate-100 pb-3">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
										3
									</div>
									<div>
										<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
											Сертификат строгой отчетности
										</h2>
										<p className="text-[11px] text-slate-500">
											Скан выданного оригинального бланка с гербовой печатью ({fullRegistrationNumber})
										</p>
									</div>
								</div>
								{certScanDoc && (
									<span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
										<span>✓</span> <span>Бланк в деле</span>
									</span>
								)}
							</div>

							{certScanDoc ? (
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
									<div className="flex items-center gap-3.5 min-w-0">
										<div className="w-12 h-12 rounded-xl bg-[#283375] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
											<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
											</svg>
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-slate-900 truncate">
													{certScanDoc.description || certScanDoc.doc_type_display || 'Скан сертификата строгой отчетности'}
												</span>
												<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
													✓ Прикреплен
												</span>
											</div>
											<div className="text-[11px] text-slate-500 mt-0.5">
												{certScanDoc.description || 'Оригинал бланка государственного образца с печатью и подписью руководства'}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2 flex-shrink-0">
										<button
											type="button"
											onClick={() => setSelectedDoc(certScanDoc)}
											className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#283375] font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
										>
											Просмотр
										</button>
										<input
											id="file-input-cert-replace"
											type="file"
											accept=".pdf,.jpg,.jpeg,.png,.webp"
											className="hidden"
											onChange={(e) => {
												const f = e.target.files?.[0];
												if (f) handleSlotFileUpload('certificate_scan', f, 'Скан выданного сертификата строгой отчетности');
												e.target.value = '';
											}}
										/>
										<label
											htmlFor="file-input-cert-replace"
											className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
										>
											Заменить
										</label>
										<button
											type="button"
											onClick={() => handleDeleteDoc(certScanDoc.id)}
											className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
											title="Удалить скан сертификата"
										>
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</div>
							) : (
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 text-center sm:text-left">
									<div>
										<div className="text-xs font-bold text-slate-800">
											Скан бланка строгой отчетности еще не загружен
										</div>
										<div className="text-[11px] text-slate-500 mt-0.5">
											Прикрепите цветной скан выданного бланка {fullRegistrationNumber} с гербовой печатью ЦНСВ
										</div>
									</div>
									<input
										id="file-input-cert-upload"
										type="file"
										accept=".pdf,.jpg,.jpeg,.png,.webp"
										className="hidden"
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) handleSlotFileUpload('certificate_scan', f, 'Скан выданного сертификата строгой отчетности');
											e.target.value = '';
										}}
									/>
									<label
										htmlFor="file-input-cert-upload"
										className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex-shrink-0 ${
											uploadingDocSlot === 'certificate_scan' ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#283375] hover:bg-[#1e265c]'
										}`}
									>
										<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
										</svg>
										<span>{uploadingDocSlot === 'certificate_scan' ? 'Загрузка...' : 'Загрузить скан сертификата'}</span>
									</label>
								</div>
							)}
						</div>

						{/* ОФИЦИАЛЬНЫЙ QR-КОД СЕРТИФИКАТА ДЛЯ ПЕЧАТИ В CORELDRAW И WORD */}
						<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
							<div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
								<div className="flex items-center gap-2.5 min-w-0">
									<div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
										<svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
										</svg>
									</div>
									<div className="min-w-0">
										<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
											Официальный QR-код сертификата для печати
										</h2>
										<p className="text-[11px] text-slate-500">
											Векторные кривые для вставки в защищенный бланк в CorelDraw или растр высокого разрешения (300 DPI)
										</p>
									</div>
								</div>
								<span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0 self-center shadow-2xs">
									✓ Готов к печати
								</span>
							</div>

							<div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
								{candidate?.qr_code_url ? (
									<img
										src={candidate.qr_code_url}
										alt="QR Code"
										className="w-36 h-36 rounded-2xl bg-white p-2.5 border border-slate-200 shadow-xs shrink-0"
									/>
								) : (
									<div className="w-36 h-36 rounded-2xl bg-white p-3 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center shrink-0">
										<svg className="w-10 h-10 text-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
										</svg>
										<span className="text-[10px] text-slate-400 font-bold">QR код</span>
									</div>
								)}

								<div className="space-y-3.5 flex-1 w-full text-xs">
									<div className="space-y-1.5">
										<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
											Ссылка онлайн-верификации:
										</span>
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-mono text-xs text-[#283375] font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 select-all shadow-2xs">
												https://validation.kg{publicVerifyUrl}
											</span>
											<button
												type="button"
												onClick={handleCopyLink}
												className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200/60"
												title="Скопировать ссылку верификации в буфер обмена"
											>
												{linkCopied ? (
													<>
														<svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
														</svg>
														<span className="text-emerald-700">Скопировано!</span>
													</>
												) : (
													<>
														<svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
														</svg>
														<span>Копировать</span>
													</>
												)}
											</button>
											<a
												href={publicVerifyUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#283375] font-bold text-xs hover:bg-blue-100 border border-blue-200/80 transition-all flex items-center gap-1"
											>
												<span>Проверить онлайн ↗</span>
											</a>
										</div>
									</div>

									<p className="text-[11px] text-slate-500 leading-relaxed">
										При сканировании камерой смартфона работодатель или инспектор мгновенно переходит на официальный государственный портал ЦНСВ с подтверждением легитимности документа.
									</p>

									<div className="flex flex-wrap items-center gap-3 pt-1">
										<button
											type="button"
											disabled={!!downloadingQR}
											onClick={() => handleDownloadQR('svg')}
											className="px-4 py-2.5 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
											title="Скачать векторный QR-код в формате SVG для CorelDraw (без потери качества)"
										>
											<svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
											</svg>
											<span>Скачать SVG (Вектор для CorelDraw)</span>
										</button>
										<button
											type="button"
											disabled={!!downloadingQR}
											onClick={() => handleDownloadQR('png')}
											className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all border border-slate-200 shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
											title="Скачать растровый QR-код в формате PNG (300 DPI) для Word и печати"
										>
											<svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
											</svg>
											<span>Скачать PNG (300 DPI)</span>
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* 4. АТТЕСТАЦИОННОЕ ДЕЛО И ЭКЗАМЕНАЦИОННЫЕ АКТЫ */}
						<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
							<div className="flex items-center justify-between border-b border-slate-100 pb-3">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
										4
									</div>
									<div>
										<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
											Аттестационное дело и экзаменационные акты
										</h2>
										<p className="text-[11px] text-slate-500">
											Официальные материалы экзамена, подтверждающие компетентность кандидата
										</p>
									</div>
								</div>
							</div>

							<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
								{OFFICIAL_EXAM_SLOTS.map((slot) => {
									const attachedDocs = documents.filter((d) => {
										if (slot.type === 'assessment_photo') {
											return ['photo', 'assessment_photo', 'work_sample'].includes(d.doc_type);
										}
										return d.doc_type === slot.type;
									});
									const hasDoc = attachedDocs.length > 0;
									const fileInputId = `file-input-${slot.type}`;
									const isPhotoSlot = slot.type === 'assessment_photo';

									return (
										<div key={slot.type} className="p-4 hover:bg-slate-50/60 transition-colors">
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<span className="text-xs font-bold text-slate-900">{slot.title}</span>
														{hasDoc ? (
															<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
																✓ Прикреплен {isPhotoSlot ? `(${attachedDocs.length} фото)` : ''}
															</span>
														) : (
															<span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
																В архиве ЦНСВ
															</span>
														)}
													</div>
													<div className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</div>

													{/* Мини-галерея для фотофиксации или список прикрепленных документов */}
													{hasDoc && isPhotoSlot ? (
														<div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
															{attachedDocs.map((doc, idx) => {
																const isSelected = selectedDoc?.id === doc.id;
																return (
																	<div
																		key={doc.id}
																		onClick={() => setSelectedDoc(doc)}
																		className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
																			isSelected
																				? 'border-[#283375] ring-2 ring-[#283375]/20 shadow-md'
																				: 'border-slate-200 hover:border-slate-400'
																		}`}
																		title={`Нажмите для просмотра фото #${idx + 1}`}
																	>
																		<img
																			src={doc.file_url}
																			alt={doc.description || `Фото ${idx + 1}`}
																			className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
																		/>
																		<span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/65 text-white text-[10px] font-bold">
																			#{idx + 1}
																		</span>
																		<button
																			type="button"
																			onClick={(e) => {
																				e.stopPropagation();
																				handleDeleteDoc(doc.id);
																			}}
																			className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/65 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
																			title="Удалить фото"
																		>
																			✕
																		</button>
																	</div>
																);
															})}
														</div>
													) : hasDoc ? (
														<div className="mt-2.5 space-y-1.5">
															{attachedDocs.map((doc) => (
																<div
																	key={doc.id}
																	className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
																		selectedDoc?.id === doc.id
																			? 'bg-blue-50/80 border-[#283375] text-[#283375] font-semibold'
																			: 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
																	}`}
																	onClick={() => setSelectedDoc(doc)}
																>
																	<div className="flex items-center gap-2 truncate pr-2">
																		<svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																		</svg>
																		<span className="truncate">{doc.description || doc.doc_type_display}</span>
																	</div>

																	<div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
																		<button
																			type="button"
																			onClick={() => setSelectedDoc(doc)}
																			className="px-2.5 py-1 text-[11px] font-bold text-[#283375] hover:bg-white rounded-lg transition-colors"
																		>
																			Просмотр
																		</button>
																		<button
																			type="button"
																			onClick={() => handleDeleteDoc(doc.id)}
																			className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
																			title="Удалить документ"
																		>
																			<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																			</svg>
																		</button>
																	</div>
																</div>
															))}
														</div>
													) : null}
												</div>

												{/* Кнопка загрузки */}
												<div className="flex-shrink-0 self-start sm:self-center">
													<input
														id={fileInputId}
														type="file"
														multiple={isPhotoSlot}
														accept={isPhotoSlot ? 'image/*' : '.pdf,.jpg,.jpeg,.png,.webp'}
														className="hidden"
														onChange={(e) => {
															const files = e.target.files;
															if (files && files.length > 0) {
																handleSlotFileUpload(slot.type, files, slot.descriptionPlaceholder);
															}
															e.target.value = '';
														}}
													/>
													<label
														htmlFor={fileInputId}
														className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
															uploadingDocSlot === slot.type
																? 'bg-slate-200 text-slate-500 cursor-not-allowed'
																: hasDoc
																? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
																: 'bg-[#283375] hover:bg-[#1e265c] text-white'
														}`}
													>
														<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
														</svg>
														<span>{hasDoc ? (isPhotoSlot ? 'Добавить фото' : 'Добавить ещё') : (isPhotoSlot ? 'Загрузить фото' : 'Загрузить скан')}</span>
													</label>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* 5. ЛИЧНЫЕ ДОКУМЕНТЫ ИЗ ДЕЛА ЗАЯВИТЕЛЯ (АРХИВ ЦНСВ) */}
						<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
								<div className="flex items-center gap-2.5">
									<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
										5
									</div>
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
												Личные документы заявителя
											</h2>
											<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
												Архив ЦНСВ (ДСП)
											</span>
										</div>
										<p className="text-[11px] text-slate-500">
											Входной пакет документов заявителя: паспорт, заявление, диплом, договор и оплата (не выводятся в QR-код)
										</p>
									</div>
								</div>

								<button
									type="button"
									onClick={() => setShowAddPersonalDoc(true)}
									className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
								>
									<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									<span>Иной документ</span>
								</button>
							</div>

							{/* СЛОТЫ ЛИЧНЫХ ДОКУМЕНТОВ В ЕДИНОМ СТИЛЕ */}
							<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
								{PERSONAL_DOC_SLOTS.map((slot) => {
									const attachedDocs = documents.filter((d) => d.doc_type === slot.type);
									const hasDoc = attachedDocs.length > 0;
									const fileInputId = `file-input-personal-${slot.type}`;

									return (
										<div key={slot.type} className="p-4 hover:bg-slate-50/60 transition-colors">
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<span className="text-xs font-bold text-slate-900">{slot.title}</span>
														{hasDoc ? (
															<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
																✓ Прикреплен {attachedDocs.length > 1 ? `(${attachedDocs.length})` : ''}
															</span>
														) : (
															<span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
																В архиве ЦНСВ
															</span>
														)}
													</div>
													<div className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</div>

													{/* Список прикрепленных документов данного типа */}
													{hasDoc && (
														<div className="mt-2.5 space-y-1.5">
															{attachedDocs.map((doc) => (
																<div
																	key={doc.id}
																	className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
																		selectedDoc?.id === doc.id
																			? 'bg-blue-50/80 border-[#283375] text-[#283375] font-semibold'
																			: 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
																	}`}
																	onClick={() => setSelectedDoc(doc)}
																>
																	<div className="flex items-center gap-2 truncate pr-2">
																		<svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																		</svg>
																		<span className="truncate">{doc.description || doc.doc_type_display}</span>
																	</div>

																	<div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
																		<button
																			type="button"
																			onClick={() => setSelectedDoc(doc)}
																			className="px-2.5 py-1 text-[11px] font-bold text-[#283375] hover:bg-white rounded-lg transition-colors"
																		>
																			Просмотр
																		</button>
																		<button
																			type="button"
																			onClick={() => handleDeleteDoc(doc.id)}
																			className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
																			title="Удалить документ"
																		>
																			<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																			</svg>
																		</button>
																	</div>
																</div>
															))}
														</div>
													)}
												</div>

												{/* Кнопка быстрой загрузки */}
												<div className="flex-shrink-0 self-start sm:self-center">
													<input
														id={fileInputId}
														type="file"
														accept=".pdf,.jpg,.jpeg,.png,.webp"
														className="hidden"
														onChange={(e) => {
															const f = e.target.files?.[0];
															if (f) handleSlotFileUpload(slot.type, f, slot.descriptionPlaceholder);
															e.target.value = '';
														}}
													/>
													<label
														htmlFor={fileInputId}
														className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
															uploadingDocSlot === slot.type
																? 'bg-slate-200 text-slate-500 cursor-not-allowed'
																: hasDoc
																? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
																: 'bg-[#283375] hover:bg-[#1e265c] text-white'
														}`}
													>
														<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
														</svg>
														<span>{hasDoc ? 'Добавить ещё' : 'Загрузить скан'}</span>
													</label>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							{/* ДОПОЛНИТЕЛЬНЫЕ ИНЫЕ ДОКУМЕНТЫ (ЕСЛИ ЕСТЬ) */}
							{(() => {
								const otherDocs = personalDocs.filter(
									(d) => !PERSONAL_DOC_SLOTS.some((s) => s.type === d.doc_type)
								);
								if (otherDocs.length === 0) return null;

								return (
									<div className="pt-3 border-t border-slate-100 space-y-2">
										<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
											Дополнительные прикрепленные документы ({otherDocs.length})
										</span>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
											{otherDocs.map((doc) => (
												<div
													key={doc.id}
													onClick={() => setSelectedDoc(doc)}
													className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
														selectedDoc?.id === doc.id
															? 'bg-blue-50/80 border-[#283375] text-[#283375] font-semibold'
															: 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
													}`}
												>
													<div className="truncate">
														<div className="font-bold truncate">{doc.doc_type_display}</div>
														<div className="text-[10px] text-slate-400 truncate">{doc.description || 'Документ дела'}</div>
													</div>

													<div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
														<button
															type="button"
															onClick={() => setSelectedDoc(doc)}
															className="px-2 py-1 text-[11px] font-bold text-[#283375] hover:bg-white rounded-lg transition-colors"
														>
															Просмотр
														</button>
														<button
															type="button"
															onClick={() => handleDeleteDoc(doc.id)}
															className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
															title="Удалить"
														>
															<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
															</svg>
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								);
							})()}
						</div>
					</div>

					{/* ПРАВАЯ КОЛОНКА: ИНСПЕКТОР ДОКУМЕНТОВ И ЧЕК-ЛИСТ КОМПЛЕКТНОСТИ (5 cols) */}
					<div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
						{/* КАРТОЧКА КОНТРОЛЯ КОМПЛЕКТНОСТИ */}
						<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
							<div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
								<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
									Комплектность дела кандидата
								</h3>
								<span className="text-xs font-black text-[#283375] font-mono">
									{completenessPercent}%
								</span>
							</div>

							{/* Прогресс-бар */}
							<div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
								<div
									className={`h-full transition-all duration-500 ${
										completenessPercent === 100
											? 'bg-emerald-500'
											: completenessPercent >= 50
											? 'bg-blue-600'
											: 'bg-amber-500'
									}`}
									style={{ width: `${completenessPercent}%` }}
								/>
							</div>

							{/* Список пунктов */}
							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between">
									<span className="text-slate-600">Скан сертификата строгой отчетности:</span>
									{certScanDoc ? (
										<span className="text-emerald-700 font-bold">✓ В деле</span>
									) : (
										<span className="text-slate-400">В архиве ЦНСВ</span>
									)}
								</div>

								<div className="flex items-center justify-between">
									<span className="text-slate-600">Протокол квалификационной комиссии:</span>
									{examProtocolDoc ? (
										<span className="text-emerald-700 font-bold">✓ В деле</span>
									) : (
										<span className="text-slate-400">В архиве ЦНСВ</span>
									)}
								</div>

								<div className="flex items-center justify-between">
									<span className="text-slate-600">Оценочный лист квалификационного экзамена:</span>
									{evalSheetDoc ? (
										<span className="text-emerald-700 font-bold">✓ В деле</span>
									) : (
										<span className="text-slate-400">В архиве ЦНСВ</span>
									)}
								</div>

								<div className="flex items-center justify-between">
									<span className="text-slate-600">Экзаменационный билет и задания:</span>
									{examTaskDoc ? (
										<span className="text-emerald-700 font-bold">✓ В деле</span>
									) : (
										<span className="text-slate-400">В архиве ЦНСВ</span>
									)}
								</div>

								<div className="flex items-center justify-between">
									<span className="text-slate-600">Фотофиксация квалификационного экзамена:</span>
									{examPhotos.length > 0 ? (
										<span className="text-emerald-700 font-bold">✓ {examPhotos.length} фото</span>
									) : (
										<span className="text-slate-400">Не загружено</span>
									)}
								</div>

								<div className="flex items-center justify-between pt-1 border-t border-slate-100">
									<span className="text-slate-600">Личные документы заявителя (паспорт, диплом...):</span>
									{personalDocs.length > 0 ? (
										<span className="text-emerald-700 font-bold">✓ {personalDocs.length} док.</span>
									) : (
										<span className="text-slate-400">Не прикреплены</span>
									)}
								</div>
							</div>
						</div>

						{/* LIVE INSPECTOR ДОКУМЕНТА */}
						<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col min-h-[460px]">
							<div className="p-4 bg-slate-900 text-white flex items-center justify-between gap-3">
								<div className="min-w-0">
									<div className="text-[10px] uppercase font-bold text-slate-400">
										{selectedDoc ? 'Просмотр документа' : 'Инспектор материалов'}
									</div>
									<div className="text-xs font-bold truncate">
										{selectedDoc?.description || selectedDoc?.doc_type_display || 'Выберите документ для просмотра'}
									</div>
								</div>

								{selectedDoc && (
									<div className="flex items-center gap-2 flex-shrink-0">
										<a
											href={selectedDoc.file_url}
											target="_blank"
											rel="noopener noreferrer"
											className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all"
										>
											В полный экран ↗
										</a>
										<button
											type="button"
											onClick={() => handleDeleteDoc(selectedDoc.id)}
											className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-all"
											title="Удалить этот файл"
										>
											<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								)}
							</div>

							<div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 min-h-[360px] select-none">
								{selectedDoc && examPhotos.length > 1 && examPhotos.some((p) => p.id === selectedDoc.id) && (() => {
									const curIdx = examPhotos.findIndex((p) => p.id === selectedDoc.id);
									const total = examPhotos.length;
									return (
										<>
											<button
												type="button"
												onClick={() => setSelectedDoc(examPhotos[(curIdx - 1 + total) % total])}
												className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/65 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center text-xl font-bold shadow-md transition-all cursor-pointer"
												title="Предыдущее фото"
											>
												‹
											</button>
											<button
												type="button"
												onClick={() => setSelectedDoc(examPhotos[(curIdx + 1) % total])}
												className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/65 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center text-xl font-bold shadow-md transition-all cursor-pointer"
												title="Следующее фото"
											>
												›
											</button>
											<span className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-bold border border-white/15">
												Фото {curIdx + 1} из {total}
											</span>
										</>
									);
								})()}
								{selectedDoc ? (
									/\.pdf$/i.test(selectedDoc.file_url) ? (
										<iframe
											src={selectedDoc.file_url}
											title={selectedDoc.description || 'Документ'}
											className="w-full h-[520px] border-0 rounded-lg bg-white"
										/>
									) : (
										<img
											src={selectedDoc.file_url}
											alt={selectedDoc.description || 'Документ'}
											className="max-w-full max-h-[520px] object-contain rounded-lg shadow-md"
										/>
									)
								) : (
									<div className="text-center p-8 text-slate-500 space-y-2">
										<svg className="w-12 h-12 mx-auto text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
										<div className="text-xs font-semibold">Нажмите на любой документ в деле слева</div>
										<p className="text-[11px] text-slate-600 max-w-xs">
											Здесь отобразится скан оценочного листа, протокола или фото экзамена в высоком разрешении.
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ЛИЧНОГО ДОКУМЕНТА */}
			{showAddPersonalDoc && (
				<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
						<div className="flex items-center justify-between border-b border-slate-100 pb-3">
							<h3 className="text-sm font-bold text-slate-900">Прикрепить документ заявителя</h3>
							<button
								type="button"
								onClick={() => setShowAddPersonalDoc(false)}
								className="text-slate-400 hover:text-slate-600 text-sm"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleUploadPersonalDoc} className="space-y-3.5 text-xs">
							<div>
								<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
									Тип документа *
								</label>
								<select
									value={newPersonalDocType}
									onChange={(e) => setNewPersonalDocType(e.target.value)}
									className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
								>
									{PERSONAL_DOC_TYPES.map((t) => (
										<option key={t.id} value={t.id}>
											{t.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
									Описание / Примечание
								</label>
								<input
									type="text"
									value={newPersonalDocDesc}
									onChange={(e) => setNewPersonalDocDesc(e.target.value)}
									placeholder="Например: Квитанция РСК Банк № 10248"
									className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
								/>
							</div>

							<div>
								<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
									Файл документа (PDF, JPG, PNG) *
								</label>
								<input
									type="file"
									required
									accept=".pdf,.jpg,.jpeg,.png,.webp"
									onChange={(e) => setNewPersonalDocFile(e.target.files?.[0] || null)}
									className="w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#283375] file:text-white file:font-semibold text-xs"
								/>
							</div>

							<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setShowAddPersonalDoc(false)}
									className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
								>
									Отмена
								</button>
								<button
									type="submit"
									disabled={uploadingPersonalDoc || !newPersonalDocFile}
									className="px-5 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-bold disabled:opacity-50"
								>
									{uploadingPersonalDoc ? 'Загрузка...' : 'Прикрепить документ'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ДЕЛА СПЕЦИАЛИСТА */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
						<div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<div className="text-center space-y-1.5">
							<h3 className="text-lg font-black text-slate-900">
								Удалить дело специалиста?
							</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								Вы действительно хотите удалить дело специалиста <b>«{fullName || candidate?.full_name}»</b> (№ {fullRegistrationNumber})? Запись будет безвозвратно удалена из государственного реестра.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2.5 pt-2">
							<button
								type="button"
								onClick={() => setShowDeleteModal(false)}
								disabled={deletingCandidate}
								className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={handleDeleteCandidate}
								disabled={deletingCandidate}
								className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
							>
								{deletingCandidate ? 'Удаление...' : 'Да, удалить'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА ФОТО СПЕЦИАЛИСТА В ВЫСОКОМ РАЗРЕШЕНИИ */}
			{showPhotoModal && photoPreview && (
				<div
					className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
					onClick={() => setShowPhotoModal(false)}
				>
					<div
						className="relative max-w-md w-full bg-slate-900 rounded-3xl p-5 shadow-2xl border border-white/10 flex flex-col items-center"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="w-full flex items-center justify-between pb-3 px-1 border-b border-white/10 mb-4">
							<div className="min-w-0 pr-3">
								<span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
									Фото кандидата 3×4
								</span>
								<h3 className="text-white font-bold text-sm truncate">
									{fullName || 'Специалист'}
								</h3>
							</div>
							<div className="flex items-center gap-2 flex-shrink-0">
								<button
									type="button"
									onClick={() => {
										setShowPhotoModal(false);
										photoInputRef.current?.click();
									}}
									className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all cursor-pointer"
									title="Загрузить новое фото"
								>
									Заменить
								</button>
								<button
									type="button"
									onClick={() => setShowPhotoModal(false)}
									className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-sm"
									title="Закрыть просмотр"
								>
									✕
								</button>
							</div>
						</div>
						<div className="w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/60 p-2">
							<img
								src={photoPreview}
								alt={fullName || 'Фото специалиста'}
								className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}