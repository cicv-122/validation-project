import { useState } from 'react';
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
		handleRejectApplication,
		handleRestoreFromArchive,
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

	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectReason, setRejectReason] = useState('Не явился на экзамен');

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
										<svg className='w-3 h-3 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
										</svg>
										<span>Ведёт: {appDetail.assigned_staff_name}</span>
									</span>
								)}
							</div>
							<h2 className='text-xl sm:text-2xl font-black text-slate-900'>
								{editAppFullName || appDetail?.full_name || 'Дело кандидата'}
							</h2>
						</div>
						<div className='flex items-center gap-2'>
							{/* Взять в работу (для новых заявок) */}
							{appDetail?.status === 'submitted' && (
								<button
									type='button'
									onClick={handleTakeInWork}
									disabled={savingAppDetail}
									className='px-3.5 py-1.5 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer'
									title='Назначить себя ответственным и перевести дело на рассмотрение'
								>
									<svg className='w-3.5 h-3.5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
									</svg>
									<span>Взять в работу</span>
								</button>
							)}

							{/* Вернуть в работу (для архивных / не завершенных) */}
							{appDetail?.status === 'rejected' && (
								<button
									type='button'
									onClick={handleRestoreFromArchive}
									disabled={savingAppDetail}
									className='px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer'
									title='Вернуть дело кандидата на повторное рассмотрение или пересдачу'
								>
									<svg className='w-3.5 h-3.5 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
									</svg>
									<span>Вернуть в работу</span>
								</button>
							)}

							{/* В архив / Отказ (для активных дел в работе) */}
							{appDetail && appDetail.status !== 'rejected' && appDetail.status !== 'completed' && (
								<button
									type='button'
									onClick={() => setShowRejectModal(true)}
									className='px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer'
									title='Переместить кандидата в архив (не явился, отказ или на пересдачу)'
								>
									<svg className='w-3.5 h-3.5 text-slate-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
									</svg>
									<span className='hidden sm:inline'>В архив / Отказ</span>
								</button>
							)}

							{/* Удалить заявку */}
							{appDetail && (
								<button
									type='button'
									onClick={() => setShowDeleteConfirm(true)}
									className='px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer'
									title='Удалить заявку'
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

								{/* Выпуск сертификата (доступно только после взятия дела в работу и проведения экзамена) */}
								{appDetail.status !== 'submitted' && (
									<IssueCertificateForm
										certNumber={certNumber}
										setCertNumber={setCertNumber}
										certInn={certInn}
										setCertInn={setCertInn}
										onSubmit={handleIssueCertificate}
										isIssuing={issuingCert}
										issueResult={issueResult}
									/>
								)}
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

			{/* Модальное окно подтверждения перемещения в архив / отказа */}
			{showRejectModal && (
				<div className='fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs'>
					<div className='bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150'>
						<div className='flex items-center gap-3 mb-3'>
							<div className='w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold'>
								<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
								</svg>
							</div>
							<div>
								<h3 className='text-base font-bold text-slate-900'>
									В архив / Фиксация отказа
								</h3>
								<p className='text-xs text-slate-500'>
									Дело будет сохранено во вкладке «Архив / Не завершено»
								</p>
							</div>
						</div>
						<p className='text-xs text-slate-600 mb-3'>
							Все документы, анкета и ИНН кандидата сохраняются в базе. При повторном обращении вы сможете в 1 клик вернуть дело в работу.
						</p>
						<label className='block text-xs font-bold text-slate-700 mb-1'>
							Укажите причину:
						</label>
						<div className='relative mb-4'>
							<select
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								className='w-full pl-3 pr-9 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] appearance-none cursor-pointer'
							>
								<option value='Не явился на экзамен'>Не явился на квалификационный экзамен</option>
								<option value='Направлен на пересдачу'>Направлен на пересдачу (не сдал теорию/практику)</option>
								<option value='Отказ кандидата'>Отказ по инициативе заявителя</option>
								<option value='Не соответствует квалификационным требованиям'>Не соответствует квалификационным требованиям</option>
								<option value='Предоставлены неполные или недостоверные документы'>Предоставлены неполные или недостоверные документы</option>
							</select>
							<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400'>
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</div>
						</div>
						<div className='flex justify-end gap-2'>
							<button
								type='button'
								onClick={() => setShowRejectModal(false)}
								className='px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer'
							>
								Отмена
							</button>
							<button
								type='button'
								onClick={() => {
									setShowRejectModal(false);
									handleRejectApplication(rejectReason);
								}}
								className='px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer'
							>
								Переместить в архив
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
