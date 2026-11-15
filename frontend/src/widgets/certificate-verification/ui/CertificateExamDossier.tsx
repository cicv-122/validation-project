import { useTranslation } from 'react-i18next';
import type {
	AssessmentDetails,
	AssessmentEvidenceDoc,
	AssessmentPhotoItem,
} from '../../../types';
import type { CertificateMediaPreview } from './CertificateMediaModal';

interface CertificateExamDossierProps {
	assessmentDetails: AssessmentDetails;
	issuedDate?: string | null;
	registrationNumber: string;
	onPreviewDoc: (preview: CertificateMediaPreview) => void;
}

export function CertificateExamDossier({
	assessmentDetails,
	issuedDate,
	registrationNumber,
	onPreviewDoc,
}: CertificateExamDossierProps) {
	const { t, i18n } = useTranslation();

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return '—';
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString(
				i18n.language === 'en' ? 'en-US' : i18n.language === 'ky' ? 'ky-KG' : 'ru-RU',
				{ day: 'numeric', month: 'long', year: 'numeric' }
			);
		} catch {
			return dateStr;
		}
	};

	const evalSheetDoc = assessmentDetails.evaluation_documents?.find(
		(d: AssessmentEvidenceDoc) => d.doc_type === 'evaluation_sheet'
	);
	const examTaskDoc = assessmentDetails.evaluation_documents?.find(
		(d: AssessmentEvidenceDoc) => d.doc_type === 'exam_task'
	);
	const examProtocolDoc = assessmentDetails.evaluation_documents?.find(
		(d: AssessmentEvidenceDoc) => d.doc_type === 'exam_protocol'
	);

	return (
		<div className='space-y-6'>
			{/* Сведения об экзамене */}
			<div className='p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-4'>
				<div className='flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3'>
					<div className='flex items-center gap-2.5'>
						<div className='w-8 h-8 rounded-lg bg-[#283375] text-white flex items-center justify-center flex-shrink-0'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
							</svg>
						</div>
						<div>
							<h3 className='text-sm sm:text-base font-black text-slate-900'>
								{t('Сведения о квалификационном экзамене')}
							</h3>
							<p className='text-[11px] text-slate-500'>
								{t('Результаты подтверждения профессиональной компетентности')}
							</p>
						</div>
					</div>

					{assessmentDetails.application_type_display && (
						<span className='text-xs font-bold px-3 py-1 bg-blue-100 text-[#283375] rounded-full border border-blue-200'>
							{t(assessmentDetails.application_type_display)}
						</span>
					)}
				</div>

				{/* Место, Дата, Комиссия, Куратор */}
				<div className={`grid grid-cols-1 ${assessmentDetails.verified_by_staff_name ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3`}>
					<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
						<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
							<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
							</svg>
							<span>{t('Место проведения оценки')}</span>
						</div>
						<div className='text-xs font-semibold text-slate-900 leading-snug'>
							{t(assessmentDetails.scheduled_location || 'Государственная аттестационная площадка ЦНСВ МП КР')}
						</div>
					</div>

					<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
						<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
							<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
							</svg>
							<span>{t('Дата проведения')}</span>
						</div>
						<div className='text-xs font-semibold text-slate-900'>
							{formatDate(assessmentDetails.scheduled_date || issuedDate)}
						</div>
					</div>

					<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
						<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
							<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
							</svg>
							<span>{t('Экзаменационная комиссия')}</span>
						</div>
						<div className='text-xs font-semibold text-slate-900'>
							{t(assessmentDetails.assessor_name || 'Отраслевая квалификационная комиссия ЦНСВ при МП КР')}
						</div>
					</div>

					{assessmentDetails.verified_by_staff_name && (
						<div className='bg-white p-3.5 rounded-xl border border-slate-200'>
							<div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1'>
								<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
								</svg>
								<span>{t('Дело оформил')}</span>
							</div>
							<div className='text-xs font-semibold text-slate-900 truncate' title={assessmentDetails.verified_by_staff_name}>
								{assessmentDetails.verified_by_staff_name}
							</div>
							<div className='text-[10px] text-slate-400 mt-0.5'>
								{t('Специалист ЦНСВ')}
							</div>
						</div>
					)}
				</div>

				{/* Решение комиссии */}
				<div className='p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2.5'>
					<span className='w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0'>
						✓
					</span>
					<span>
						<b>{t('Решение квалификационной комиссии:')}</b>{' '}
						{t(
							'Теоретический и практический квалификационный экзамен сдан успешно. Навыки кандидата полностью соответствуют профессиональному стандарту.'
						)}
					</span>
				</div>
			</div>

			{/* Электронное дело и документы */}
			<div className='space-y-3 pt-1'>
				<div>
					<h4 className='text-xs font-extrabold uppercase tracking-wider text-slate-700'>
						{t('Электронное дело и подтверждающие документы')}
					</h4>
					<p className='text-[11px] text-slate-500'>
						{t('Официальные акты, экзаменационные материалы и материалы дела')}
					</p>
				</div>

				<div className='divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs'>
					{/* 1. Оценочный лист */}
					<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
						<div className='flex items-center gap-3.5 min-w-0'>
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
									evalSheetDoc
										? 'bg-blue-50 text-[#283375] border-blue-200'
										: 'bg-slate-50 text-slate-400 border-slate-200'
								}`}
							>
								<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
								</svg>
							</div>
							<div className='min-w-0'>
								<div className='text-xs font-bold text-slate-900'>
									{t('Оценочный лист квалификационного экзамена')}
								</div>
								<div className='text-[11px] text-slate-500 line-clamp-1'>
									{evalSheetDoc
										? evalSheetDoc.description ||
										  t('Официальная ведомость баллов по теории, ТБ и практическим заданиям')
										: t(
												'Оригинал бумажного акта с подписями находится на хранении в Центральном госархиве ЦНСВ МП КР (г. Бишкек)'
										  )}
								</div>
							</div>
						</div>

						<div className='flex-shrink-0'>
							{evalSheetDoc ? (
								<button
									type='button'
									onClick={() =>
										onPreviewDoc({
											url: evalSheetDoc.file_url,
											title:
												evalSheetDoc.doc_type_display ||
												t('Оценочный лист квалификационного экзамена'),
											isPdf: /\.pdf$/i.test(evalSheetDoc.file_url),
										})
									}
									className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
								>
									<span>{t('Просмотреть скан')}</span>
									<span>↗</span>
								</button>
							) : (
								<span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold'>
									<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' />
									</svg>
									<span>{t('В архиве ЦНСВ')}</span>
								</span>
							)}
						</div>
					</div>

					{/* 2. Экзаменационный билет / задания */}
					<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
						<div className='flex items-center gap-3.5 min-w-0'>
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
									examTaskDoc
										? 'bg-blue-50 text-[#283375] border-blue-200'
										: 'bg-slate-50 text-slate-400 border-slate-200'
								}`}
							>
								<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
								</svg>
							</div>
							<div className='min-w-0'>
								<div className='text-xs font-bold text-slate-900'>
									{t('Экзаменационный билет и практические задания')}
								</div>
								<div className='text-[11px] text-slate-500 line-clamp-1'>
									{examTaskDoc
										? examTaskDoc.description ||
										  t('Экзаменационные тесты и технические задания с ответами кандидата')
										: t(
												'Экзаменационные материалы на хранении в Центральном государственном архиве ЦНСВ МП КР (г. Бишкек)'
										  )}
								</div>
							</div>
						</div>

						<div className='flex-shrink-0'>
							{examTaskDoc ? (
								<button
									type='button'
									onClick={() =>
										onPreviewDoc({
											url: examTaskDoc.file_url,
											title:
												examTaskDoc.doc_type_display ||
												t('Экзаменационный билет и практические задания'),
											isPdf: /\.pdf$/i.test(examTaskDoc.file_url),
										})
									}
									className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
								>
									<span>{t('Просмотреть задания')}</span>
									<span>↗</span>
								</button>
							) : (
								<span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold'>
									<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' />
									</svg>
									<span>{t('В архиве ЦНСВ')}</span>
								</span>
							)}
						</div>
					</div>

					{/* 3. Протокол комиссии */}
					<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
						<div className='flex items-center gap-3.5 min-w-0'>
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
									examProtocolDoc
										? 'bg-blue-50 text-[#283375] border-blue-200'
										: 'bg-slate-50 text-slate-400 border-slate-200'
								}`}
							>
								<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
								</svg>
							</div>
							<div className='min-w-0'>
								<div className='text-xs font-bold text-slate-900'>
									{t('Протокол квалификационной комиссии')}
								</div>
								<div className='text-[11px] text-slate-500 line-clamp-1'>
									{examProtocolDoc
										? examProtocolDoc.description ||
										  t('Итоговый протокол заседания комиссии с решением о подтверждении квалификации')
										: t(
												'Оригинал протокола заседания комиссии на хранении в Центральном госархиве ЦНСВ МП КР (г. Бишкек)'
										  )}
								</div>
							</div>
						</div>

						<div className='flex-shrink-0'>
							{examProtocolDoc ? (
								<button
									type='button'
									onClick={() =>
										onPreviewDoc({
											url: examProtocolDoc.file_url,
											title:
												examProtocolDoc.doc_type_display ||
												t('Протокол квалификационной комиссии'),
											isPdf: /\.pdf$/i.test(examProtocolDoc.file_url),
										})
									}
									className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
								>
									<span>{t('Просмотреть протокол')}</span>
									<span>↗</span>
								</button>
							) : (
								<span className='inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold'>
									<svg className='w-3.5 h-3.5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' />
									</svg>
									<span>{t('В архиве ЦНСВ')}</span>
								</span>
							)}
						</div>
					</div>

					{/* 4. Скан сертификата строгой отчетности */}
					{assessmentDetails.certificate_scan_url && (
						<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
							<div className='flex items-center gap-3.5 min-w-0'>
								<div className='w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center flex-shrink-0'>
									<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
									</svg>
								</div>
								<div className='min-w-0'>
									<div className='text-xs font-bold text-slate-900'>
										{t('Оригинал бумажного сертификата строгой отчетности')}
									</div>
									<div className='text-[11px] text-slate-500 line-clamp-1'>
										{t('Скан выданного государственного бланка с гербовой печатью и подписью руководства')}
									</div>
								</div>
							</div>

							<button
								type='button'
								onClick={() =>
									onPreviewDoc({
										url: assessmentDetails.certificate_scan_url!,
										title: `${t('Оригинал бумажного сертификата строгой отчетности')} ${registrationNumber}`,
										isPdf: /\.pdf$/i.test(assessmentDetails.certificate_scan_url!),
									})
								}
								className='w-full sm:w-auto px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
							>
								<span>{t('Просмотреть оригинал сертификата')}</span>
								<span>↗</span>
							</button>
						</div>
					)}

					{/* 5. Фотофиксация квалификационного экзамена */}
					{assessmentDetails.exam_photos && assessmentDetails.exam_photos.length > 0 && (
						<div className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'>
							<div className='flex items-center gap-3.5 min-w-0'>
								<div className='w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0'>
									<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
									</svg>
								</div>
								<div className='min-w-0'>
									<div className='text-xs font-bold text-slate-900'>
										{t('Фотофиксация квалификационного экзамена')} ({assessmentDetails.exam_photos.length}{' '}
										{t('фото')})
									</div>
									<div className='text-[11px] text-slate-500 line-clamp-1'>
										{t('Снимки с места проведения: подтверждение выполнения практических заданий')}
									</div>
								</div>
							</div>

							<div className='flex items-center gap-2.5 flex-shrink-0'>
								<div className='flex items-center -space-x-2 mr-1'>
									{assessmentDetails.exam_photos.slice(0, 4).map((p: AssessmentPhotoItem, idx: number) => (
										<img
											key={idx}
											src={p.file_url}
											alt=''
											onClick={() =>
												onPreviewDoc({
													url: p.file_url,
													title: `${t('Фотофиксация квалификационного экзамена')} (${idx + 1} / ${assessmentDetails.exam_photos!.length})`,
													photos: assessmentDetails.exam_photos!,
													currentIndex: idx,
												})
											}
											title={`${t('Открыть фото')} ${idx + 1}`}
											className='w-9 h-9 rounded-lg object-cover border-2 border-white shadow-2xs hover:scale-110 hover:z-10 transition-transform cursor-pointer'
										/>
									))}
								</div>
								<button
									type='button'
									onClick={() =>
										onPreviewDoc({
											url: assessmentDetails.exam_photos![0].file_url,
											title: `${t('Фотофиксация квалификационного экзамена')} (1 / ${assessmentDetails.exam_photos!.length})`,
											photos: assessmentDetails.exam_photos!,
											currentIndex: 0,
										})
									}
									className='w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer'
								>
									<span>
										{t('Смотреть фотографии')} ({assessmentDetails.exam_photos.length})
									</span>
									<span>↗</span>
								</button>
							</div>
						</div>
					)}

					{/* 6. Личные документы кандидата */}
					{assessmentDetails.candidate_documents &&
						assessmentDetails.candidate_documents.map((doc: AssessmentEvidenceDoc) => {
							const isImg = /\.(jpe?g|png|webp|gif)$/i.test(doc.file_url);
							const isPdf = /\.pdf$/i.test(doc.file_url);
							return (
								<div
									key={doc.id}
									className='p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors'
								>
									<div className='flex items-center gap-3.5 min-w-0'>
										<div className='w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center flex-shrink-0'>
											<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
											</svg>
										</div>
										<div className='min-w-0'>
											<div className='text-xs font-bold text-slate-900'>
												{doc.doc_type_display}
											</div>
											<div className='text-[11px] text-slate-500 line-clamp-1'>
												{doc.description || t('Личный документ из дела кандидата')}
											</div>
										</div>
									</div>

									<button
										type='button'
										onClick={() => {
											if (isImg || isPdf) {
												onPreviewDoc({
													url: doc.file_url,
													title: doc.doc_type_display,
													isPdf,
												});
											} else {
												window.open(doc.file_url, '_blank');
											}
										}}
										className='w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#283375] text-slate-700 hover:text-white text-xs font-bold transition-all border border-slate-200 hover:border-transparent flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer'
									>
										<span>{t('Просмотреть документ')}</span>
										<span>↗</span>
									</button>
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
}
