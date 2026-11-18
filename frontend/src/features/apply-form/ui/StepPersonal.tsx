import { useTranslation } from 'react-i18next';
import {
	analyzeKyrgyzPin,
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
} from '../../../shared/lib';

interface FormData {
	full_name: string;
	birth_year: string;
	citizenship?: CitizenshipCode;
	inn: string;
	phone: string;
	whatsapp: string;
	email: string;
	address: string;
}

interface StepPersonalProps {
	form: FormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	onInnChange: (val: string) => void;
	onCitizenshipChange?: (citizenship: CitizenshipCode) => void;
}

export default function StepPersonal({
	form,
	onChange,
	onInnChange,
	onCitizenshipChange,
}: StepPersonalProps) {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();
	const minYear = 1935;
	const maxYear = currentYear - 14;
	const citizenship: CitizenshipCode = form.citizenship || '';
	const currentCitizenshipMeta = CITIZENSHIP_OPTIONS.find((c) => c.value === citizenship);
	const pinAnalysis = analyzeKyrgyzPin(form.inn, form.full_name, citizenship);

	const birthYearNum = form.birth_year ? parseInt(form.birth_year, 10) : null;
	const isBirthYearInvalid =
		form.birth_year.length === 4 &&
		birthYearNum !== null &&
		(birthYearNum < minYear || birthYearNum > maxYear);

	const handleInnInput = (val: string) => {
		const maxLen = currentCitizenshipMeta?.maxLength || 14;
		const clean = val.replace(/\D/g, '').slice(0, maxLen);
		onInnChange(clean);

		const nextAnalysis = analyzeKyrgyzPin(clean, form.full_name, citizenship);
		if (nextAnalysis.birthYear && nextAnalysis.birthYear >= minYear && nextAnalysis.birthYear <= maxYear) {
			onChange({
				target: { name: 'birth_year', value: String(nextAnalysis.birthYear) },
			} as any);
		}
	};

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold'>
					1
				</span>
				{t('Личные данные')}
			</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-5 items-start'>
				<div className='md:col-span-2'>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('ФИО кандидата')}
					</label>
					<input
						type='text'
						name='full_name'
						value={form.full_name}
						onChange={onChange}
						placeholder={t('form.placeholder_name', 'Иванов Иван Иванович')}
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all'
					/>
				</div>

				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Гражданство')}
					</label>
					<div className='relative'>
						<select
							name='citizenship'
							value={citizenship}
							onChange={(e) => {
								const nextCode = e.target.value as CitizenshipCode;
								if (onCitizenshipChange) {
									onCitizenshipChange(nextCode);
								} else {
									onChange(e);
								}
							}}
							className={`w-full pl-4 pr-10 py-3 bg-white border rounded-xl appearance-none focus:ring-2 outline-none text-sm transition-all cursor-pointer ${
								form.inn && !citizenship
									? 'border-red-400 focus:ring-red-400 bg-red-50/30'
									: 'border-gray-300 focus:ring-blue-500'
							}`}
						>
							<option value=''>— {t('Выберите гражданство')} —</option>
							{CITIZENSHIP_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{t(opt.labelKey || opt.label, opt.label)}
								</option>
							))}
						</select>
						<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400'>
							<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>
					</div>
				</div>

				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Персональный номер (ПИН / ИНН)')}
					</label>
					<input
						type='text'
						name='inn'
						value={form.inn}
						onChange={(e) => handleInnInput(e.target.value)}
						placeholder={
							currentCitizenshipMeta
								? t(currentCitizenshipMeta.placeholderKey || currentCitizenshipMeta.placeholder, currentCitizenshipMeta.placeholder)
								: t('Сначала выберите гражданство')
						}
						required
						maxLength={currentCitizenshipMeta?.maxLength || 14}
						className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none text-sm transition-all font-mono ${
							form.inn && pinAnalysis.errorMessage
								? 'border-red-400 focus:ring-red-400 bg-red-50/30'
								: form.inn && pinAnalysis.isValid && pinAnalysis.isComplete
								? 'border-emerald-400 focus:ring-emerald-400 bg-emerald-50/20'
								: 'border-gray-300 focus:ring-blue-500'
						}`}
					/>
					{form.inn && pinAnalysis.errorMessage && (
						<p className='text-xs text-red-600 mt-1.5 font-semibold'>
							{t(pinAnalysis.errorMessage)}
						</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Год рождения')}
					</label>
					<input
						type='number'
						name='birth_year'
						value={form.birth_year}
						onChange={(e) => {
							const val = e.target.value.slice(0, 4);
							onChange({
								target: { name: 'birth_year', value: val },
							} as any);
						}}
						placeholder='1990'
						min={minYear}
						max={maxYear}
						className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 outline-none text-sm transition-all ${
							isBirthYearInvalid
								? 'border-red-400 focus:ring-red-400 bg-red-50/30'
								: 'border-gray-300 focus:ring-blue-500'
						}`}
					/>
					{isBirthYearInvalid && (
						<p className='text-xs text-red-600 mt-1.5 font-semibold'>
							{t('Укажите реальный год рождения (от {{min}} до {{max}})', {
								min: minYear,
								max: maxYear,
							})}
						</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Адрес проживания')}
					</label>
					<input
						type='text'
						name='address'
						value={form.address}
						onChange={onChange}
						placeholder={t('form.placeholder_address', 'г. Бишкек, Первомайский район, ул. ...')}
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all'
					/>
				</div>

				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Телефон для связи')}
					</label>
					<input
						type='tel'
						name='phone'
						value={form.phone}
						onChange={onChange}
						placeholder='+996 700 000000'
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all'
					/>
				</div>

				<div>
					<div className='flex items-center justify-between mb-1.5'>
						<label className='block text-sm font-semibold text-gray-800'>
							{t('Номер WhatsApp')}
						</label>
						<button
							type='button'
							onClick={() => {
								if (form.phone) {
									onChange({
										target: { name: 'whatsapp', value: form.phone, type: 'text' },
									} as any);
								}
							}}
							className='text-xs text-blue-600 hover:underline font-medium cursor-pointer'
						>
							{t('Такой же, как телефон')}
						</button>
					</div>
					<input
						type='tel'
						name='whatsapp'
						value={form.whatsapp}
						onChange={onChange}
						placeholder='+996 700 000000'
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all'
					/>
				</div>
			</div>
		</div>
	);
}
