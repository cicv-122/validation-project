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
}: AssessmentScheduleFieldsProps) {
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
