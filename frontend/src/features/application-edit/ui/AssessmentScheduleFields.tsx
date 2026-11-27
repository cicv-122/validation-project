// frontend/src/features/application-edit/ui/AssessmentScheduleFields.tsx
import { useMemo, useState, useRef, useEffect } from 'react';
import { useCopyToClipboard, formatLocalizedDate } from '../../../shared/lib';
import { WhatsAppIcon, CopyIcon, CheckIcon } from '../../../shared/ui';
import localExpertsData from '../../../data/experts_database.json';
import { useAssessmentCenters } from '../../../entities/center/api/centerHooks';

interface AssessmentScheduleFieldsProps {
	isAdmin?: boolean;
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
	isAdmin,
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
	const [isAssessorDropdownOpen, setIsAssessorDropdownOpen] = useState(false);
	const assessorContainerRef = useRef<HTMLDivElement>(null);
	const { data: centers } = useAssessmentCenters();

	// Закрытие подсказок эксперта при клике вне поля
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (assessorContainerRef.current && !assessorContainerRef.current.contains(e.target as Node)) {
				setIsAssessorDropdownOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Подсказки аттестованных экспертов ЦНСВ с приоритетом по профессии
	const expertSuggestions = useMemo(() => {
		const q = assessor.toLowerCase().trim();
		const candProf = profession.toLowerCase().trim();

		const list = localExpertsData.map((e) => ({
			...e,
			isProfMatch: candProf && (e.profession_ru || '').toLowerCase().includes(candProf),
		}));

		list.sort((a, b) => (b.isProfMatch ? 1 : 0) - (a.isProfMatch ? 1 : 0));

		if (!q) {
			return list.slice(0, 10);
		}

		return list
			.filter(
				(e) =>
					e.name.toLowerCase().includes(q) ||
					(e.organization && e.organization.toLowerCase().includes(q)) ||
					(e.profession_ru && e.profession_ru.toLowerCase().includes(q))
			)
			.slice(0, 10);
	}, [assessor, profession]);

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
						Текущий статус дела
					</label>
					<div className='relative'>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className='w-full pl-3 pr-9 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] appearance-none cursor-pointer'
						>
							{(isAdmin || status === 'submitted') && (
								<option value='submitted'>Входящая (Новая)</option>
							)}
							<option value='under_review'>На рассмотрении</option>
							<option value='assessment_scheduled'>Оценка назначена</option>
							<option value='completed'>В реестре (Выдано)</option>
							<option value='rejected'>Отклонена</option>
						</select>
						<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>
					</div>
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

				{/* Эксперт-оценщик с подсказками из базы и свободным вводом */}
				<div className='relative' ref={assessorContainerRef}>
					<label
						className='block text-[11px] font-bold text-slate-600 mb-1 truncate'
						title='Эксперт-оценщик (подсказки из базы / свободный ввод)'
					>
						Эксперт-оценщик
					</label>
					<div className='relative'>
						<input
							type='text'
							value={assessor}
							onFocus={() => setIsAssessorDropdownOpen(true)}
							onChange={(e) => {
								setAssessor(e.target.value);
								setIsAssessorDropdownOpen(true);
							}}
							placeholder='ФИО эксперта (из базы или ввод)...'
							className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
						/>
						{assessor && (
							<button
								type='button'
								onClick={() => setAssessor('')}
								className='absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs'
								title='Очистить'
							>
								✕
							</button>
						)}
					</div>

					{/* Выпадающий список подсказок экспертов */}
					{isAssessorDropdownOpen && expertSuggestions.length > 0 && (
						<div className='absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-56 overflow-y-auto divide-y divide-slate-100'>
							<div className='px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 tracking-wider flex items-center justify-between'>
								<span>Аттестованные эксперты ЦНСВ:</span>
								<span className='text-[9px] text-slate-400 font-normal'>клик для выбора</span>
							</div>
							{expertSuggestions.map((exp) => (
								<button
									key={exp.id}
									type='button'
									onClick={() => {
										setAssessor(exp.name);
										setIsAssessorDropdownOpen(false);
									}}
									className='w-full px-3 py-2 text-left hover:bg-blue-50/70 transition-colors flex items-start justify-between gap-2 cursor-pointer'
								>
									<div className='min-w-0'>
										<div className='flex items-center gap-1.5 flex-wrap'>
											<span className='text-xs font-bold text-slate-900'>{exp.name}</span>
											{exp.isProfMatch && (
												<span className='px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
													По профилю: {exp.profession_ru}
												</span>
											)}
										</div>
										<div className='text-[10px] text-slate-500 mt-0.5 truncate'>
											{exp.organization || 'Организация не указана'} {exp.city_ru ? `• ${exp.city_ru}` : ''}
										</div>
									</div>
									<span className='text-[10px] text-slate-400 font-medium shrink-0'>
										{exp.role_ru}
									</span>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Место проведения с подсказками из 10 центров */}
				<div className='sm:col-span-3'>
					<div className='flex items-center justify-between mb-1'>
						<label className='block text-[11px] font-bold text-slate-600'>
							Место проведения оценки (Центр / Лаборатория / Колледж)
						</label>
						<span className='text-[10px] text-slate-400 font-normal'>
							(из списка центров или свободный адрес)
						</span>
					</div>
					<input
						type='text'
						list='assessment-centers-datalist'
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder='Напр. Бишкекский Колледж Архитектуры и Менеджмента в Строительстве (БКАМС)'
						className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
					<datalist id='assessment-centers-datalist'>
						{centers?.map((c) => (
							<option key={c.id} value={`${c.organization} (${c.address || ''})`} />
						))}
					</datalist>
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
