import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useExperts } from '../hooks/useApi';

export default function Experts() {
	const { t } = useTranslation();
	const { data: experts, isLoading, error } = useExperts();

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('База данных экспертов')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Полный список экспертов-оценщиков центров оценки квалификации, аккредитованных Центром независимой сертификации и валидации Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('База данных экспертов')} />
			<div className='max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : experts && experts.length > 0 ? (
					<div className='overflow-x-auto shadow-sm rounded-lg border border-gray-200'>
						<table className='min-w-full divide-y divide-gray-200 text-sm'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
										{t('Центр оценки')}
									</th>
									<th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
										{t('Профессия')}
									</th>
									<th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
										{t('Оценщики')}
									</th>
									<th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
										{t('Оценщик работодатель')}
									</th>
									<th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
										{t('Консультант')}
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{experts.map((exp: any) => (
									<tr key={exp.id} className='hover:bg-gray-50 transition-colors'>
										<td className='px-4 py-4 whitespace-normal font-medium text-gray-900'>
											{exp.assessment_center?.organization}
										</td>
										<td className='px-4 py-4 whitespace-normal text-gray-700'>{exp.profession}</td>
										<td className='px-4 py-4 whitespace-normal text-gray-600 space-y-1'>
											{exp.appraisers?.split('\n').map((line: string, i: number) => (
												<div key={i}>{line}</div>
											))}
										</td>
										<td className='px-4 py-4 whitespace-normal text-gray-600 space-y-1'>
											{exp.appraiser_employer?.split('\n').map((line: string, i: number) => (
												<div key={i}>{line}</div>
											))}
										</td>
										<td className='px-4 py-4 whitespace-normal text-gray-600'>{exp.consultant}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<EmptyState message={t('Данных пока нет.')} />
				)}
			</div>
		</div>
	);
}
