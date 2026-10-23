import { useTranslation } from 'react-i18next';

interface FormData {
	full_name: string;
	birth_year: string;
	inn: string;
	phone: string;
	whatsapp: string;
	email: string;
	address: string;
	profession: string;
	qualification_level: string;
	application_type: string;
	data_consent: boolean;
}

interface StepConfirmProps {
	form: FormData;
	documentsCount: number;
	errorMsg?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex gap-2 text-sm'>
			<span className='text-gray-500 dark:text-gray-400 min-w-24'>{label}:</span>
			<span className='text-gray-900 dark:text-white font-medium'>{value}</span>
		</div>
	);
}

export default function StepConfirm({ form, documentsCount, errorMsg, onChange }: StepConfirmProps) {
	const { t } = useTranslation();

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold'>4</span>
				{t('Проверьте данные и подтвердите')}
			</h2>

			<div className='space-y-4 text-sm bg-gray-50 dark:bg-[#0c0f24] p-5 rounded-xl border border-gray-100 dark:border-blue-900/30'>
				<Row label='ФИО' value={form.full_name} />
				<Row label={t('Год рождения')} value={form.birth_year || '—'} />
				<Row label={t('Персональный номер')} value={form.inn} />
				<Row label={t('Телефон')} value={form.phone} />
				{form.whatsapp && <Row label='WhatsApp' value={form.whatsapp} />}
				{form.address && <Row label='Адрес' value={form.address} />}
				<Row label='Профессия' value={form.profession} />
				{form.qualification_level && <Row label='Уровень' value={form.qualification_level} />}
				<Row label='Тип' value={form.application_type === 'certification' ? 'Сертификация' : 'Валидация'} />
				<Row label='Документов' value={`${documentsCount} файл(ов)`} />
			</div>

			<div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-6 text-sm text-gray-700 dark:text-amber-200 mt-6'>
				<p className='font-semibold mb-1 text-amber-950 dark:text-amber-100'>{t('Заявление направляется:')}</p>
				<p>{t('Директору ЦНСВ при МП КР Ж.А. Шаматовой')}</p>
				<p className='mt-2 text-xs text-amber-700 dark:text-amber-300/80'>
					{t('Мои данные могут быть использованы только в рамках процесса процедуры оценки признания компетенций.')}
				</p>
			</div>

			<label className='flex items-start gap-3 cursor-pointer'>
				<input
					type='checkbox'
					name='data_consent'
					checked={form.data_consent}
					onChange={onChange}
					className='mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-blue-900 bg-white dark:bg-[#0c0f24] text-blue-600 focus:ring-blue-500'
				/>
				<span className='text-sm text-gray-700 dark:text-gray-300'>
					{t('Я подтверждаю правильность введённых данных и даю согласие на их обработку в рамках процедуры оценки признания компетенций.')}
				</span>
			</label>

			{errorMsg && (
				<div className='mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-700 dark:text-red-300'>
					{errorMsg}
				</div>
			)}
		</div>
	);
}
