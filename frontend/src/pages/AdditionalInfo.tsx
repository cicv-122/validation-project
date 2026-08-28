import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import DocumentCard from '../components/ui/DocumentCard';
import { useProfStandards } from '../hooks/useApi';
import type { ProfStandard } from '../types';

export default function AdditionalInfo() {
	const { t } = useTranslation();
	const { data: standards, isLoading, error } = useProfStandards();

	return (
		<div className='bg-gray-50 min-h-screen'>
			<SEO
				title={`${t('Дополнительная информация')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Нормативно-правовые акты, положения, перечни документов и профессиональные стандарты Центра независимой сертификации и валидации КР.'
				)}
			/>
			<PageHero title={t('Дополнительная информация')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{/* Static Documents Section */}
				<div className='mb-16'>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
						<svg
							className='w-6 h-6 mr-2 text-blue-600'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
							/>
						</svg>
						{t('Нормативно-правовые акты')}
					</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						<DocumentCard
							title={t('ПОСТАНОВЛЕНИЕ КАБИНЕТА МИНИСТРОВ')}
							description={t('про Центр независимой сертификации и валидации')}
							downloadHref='/media/documents/NLA/Постановление.pdf'
							downloadLabel={t('Скачать документ')}
						/>
						<DocumentCard
							title={t('ПОЛОЖЕНИЕ')}
							description={t(
								'об учреждении «Центр независимой сертификации и валидации» при Министерстве просвещения Кыргызской Республики'
							)}
							downloadHref='/media/documents/NLA/Положение.pdf'
							downloadLabel={t('Скачать документ')}
						/>
						<DocumentCard
							title={t('Перечень документов для портфолио доказательств')}
							description={t(
								'Список документов, подтверждающих квалификацию для прохождения процедуры сертификации / валидации'
							)}
							downloadHref='/media/documents/NLA/Перечень документов для портфолио доказательств.pdf'
							downloadLabel={t('Скачать документ')}
						/>
					</div>
				</div>

				{/* Prof Standards Section */}
				<div>
					<h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center'>
						<svg
							className='w-6 h-6 mr-2 text-blue-600'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
							/>
						</svg>
						{t('Проф. стандарты')}
					</h2>
					{isLoading ? (
						<Spinner />
					) : error ? (
						<ErrorMessage message={t('Ошибка загрузки документов.')} />
					) : standards && standards.length > 0 ? (
						<div className='bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100'>
							<div className='overflow-x-auto'>
								<table className='min-w-full divide-y divide-gray-100'>
									<thead className='bg-gray-50/80'>
										<tr>
											<th
												scope='col'
												className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'
											>
												{t('Название')}
											</th>
											<th
												scope='col'
												className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'
											>
												{t('Файл')}
											</th>
										</tr>
									</thead>
									<tbody className='bg-white divide-y divide-gray-50'>
										{standards.map((doc: ProfStandard) => (
											<tr key={doc.id} className='hover:bg-slate-50/50 transition-colors'>
												<td className='px-6 py-5 whitespace-normal text-sm font-semibold text-gray-900 leading-snug'>
													{doc.title}
												</td>
												<td className='px-6 py-5 whitespace-nowrap text-right text-sm font-semibold'>
													<a
														href={doc.file}
														target='_blank'
														rel='noreferrer'
														className='text-blue-600 hover:text-blue-800 inline-flex items-center transition-colors bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100'
													>
														<svg
															xmlns='http://www.w3.org/2000/svg'
															className='h-4 w-4 mr-1.5'
															fill='none'
															viewBox='0 0 24 24'
															stroke='currentColor'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
															/>
														</svg>
														{t('Скачать')}
													</a>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<EmptyState message={t('Документов пока нет.')} />
					)}
				</div>
			</div>
		</div>
	);
}
