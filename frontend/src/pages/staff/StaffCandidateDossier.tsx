// frontend/src/pages/staff/StaffCandidateDossier.tsx
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StaffHeader from '../../components/staff/StaffHeader';
import {
	AddPersonalDocumentModal,
	DeleteDossierModal,
	PhotoPreviewModal,
} from '../../features/dossier-modals';
import {
	CandidateCertificateCard,
	CandidateExamCommissionCard,
	CandidateExamDocumentsCard,
	CandidatePersonalCard,
	CandidatePersonalDocumentsCard,
	DossierCompletenessInspector,
	DossierDocumentModal,
	DossierHeaderActions,
} from '../../widgets/dossier-viewer';
import { useDossierState } from '../../widgets/dossier-viewer/model/useDossierState';

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
		(typeof window !== 'undefined' ? sessionStorage.getItem('staff_dashboard_last_url') : null) ||
		`/staff/dashboard?tab=registry${id ? `&target=${id}` : ''}`;

	const {
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
		setNewPhotoFile,
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
	} = useDossierState(id, returnUrl);

	const [isViewerModalOpen, setIsViewerModalOpen] = useState<boolean>(false);
	const [isSplitMode, setIsSplitMode] = useState<boolean>(false);

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
			<div className='min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-700'>
				<div className='text-center space-y-3'>
					<div className='w-10 h-10 border-4 border-[#283375] border-t-transparent rounded-full animate-spin mx-auto' />
					<p className='text-sm font-bold'>Загрузка электронного дела кандидата...</p>
				</div>
			</div>
		);
	}

	if (!candidate) {
		return (
			<div className='min-h-screen bg-slate-100 p-8 flex items-center justify-center'>
				<div className='bg-white p-8 rounded-3xl border border-slate-200 max-w-md text-center space-y-4'>
					<h3 className='text-lg font-bold text-slate-900'>Дело не найдено</h3>
					<p className='text-xs text-slate-500'>
						Запрашиваемый кандидат не существует в базе данных или был перемещен.
					</p>
					<button
						type='button'
						onClick={() => navigate(returnUrl)}
						className='inline-block px-5 py-2.5 rounded-xl bg-[#283375] text-white font-bold text-xs cursor-pointer'
					>
						Вернуться в реестр
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-slate-100/70 text-slate-800 pb-20'>
			<StaffHeader
				profile={profile}
				isDossier={true}
				candidateNumber={fullRegistrationNumber}
			/>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6'>
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
					isSplitMode={isSplitMode}
					onToggleSplitMode={() => setIsSplitMode((prev) => !prev)}
				/>

				{saveSuccessMsg && (
					<div className='p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs'>
						<svg className='w-4 h-4 text-emerald-600 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
						</svg>
						<span>{saveSuccessMsg}</span>
					</div>
				)}

				{errorMsg && (
					<div className='p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 shadow-xs'>
						<svg className='w-4 h-4 text-red-600 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
						</svg>
						<span>{errorMsg}</span>
					</div>
				)}

				<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'>
					<div className={`${isSplitMode ? 'lg:col-span-6' : 'lg:col-span-7'} space-y-6 transition-all duration-200`}>
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

						<CandidateCertificateCard
							fullRegistrationNumber={fullRegistrationNumber}
							certScanDoc={certScanDoc}
							onViewDoc={(doc) => {
								setSelectedDoc(doc);
								setIsViewerModalOpen(true);
							}}
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

						<CandidateExamDocumentsCard
							documents={documents}
							selectedDoc={selectedDoc}
							uploadingDocSlot={uploadingDocSlot}
							onSelectDoc={(doc) => setSelectedDoc(doc)}
							onViewDoc={(doc) => {
								setSelectedDoc(doc);
								setIsViewerModalOpen(true);
							}}
							onDeleteDoc={handleDeleteDoc}
							onSlotFileUpload={handleSlotFileUpload}
						/>

						<CandidatePersonalDocumentsCard
							documents={documents}
							personalDocs={personalDocs}
							selectedDoc={selectedDoc}
							uploadingDocSlot={uploadingDocSlot}
							onSelectDoc={(doc) => setSelectedDoc(doc)}
							onViewDoc={(doc) => {
								setSelectedDoc(doc);
								setIsViewerModalOpen(true);
							}}
							onDeleteDoc={handleDeleteDoc}
							onSlotFileChange={(slotType, file, placeholder) =>
								handleSlotFileUpload(slotType, file, placeholder)
							}
							onOpenAddModal={() => setShowAddPersonalDoc(true)}
						/>
					</div>

					<div className={`${isSplitMode ? 'lg:col-span-6' : 'lg:col-span-5'} transition-all duration-200`}>
						<DossierCompletenessInspector
							completenessPercent={completenessPercent}
							certScanDoc={certScanDoc}
							examProtocolDoc={examProtocolDoc}
							evalSheetDoc={evalSheetDoc}
							examTaskDoc={examTaskDoc}
							examPhotos={examPhotos}
							personalDocs={personalDocs}
							allDocs={documents}
							selectedDoc={selectedDoc}
							onSelectDoc={(doc) => setSelectedDoc(doc)}
							onOpenModal={() => setIsViewerModalOpen(true)}
							onDeleteDoc={handleDeleteDoc}
						/>
					</div>
				</div>
			</div>

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

			<DossierDocumentModal
				isOpen={isViewerModalOpen}
				onClose={() => setIsViewerModalOpen(false)}
				documents={documents}
				activeDoc={selectedDoc}
				onSelectDoc={(doc) => setSelectedDoc(doc)}
				onDeleteDoc={handleDeleteDoc}
			/>

			<DeleteDossierModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				fullName={fullName || candidate.full_name || 'Специалист'}
				registrationNumber={fullRegistrationNumber}
				onConfirm={handleDeleteCandidate}
				deleting={deletingCandidate}
			/>

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
