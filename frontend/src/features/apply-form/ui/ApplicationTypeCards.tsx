import { useTranslation } from 'react-i18next';

interface ApplicationTypeCardsProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TYPE_OPTIONS = [
	{
		value: 'certification',
		label: 'Сертификация',
		desc: 'Для выпускников колледжей, профлицеев или специализированных курсов',
		icon: '🎓',
	},
	{
		value: 'validation',
		label: 'Валидация',
		desc: 'Для специалистов с практическим опытом работы (без диплома по профессии)',
		icon: '🛠️',
	},
];

export function ApplicationTypeCards({ value, onChange }: ApplicationTypeCardsProps) {
	const { t } = useTranslation();

	return (
		<div>
			<label className='block text-sm font-semibold text-gray-800 mb-2'>
				{t('Тип процедуры')} <span className='text-red-500'>*</span>
			</label>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
				{TYPE_OPTIONS.map((opt) => {
					const isChecked = value === opt.value;
					return (
						<label
							key={opt.value}
							className={`flex flex-col cursor-pointer rounded-2xl border-2 p-5 transition-all ${
								isChecked
									? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
									: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
							}`}
						>
							<input
								type='radio'
								name='application_type'
								value={opt.value}
								checked={isChecked}
								onChange={onChange}
								className='sr-only'
							/>
							<div className='flex items-center justify-between mb-1.5'>
								<div className='flex items-center gap-2'>
									<span className='text-xl'>{opt.icon}</span>
									<span className='font-bold text-gray-900 text-base'>{t(opt.label)}</span>
								</div>
								<span
									className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
										isChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
									}`}
								>
									{isChecked && <span className='w-1.5 h-1.5 bg-white rounded-full' />}
								</span>
							</div>
							<span className='text-xs text-gray-600 leading-relaxed'>{t(opt.desc)}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}
