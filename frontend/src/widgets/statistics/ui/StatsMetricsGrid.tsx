import { useTranslation } from 'react-i18next';
import StatCard, { StatItem } from './StatCard';

interface StatsMetricsGridProps {
	isVisible: boolean;
}

export default function StatsMetricsGrid({ isVisible }: StatsMetricsGridProps) {
	const { t } = useTranslation();

	// 8 показателей по сентябрю 2026 г.
	const stats: StatItem[] = [
		{
			id: 'candidates',
			prefix: '~',
			value: 1434,
			titleKey: 'stats.candidates_title',
			descKey: 'stats.candidates_desc',
			defaultDesc: 'человек прошли сертификацию и валидацию с 2024 г.',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
					/>
				</svg>
			),
		},
		{
			id: 'migrants',
			prefix: '~',
			value: 286,
			titleKey: 'stats.migrants_title',
			descKey: 'stats.migrants_desc',
			defaultDesc: 'из них — трудовые мигранты',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
			),
		},
		{
			id: 'professions',
			prefix: '~',
			value: 31,
			titleKey: 'stats.professions_title',
			descKey: 'stats.professions_desc',
			defaultDesc: 'профессий; уровни 3 и 4 НРК',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
					/>
				</svg>
			),
		},
		{
			id: 'tools',
			prefix: '~',
			value: 1767,
			titleKey: 'stats.tools_title',
			descKey: 'stats.tools_desc',
			defaultDesc: 'инструментов оценки (при поддержке GIZ, АБР, МОТ)',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
					/>
				</svg>
			),
		},
		{
			id: 'assessors',
			value: 134,
			titleKey: 'stats.assessors_title',
			descKey: 'stats.assessors_desc_updated',
			defaultDesc: 'оценщиков в базе (в т.ч. от работодателей)',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
					/>
				</svg>
			),
		},
		{
			id: 'standards',
			value: 29,
			titleKey: 'stats.standards_title',
			descKey: 'stats.standards_desc',
			defaultDesc: 'утверждённых профессиональных стандартов',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
					/>
				</svg>
			),
		},
		{
			id: 'labs',
			value: 18,
			titleKey: 'stats.labs_title',
			descKey: 'stats.labs_desc',
			defaultDesc: 'лабораторий оснащены для практической оценки',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
					/>
				</svg>
			),
		},
		{
			id: 'price',
			value: 10000,
			suffix: t('stats.currency_suffix', ' сом'),
			titleKey: 'stats.price_title',
			descKey: 'stats.price_desc',
			defaultDesc: 'сом — стоимость услуги для кандидата',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
					/>
				</svg>
			),
		},
	];

	return (
		<div>
			{/* Заголовок */}
			<div className='flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 border-b-2 border-gray-100 pb-4 gap-4'>
				<div>
					<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#283375] text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-100'>
						<span className='w-2 h-2 rounded-full bg-blue-600 animate-pulse' />
						{t('stats.badge', 'Статистика и показатели')}
					</div>
					<h2 className='text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight'>
						{t('stats.title_main', 'Центр в цифрах')}{' '}
						<span className='text-[#8B1E1E] font-medium text-lg sm:text-xl md:text-2xl block sm:inline mt-1 sm:mt-0'>
							({t('stats.subtitle_updated', 'данные на сентябрь 2026 г.')})
						</span>
					</h2>
				</div>
				<p className='text-sm text-gray-500 max-w-md'>
					{t(
						'stats.footnote',
						'Результаты деятельности и динамика развития Центра независимой сертификации и валидации'
					)}
				</p>
			</div>

			{/* Сетка показателей 4 в ряд на desktop */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
				{stats.map((item, idx) => (
					<StatCard key={item.id} item={item} isVisible={isVisible} delay={idx * 60} />
				))}
			</div>
		</div>
	);
}
