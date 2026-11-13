import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useExpertStatistics } from '../model/useExpertStatistics';
import { RegionBars } from './RegionBars';

interface AssessorsRegionChartProps {
	isVisible: boolean;
}

export default function AssessorsRegionChart({ isVisible }: AssessorsRegionChartProps) {
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language || 'ru';

	const { regionStats, sectorStats, maxCount, totalUniqueExperts } = useExpertStatistics();

	const priorityFieldsPrefix =
		currentLang === 'ky'
			? `${sectorStats.length} негизги багыт: `
			: currentLang === 'en'
				? `${sectorStats.length} priority fields: `
				: `${sectorStats.length === 2 ? 'Два направления' : `${sectorStats.length} направления`}: `;

	const priorityFieldsList = sectorStats
		.map((s) =>
			(currentLang === 'ky'
				? s.nameKg
				: currentLang === 'en'
					? s.nameEn
					: s.nameRu
			).toLowerCase()
		)
		.join('; ');

	return (
		<div className='bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm overflow-hidden'>
			<div className='flex flex-col md:flex-row md:items-start justify-between pb-6 mb-8 border-b border-gray-200/80 gap-6'>
				<div>
					<h3 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>
						{t('stats.chart.title', 'В 2025 году обучено 111 оценщиков')}
					</h3>

					<p className='mt-2.5 text-sm text-gray-700 leading-relaxed font-normal'>
						<span className='font-semibold text-gray-900'>{priorityFieldsPrefix}</span>
						<span className='text-[#283375] font-medium'>{priorityFieldsList}</span>
						.{' '}
						{t(
							'stats.chart.tail',
							'Мастера производственного обучения и представители работодателей.'
						)}
					</p>
				</div>

				<div className='flex items-center gap-3 self-start md:self-center flex-shrink-0'>
					<Link
						to='/documents/experts'
						className='inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#283375] text-white text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm'
					>
						<span>{t('stats.chart.view_all_btn', 'Открыть реестр')}</span>
						<span>→</span>
					</Link>
				</div>
			</div>

			<RegionBars
				regionStats={regionStats}
				maxCount={maxCount}
				isVisible={isVisible}
				currentLang={currentLang}
			/>

			<div className='mt-8 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500'>
				<div className='flex items-center gap-2 text-gray-700 bg-blue-50/80 border border-blue-200/80 px-4 py-2.5 rounded-xl'>
					<span className='w-2 h-2 rounded-full bg-blue-600 flex-shrink-0' />
					<span>
						<strong className='text-gray-900'>
							{t('stats.chart.qualification_note_title', 'Квалификационная структура:')}
						</strong>{' '}
						{currentLang === 'ky'
							? `Базада 134 баалоочу катталган, анын ичинде 63ү — иш берүүчүлөрдүн өкүлдөрү. 2025-жылы "Чебер" программасы боюнча 111 баалоочу окутулду.`
							: currentLang === 'en'
								? `134 assessors in database, of which 63 are employer representatives. 111 assessors were trained in 2025 under the Cheber project.`
								: `В базе Центра числятся 134 оценщика, из них 63 — представители работодателей. В 2025 году по программе «Чебер» обучено 111 оценщиков.`}
					</span>
				</div>
				<div className='text-gray-400 font-medium whitespace-nowrap'>
					{t('stats.chart.total_counter', 'Всего в базе: {{total}} специалистов', {
						total: totalUniqueExperts || 134,
					})}
				</div>
			</div>
		</div>
	);
}
