import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { usePartners } from '../hooks/useApi';
import type { DevelopmentPartner } from '../types';

export default function Partners() {
	const { t } = useTranslation();
	const { data: partners, isLoading, error } = usePartners();

	// Restore scroll position when data loads and user returned from detail page
	useLayoutEffect(() => {
		if (!isLoading && partners && partners.length > 0) {
			const fromPartners = sessionStorage.getItem('from_partners');
			const savedScroll = sessionStorage.getItem('partners_scroll_pos');

			if (fromPartners === 'true' && savedScroll) {
				const scrollY = parseInt(savedScroll, 10);
				if (!isNaN(scrollY) && scrollY > 0) {
					const origBehavior = document.documentElement.style.scrollBehavior;
					document.documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, scrollY);
					document.documentElement.style.scrollBehavior = origBehavior;
				}
				sessionStorage.removeItem('partners_scroll_pos');
			}
		}
	}, [isLoading, partners]);

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('Партнеры по развитию')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Партнеры по развитию Центра независимой сертификации и валидации при Министерстве просвещения Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('Партнеры по развитию')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки документов.')} />
				) : partners && partners.length > 0 ? (
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
						<ul className='divide-y divide-gray-100'>
							{partners.map((doc: DevelopmentPartner) => (
								<li key={doc.id}>
									<Link
										to={`/documents/partners/${doc.id}`}
										onClick={() => {
											sessionStorage.setItem('from_partners', 'true');
											sessionStorage.setItem('partners_scroll_pos', window.scrollY.toString());
										}}
										className='group flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-all duration-300'
									>
										<div className='flex items-center space-x-4 w-full'>
											<div className='flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-5 w-5'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
													/>
												</svg>
											</div>
											<div className='flex-1 min-w-0'>
												<p className='text-base font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 truncate whitespace-normal'>
													{doc.title}
												</p>
											</div>
											<div className='flex-shrink-0 pl-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-600 flex items-center gap-1.5 text-sm font-medium'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-4 w-4'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M14 5l7 7m0 0l-7 7m7-7H3'
													/>
												</svg>
												<span className='hidden sm:inline'>{t('Подробнее')}</span>
											</div>
										</div>
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : (
					<EmptyState message={t('Документов пока нет.')} />
				)}
			</div>
		</div>
	);
}
