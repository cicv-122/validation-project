import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export default function NotFound() {
	const { t } = useTranslation();
	const { lang = 'ru' } = useParams<{ lang: string }>();

	return (
		<div className='min-h-[60vh] flex flex-col items-center justify-center px-4 text-center'>
			<div className='mb-6'>
				<span className='text-[120px] font-extrabold text-[#283375] leading-none select-none'>
					404
				</span>
			</div>
			<h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-3'>
				{t('Страница не найдена')}
			</h1>
			<p className='text-gray-500 mb-8 max-w-md'>
				{t('Запрошенная страница не существует или была перемещена.')}
			</p>
			<Link
				to={'/' + lang}
				className='inline-flex items-center gap-2 bg-[#283375] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#252d5e] transition-colors shadow-md'
			>
				← {t('На главную')}
			</Link>
		</div>
	);
}
