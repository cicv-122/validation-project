import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useProfStandards } from '../hooks/useApi';
import type { ProfStandard } from '../types';

export default function ProfStandards() {
	const { t, i18n } = useTranslation();
	const { data: standards, isLoading, error } = useProfStandards();

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('Профессиональные стандарты')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Профессиональные стандарты, утвержденные для проведения независимой сертификации и валидации профессиональных квалификаций в Кыргызской Республике.'
				)}
			/>
			<PageHero title={t('Проф. стандарты')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки документов.')} />
				) : standards && standards.length > 0 ? (
					<div className='overflow-x-auto shadow-sm rounded-lg border border-gray-200'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
									>
										{t('Название')}
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
									>
										{t('Дата публ.')}
									</th>
									<th
										scope='col'
										className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
									>
										{t('Файл')}
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{standards.map((doc: ProfStandard) => (
									<tr key={doc.id} className='hover:bg-gray-50 transition-colors'>
										<td className='px-6 py-4 whitespace-normal text-sm font-medium text-gray-900'>
											{doc.title}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{new Date(doc.created_at).toLocaleDateString(i18n.language)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<a
												href={doc.file}
												target='_blank'
												rel='noreferrer'
												className='text-blue-600 hover:text-blue-900 inline-flex items-center gap-1'
											>
												<svg
													className='w-4 h-4'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
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
				) : (
					<EmptyState message={t('Документов пока нет.')} />
				)}
			</div>
		</div>
	);
}
