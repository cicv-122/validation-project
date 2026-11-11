import React from 'react';

interface CandidateExamCommissionCardProps {
	scheduledLocation: string;
	onScheduledLocationChange: (val: string) => void;
	scheduledDate: string;
	onScheduledDateChange: (val: string) => void;
	qualificationLevel: string;
	onQualificationLevelChange: (val: string) => void;
	assessorName: string;
	onAssessorNameChange: (val: string) => void;
	specialization: string;
	onSpecializationChange: (val: string) => void;
}

export const CandidateExamCommissionCard: React.FC<CandidateExamCommissionCardProps> = ({
	scheduledLocation,
	onScheduledLocationChange,
	scheduledDate,
	onScheduledDateChange,
	qualificationLevel,
	onQualificationLevelChange,
	assessorName,
	onAssessorNameChange,
	specialization,
	onSpecializationChange,
}) => {
	return (
		<div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
			<div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
				<div className="w-8 h-8 rounded-lg bg-blue-50 text-[#283375] flex items-center justify-center font-bold text-sm">
					2
				</div>
				<div>
					<h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
						Сведения о квалификационном экзамене
					</h2>
					<p className="text-[11px] text-slate-500">
						Отображаются в первом официальном блоке на странице проверки QR-кода
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
				<div className="sm:col-span-2">
					<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
						Место проведения оценки (аттестационная площадка)
					</label>
					<input
						type="text"
						value={scheduledLocation}
						onChange={(e) => onScheduledLocationChange(e.target.value)}
						placeholder="Например: Государственная аттестационная площадка ЦНСВ МП КР (г. Бишкек)"
						className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
					/>
				</div>

				<div className="flex flex-col">
					<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 leading-tight">
						Дата проведения экзамена
					</label>
					<input
						type="date"
						value={scheduledDate}
						onChange={(e) => onScheduledDateChange(e.target.value)}
						className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
					/>
				</div>

				<div className="flex flex-col">
					<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 leading-tight">
						Разряд / Уровень
					</label>
					<input
						type="text"
						value={qualificationLevel}
						onChange={(e) => onQualificationLevelChange(e.target.value)}
						placeholder="Например: 3-й разряд"
						className="w-full h-[42px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
					/>
				</div>

				<div className="sm:col-span-2">
					<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
						Экзаменационная комиссия (Председатель и эксперты)
					</label>
					<input
						type="text"
						value={assessorName}
						onChange={(e) => onAssessorNameChange(e.target.value)}
						placeholder="Например: Председатель комиссии: Чалов Н.С., Эксперт: Асанов Б."
						className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
					/>
				</div>

				<div className="sm:col-span-2">
					<label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
						Специализация (при наличии)
					</label>
					<input
						type="text"
						value={specialization}
						onChange={(e) => onSpecializationChange(e.target.value)}
						placeholder="Например: Изготовление корпусной мебели, Санитарно-ветеринарный надзор"
						className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#283375] font-medium text-slate-900"
					/>
				</div>
			</div>
		</div>
	);
};
