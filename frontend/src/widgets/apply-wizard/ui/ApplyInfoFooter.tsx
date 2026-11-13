import { useTranslation } from 'react-i18next';

export default function ApplyInfoFooter() {
	const { t } = useTranslation();

	return (
		<div className='mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800'>
			<p className='font-semibold mb-1'>{t('Адрес Центра:')}</p>
			<p>{t('ул. Жусупа Абдрахманова, 276')}</p>
			<p className='mt-1'>Тел: +996703047535, +996755222794</p>
		</div>
	);
}
