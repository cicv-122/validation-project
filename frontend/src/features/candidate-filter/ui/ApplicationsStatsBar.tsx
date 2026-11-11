// frontend/src/features/candidate-filter/ui/ApplicationsStatsBar.tsx
import React from 'react';
import type { StaffProfile } from '../../../api/staff';

interface ApplicationsStatsBarProps {
	profile: StaffProfile | null;
	onOpenMinistryReport: () => void;
}

export const ApplicationsStatsBar: React.FC<ApplicationsStatsBarProps> = ({
	profile,
	onOpenMinistryReport,
}) => {
	return (
		<div className="bg-gradient-to-r from-[#1b2559] via-[#283375] to-[#1e3a8a] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-blue-900/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
			<div className="space-y-1.5 max-w-xl">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
						Министерство просвещения Кыргызской Республики (МП КР)
					</span>
					<span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold border border-white/20 flex items-center gap-1">
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
						Электронная приёмная
					</span>
				</div>
				<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
					Мониторинг цифрового потока приёмной ЦНСВ
				</h2>
				<p className="text-xs text-blue-100/80 leading-relaxed">
					Сводный учёт онлайн-обращений граждан Кыргызской Республики на признание и сертификацию квалификаций через цифровую приемную.
				</p>
			</div>

			<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
				<div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial min-w-[90px]">
					<span className="text-[10px] uppercase font-bold text-blue-200 block">
						Всего в приёмной
					</span>
					<span className="text-2xl font-black text-white">
						{profile?.stats.total || 0}
					</span>
				</div>
				<div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial min-w-[90px]">
					<span className="text-[10px] uppercase font-bold text-blue-200 block">
						Валидация
					</span>
					<span className="text-2xl font-black text-white">
						{profile?.stats.validation_count || 0}
					</span>
				</div>
				<div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial min-w-[90px]">
					<span className="text-[10px] uppercase font-bold text-blue-200 block">
						Сертификация
					</span>
					<span className="text-2xl font-black text-white">
						{profile?.stats.certification_count || 0}
					</span>
				</div>
				<button
					type="button"
					onClick={onOpenMinistryReport}
					className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white text-[#283375] font-extrabold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
				>
					<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
					<span>Сводка для Министерства</span>
				</button>
			</div>
		</div>
	);
};
