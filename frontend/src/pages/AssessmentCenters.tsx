import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useAssessmentCenters } from '../hooks/useApi';

export default function AssessmentCenters() {
	const { t } = useTranslation();
	const { data: centers, isLoading, error } = useAssessmentCenters();

	// Restore scroll position when data loads and user returned from detail page
	useLayoutEffect(() => {
		if (!isLoading && centers && centers.length > 0) {
			const fromCenters = sessionStorage.getItem('from_centers');
			const savedScroll = sessionStorage.getItem('centers_scroll_pos');

			if (fromCenters === 'true' && savedScroll) {
				const scrollY = parseInt(savedScroll, 10);
				if (!isNaN(scrollY) && scrollY > 0) {
					const origBehavior = document.documentElement.style.scrollBehavior;
					document.documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, scrollY);
					document.documentElement.style.scrollBehavior = origBehavior;
				}
				sessionStorage.removeItem('centers_scroll_pos');
			}
		}
	}, [isLoading, centers]);

	return (
		<div className='bg-gray-50 min-h-screen'>
			<SEO
				title={`${t('Центры оценки компетенций')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Аккредитованные центры оценки квалификации в Кыргызстане. Полный список организаций, проводящих независимую сертификацию и валидацию профессиональных компетенций.'
				)}
			/>
			<PageHero title={t('Центры оценки компетенций')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : centers && centers.length > 0 ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{centers.map((center: any) => (
							<Link
								key={center.id}
								to={`/documents/assessment-centers/${center.id}`}
								onClick={() => {
									sessionStorage.setItem('from_centers', 'true');
									sessionStorage.setItem('centers_scroll_pos', window.scrollY.toString());
								}}
								className='group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 border-l-4 border-l-blue-500 flex flex-col justify-between hover:border-l-blue-600'
							>
								<div>
									<h3 className='text-xl font-bold text-gray-900 mb-6 group-hover:text-blue-600 transition-colors duration-300 leading-tight min-h-28 flex items-start'>
										{center.organization}
									</h3>
									<div>
										<p className='text-sm text-gray-500 mb-2'>{t('Руководство Центра')}:</p>
										<div className='space-y-3'>
											{center.directors?.map((director: any) => (
												<div
													key={director.id}
													className='bg-slate-50/80 rounded-lg p-3 border border-slate-100 group-hover:bg-slate-100/50 transition-colors duration-300'
												>
													<p className='font-medium text-gray-800'>{director.name}</p>
													{director.phone && (
														<div className='mt-1 flex items-center text-gray-600'>
															<svg
																className='w-3.5 h-3.5 mr-1.5 text-blue-500'
																fill='none'
																stroke='currentColor'
																viewBox='0 0 24 24'
															>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth={2}
																	d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
																/>
															</svg>
															<span className='text-sm'>{director.phone}</span>
														</div>
													)}
												</div>
											))}
											{(!center.directors || center.directors.length === 0) && (
												<p className='text-sm text-gray-400 italic'>{t('Руководители не указаны')}</p>
											)}
										</div>
									</div>
								</div>

								<div className='mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors duration-300'>
									<span>{t('Подробнее')}</span>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300'
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
								</div>
							</Link>
						))}
					</div>
				) : (
					<EmptyState message={t('Центров пока нет.')} />
				)}
			</div>
		</div>
	);
}
