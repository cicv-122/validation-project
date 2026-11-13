interface ProfessionProcedureFieldsProps {
	procedureType: 'certification' | 'validation';
	setProcedureType: (val: 'certification' | 'validation') => void;
	profession: string;
	setProfession: (val: string) => void;
	qualLevel: string;
	setQualLevel: (val: string) => void;
	expYears: number | string;
	setExpYears: (val: number | string) => void;
	certNumber: string;
	setCertNumber: (val: string) => void;
	expDesc: string;
	setExpDesc: (val: string) => void;
}

export function ProfessionProcedureFields({
	procedureType,
	setProcedureType,
	profession,
	setProfession,
	qualLevel,
	setQualLevel,
	expYears,
	setExpYears,
	certNumber,
	setCertNumber,
	expDesc,
	setExpDesc,
}: ProfessionProcedureFieldsProps) {
	return (
		<div className='bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4'>
			<div className='flex items-center justify-between'>
				<h3 className='text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2'>
					<svg className='w-4 h-4 text-[#283375]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
					</svg>
					<span>Процедура, профессия и квалификация</span>
				</h3>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
				{/* Тип процедуры */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Тип процедуры
					</label>
					<select
						value={procedureType}
						onChange={(e) => setProcedureType(e.target.value as 'certification' | 'validation')}
						className='w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					>
						<option value='certification'>Сертификация</option>
						<option value='validation'>Валидация</option>
					</select>
				</div>

				{/* Профессия */}
				<div className='sm:col-span-2'>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Профессия *
					</label>
					<input
						type='text'
						value={profession}
						onChange={(e) => setProfession(e.target.value)}
						placeholder='Название профессии...'
						className='w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Разряд / Уровень */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Разряд / Уровень квалификации
					</label>
					<input
						type='text'
						value={qualLevel}
						onChange={(e) => setQualLevel(e.target.value)}
						placeholder='Напр. 3, 4 разряд'
						className='w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Стаж лет */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Стаж работы (лет)
					</label>
					<input
						type='number'
						min={0}
						value={expYears}
						onChange={(e) => setExpYears(e.target.value)}
						className='w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Номер выданного сертификата (если выдан) */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Номер сертификата
					</label>
					<div className='flex items-center px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:border-[#283375] focus-within:ring-1 focus-within:ring-[#283375]'>
						<span className='text-xs font-bold font-mono text-slate-700 select-none whitespace-nowrap mr-1.5'>
							ЦС №
						</span>
						<input
							type='text'
							value={certNumber.replace(/^ЦС\s*№?\s*/i, '')}
							onChange={(e) => {
								const val = e.target.value.trim();
								setCertNumber(val ? `ЦС № ${val}` : '');
							}}
							placeholder='000760'
							className='w-full text-xs font-bold font-mono text-slate-900 outline-none bg-transparent p-0'
						/>
					</div>
				</div>

				{/* Описание стажа */}
				<div className='sm:col-span-3'>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Описание опыта и навыков
					</label>
					<textarea
						rows={2}
						value={expDesc}
						onChange={(e) => setExpDesc(e.target.value)}
						placeholder='Опыт кандидата, места работы, практические навыки...'
						className='w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>
			</div>
		</div>
	);
}
