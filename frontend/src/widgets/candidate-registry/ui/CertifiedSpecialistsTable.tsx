// frontend/src/widgets/candidate-registry/ui/CertifiedSpecialistsTable.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { StaffCertifiedUser, CertifiedClusterItem } from '../../../api/staff';
import { formatProfessionTitle } from '../../../entities/candidate';

interface CertifiedSpecialistsTableProps {
	loading: boolean;
	certifiedList: StaffCertifiedUser[];
	certifiedTotal: number;
	certifiedPage: number;
	onPageChange: (page: number) => void;
	onDeleteSpecialist: (item: StaffCertifiedUser) => void;
	candidateDossierState: (candidateId: number) => Record<string, unknown>;
	certifiedCluster: string;
	certifiedClustersList: CertifiedClusterItem[];
	certifiedHasInn: '' | 'true' | 'false';
	certifiedSearch: string;
	onResetCluster: () => void;
	onResetHasInn: () => void;
	onResetSearch: () => void;
}

function getInitials(name: string): string {
	if (!name) return 'ЦН';
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const CertifiedSpecialistsTable: React.FC<CertifiedSpecialistsTableProps> = ({
	loading,
	certifiedList,
	certifiedTotal,
	certifiedPage,
	onPageChange,
	onDeleteSpecialist,
	candidateDossierState,
	certifiedCluster,
	certifiedClustersList,
	certifiedHasInn,
	certifiedSearch,
	onResetCluster,
	onResetHasInn,
	onResetSearch,
}) => {
	const isInitialLoading = loading && certifiedList.length === 0;
	const isUpdating = loading && certifiedList.length > 0;

	const [jumpInput, setJumpInput] = useState('');

	const PAGE_SIZE = 20;
	const totalPages = Math.max(1, Math.ceil(certifiedTotal / PAGE_SIZE));
	const fromIndex = certifiedTotal === 0 ? 0 : (certifiedPage - 1) * PAGE_SIZE + 1;
	const toIndex = Math.min(certifiedPage * PAGE_SIZE, certifiedTotal);

	const handleJumpSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const target = parseInt(jumpInput.trim(), 10);
		if (!isNaN(target) && target >= 1 && target <= totalPages) {
			onPageChange(target);
			setJumpInput('');
		}
	};

	const getPaginationRange = () => {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		if (certifiedPage <= 4) {
			return [1, 2, 3, 4, 5, '...', totalPages];
		}
		if (certifiedPage >= totalPages - 3) {
			return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
		}
		return [1, '...', certifiedPage - 1, certifiedPage, certifiedPage + 1, '...', totalPages];
	};

	return (
		<div id="certified-specialists-table" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative min-h-[680px]">
			{/* Индикатор фонового обновления данных при смене фильтра/отрасли */}
			{isUpdating && (
				<div className="absolute top-0 inset-x-0 z-20 h-1 bg-slate-100 overflow-hidden">
					<div className="h-full bg-[#283375] animate-pulse w-full" />
				</div>
			)}

			{isInitialLoading ? (
				<div className="py-24 text-center text-slate-400 text-sm flex flex-col items-center justify-center min-h-[560px]">
					<div className="w-9 h-9 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mb-3" />
					<span className="font-medium">Загрузка базы специалистов...</span>
				</div>
			) : certifiedList.length === 0 ? (
				<div className="py-20 px-4 text-center max-w-lg mx-auto space-y-3 flex flex-col items-center justify-center min-h-[560px]">
					<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
						<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<div className="text-base font-bold text-slate-800">
						По вашему запросу специалисты не найдены
					</div>
					{certifiedCluster && (
						<div className="text-xs text-slate-500 leading-relaxed">
							{certifiedHasInn === 'true' && (
								<span>
									В отрасли <b>«{certifiedClustersList.find((c) => c.key === certifiedCluster)?.title || certifiedCluster}»</b> пока нет оцифрованных специалистов с подтверждённым ИНН (все специалисты этой отрасли находятся во вкладке «Без ИНН»).
								</span>
							)}
							{certifiedHasInn === 'false' && (
								<span>
									В отрасли <b>«{certifiedClustersList.find((c) => c.key === certifiedCluster)?.title || certifiedCluster}»</b> нет специалистов без ИНН.
								</span>
							)}
							{!certifiedHasInn && certifiedSearch && (
								<span>
									По поисковому запросу «<b>{certifiedSearch}</b>» в выбранной отрасли совпадений не обнаружено.
								</span>
							)}
						</div>
					)}
					<div className="flex flex-wrap items-center justify-center gap-2 pt-2">
						{certifiedHasInn && (
							<button
								type="button"
								onClick={onResetHasInn}
								className="px-3.5 py-2 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] transition-all cursor-pointer shadow-xs"
							>
								Показать всех специалистов {certifiedCluster ? `в этой отрасли (${certifiedClustersList.find((c) => c.key === certifiedCluster)?.count || ''})` : ''}
							</button>
						)}
						{certifiedCluster && (
							<button
								type="button"
								onClick={onResetCluster}
								className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
							>
								Сбросить отрасль
							</button>
						)}
						{certifiedSearch && (
							<button
								type="button"
								onClick={onResetSearch}
								className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
							>
								Очистить поиск
							</button>
						)}
					</div>
				</div>
			) : (
				<div className={`transition-opacity duration-150 ${isUpdating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
					<div className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:rounded-full">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
								<tr>
									<th className="py-3 px-2 w-10 text-center">Фото</th>
									<th className="py-3 px-2.5 whitespace-nowrap">Номер сертификата</th>
									<th className="py-3 px-2.5">ФИО специалиста</th>
									<th className="py-3 px-2 whitespace-nowrap">ИНН / ПИН</th>
									<th className="py-3 px-2.5">Присвоенная профессия</th>
									<th className="py-3 px-2 whitespace-nowrap">Дата выдачи</th>
									<th className="py-3 px-3 text-right whitespace-nowrap">Действие</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{certifiedList.map((item) => (
									<tr
										key={item.id}
										id={`candidate-row-${item.id}`}
										className="hover:bg-slate-50/80 transition-colors h-[58px]"
									>
										<td className="py-2 px-2 text-center">
											{item.image_url || item.image ? (
												<img
													src={item.image_url || item.image || ''}
													alt={item.full_name}
													className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs mx-auto"
												/>
											) : (
												<div className="w-8 h-8 rounded-lg bg-[#283375]/8 border border-[#283375]/15 flex items-center justify-center text-[#283375] font-extrabold text-[11px] mx-auto shadow-2xs">
													{getInitials(item.full_name)}
												</div>
											)}
										</td>
										<td className="py-2 px-2.5 whitespace-nowrap text-xs">
											{!item.registration_number || /^ЦС\s*№?\s*0+$/i.test(item.registration_number.trim()) ? (
												<span
													className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-semibold tracking-tight shadow-2xs"
													title="Номер бланка сертификата не был внесён в архивной ведомости. Нажмите «Редактировать дело», чтобы внести номер."
												>
													<span className="text-slate-400 font-bold">№</span> Не присвоен
												</span>
											) : (
												<span className="font-mono font-bold text-blue-900">
													{item.registration_number}
												</span>
											)}
										</td>
										<td className="py-2 px-2.5 font-bold text-slate-900 text-xs leading-snug">
											<Link
												to={`/staff/candidates/${item.id}`}
												state={candidateDossierState(item.id)}
												className="hover:text-[#283375] hover:underline transition-colors"
												title="Открыть электронное дело специалиста"
											>
												{item.full_name}
											</Link>
										</td>
										<td className="py-2 px-2 whitespace-nowrap font-mono">
											<Link
												to={`/staff/candidates/${item.id}`}
												state={candidateDossierState(item.id)}
												title={item.inn ? 'ИНН подтвержден (нажмите, чтобы открыть дело)' : 'ИНН не указан (нажмите, чтобы внести в деле)'}
												className="inline-block transition-transform hover:scale-105"
											>
												{item.inn ? (
													<span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
														<span className="text-emerald-600 font-black">✓</span>
														<span>{item.inn}</span>
													</span>
												) : (
													<span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs">
														<span className="text-amber-500 font-black">⚠</span>
														<span>Не указан</span>
													</span>
												)}
											</Link>
										</td>
										<td className="py-2 px-2.5 font-medium text-slate-700 text-xs">
											<div className="line-clamp-2 leading-tight" title={item.profession}>
												{formatProfessionTitle(item.profession)}
											</div>
										</td>
										<td className="py-2 px-2 text-slate-500 whitespace-nowrap text-[11px]">
											{item.issued_date || '—'}
										</td>
										<td className="py-2 px-3 text-right whitespace-nowrap">
											<div className="flex items-center justify-end gap-1.5">
												<Link
													to={`/staff/candidates/${item.id}`}
													state={candidateDossierState(item.id)}
													className="px-2.5 py-1.5 rounded-lg bg-[#283375] text-white font-bold hover:bg-[#1e265c] transition-all text-xs inline-flex items-center gap-1 shadow-2xs cursor-pointer"
													title="Редактировать дело специалиста"
												>
													<svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
													<span className="hidden xl:inline">Редактировать дело</span>
													<span className="xl:hidden">Дело</span>
												</Link>
												<button
													type="button"
													onClick={() => onDeleteSpecialist(item)}
													className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
													title="Удалить специалиста из реестра"
												>
													<svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Пагинация */}
					<div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
						<div className="text-slate-500 font-medium">
							Показано <strong className="text-slate-800 font-bold">{fromIndex}–{toIndex}</strong> из{' '}
							<strong className="text-slate-800 font-bold">{certifiedTotal}</strong> специалистов
							{totalPages > 1 && (
								<span className="text-slate-400 ml-1.5 font-normal">
									(Всего {totalPages} {totalPages === 1 ? 'страница' : (totalPages < 5 ? 'страницы' : 'страниц')})
								</span>
							)}
						</div>

						<div className="flex flex-wrap items-center justify-center gap-1.5">
							{/* В начало */}
							<button
								type="button"
								disabled={certifiedPage <= 1}
								onClick={() => onPageChange(1)}
								title="В начало (первая страница)"
								className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
							>
								«
							</button>

							{/* Предыдущая */}
							<button
								type="button"
								disabled={certifiedPage <= 1}
								onClick={() => onPageChange(certifiedPage - 1)}
								title="Предыдущая страница"
								className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
							>
								← Назад
							</button>

							{/* Номера страниц (на экранах от sm) */}
							<div className="hidden sm:flex items-center gap-1">
								{getPaginationRange().map((p, idx) =>
									p === '...' ? (
										<span key={`dots-${idx}`} className="px-1.5 py-1 text-slate-400 font-bold select-none">
											…
										</span>
									) : (
										<button
											type="button"
											key={p}
											onClick={() => onPageChange(p as number)}
											className={`min-w-8 h-8 px-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
												certifiedPage === p
													? 'bg-[#283375] text-white shadow-2xs'
													: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
											}`}
										>
											{p}
										</button>
									)
								)}
							</div>

							{/* Мобильный компактный индикатор */}
							<div className="sm:hidden px-2 font-bold text-slate-700">
								{certifiedPage} / {totalPages}
							</div>

							{/* Следующая */}
							<button
								type="button"
								disabled={certifiedPage >= totalPages || certifiedList.length < PAGE_SIZE}
								onClick={() => onPageChange(certifiedPage + 1)}
								title="Следующая страница"
								className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
							>
								Вперед →
							</button>

							{/* В конец */}
							<button
								type="button"
								disabled={certifiedPage >= totalPages || certifiedList.length < PAGE_SIZE}
								onClick={() => onPageChange(totalPages)}
								title={`В конец (страница ${totalPages})`}
								className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
							>
								»
							</button>

							{/* Быстрый переход по номеру */}
							{totalPages > 3 && (
								<form onSubmit={handleJumpSubmit} className="hidden lg:flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
									<span className="text-[11px] text-slate-500 font-medium">Стр:</span>
									<input
										type="number"
										min={1}
										max={totalPages}
										value={jumpInput}
										onChange={(e) => setJumpInput(e.target.value)}
										placeholder={String(certifiedPage)}
										className="w-12 px-1.5 py-1 text-center font-bold text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-[#283375] focus:outline-none"
									/>
									<button
										type="submit"
										disabled={!jumpInput}
										className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#283375] text-slate-700 hover:text-white font-bold text-[11px] disabled:opacity-40 transition-colors cursor-pointer"
									>
										Перейти
									</button>
								</form>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
