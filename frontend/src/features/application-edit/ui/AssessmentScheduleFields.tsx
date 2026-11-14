// frontend/src/features/application-edit/ui/AssessmentScheduleFields.tsx
import { useMemo } from 'react';
import { useCopyToClipboard, formatLocalizedDate } from '../../../shared/lib';
import { WhatsAppIcon, CopyIcon, CheckIcon } from '../../../shared/ui';

interface AssessmentScheduleFieldsProps {
	status: string;
	setStatus: (val: string) => void;
	date: string;
	setDate: (val: string) => void;
	assessor: string;
	setAssessor: (val: string) => void;
	location: string;
	setLocation: (val: string) => void;
	notes: string;
	setNotes: (val: string) => void;
	onSave: () => void;
	isSaving: boolean;
	candidateName?: string;
	profession?: string;
	phone?: string;
	whatsapp?: string;
	regNumber?: string;
	assignedStaffName?: string;
	assignedStaffPhone?: string;
}

export function AssessmentScheduleFields({
	status,
	setStatus,
	date,
	setDate,
	assessor,
	setAssessor,
	location,
	setLocation,
	notes,
	setNotes,
	onSave,
	isSaving,
	candidateName = '',
	profession = '',
	phone = '',
	whatsapp = '',
	regNumber = '',
	assignedStaffName = '',
	assignedStaffPhone = '',
}: AssessmentScheduleFieldsProps) {
	const [isCopied, copy] = useCopyToClipboard(2500);

	const formattedExamDate = useMemo(() => {
		if (!date) return '';
		return formatLocalizedDate(date, 'ru');
	}, [date]);

	// Генерация текста официального уведомления для кандидата
	const notificationText = useMemo(() => {
		const targetName = candidateName.trim() || 'кандидат';
		const targetProf = profession.trim() || 'заявленной профессии';
		const dateStr = formattedExamDate || 'будет сообщена дополнительно';
		const locStr = location.trim() || 'будет сообщено дополнительно';

		let msg = `Здравствуйте, ${targetName}!\n\n` +
			`Центр независимой сертификации и валидации (ЦНСВ) при Министерстве просвещения Кыргызской Республики уведомляет:\n` +
			`Ваша заявка № ${regNumber} на валидацию квалификации «${targetProf}» успешно одобрена!\n\n` +
			`Вам назначен квалификационный экзамен:\n` +
			`📅 Дата: ${dateStr}\n` +
			`📍 Место проведения: ${locStr}\n`;

		if (assessor.trim()) {
			msg += `👨‍🏫 Ведущий эксперт-оценщик: ${assessor.trim()}\n`;
		}

		msg += `\n⚠️ Важно иметь при себе:\n` +
			`1. Оригинал паспорта (ID-карта)\n` +
			`2. Рабочую форму / спецодежду (при наличии)\n\n`;

		if (assignedStaffName.trim()) {
			msg += `По всем вопросам вы можете связаться с вашим ответственным экспертом ЦНСВ:\n` +
				`👤 ${assignedStaffName.trim()}` +
				(assignedStaffPhone.trim() ? ` (тел: ${assignedStaffPhone.trim()})\n\n` : `\n\n`);
		}

		msg += `Проверить статус заявки онлайн:\n` +
			`👉 https://validation.kg/application-status?reg=${regNumber}`;

		return msg;
	}, [
		candidateName,
		profession,
		formattedExamDate,
		location,
		assessor,
		assignedStaffName,
		assignedStaffPhone,
		regNumber,
	]);

	// Нормализация номера телефона для WhatsApp (с авто-подстановкой кода 996 для КР)
	const whatsappUrl = useMemo(() => {
		const raw = (whatsapp || phone || '').replace(/\D/g, '');
		if (!raw) return null;
		const normalized = raw.startsWith('0')
			? '996' + raw.slice(1)
			: raw.startsWith('996')
			? raw
			: raw.length === 9 || raw.length === 10
			? '996' + raw
			: raw;
		return `https://wa.me/${normalized}?text=${encodeURIComponent(notificationText)}`;
	}, [whatsapp, phone, notificationText]);

	return (
		<div className='bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4'>
			<div className='flex items-center justify-between'>
				<h3 className='text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2'>
					<svg className='w-4 h-4 text-[#283375]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
					</svg>
					<span>Назначение экзамена и статус дела</span>
				</h3>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
				{/* Статус */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Текущий статус дела *
					</label>
					<select
						value={status}
						onChange={(e) => setStatus(e.target.value)}
						className='w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					>
						<option value='submitted'>Входящая (Новая)</option>
						<option value='under_review'>На рассмотрении</option>
						<option value='assessment_scheduled'>Оценка назначена</option>
						<option value='completed'>В реестре (Выдано)</option>
						<option value='rejected'>Отклонена</option>
					</select>
				</div>

				{/* Дата экзамена */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Дата практического экзамена
					</label>
					<input
						type='date'
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Эксперт-оценщик */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Эксперт-оценщик
					</label>
					<input
						type='text'
						value={assessor}
						onChange={(e) => setAssessor(e.target.value)}
						placeholder='ФИО эксперта-оценщика...'
						className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Место проведения */}
				<div className='sm:col-span-3'>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Место проведения оценки (Центр / Лаборатория / Колледж)
					</label>
					<input
						type='text'
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder='Напр. Бишкекский колледж № 93, лаборатория сварки'
						className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Заметки сотрудника */}
				<div className='sm:col-span-3'>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Служебные заметки сотрудника ЦНСВ
					</label>
					<textarea
						rows={2}
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder='Заметки по кандидату, результат собеседования, замечания к документам...'
						className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>
			</div>

			{/* БЛОК АВТОМАТИЧЕСКОГО УВЕДОМЛЕНИЯ КАНДИДАТА В WHATSAPP */}
			{(date || location || status === 'assessment_scheduled') && (
				<div className='mt-2 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200'>
					<div className='flex items-center justify-between flex-wrap gap-2'>
						<div className='flex items-center gap-2'>
							<div className='w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs'>
								<WhatsAppIcon className='w-3.5 h-3.5' />
							</div>
							<span className='text-xs font-bold text-emerald-950'>
								Уведомление кандидата о назначении экзамена
							</span>
						</div>
						<span className='text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md'>
							WhatsApp / SMS
						</span>
					</div>

					<div className='p-3 bg-white rounded-xl border border-emerald-100 text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto'>
						{notificationText}
					</div>

					<div className='flex items-center justify-between gap-2 flex-wrap pt-1'>
						<div className='flex items-center gap-2'>
							{whatsappUrl ? (
								<a
									href={whatsappUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer'
								>
									<WhatsAppIcon className='w-4 h-4' />
									<span>Отправить в WhatsApp</span>
								</a>
							) : (
								<span className='text-xs text-amber-700 font-medium'>
									⚠️ У кандидата не указан номер телефона для WhatsApp
								</span>
							)}

							<button
								type='button'
								onClick={() => copy(notificationText)}
								className='px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs'
							>
								{isCopied ? (
									<>
										<CheckIcon className='w-4 h-4 text-emerald-600' />
										<span className='text-emerald-700'>Текст скопирован!</span>
									</>
								) : (
									<>
										<CopyIcon className='w-4 h-4 text-slate-500' />
										<span>Скопировать текст</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* КНОПКА СОХРАНЕНИЯ ВСЕХ ИЗМЕНЕНИЙ В ДЕЛЕ */}
			<div className='pt-2 flex justify-end'>
				<button
					type='button'
					onClick={onSave}
					disabled={isSaving}
					className='px-6 py-3 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-black text-xs transition-all shadow-md shadow-[#283375]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer'
				>
					{isSaving ? (
						<>
							<div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
							<span>Сохранение данных...</span>
						</>
					) : (
						<>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4' />
							</svg>
							<span>Сохранить все изменения в деле</span>
						</>
					)}
				</button>
			</div>
		</div>
	);
}
