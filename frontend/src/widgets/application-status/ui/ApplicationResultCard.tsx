// frontend/src/widgets/application-status/ui/ApplicationResultCard.tsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatLocalizedDate } from '../../../shared/lib';
import {
	StatusBadge,
	LocationIcon,
	PhoneIcon,
	WhatsAppIcon,
	DocumentIcon,
	CheckIcon,
} from '../../../shared/ui';
import { StatusData } from '../model/types';

export interface ApplicationResultCardProps {
	result: StatusData;
}

const STEPS = [
	{ id: 'submitted', label: 'Подана', desc: 'Принята системой' },
	{ id: 'under_review', label: 'На рассмотрении', desc: 'Проверка документов' },
	{ id: 'assessment_scheduled', label: 'Экзамен назначен', desc: 'Практическая оценка' },
	{ id: 'completed', label: 'Выдан сертификат', desc: 'Внесено в реестр' },
] as const;

export const ApplicationResultCard: React.FC<ApplicationResultCardProps> = ({ result }) => {
	const { t, i18n } = useTranslation();

	// Определение текущего шага в воронке
	const currentStepIndex = useMemo(() => {
		const s = result.status;
		if (s === 'completed') return 3;
		if (s === 'assessment_scheduled' || s === 'assessment_in_progress' || s === 'approved') return 2;
		if (s === 'under_review') return 1;
		return 0; // submitted or draft
	}, [result.status]);

	const isRejected = result.status === 'rejected';

	const cleanStaffPhone = useMemo(() => {
		if (!result.assigned_staff_phone) return '';
		const raw = result.assigned_staff_phone.replace(/\D/g, '');
		if (raw.startsWith('0')) return '996' + raw.slice(1);
		if (raw.startsWith('996')) return raw;
		return '996' + raw;
	}, [result.assigned_staff_phone]);

	return (
		<div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden space-y-6 p-6 sm:p-8 animate-in fade-in duration-300">
			{/* ШАПКА КАРТОЧКИ */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
				<div>
					<div className="flex items-center gap-2 mb-1.5 flex-wrap">
						<span className="text-[11px] font-mono uppercase font-bold text-slate-400">
							№ {result.short_registration_number || result.registration_number}
						</span>
						<StatusBadge status={result.status} label={result.status_display} size="sm" showDot />
					</div>
					<h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
						{result.full_name}
					</h2>
					<p className="text-sm font-semibold text-[#283375] mt-0.5">
						{result.profession} {result.specialization ? `· ${result.specialization}` : ''}
					</p>
				</div>

				<div className="text-left sm:text-right text-xs text-slate-400 font-medium">
					<div>{t('Дата подачи')}</div>
					<div className="text-slate-800 font-bold text-sm mt-0.5">
						{formatLocalizedDate(result.created_at, i18n.language)}
					</div>
				</div>
			</div>

			{/* ПОШАГОВЫЙ ТРЕКЕР (STEPPER) - если не отклонена */}
			{!isRejected ? (
				<div className="py-2">
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
						{STEPS.map((step, idx) => {
							const isPassed = idx < currentStepIndex;
							const isCurrent = idx === currentStepIndex;

							return (
								<div
									key={step.id}
									className={`p-3.5 rounded-2xl border transition-all ${
										isCurrent
											? 'bg-blue-50/80 border-[#283375] shadow-xs'
											: isPassed
											? 'bg-emerald-50/60 border-emerald-200'
											: 'bg-slate-50/60 border-slate-200/60 opacity-60'
									}`}
								>
									<div className="flex items-center gap-2 mb-1.5">
										<div
											className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
												isPassed
													? 'bg-emerald-600 text-white'
													: isCurrent
													? 'bg-[#283375] text-white animate-pulse'
													: 'bg-slate-200 text-slate-500'
											}`}
										>
											{isPassed ? <CheckIcon className="w-3.5 h-3.5" /> : idx + 1}
										</div>
										<span
											className={`text-xs font-bold ${
												isCurrent
													? 'text-[#283375]'
													: isPassed
													? 'text-emerald-900'
													: 'text-slate-600'
											}`}
										>
											{t(step.label)}
										</span>
									</div>
									<p className="text-[11px] text-slate-500 leading-tight">
										{t(step.desc)}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			) : (
				<div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
					<span className="text-xl">⚠️</span>
					<div>
						<h4 className="font-bold">{t('Заявка отклонена')}</h4>
						<p className="text-xs text-red-700 mt-1">
							{t('По вашей заявке принято решение об отказе. Для уточнения причин свяжитесь с Центром независимой сертификации и валидации.')}
						</p>
					</div>
				</div>
			)}

			{/* АКЦЕНТНЫЙ БЛОК: ЭКЗАМЕН НАЗНАЧЕН (Дата, Время, Место, Оценщик) */}
			{(result.scheduled_date || result.scheduled_location) && !isRejected && (
				<div className="p-5 bg-gradient-to-br from-cyan-50/90 via-blue-50/60 to-white border-2 border-cyan-300/80 rounded-3xl shadow-sm space-y-4">
					<div className="flex items-center justify-between flex-wrap gap-2">
						<div className="flex items-center gap-2.5">
							<div className="w-9 h-9 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
								<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
									{t('Вам назначен квалификационный экзамен')}
								</h3>
								<p className="text-xs text-slate-500">
									{t('Практическая оценка навыков и профессиональных компетенций')}
								</p>
							</div>
						</div>
						<span className="text-xs font-bold text-cyan-800 bg-cyan-100/80 px-3 py-1 rounded-full">
							{t('Официальное расписание')}
						</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
						{result.scheduled_date && (
							<div className="p-3.5 bg-white/90 rounded-2xl border border-cyan-100 shadow-2xs">
								<div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
									{t('Дата проведения')}
								</div>
								<div className="text-sm font-black text-[#283375]">
									{formatLocalizedDate(result.scheduled_date, i18n.language)}
								</div>
							</div>
						)}

						{result.scheduled_location && (
							<div className="p-3.5 bg-white/90 rounded-2xl border border-cyan-100 shadow-2xs">
								<div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
									<LocationIcon className="w-3.5 h-3.5 text-slate-400" />
									<span>{t('Место проведения')}</span>
								</div>
								<div className="text-xs font-bold text-slate-800 leading-snug">
									{result.scheduled_location}
								</div>
							</div>
						)}
					</div>

					{result.assessor_name && (
						<div className="text-xs text-slate-600 flex items-center gap-2 pt-1">
							<span className="font-semibold text-slate-400">{t('Ведущий эксперт-оценщик:')}</span>
							<span className="font-bold text-slate-800">{result.assessor_name}</span>
						</div>
					)}

					<div className="p-3 bg-white/60 rounded-xl border border-cyan-100 text-[11px] text-slate-600 flex items-start gap-2">
						<span className="text-amber-500 font-bold">⚠️</span>
						<span>
							{t('Пожалуйста, не опаздывайте. При себе необходимо иметь оригинал паспорта (ID-карту) и спецодежду (при наличии).')}
						</span>
					</div>
				</div>
			)}

			{/* БЛОК: СЕРТИФИКАТ УСПЕШНО ВЫДАН (completed) */}
			{result.status === 'completed' && (
				<div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-3xl shadow-sm space-y-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
							<DocumentIcon className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base font-black text-emerald-950">
								{t('Квалификация успешно подтверждена!')}
							</h3>
							<p className="text-xs text-emerald-800">
								{t('Вам выдан государственный сертификат Центра независимой сертификации и валидации при МП КР')}
								{result.certificate_number_issued ? ` (${result.certificate_number_issued})` : ''}.
							</p>
						</div>
					</div>

					<div className="pt-2">
						<Link
							to={`/verify/${encodeURIComponent(result.certificate_number_issued || result.registration_number)}`}
							className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-md shadow-emerald-700/20"
						>
							<DocumentIcon className="w-4 h-4" />
							<span>{t('Открыть сертификат в госреестре')} →</span>
						</Link>
					</div>
				</div>
			)}

			{/* БЛОК ОТВЕТСТВЕННОГО ЭКСПЕРТА ЦНСВ */}
			{result.assigned_staff_name && (
				<div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-full bg-blue-100 text-[#283375] font-bold flex items-center justify-center text-xs">
							👤
						</div>
						<div>
							<span className="text-[11px] text-slate-400 font-semibold block">
								{t('Ответственный сотрудник ЦНСВ')}
							</span>
							<span className="font-bold text-slate-900 text-xs">
								{result.assigned_staff_name}
							</span>
						</div>
					</div>

					{cleanStaffPhone && (
						<div className="flex items-center gap-2">
							<a
								href={`tel:+${cleanStaffPhone}`}
								className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
							>
								<PhoneIcon className="w-3.5 h-3.5 text-slate-500" />
								<span>{t('Позвонить')}</span>
							</a>
							<a
								href={`https://wa.me/${cleanStaffPhone}`}
								target="_blank"
								rel="noopener noreferrer"
								className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
							>
								<WhatsAppIcon className="w-3.5 h-3.5" />
								<span>WhatsApp</span>
							</a>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
