// frontend/src/widgets/assessment-queue/ui/ApplicationsQueueTable.tsx
import React from 'react';
import type { StaffApplicationItem, StaffProfile } from '../../../api/staff';
import { StatusBadge } from '../../../shared/ui';

interface SubTabDef {
	id: string;
	label: string;
	statKey?: keyof StaffProfile['stats'];
}

const SUB_TABS_CONFIG: Record<string, SubTabDef[]> = {
	submitted: [
		{ id: 'online', label: 'С сайта (онлайн)', statKey: 'submitted_online' },
		{ id: 'in_person', label: 'Очный приём', statKey: 'submitted_in_person' },
	],
	under_review: [
		{ id: 'under_review_docs', label: 'Проверка документов', statKey: 'under_review_docs' },
		{ id: 'assessment_scheduled', label: 'Оценка назначена', statKey: 'scheduled' },
	],
	completed: [],
	rejected: [
		{ id: 'rejected_exam', label: 'Не сдали экзамен', statKey: 'rejected_exam' },
		{ id: 'rejected_cancelled', label: 'Отказ / Не вышли на связь', statKey: 'rejected_cancelled' },
	],
};

function formatAppDate(dateStr?: string): string {
	if (!dateStr) return '—';
	try {
		const d = new Date(dateStr);
		return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
	} catch {
		return dateStr;
	}
}

function formatAppTime(dateStr?: string): string {
	if (!dateStr) return '';
	try {
		const d = new Date(dateStr);
		return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
	} catch {
		return '';
	}
}

interface ApplicationsQueueTableProps {
	loading: boolean;
	applications: StaffApplicationItem[];
	profile: StaffProfile | null;
	activeAppStatus: string;
	activeSubStatus: string;
	appSearchQuery: string;
	onCreateInPerson?: () => void;
	onOpenApplication: (id: number) => void;
	onResetFilters: () => void;
	onSubStatusChange: (subStatus: string) => void;
	onSearchChange: (query: string) => void;
	onSearchSubmit: (e: React.FormEvent) => void;
}

export const ApplicationsQueueTable: React.FC<ApplicationsQueueTableProps> = ({
	loading,
	applications,
	profile,
	activeAppStatus,
	activeSubStatus,
	appSearchQuery,
	onCreateInPerson,
	onOpenApplication,
	onResetFilters,
	onSubStatusChange,
	onSearchChange,
	onSearchSubmit,
}) => {
	const subTabs = SUB_TABS_CONFIG[activeAppStatus] || SUB_TABS_CONFIG['submitted'];

	return (
		<div className="space-y-4">
			{/* Подвкладки конкретного выбранного этапа и поиск */}
			<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
				{subTabs.length > 0 ? (
					<div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
						{subTabs.map((tab) => {
							const count = tab.statKey ? (profile?.stats as any)?.[tab.statKey] : undefined;
							const isActive = activeSubStatus === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => onSubStatusChange(tab.id)}
									className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
										isActive
											? 'bg-[#283375] text-white shadow-xs'
											: 'text-slate-600 hover:bg-slate-100'
									}`}
								>
									<span>{tab.label}</span>
									{typeof count === 'number' && (
										<span
											className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
												isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
											}`}
										>
											{count}
										</span>
									)}
								</button>
							);
						})}
					</div>
				) : (
					<div className="text-xs font-bold text-slate-500 py-1">
						Реестр выданных сертификатов
					</div>
				)}

				<div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
					<form onSubmit={onSearchSubmit} className="w-full sm:w-72 flex items-center gap-2">
						<input
							type="text"
							value={appSearchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder="ФИО, ИНН, телефон или номер..."
							className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
						/>
						<button
							type="submit"
							className="px-3.5 py-2 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] transition-all flex-shrink-0 cursor-pointer"
						>
							Найти
						</button>
					</form>
					{onCreateInPerson && (
						<button
							type="button"
							onClick={onCreateInPerson}
							className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-shrink-0 shadow-xs cursor-pointer"
							title="Зарегистрировать кандидата, обратившегося лично в Центр"
						>
							<svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
							</svg>
							<span>Очный приём</span>
						</button>
					)}
				</div>
			</div>

			{/* Таблица кандидатов */}
			<div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
				{loading ? (
					<div className="py-16 text-center text-slate-400 text-sm">
						<div className="w-8 h-8 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-2" />
						Загрузка списка заявок...
					</div>
				) : applications.length === 0 ? (
					<div className="py-16 text-center text-slate-400 text-sm space-y-2">
						<div>В этом разделе пока нет заявок кандидатов.</div>
						{appSearchQuery ? (
							<button
								type="button"
								onClick={onResetFilters}
								className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
							>
								Очистить поисковый запрос «{appSearchQuery}»
							</button>
						) : activeSubStatus ? (
							<button
								type="button"
								onClick={onResetFilters}
								className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
							>
								Сбросить под-фильтр
							</button>
						) : null}
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
								<tr>
									<th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">№ Рег</th>
									<th className="py-3.5 px-4">Кандидат</th>
									<th className="py-3.5 px-4">Профессия</th>
									<th className="py-3.5 px-4 whitespace-nowrap">Тип</th>
									<th className="py-3.5 px-4 whitespace-nowrap text-center min-w-[150px]">Контакты</th>
									<th className="py-3.5 px-4 whitespace-nowrap">Дата подачи</th>
									<th className="py-3.5 px-4 whitespace-nowrap text-center min-w-[130px]">Статус</th>
									<th className="py-3.5 px-4 text-right whitespace-nowrap">Действие</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{applications.map((app) => {
									const rawPhone = app.phone || '';
									const rawWhatsapp = app.whatsapp || '';
									const cleanPhone = rawWhatsapp.replace(/[^0-9]/g, '') || rawPhone.replace(/[^0-9]/g, '');

									return (
										<tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
											<td className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">
												<div className="font-mono font-bold text-slate-900 text-xs">
													{app.short_registration_number}
												</div>
											</td>
											<td className="py-3.5 px-4">
												<div className="flex items-center gap-2 flex-wrap">
													<span className="font-bold text-slate-900 text-sm">{app.full_name}</span>
													{app.is_labor_migrant && (
														<span
															className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-md"
															title={`Трудовой мигрант: ${app.migration_country || 'Опыт за рубежом'}`}
														>
															✈️ Мигрант{app.migration_country ? ` • ${app.migration_country}` : ''}
														</span>
													)}
												</div>
												<div className="flex flex-wrap items-center gap-1.5 mt-1">
													{app.inn && (
														<span className="text-[11px] text-slate-400 font-mono mr-1">
															ИНН: {app.inn}
														</span>
													)}
													{app.assigned_staff_name ? (
														<span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#283375] bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded-md">
															<span className="w-1.5 h-1.5 rounded-full bg-[#283375]" />
															Ведёт: {app.assigned_staff_name}
														</span>
													) : (
														<span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
															<span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
															Куратор не назначен
														</span>
													)}
												</div>
											</td>
											<td className="py-3.5 px-4 font-medium text-slate-800">
												<div>{app.profession}</div>
												{app.qualification_level && (
													<span className="text-[10px] text-slate-400">
														{app.qualification_level}
													</span>
												)}
											</td>
											<td className="py-3.5 px-4">
												<span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
													{app.type_display}
												</span>
											</td>
											<td className="py-3.5 px-4 whitespace-nowrap text-center min-w-[150px]">
												<div className="font-medium text-slate-800 whitespace-nowrap font-mono">{rawPhone || '—'}</div>
												{cleanPhone && (
													<div className="mt-0.5 flex items-center justify-center">
														<a
															href={`https://wa.me/${cleanPhone}`}
															target="_blank"
															rel="noreferrer"
															className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center justify-center gap-1"
														>
															<span>WhatsApp</span>
														</a>
													</div>
												)}
											</td>
											<td className="py-3.5 px-4 whitespace-nowrap">
												<div className="font-bold text-slate-900 text-xs">
													{formatAppDate(app.created_at || app.submitted_at)}
												</div>
												<div className="text-[11px] text-slate-400 font-mono">
													{formatAppTime(app.created_at || app.submitted_at)}
												</div>
											</td>
											<td className="py-3.5 px-4 text-center whitespace-nowrap min-w-[130px]">
												<div className="flex items-center justify-center">
													<StatusBadge status={app.status} label={app.status_display} size="sm" />
												</div>
											</td>
											<td className="py-3.5 px-4 text-right">
												<button
													type="button"
													onClick={() => onOpenApplication(app.id)}
													className="px-3.5 py-1.5 rounded-xl bg-[#283375] text-white font-bold hover:bg-[#1e265c] transition-all text-xs cursor-pointer shadow-2xs"
												>
													Открыть дело
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}

				{/* Информационный подвал таблицы с счетчиками */}
				{!loading && applications.length > 0 && (
					<div className="p-3.5 px-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
						<div>
							Показано: <b className="text-slate-900">{applications.length}</b> {applications.length === 1 ? 'заявка' : applications.length < 5 ? 'заявки' : 'заявок'}
							{activeSubStatus && (
								<span className="ml-1 text-slate-500 font-semibold">
									(в фильтре «{subTabs.find((t) => t.id === activeSubStatus)?.label}»)
								</span>
							)}
							{appSearchQuery && (
								<span className="ml-1 text-slate-500 font-semibold">
									по запросу «<span className="text-slate-900 font-bold">{appSearchQuery}</span>»
								</span>
							)}
						</div>
						{(activeSubStatus || appSearchQuery) && (
							<button
								type="button"
								onClick={onResetFilters}
								className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
							>
								Сбросить фильтр
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
