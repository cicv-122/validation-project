import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function CertificateSupportCard() {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden'>
			<div className='flex items-start sm:items-center gap-4'>
				<div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0'>
					<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' />
					</svg>
				</div>
				<div>
					<h3 className='text-base sm:text-lg font-bold text-slate-900'>
						{t('Возникли трудности с проверкой документа?')}
					</h3>
					<p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
						{t('Обратитесь в приёмную ЦНСВ или посетите страницу контактов')}
					</p>
				</div>
			</div>

			<div className='flex flex-col gap-2.5 w-full sm:w-auto sm:min-w-[210px] flex-shrink-0'>
				<Link
					to='/contacts'
					className='w-full inline-flex items-center justify-center px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 text-center'
				>
					{t('Контакты')}
				</Link>

				<a
					href='tel:+996312591401'
					className='w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#283375] hover:bg-[#1e2759] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 text-center'
				>
					<svg className='w-4 h-4 text-white flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
					</svg>
					<span>+996 312 59 14 01</span>
				</a>
			</div>
		</div>
	);
}
