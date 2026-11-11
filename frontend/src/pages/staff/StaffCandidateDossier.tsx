// frontend/src/pages/staff/StaffCandidateDossier.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
	staffApi,
	StaffProfile,
	StaffCertifiedUser,
	StaffApplicationDocument,
} from '../../api/staff';
import StaffHeader from '../../components/staff/StaffHeader';
import {
	analyzeKyrgyzPin,
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
	detectCitizenshipFromExistingInn,
} from '../../utils/kyrgyzPinValidator';
import {
	DossierHeaderActions,
	CandidatePersonalCard,
	CandidateExamCommissionCard,
	CandidateCertificateCard,
	CandidateExamDocumentsCard,
	CandidatePersonalDocumentsCard,
	DossierCompletenessInspector,
} from '../../widgets/dossier-viewer';
import {
	AddPersonalDocumentModal,
	DeleteDossierModal,
	PhotoPreviewModal,
} from '../../features/dossier-modals';

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
	const returnUrl =
		(location.state as any)?.returnUrl ||
		`/staff/dashboard?tab=registry${id ? `&target=${id}` : ''}`;

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

	const [downloadingQR, setDownloadingQR] = useState<string | null>(null);
	const [linkCopied, setLinkCopied] = useState(false);

	const cleanCertDigits = certNumberDigits.replace(/[^0-9]/g, '');
	const fullRegistrationNumber = certNumberDigits.trim()
		? `ЦС № ${certNumberDigits.trim()}`
		: candidate?.registration_number || '';
	const publicVerifyUrl = `/verify/${cleanCertDigits || candidate?.id}`;

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

	// Completeness stats for checklist
	const evalSheetDoc = documents.find((d) => d.doc_type === 'evaluation_sheet');
	const examTaskDoc = documents.find((d) => d.doc_type === 'exam_task');
	const examProtocolDoc = documents.find((d) => d.doc_type === 'exam_protocol');
	const certScanDoc = documents.find((d) => d.doc_type === 'certificate_scan');
	const examPhotos = documents.filter((d) =>
		['photo', 'assessment_photo', 'work_sample'].includes(d.doc_type)
	);
	const personalDocs = documents.filter(
		(d) =>
			![
				'evaluation_sheet',
				'exam_task',
				'exam_protocol',
				'certificate_scan',
				'photo',
				'assessment_photo',
				'work_sample',
			].includes(d.doc_type)
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
					<p className="text-xs text-slate-500">
						Запрашиваемый кандидат не существует в базе данных или был перемещен.
					</p>
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
		<div className="min-h-screen bg-slate-100/70 text-slate-800 pb-20">
			{/* ЕДИНАЯ СЛУЖЕБНАЯ ШАПКА ЦНСВ МП КР */}
			<StaffHeader
				profile={profile}
				isDossier={true}
				candidateNumber={fullRegistrationNumber}
			/>

			{/* ОСНОВНОЙ КОНТЕНТ ДЕЛА */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
				{/* НАВИГАЦИОННАЯ СТРОКА И КНОПКИ ДЕЙСТВИЙ (STICKY TOP) */}
				<DossierHeaderActions
					returnUrl={returnUrl}
					onNavigateBack={() => navigate(returnUrl)}
					fullRegistrationNumber={fullRegistrationNumber}
					fullName={fullName}
					candidateName={candidate.full_name}
					updatedAt={candidate.updated_at}
					updatedByName={candidate.updated_by_name}
					onPrint={() => window.print()}
					onSave={() => handleSaveDossier()}
					saving={saving}
					onDeleteClick={() => setShowDeleteModal(true)}
				/>

				{/* Уведомления об успехе или ошибке */}
				{saveSuccessMsg && (
					<div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
						<svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
						<span>{saveSuccessMsg}</span>
					</div>
				)}

				{errorMsg && (
					<div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 shadow-xs">
						<svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<span>{errorMsg}</span>
					</div>
				)}

				{/* ДВУХКОЛОНОЧНЫЙ СПЛИТ-ИНТЕРФЕЙС */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
					{/* ЛЕВАЯ КОЛОНКА: ОСНОВНЫЕ РАЗДЕЛЫ ДЕЛА (7 cols) */}
					<div className="lg:col-span-7 space-y-6">
						{/* 1. ЛИЧНЫЕ И РЕГИСТРАЦИОННЫЕ РЕКВИЗИТЫ */}
						<CandidatePersonalCard
							candidateId={candidate.id}
							fullName={fullName}
							onFullNameChange={setFullName}
							photoPreview={photoPreview}
							onPhotoClick={() => setShowPhotoModal(true)}
							photoInputRef={photoInputRef}
							onPhotoChange={handlePhotoChange}
							onRemovePhoto={() => {
								setPhotoPreview(null);
								setNewPhotoFile(null);
								setRemovePhoto(true);
							}}
							citizenship={citizenship}
							onCitizenshipChange={setCitizenship}
							inn={inn}
							onInnChange={setInn}
							pinAnalysis={pinAnalysis}
							currentCitizenshipMeta={currentCitizenshipMeta}
							certNumberDigits={certNumberDigits}
							onCertNumberDigitsChange={setCertNumberDigits}
							issuedDate={issuedDate}
							onIssuedDateChange={setIssuedDate}
							profession={profession}
							onProfessionChange={setProfession}
							phone={phone}
							onPhoneChange={setPhone}
							whatsapp={whatsapp}
							onWhatsappChange={setWhatsapp}
						/>

						{/* 2. КВАЛИФИКАЦИОННЫЙ ЭКЗАМЕН И КОМИССИЯ */}
						<CandidateExamCommissionCard
							scheduledLocation={scheduledLocation}
							onScheduledLocationChange={setScheduledLocation}
							scheduledDate={scheduledDate}
							onScheduledDateChange={setScheduledDate}
							qualificationLevel={qualificationLevel}
							onQualificationLevelChange={setQualificationLevel}
							assessorName={assessorName}
							onAssessorNameChange={setAssessorName}
							specialization={specialization}
							onSpecializationChange={setSpecialization}
						/>

						{/* 3. ИТОГОВЫЙ СЕРТИФИКАТ СТРОГОЙ ОТЧЕТНОСТИ */}
						<CandidateCertificateCard
							fullRegistrationNumber={fullRegistrationNumber}
							certScanDoc={certScanDoc}
							onViewDoc={(doc) => setSelectedDoc(doc)}
							onDeleteDoc={handleDeleteDoc}
							onUploadSlotFile={(slotType, file, desc) =>
								handleSlotFileUpload(slotType, file, desc)
							}
							uploadingDocSlot={uploadingDocSlot}
							qrCodeUrl={candidate.qr_code_url}
							publicVerifyUrl={publicVerifyUrl}
							onCopyLink={handleCopyLink}
							linkCopied={linkCopied}
							downloadingQR={downloadingQR}
							onDownloadQR={handleDownloadQR}
						/>

						{/* 4. АТТЕСТАЦИОННОЕ ДЕЛО И ЭКЗАМЕНАЦИОННЫЕ АКТЫ */}
						<CandidateExamDocumentsCard
							documents={documents}
							selectedDoc={selectedDoc}
							uploadingDocSlot={uploadingDocSlot}
							onSelectDoc={(doc) => setSelectedDoc(doc)}
							onDeleteDoc={handleDeleteDoc}
							onSlotFileUpload={handleSlotFileUpload}
						/>

						{/* 5. ЛИЧНЫЕ ДОКУМЕНТЫ ИЗ ДЕЛА ЗАЯВИТЕЛЯ (АРХИВ ЦНСВ) */}
						<CandidatePersonalDocumentsCard
							documents={documents}
							personalDocs={personalDocs}
							selectedDoc={selectedDoc}
							uploadingDocSlot={uploadingDocSlot}
							onSelectDoc={(doc) => setSelectedDoc(doc)}
							onDeleteDoc={handleDeleteDoc}
							onSlotFileChange={(slotType, file, placeholder) =>
								handleSlotFileUpload(slotType, file, placeholder)
							}
							onOpenAddModal={() => setShowAddPersonalDoc(true)}
						/>
					</div>

					{/* ПРАВАЯ КОЛОНКА: ИНСПЕКТОР ДОКУМЕНТОВ И ЧЕК-ЛИСТ КОМПЛЕКТНОСТИ (5 cols) */}
					<DossierCompletenessInspector
						completenessPercent={completenessPercent}
						certScanDoc={certScanDoc}
						examProtocolDoc={examProtocolDoc}
						evalSheetDoc={evalSheetDoc}
						examTaskDoc={examTaskDoc}
						examPhotos={examPhotos}
						personalDocs={personalDocs}
						selectedDoc={selectedDoc}
						onDeleteDoc={handleDeleteDoc}
					/>
				</div>
			</div>

			{/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ЛИЧНОГО ДОКУМЕНТА */}
			<AddPersonalDocumentModal
				isOpen={showAddPersonalDoc}
				onClose={() => setShowAddPersonalDoc(false)}
				docTypes={PERSONAL_DOC_TYPES}
				selectedDocType={newPersonalDocType}
				onSelectDocType={setNewPersonalDocType}
				docDesc={newPersonalDocDesc}
				onDescChange={setNewPersonalDocDesc}
				onFileChange={setNewPersonalDocFile}
				onSubmit={handleUploadPersonalDoc}
				uploading={uploadingPersonalDoc}
				hasFile={!!newPersonalDocFile}
			/>

			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ДЕЛА СПЕЦИАЛИСТА */}
			<DeleteDossierModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				fullName={fullName || candidate.full_name || 'Специалист'}
				registrationNumber={fullRegistrationNumber}
				onConfirm={handleDeleteCandidate}
				deleting={deletingCandidate}
			/>

			{/* МОДАЛЬНОЕ ОКНО ПРОСМОТРА И ЗАМЕНЫ ФОТО 3×4 */}
			<PhotoPreviewModal
				isOpen={showPhotoModal}
				photoUrl={photoPreview}
				fullName={fullName || candidate.full_name || 'Специалист'}
				onClose={() => setShowPhotoModal(false)}
				onReplaceClick={() => {
					setShowPhotoModal(false);
					photoInputRef.current?.click();
				}}
			/>
		</div>
	);
}
