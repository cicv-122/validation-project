import { useTranslation } from 'react-i18next';

interface FormData {
	full_name: string;
	birth_year: string;
	inn: string;
	phone: string;
	email: string;
	address: string;
}

interface StepPersonalProps {
	form: FormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	onInnChange: (val: string) => void;
}

export default function StepPersonal({ form, onChange, onInnChange }: StepPersonalProps) {
	const { t } = useTranslation();

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center'>1</span>
				{t('Личные данные')}
			</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
				<div className='md:col-span-2'>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('ФИО кандидата *')}</label>
					<input
						type='text'
						name='full_name'
						value={form.full_name}
						onChange={onChange}
						placeholder='Иванов Иван Иванович'
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('Год рождения')}</label>
					<input
						type='number'
						name='birth_year'
						value={form.birth_year}
						onChange={onChange}
						placeholder='1990'
						min='1920'
						max='2010'
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm'
					/>
				</div>
				<div className='md:col-span-2'>
					<label className='block text-sm font-medium text-gray-700 mb-2'>
						{t('Персональный номер')} <span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						name='inn'
						value={form.inn}
						onChange={e => onInnChange(e.target.value.replace(/\D/g, '').slice(0, 14))}
						placeholder='00000000000000'
						required
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow'
					/>
					{form.inn && form.inn.length < 14 && (
						<p className='text-xs text-red-500 mt-1'>
							{t('Персональный номер должен состоять из 14 цифр')}
						</p>
					)}
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('Телефон *')}</label>
					<input
						type='tel'
						name='phone'
						value={form.phone}
						onChange={onChange}
						placeholder='+996 700 000000'
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('E-mail *')}</label>
					<input
						type='email'
						name='email'
						value={form.email}
						onChange={onChange}
						placeholder='example@mail.com'
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
				<div className='md:col-span-2'>
					<label className='block text-sm font-medium text-gray-700 mb-1'>{t('Адрес проживания')}</label>
					<input
						type='text'
						name='address'
						value={form.address}
						onChange={onChange}
						placeholder='г. Бишкек, ул. ...'
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
			</div>
		</div>
	);
}
