import { DossierDocumentSlots } from '../../../widgets/dossier-viewer';
import { ConfirmDeleteDialog } from '../../status-change';
import { StatusBadge } from '../../../shared/ui';
import { useEditApplication } from '../model/useEditApplication';
import { AssessmentScheduleFields } from './AssessmentScheduleFields';
import { IssueCertificateForm } from './IssueCertificateForm';
import { PersonalContactFields } from './PersonalContactFields';
import { ProfessionProcedureFields } from './ProfessionProcedureFields';

interface EditApplicationModalProps {
	applicationId: number | null;
	isOpen: boolean;
	onClose: () => void;
	onSaved?: () => void;
	onDeleted?: () => void;
}



function formatAppDateTime(dateStr?: string): string {
	if (!dateStr) return '—';
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		return d.toLocaleString('ru-RU', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return dateStr;
	}
}

export function EditApplicationModal({
	applicationId,
	isOpen,
	onClose,
	onSaved,
	onDeleted,
}: EditApplicationModalProps) {
	const {
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
		handleSaveAppDetail,
		handleDeleteApplication,
		uploadFilesDirectly,
		handleDeleteDoc,
		handleIssueCertificate,
	} = useEditApplication({
		applicationId,
		isOpen,
		onSaved,
		onDeleted,
		onClose,
	});

	if (!isOpen || !applicationId) return null;

	return (
		<>
			<div className='fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'>
				<div className='bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100'>
					{/* Заголовок модального окна */}
					<div className='p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4'>
						<div>
							<div className='flex items-center gap-2 mb-1 flex-wrap'>
								<span className='text-[11px] uppercase font-bold text-slate-400'>
									Дело кандидата • {appDetail?.short_registration_number}
								</span>
								{appDetail && (
									<StatusBadge
										status={appDetail.status}
										label={appDetail.status_display}
										size='xs'
									/>
								)}
								{appDetail?.created_at && (
									<span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1'>
										<svg className='w-3 h-3 text-slate-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
										</svg>
										<span>Подано: {formatAppDateTime(appDetail.created_at)}</span>
									</span>
								)}
								{appDetail?.assigned_staff_name && (
									<span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1'>
										<span>👤 Ведёт: {appDetail.assigned_staff_name}</span>
									</span>
								)}
							</div>
							<h2 className='text-xl sm:text-2xl font-black text-slate-900'>
								{editAppFullName || appDetail?.full_name || 'Дело кандидата'}
							</h2>
						</div>
						<div className='flex items-center gap-2'>
							{appDetail?.status === 'submitted' && (
								<button
									type='button'
									onClick={handleTakeInWork}
									disabled={savingAppDetail}
									className='px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer animate-pulse hover:animate-none'
									title='Назначить себя ответственным и перевести дело на рассмотрение'
								>
									<span>⚡ Взять в работу</span>
								</button>
							)}
							{appDetail && (
								<button
									type='button'
									onClick={() => setShowDeleteConfirm(true)}
									className='px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer'
									title='Переместить заявку в архив'
								>
									<svg className='w-3.5 h-3.5 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
									</svg>
									<span className='hidden sm:inline'>Удалить заявку</span>
								</button>
							)}
							<button
								onClick={onClose}
								className='w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer'
							>
								✕
							</button>
						</div>
					</div>

					{/* Тело модалки */}
					<div className='p-6 overflow-y-auto space-y-6 flex-1'>
						{loadingDetail ? (
							<div className='py-16 text-center text-slate-400'>
								<div className='w-8 h-8 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-2' />
								Загрузка дела кандидата...
							</div>
						) : appDetail ? (
							<>
								{appSaveSuccessMsg && (
									<div className='p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between'>
										<span>✓ {appSaveSuccessMsg}</span>
										<button onClick={() => setAppSaveSuccessMsg(null)} className='text-emerald-700 hover:text-emerald-950'>
											✕
										</button>
									</div>
								)}

								<PersonalContactFields
									fullName={editAppFullName}
									setFullName={setEditAppFullName}
									citizenship={appCitizenship}
									setCitizenship={setAppCitizenship}
									inn={editAppInn}
									setInn={setEditAppInn}
									pinErrorMessage={editAppPinAnalysis.errorMessage}
									isPinValid={editAppPinAnalysis.isValid}
									isPinComplete={editAppPinAnalysis.isComplete}
									phone={editAppPhone}
									setPhone={setEditAppPhone}
									whatsapp={editAppWhatsapp}
									setWhatsapp={setEditAppWhatsapp}
									email={editAppEmail}
									setEmail={setEditAppEmail}
									address={editAppAddress}
									setAddress={setEditAppAddress}
								/>

								<ProfessionProcedureFields
									procedureType={editAppType}
									setProcedureType={setEditAppType}
									profession={editAppProfession}
									setProfession={setEditAppProfession}
									qualLevel={editAppQualLevel}
									setQualLevel={setEditAppQualLevel}
									expYears={editAppExpYears}
									setExpYears={setEditAppExpYears}
									certNumber={certNumber}
									setCertNumber={setCertNumber}
									expDesc={editAppExpDesc}
									setExpDesc={setEditAppExpDesc}
								/>

								<AssessmentScheduleFields
									status={editAppStatus}
									setStatus={setEditAppStatus}
									date={editAppDate}
									setDate={setEditAppDate}
									assessor={editAppAssessor}
									setAssessor={setEditAppAssessor}
									location={editAppLocation}
									setLocation={setEditAppLocation}
									notes={editAppNotes}
									setNotes={setEditAppNotes}
									onSave={handleSaveAppDetail}
									isSaving={savingAppDetail}
									candidateName={editAppFullName || appDetail.full_name}
									profession={editAppProfession || appDetail.profession}
									phone={editAppPhone || appDetail.phone}
									whatsapp={editAppWhatsapp || appDetail.whatsapp}
									regNumber={appDetail.short_registration_number || appDetail.registration_number}
									assignedStaffName={appDetail.assigned_staff_name}
									assignedStaffPhone={appDetail.assigned_staff_phone}
								/>

								{/* Документы дела */}
								<DossierDocumentSlots
									documents={appDetail.documents}
									uploadingDoc={uploadingDoc}
									onUploadFiles={uploadFilesDirectly}
									onDeleteDoc={handleDeleteDoc}
								/>

								{/* Выпуск сертификата */}
								<IssueCertificateForm
									certNumber={certNumber}
									setCertNumber={setCertNumber}
									certInn={certInn}
									setCertInn={setCertInn}
									onSubmit={handleIssueCertificate}
									isIssuing={issuingCert}
									issueResult={issueResult}
								/>
							</>
						) : null}
					</div>
				</div>
			</div>

			<ConfirmDeleteDialog
				isOpen={showDeleteConfirm}
				title='Удалить заявку кандидата?'
				description={
					<span>
						Заявка кандидата <b>«{appDetail?.full_name}»</b> (№ {appDetail?.short_registration_number}) будет перемещена в архив ЦНСВ и исключена из активных списков.
					</span>
				}
				isDeleting={isDeletingApp}
				onCancel={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeleteApplication}
			/>
		</>
	);
}
