import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, SEO, Spinner } from '../components/ui';
import { useAssessmentCenter } from '../hooks/useApi';

export default function AssessmentCenterDetail() {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { data: center, isLoading, error } = useAssessmentCenter(id);

	if (isLoading) {
		return <Spinner />;
	}

	if (error || !center) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<ErrorMessage message={t('Ошибка загрузки данных.')} />
			</div>
		);
	}

	return (
		<div className='bg-slate-50 py-12 min-h-screen'>
			<SEO
				title={`${center.organization} — ${t('Центры оценки компетенций')}`}
				description={t('Детальная информация о центре оценки компетенций, контакты, сертифицируемые профессии и эксперты.')}
			/>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Back Link */}
				<div className='mb-8' id='center-detail-container'>
					<Link
						to='/documents/assessment-centers'
						className='inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5 mr-1.5'
							viewBox='0 0 20 20'
							fill='currentColor'
						>
							<path
								fillRule='evenodd'
								d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
								clipRule='evenodd'
							/>
						</svg>
						{t('Назад к списку центров')}
					</Link>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column: Title and Professions/Experts */}
					<div className='lg:col-span-2 space-y-6'>
						<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8'>
							<h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4'>
								{center.organization}
							</h1>
							<div className='w-20 h-1.5 bg-blue-500 rounded-full'></div>
						</div>

						{/* Professions and Experts Table */}
						<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8'>
							<h2 className='text-xl font-bold text-gray-900 mb-6'>
								{t('Сертифицируемые направления и эксперты')}
							</h2>

							{center.experts && center.experts.length > 0 ? (
								<div className='overflow-x-auto -mx-6 sm:mx-0'>
									<table className='min-w-full divide-y divide-gray-200 text-sm'>
										<thead className='bg-gray-50'>
											<tr>
												<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
													{t('Профессия')}
												</th>
												<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
													{t('Оценщики')}
												</th>
												<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
													{t('Оценщик-работодатель')}
												</th>
												<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
													{t('Консультант')}
												</th>
											</tr>
										</thead>
										<tbody className='bg-white divide-y divide-gray-100'>
											{center.experts.map((exp) => (
												<tr key={exp.id} className='hover:bg-slate-50/50 transition-colors'>
													<td className='px-6 py-4 font-medium text-gray-900 align-top whitespace-normal'>
														{exp.profession}
													</td>
													<td className='px-6 py-4 text-gray-600 align-top whitespace-normal leading-relaxed'>
														{exp.appraisers}
													</td>
													<td className='px-6 py-4 text-gray-600 align-top whitespace-normal leading-relaxed'>
														{exp.appraiser_employer}
													</td>
													<td className='px-6 py-4 text-gray-600 align-top whitespace-normal'>
														{exp.consultant}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p className='text-gray-500 italic text-sm'>
									{t('Информация о направлениях сертификации временно отсутствует.')}
								</p>
							)}
						</div>
					</div>

					{/* Right Column: Sidebar Contacts & Directors */}
					<div className='space-y-6'>
						{/* Contacts Card */}
						<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
							<h3 className='text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4'>
								{t('Контакты Центра')}
							</h3>
							<div className='space-y-4 text-sm text-gray-600'>
								{center.address && (
									<div className='flex items-start'>
										<svg
											className='w-5 h-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
											/>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
											/>
										</svg>
										<div className='space-y-1.5'>
											{center.address
												.split(/[\r\n]+/)
												.map((a) => a.trim())
												.filter(Boolean)
												.map((addr, idx) => (
													<div key={idx}>
														<a
															href={center.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`}
															target='_blank'
															rel='noopener noreferrer'
															className='text-gray-900 leading-relaxed hover:text-blue-600 font-medium transition-colors inline-block'
															title={t('Открыть на карте')}
														>
															{addr}
														</a>
													</div>
												))}
										</div>
									</div>
								)}

								{center.phone && (
									<div className='flex items-start'>
										<svg
											className='w-5 h-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0'
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
										<div className='space-y-1'>
											{center.phone.split('\n').filter(Boolean).map((p, idx) => (
												<div key={idx}>
													<a href={`tel:${p.replace(/[^\d+]/g, '')}`} className='hover:text-blue-600 hover:underline transition-colors'>
														{p}
													</a>
												</div>
											))}
										</div>
									</div>
								)}

								{center.email && (
									<div className='flex items-center'>
										<svg
											className='w-5 h-5 mr-3 text-blue-500 flex-shrink-0'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
											/>
										</svg>
										<a
											href={`mailto:${center.email}`}
											className='hover:text-blue-600 hover:underline transition-colors'
										>
											{center.email}
										</a>
									</div>
								)}

								{center.website && (
									<div className='flex items-center'>
										<svg
											className='w-5 h-5 mr-3 text-blue-500 flex-shrink-0'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
											/>
										</svg>
										<a
											href={center.website}
											target='_blank'
											rel='noopener noreferrer'
											className='hover:text-blue-600 hover:underline transition-colors truncate'
										>
											{center.website.replace(/^https?:\/\//, '')}
										</a>
									</div>
								)}
							</div>
						</div>

						{/* Administration Card */}
						<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
							<h3 className='text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4'>
								{t('Руководство')}
							</h3>
							<div className='space-y-4'>
								{center.directors && center.directors.length > 0 ? (
									center.directors.map((dir) => (
										<div key={dir.id} className='bg-slate-50 rounded-xl p-4 border border-slate-100'>
											<p className='font-semibold text-gray-800 text-sm'>{dir.name}</p>
											{dir.phone && (
												<div className='mt-2 flex items-center text-gray-600 text-xs font-medium'>
													<svg
														className='w-4 h-4 mr-2 text-blue-500 flex-shrink-0'
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
													<span>{dir.phone}</span>
												</div>
											)}
										</div>
									))
								) : (
									<p className='text-gray-400 italic text-sm'>{t('Руководители не указаны')}</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
