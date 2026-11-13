// frontend/src/widgets/assessment-queue/ui/ApplicationsQueueTable.tsx
import React from 'react';
import type { StaffApplicationItem, StaffProfile } from '../../../api/staff';
import { StatusBadge } from '../../../shared/ui';

const APPLICATION_STATUS_TABS = [
	{ id: '', label: 'Все заявки', statKey: 'total' },
	{ id: 'submitted', label: 'Новые', statKey: 'submitted' },
	{ id: 'under_review', label: 'На рассмотрении', statKey: 'under_review' },
	{ id: 'completed', label: 'Выдано', statKey: 'completed' },
];



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
	appSearchQuery: string;
	onOpenApplication: (id: number) => void;
	onResetFilters: () => void;
	onStatusChange: (status: string) => void;
	onSearchChange: (query: string) => void;
	onSearchSubmit: (e: React.FormEvent) => void;
}

export const ApplicationsQueueTable: React.FC<ApplicationsQueueTableProps> = ({
	loading,
	applications,
	profile,
	activeAppStatus,
	appSearchQuery,
	onOpenApplication,
	onResetFilters,
	onStatusChange,
	onSearchChange,
	onSearchSubmit,
}) => {
	return (
		<div className="space-y-4">
			{/* Фильтры-табы с бейджами и поиск */}
			<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
				<div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
					{APPLICATION_STATUS_TABS.map((tab) => {
						const count = tab.statKey ? (profile?.stats as any)?.[tab.statKey] : profile?.stats.total;
						const isActive = activeAppStatus === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => onStatusChange(tab.id)}
								className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
									isActive
										? 'bg-[#283375] text-white shadow-xs'
										: 'text-slate-600 hover:bg-slate-100'
								}`}
							>
								<span>{tab.label}</span>
								<span
									className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
										isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
									}`}
								>
									{count ?? 0}
								</span>
							</button>
						);
					})}
				</div>

				<form onSubmit={onSearchSubmit} className="w-full md:w-80 flex items-center gap-2">
					<input
						type="text"
						value={appSearchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="ФИО, ИНН, телефон или номер..."
						className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
					/>
					<button
						type="submit"
						className="px-4 py-2 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] transition-all flex-shrink-0 cursor-pointer"
					>
						Найти
					</button>
				</form>
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
						{activeAppStatus && (
							<button
								type="button"
								onClick={onResetFilters}
								className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
							>
								Показать все заявки ({profile?.stats.total || 0})
							</button>
						)}
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
									<th className="py-3.5 px-4 whitespace-nowrap">Контакты</th>
									<th className="py-3.5 px-4 whitespace-nowrap">Дата подачи</th>
									<th className="py-3.5 px-4 whitespace-nowrap">Статус</th>
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
											<td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
												<div className="font-mono font-bold text-slate-900 text-xs">
													{app.short_registration_number}
												</div>
												{app.certificate_number_issued && (
													<span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono font-bold text-[10px] whitespace-nowrap">
														{app.certificate_number_issued}
													</span>
												)}
											</td>
											<td className="py-3.5 px-4">
												<div className="font-bold text-slate-900 text-sm">{app.full_name}</div>
												{app.inn && (
													<span className="text-[11px] text-slate-400 font-mono">
														ИНН: {app.inn}
													</span>
												)}
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
											<td className="py-3.5 px-4">
												<div className="font-medium text-slate-800">{rawPhone || '—'}</div>
												{cleanPhone && (
													<a
														href={`https://wa.me/${cleanPhone}`}
														target="_blank"
														rel="noreferrer"
														className="text-[10px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
													>
														<span>WhatsApp</span>
													</a>
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
											<td className="py-3.5 px-4">
												<StatusBadge status={app.status} label={app.status_display} size="sm" />
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
							{activeAppStatus && (
								<span className="ml-1 text-slate-500 font-semibold">
									(в статусе «{APPLICATION_STATUS_TABS.find((t) => t.id === activeAppStatus)?.label}»)
								</span>
							)}
							{appSearchQuery && (
								<span className="ml-1 text-slate-500 font-semibold">
									по запросу «<span className="text-slate-900 font-bold">{appSearchQuery}</span>»
								</span>
							)}
						</div>
						{(activeAppStatus || appSearchQuery) && (
							<button
								type="button"
								onClick={onResetFilters}
								className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
							>
								Сбросить фильтр и показать все ({profile?.stats.total || 0})
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};
