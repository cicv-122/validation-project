// frontend/src/widgets/digitization-stats/ui/DigitizationArchiveHero.tsx
import React from 'react';
import type { StaffProfile } from '../../../api/staff';

interface DigitizationArchiveHeroProps {
	profile: StaffProfile | null;
	certifiedTotal: number;
}

export const DigitizationArchiveHero: React.FC<DigitizationArchiveHeroProps> = ({
	profile,
	certifiedTotal,
}) => {
	const total = profile?.stats?.registry_total || certifiedTotal || 827;
	const withInn = profile?.stats?.registry_with_inn || 0;
	const withoutInn = profile?.stats?.registry_without_inn ?? (total - withInn);
	const percent = profile?.stats?.registry_digitized_percent || 0.7;

	return (
		<div className="space-y-4">
			{/* Баннер оцифровки архива */}
			<div className="bg-gradient-to-r from-[#1b2559] via-[#283375] to-[#1e3a8a] text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-blue-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
				<div className="space-y-2 max-w-xl">
					<div className="flex items-center gap-2">
						<span className="px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
							Государственный архив
						</span>
						<span className="text-xs text-blue-200">
							Министерство просвещения Кыргызской Республики
						</span>
					</div>
					<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
						Оцифровка архива сертифицированных специалистов
					</h2>
					<p className="text-xs text-blue-100/80 leading-relaxed">
						Внесение 14-значных персональных идентификационных номеров (ПИН/ИНН), прикрепление протоколов квалификационных комиссий и электронных сканов к {total} архивным сертификатам.
					</p>
				</div>

				{/* Прогресс-бар оцифровки */}
				<div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
					<div className="flex items-center justify-between text-xs">
						<span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
							Прогресс оцифровки
						</span>
						<span className="text-sm font-black text-white">{percent}%</span>
					</div>
					<div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
						<div
							className="h-full bg-emerald-400 rounded-full transition-all duration-500"
							style={{ width: `${Math.max(percent, 0.5)}%` }}
						/>
					</div>
					<div className="text-[10px] text-blue-200/80 text-right">
						{withInn} из {total} оцифровано
					</div>
				</div>
			</div>

			{/* KPI карточки */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
				<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
						Всего в архиве
					</span>
					<div className="flex items-baseline justify-between">
						<span className="text-2xl font-black text-slate-900">{total}</span>
						<span className="w-2 h-2 rounded-full bg-[#283375]" />
					</div>
					<span className="text-[10px] text-slate-400 font-medium block mt-1">
						Историческая база
					</span>
				</div>

				<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
						Оцифровано (с ПИН)
					</span>
					<div className="flex items-baseline justify-between">
						<span className="text-2xl font-black text-emerald-700">{withInn}</span>
						<span className="w-2 h-2 rounded-full bg-emerald-500" />
					</div>
					<span className="text-[10px] text-emerald-600/80 font-medium block mt-1">
						Доступна онлайн-верификация
					</span>
				</div>

				<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">
						Ожидают внесения ПИН
					</span>
					<div className="flex items-baseline justify-between">
						<span className="text-2xl font-black text-amber-700">{withoutInn}</span>
						<span className="w-2 h-2 rounded-full bg-amber-500" />
					</div>
					<span className="text-[10px] text-amber-600/80 font-medium block mt-1">
						Требуется ввод 14 цифр
					</span>
				</div>

				<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
					<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
						Доля оцифровки
					</span>
					<div className="flex items-baseline justify-between">
						<span className="text-2xl font-black text-slate-900">{percent}%</span>
						<span className="text-[10px] font-bold text-slate-400">KPI</span>
					</div>
					<span className="text-[10px] text-slate-400 font-medium block mt-1">
						Цель: 100% архива
					</span>
				</div>
			</div>
		</div>
	);
};
