// frontend/src/widgets/candidate-registry/ui/CertifiedSpecialistsTable.tsx
import React from 'react';
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
	return (
		<div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
			{loading ? (
				<div className="py-20 text-center text-slate-400 text-sm">
					<div className="w-8 h-8 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-2" />
					Загрузка базы специалистов...
				</div>
			) : certifiedList.length === 0 ? (
				<div className="py-16 px-4 text-center max-w-lg mx-auto space-y-3">
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
				<>
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
								<tr>
									<th className="py-3.5 px-4 w-12 text-center">Фото</th>
									<th className="py-3.5 px-4 whitespace-nowrap">Номер сертификата</th>
									<th className="py-3.5 px-4">ФИО специалиста</th>
									<th className="py-3.5 px-4 whitespace-nowrap">ИНН / ПИН</th>
									<th className="py-3.5 px-4">Присвоенная профессия</th>
									<th className="py-3.5 px-4 whitespace-nowrap">Дата выдачи</th>
									<th className="py-3.5 px-4 text-right whitespace-nowrap">Действие</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{certifiedList.map((item) => (
									<tr
										key={item.id}
										id={`candidate-row-${item.id}`}
										className="hover:bg-slate-50/80 transition-all duration-300"
									>
										<td className="py-3.5 px-4 text-center">
											{item.image_url || item.image ? (
												<img
													src={item.image_url || item.image || ''}
													alt={item.full_name}
													className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs mx-auto"
												/>
											) : (
												<div className="w-10 h-10 rounded-xl bg-[#283375]/8 border border-[#283375]/15 flex items-center justify-center text-[#283375] font-extrabold text-xs mx-auto shadow-2xs">
													{getInitials(item.full_name)}
												</div>
											)}
										</td>
										<td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
											{item.registration_number}
										</td>
										<td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
											<Link
												to={`/staff/candidates/${item.id}`}
												state={candidateDossierState(item.id)}
												className="hover:text-[#283375] hover:underline transition-colors"
												title="Открыть электронное дело специалиста"
											>
												{item.full_name}
											</Link>
										</td>
										<td className="py-3.5 px-4 whitespace-nowrap font-mono">
											<Link
												to={`/staff/candidates/${item.id}`}
												state={candidateDossierState(item.id)}
												title={item.inn ? 'ИНН подтвержден (нажмите, чтобы открыть дело)' : 'ИНН не указан (нажмите, чтобы внести в деле)'}
												className="inline-block transition-transform hover:scale-105"
											>
												{item.inn ? (
													<span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
														<span className="text-emerald-600 font-black">✓</span>
														<span>{item.inn}</span>
													</span>
												) : (
													<span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
														<span className="text-amber-500 font-black">⚠</span>
														<span>Не указан</span>
													</span>
												)}
											</Link>
										</td>
										<td className="py-3.5 px-4 font-medium text-slate-700">
											{formatProfessionTitle(item.profession)}
										</td>
										<td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
											{item.issued_date || '—'}
										</td>
										<td className="py-3.5 px-4 text-right">
											<div className="flex items-center justify-end gap-2">
												<Link
													to={`/staff/candidates/${item.id}`}
													state={candidateDossierState(item.id)}
													className="px-3.5 py-1.5 rounded-xl bg-[#283375] text-white font-bold hover:bg-[#1e265c] transition-all text-xs inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
												>
													<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
													<span>Редактировать дело</span>
												</Link>
												<button
													type="button"
													onClick={() => onDeleteSpecialist(item)}
													className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
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
					<div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
						<span className="text-slate-500">
							Показано {certifiedList.length} из {certifiedTotal} специалистов
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								disabled={certifiedPage <= 1}
								onClick={() => onPageChange(certifiedPage - 1)}
								className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
							>
								← Назад
							</button>
							<span className="font-bold text-slate-700 px-2">
								Страница {certifiedPage}
							</span>
							<button
								type="button"
								disabled={certifiedList.length < 20}
								onClick={() => onPageChange(certifiedPage + 1)}
								className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
							>
								Вперед →
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
