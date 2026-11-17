import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentCenterExpert } from '../../../types';

export interface AssessmentCenterProfessionsTableProps {
	experts?: AssessmentCenterExpert[];
}

function getInitials(name: string): string {
	if (!name) return 'ЦН';
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const AssessmentCenterProfessionsTable: React.FC<AssessmentCenterProfessionsTableProps> = ({
	experts,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-6'>
			<div className='flex items-center justify-between gap-3 border-b border-slate-100 pb-4'>
				<div>
					<h2 className='text-lg sm:text-xl font-black text-slate-900 tracking-tight'>
						{t('Сертифицируемые направления и эксперты')}
					</h2>
					<p className='text-xs text-slate-500 mt-0.5'>
						{t('Официальные профессии для сдачи квалификационных экзаменов и закреплённый состав экспертной комиссии')}
					</p>
				</div>
				{experts && experts.length > 0 && (
					<span className='px-3 py-1 rounded-full text-xs font-bold bg-[#283375]/10 text-[#283375] border border-[#283375]/20 flex-shrink-0'>
						{experts.length} {t('направл.')}
					</span>
				)}
			</div>

			{experts && experts.length > 0 ? (
				<div className='space-y-5'>
					{experts.map((exp) => {
						const hasStructuredExperts = exp.experts_detail && exp.experts_detail.length > 0;

						return (
							<div
								key={exp.id || exp.profession}
								className='rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#283375]/30 hover:shadow-md transition-all p-5 sm:p-6 space-y-4'
							>
								{/* Шапка сертифицируемой профессии */}
								<div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3.5'>
									<div className='flex items-center gap-3'>
										<div className='w-10 h-10 rounded-xl bg-[#283375] text-white flex items-center justify-center shadow-xs flex-shrink-0'>
											<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
												/>
											</svg>
										</div>
										<div>
											<span className='text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block'>
												{t('Сертифицируемая профессия')}
											</span>
											<h3 className='text-base sm:text-lg font-black text-slate-900 leading-snug'>
												{exp.profession}
											</h3>
										</div>
									</div>

									<span className='px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5'>
										<span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
										<span>
											{hasStructuredExperts
												? `${exp.experts_detail!.length} ${t('аттестованных эксперта')}`
												: t('Комиссия утверждена')}
										</span>
									</span>
								</div>

								{/* Структурированный список экспертов */}
								{hasStructuredExperts ? (
									<div className='space-y-2.5 pt-1'>
										<div className='text-xs font-bold uppercase tracking-wider text-slate-500'>
											{t('Аттестованная экспертная комиссия')}:
										</div>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
											{exp.experts_detail!.map((person) => (
												<div
													key={person.id || person.name}
													className='p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs hover:border-[#283375]/40 transition-colors'
												>
													<div className='w-9 h-9 rounded-xl bg-[#283375] text-white text-xs font-black flex items-center justify-center flex-shrink-0 shadow-2xs'>
														{getInitials(person.name)}
													</div>
													<div className='min-w-0 flex-1'>
														<div className='font-bold text-xs sm:text-sm text-slate-900 truncate' title={person.name}>
															{person.name}
														</div>
														<div className='flex items-center gap-1.5 flex-wrap mt-1'>
															<span className='px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 text-[#283375] border border-blue-200'>
																{person.role_ru || t('Оценщик')}
															</span>
															{person.city_ru && (
																<span className='text-[10px] font-medium text-slate-400'>
																	• {person.city_ru}
																</span>
															)}
														</div>
														{person.organization && (
															<div className='text-[11px] text-slate-500 mt-1 line-clamp-1' title={person.organization}>
																{person.organization}
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									/* Резервное отображение для текстовых полей */
									<div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
										{exp.appraisers && (
											<div className='p-3 rounded-xl bg-white border border-slate-200'>
												<span className='text-[10px] font-bold uppercase text-slate-400 block mb-1'>
													{t('Оценщики')}
												</span>
												<span className='text-xs font-semibold text-slate-800 leading-relaxed block'>
													{exp.appraisers}
												</span>
											</div>
										)}
										{exp.appraiser_employer && (
											<div className='p-3 rounded-xl bg-white border border-slate-200'>
												<span className='text-[10px] font-bold uppercase text-slate-400 block mb-1'>
													{t('Оценщик от работодателя')}
												</span>
												<span className='text-xs font-semibold text-slate-800 leading-relaxed block'>
													{exp.appraiser_employer}
												</span>
											</div>
										)}
										{exp.consultant && (
											<div className='p-3 rounded-xl bg-white border border-slate-200'>
												<span className='text-[10px] font-bold uppercase text-slate-400 block mb-1'>
													{t('Консультант')}
												</span>
												<span className='text-xs font-semibold text-slate-800 leading-relaxed block'>
													{exp.consultant}
												</span>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className='py-10 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2'>
					<div className='w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto'>
						<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
						</svg>
					</div>
					<div className='text-sm font-bold text-slate-700'>
						{t('Информация о направлениях сертификации обновляется')}
					</div>
					<p className='text-xs text-slate-400 max-w-md mx-auto'>
						{t('В настоящее время формируется реестр сертифицируемых профессий и состав экспертной комиссии для данного центра оценки.')}
					</p>
				</div>
			)}
		</div>
	);
};
