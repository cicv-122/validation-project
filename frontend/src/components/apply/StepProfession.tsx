import { useTranslation } from 'react-i18next';

interface FormData {
	profession: string;
	qualification_level: string;
	application_type: string;
}

interface StepProfessionProps {
	form: FormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const OPTIONS = [
	{
		value: 'certification',
		label: 'Сертификация',
		desc: 'Для граждан с формальным образованием',
	},
	{
		value: 'validation',
		label: 'Валидация',
		desc: 'Для граждан с неформальным/практическим опытом',
	},
];

export default function StepProfession({ form, onChange }: StepProfessionProps) {
	const { t } = useTranslation();

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center'>2</span>
				{t('Профессия')} — {t('Тип процедуры *')}
			</h2>
			<div className='space-y-5'>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('Профессия *')}</label>
					<input
						type='text'
						name='profession'
						value={form.profession}
						onChange={onChange}
						placeholder={t('Например: Повар, Сварщик, Парикмахер...')}
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('Квалификационный уровень')}</label>
					<input
						type='text'
						name='qualification_level'
						value={form.qualification_level}
						onChange={onChange}
						placeholder={t('Например: 4-й уровень')}
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-3'>{t('Тип процедуры *')}</label>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{OPTIONS.map(opt => (
							<label
								key={opt.value}
								className={`flex flex-col cursor-pointer rounded-xl border-2 p-4 transition-all ${
									form.application_type === opt.value
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 hover:border-blue-300'
								}`}
							>
								<input
									type='radio'
									name='application_type'
									value={opt.value}
									checked={form.application_type === opt.value}
									onChange={onChange}
									className='sr-only'
								/>
								<span className='font-semibold text-gray-800 text-sm'>{t(opt.label)}</span>
								<span className='text-xs text-gray-500 mt-1'>{t(opt.desc)}</span>
							</label>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
