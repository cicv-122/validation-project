// frontend/src/features/candidate-filter/ui/MinistryReportModal.tsx
import React from 'react';
import type { StaffProfile, StaffApplicationItem } from '../../../api/staff';

interface MinistryReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	profile: StaffProfile | null;
	applications: StaffApplicationItem[];
}

export const MinistryReportModal: React.FC<MinistryReportModalProps> = ({
	isOpen,
	onClose,
	profile,
	applications,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
			<div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:max-w-none print:max-h-none print:border-none print:rounded-none">
				{/* Шапка отчета */}
				<div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 print:bg-transparent print:border-b-2 print:border-slate-800">
					<div className="space-y-1">
						<div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
							Кыргыз Республикасынын Агартуу министрлиги
						</div>
						<div className="text-xs font-black text-slate-700 uppercase tracking-wider">
							Министерство просвещения Кыргызской Республики (МП КР)
						</div>
						<h2 className="text-lg sm:text-xl font-black text-[#283375] print:text-black">
							Сводная ведомость Электронной приёмной ЦНСВ
						</h2>
						<div className="text-[11px] text-slate-500">
							По состоянию на: <b>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</b> • Ответственный: <b>{profile?.full_name}</b> ({profile?.role_display})
						</div>
					</div>
					<div className="flex items-center gap-2 print:hidden">
						<button
							type="button"
							onClick={() => window.print()}
							className="px-3.5 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
							</svg>
							<span>Печать (PDF)</span>
						</button>
						<button
							type="button"
							onClick={onClose}
							className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
						>
							✕
						</button>
					</div>
				</div>

				{/* Содержимое отчета */}
				<div className="p-6 overflow-y-auto space-y-6 flex-1 print:overflow-visible print:p-2">
					{/* Ключевые показатели цифровой приемной */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
						<div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
							<span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Всего поступило</span>
							<span className="text-2xl font-black text-[#283375]">{profile?.stats.total || 0}</span>
						</div>
						<div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-center">
							<span className="text-[10px] font-extrabold uppercase text-amber-700 block mb-0.5">Валидация</span>
							<span className="text-2xl font-black text-amber-800">{profile?.stats.validation_count || 0}</span>
						</div>
						<div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50 text-center">
							<span className="text-[10px] font-extrabold uppercase text-cyan-700 block mb-0.5">Сертификация</span>
							<span className="text-2xl font-black text-cyan-800">{profile?.stats.certification_count || 0}</span>
						</div>
						<div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
							<span className="text-[10px] font-extrabold uppercase text-emerald-700 block mb-0.5">Завершено / Выдано</span>
							<span className="text-2xl font-black text-emerald-800">{profile?.stats.completed || 0}</span>
						</div>
					</div>

					{/* Оцифровка Государственного реестра */}
					<div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] text-white">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
							<div>
								<span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
									Государственный реестр выданных сертификатов
								</span>
								<h4 className="text-sm font-black text-white">
									Ход цифровизации исторического архива ({profile?.stats.registry_total || 827} специалистов)
								</h4>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs text-slate-300">Прогресс:</span>
								<span className="text-base font-black text-emerald-400">{profile?.stats.registry_digitized_percent || 0}%</span>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3 text-center">
							<div className="p-2.5 rounded-xl bg-white/10">
								<span className="text-[10px] uppercase font-bold text-slate-300 block">Всего в архиве</span>
								<span className="text-xl font-black text-white">{profile?.stats.registry_total || 827}</span>
							</div>
							<div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
								<span className="text-[10px] uppercase font-bold text-emerald-300 block">Оцифровано (с ПИН)</span>
								<span className="text-xl font-black text-emerald-300">{profile?.stats.registry_with_inn || 0}</span>
							</div>
							<div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
								<span className="text-[10px] uppercase font-bold text-amber-300 block">Ожидают ПИН</span>
								<span className="text-xl font-black text-amber-300">{profile?.stats.registry_without_inn || 0}</span>
							</div>
						</div>
					</div>

					{/* Сводка по этапам рассмотрения */}
					<div className="border border-slate-200 rounded-2xl overflow-hidden">
						<div className="p-3 bg-slate-100 border-b border-slate-200 font-extrabold text-xs text-slate-700 uppercase tracking-wider">
							Статусы обработки заявлений граждан в Электронной приёмной
						</div>
						<table className="w-full text-left text-xs">
							<thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
								<tr>
									<th className="py-2.5 px-4">Этап процедуры</th>
									<th className="py-2.5 px-4 text-center">Количество</th>
									<th className="py-2.5 px-4">Регламентное действие</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 font-medium">
								<tr>
									<td className="py-2.5 px-4 font-bold text-blue-700">Входящие (Новые заявки)</td>
									<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.submitted || 0}</td>
									<td className="py-2.5 px-4 text-slate-500">Первичная модерация и проверка полноты пакета документов</td>
								</tr>
								<tr>
									<td className="py-2.5 px-4 font-bold text-amber-700">На рассмотрении экспертов</td>
									<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.under_review || 0}</td>
									<td className="py-2.5 px-4 text-slate-500">Оценка соответствия профстандарту, портфолио и стажа</td>
								</tr>
								<tr>
									<td className="py-2.5 px-4 font-bold text-cyan-700">Квалификационная оценка назначена</td>
									<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.scheduled || 0}</td>
									<td className="py-2.5 px-4 text-slate-500">Формирование комиссии, выезд на полигон/мастерскую</td>
								</tr>
								<tr>
									<td className="py-2.5 px-4 font-bold text-purple-700">Одобрено комиссией</td>
									<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.approved || 0}</td>
									<td className="py-2.5 px-4 text-slate-500">Успешная сдача экзамена, подготовка к внесению в госреестр</td>
								</tr>
								<tr>
									<td className="py-2.5 px-4 font-bold text-emerald-700">Сертификаты внесены в реестр (Выдано)</td>
									<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.completed || 0}</td>
									<td className="py-2.5 px-4 text-slate-500">Присвоен уникальный номер бланка ЦС, активен QR-код верификации</td>
								</tr>
								<tr>
									<td className="py-2.5 px-4 font-bold text-red-700">Отклонено</td>
									<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.rejected || 0}</td>
									<td className="py-2.5 px-4 text-slate-500">Несоответствие критериям или отказ заявителя</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* Реестр заявлений граждан */}
					<div className="border border-slate-200 rounded-2xl overflow-hidden">
						<div className="p-3 bg-slate-100 border-b border-slate-200 font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
							<span>Поименный реестр онлайн-заявлений граждан</span>
							<span className="text-[11px] font-bold text-slate-500">Всего: {applications.length}</span>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-[11px]">
								<thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
									<tr>
										<th className="py-2 px-3">№ Рег</th>
										<th className="py-2 px-3">ФИО заявителя</th>
										<th className="py-2 px-3">ИНН</th>
										<th className="py-2 px-3">Профессия</th>
										<th className="py-2 px-3">Процедура</th>
										<th className="py-2 px-3">Статус</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{applications.map((app) => (
										<tr key={app.id}>
											<td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
												{app.short_registration_number}
												{app.certificate_number_issued && (
													<div className="text-[9px] text-emerald-700 font-bold">{app.certificate_number_issued}</div>
												)}
											</td>
											<td className="py-2 px-3 font-bold text-slate-900">{app.full_name}</td>
											<td className="py-2 px-3 font-mono text-slate-500">{app.inn || '—'}</td>
											<td className="py-2 px-3 text-slate-800">{app.profession}</td>
											<td className="py-2 px-3 whitespace-nowrap">{app.type_display}</td>
											<td className="py-2 px-3 whitespace-nowrap">
												<span className="font-bold text-slate-700">{app.status_display}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Подписи для отчета */}
					<div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700 print:grid-cols-2">
						<div>
							<div className="font-bold">Директор ЦНСВ:</div>
							<div className="mt-8 border-b border-slate-400 w-48" />
							<div className="text-[10px] text-slate-400 mt-1">подпись / печать</div>
						</div>
						<div className="text-right">
							<div className="font-bold">Ответственный исполнитель:</div>
							<div className="mt-8 border-b border-slate-400 w-48 ml-auto" />
							<div className="text-[10px] text-slate-400 mt-1">{profile?.full_name}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
