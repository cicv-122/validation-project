import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import rawExperts from '../../data/experts_database.json';

interface StatItem {
	id: string;
	prefix?: string;
	value?: number;
	displayStr?: string;
	suffix?: string;
	titleKey: string;
	descKey: string;
	icon: React.ReactNode;
}

interface RegionStat {
	id: string;
	cityRu: string;
	cityKg: string;
	regionRu: string;
	regionKg: string;
	count: number;
}

interface SectorStat {
	id: string;
	nameRu: string;
	nameKg: string;
	nameEn: string;
	icon: string;
	count: number;
	professions: { name: string; count: number }[];
}

export default function StatisticsSection() {
	const { t, i18n } = useTranslation();
	const sectionRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	// ДИНАМИЧЕСКИЙ РАСЧЕТ ИЗ НАШЕЙ РЕАЛЬНОЙ БАЗЫ ДАННЫХ EXPERTS_DATABASE.JSON
	const { totalAll, totalUniqueExperts, totalTrainers, regionStats, sectorStats, maxCount } = useMemo(() => {
		const rawList = rawExperts as any[];

		const trainers = rawList.filter((item) => item.role_ru === 'Тренер');
		const assessors = rawList.filter((item) => item.role_ru === 'Оценщик');

		// Таблица сопоставления расхождений написания имен между списками
		const synonymPairs: Record<string, string> = {
			'Молдокулова Элина Ашимбековна': 'Молдокулова Элина Эшимбековна',
			'Жунусова Таттыгул Ашырбаевна': 'Жунусова Таттуугул Аширбаевна',
			'Абубакирова Юлдуз Хабибуллаевна': 'Абабакирова Юлдуз Хабибуллоевна',
			'Калданова Гульзат': 'Калданова Гулзат',
			'Молдобаева Майрамкул Акматбековна': 'Молдобаева Майрамкуль Акматбековна',
			'Дженалиева Гульзада Асылбековна': 'Дженалиева Гулзада Асылбековна',
			'Жумабаева Бактыгул Амановна': 'Жумабаева Бактыгуль Амановна',
		};

		// 1. Дедупликация и объединение: все в реестре являются оценщиками,
		// а 24 эксперта имеют дополнительную квалификацию "Тренер-оценщик"
		const map: Record<string, any> = {};

		assessors.forEach((a) => {
			const key = a.name.trim().toLowerCase();
			map[key] = {
				...a,
				isTrainer: false,
				records: [a],
			};
		});

		trainers.forEach((t) => {
			const exactKey = t.name.trim().toLowerCase();
			const synTarget = synonymPairs[t.name];
			const synKey = synTarget ? synTarget.trim().toLowerCase() : null;

			const match = map[exactKey] || (synKey ? map[synKey] : null);

			if (match) {
				match.isTrainer = true;
				match.records.push(t);
				if (!match.phone && t.phone) match.phone = t.phone;
			} else {
				map[exactKey] = {
					...t,
					isTrainer: true,
					records: [t],
				};
			}
		});

		const uniqueExpertsList = Object.values(map);

		// 2. Группировка по городам / регионам
		const groupMap: Record<string, RegionStat & { trainersCount: number }> = {};

		uniqueExpertsList.forEach((item) => {
			const cityRu = (item.city_ru || '').trim();
			const cityKg = (item.city_kg || '').trim();
			let regionRu = (item.region_ru || '').trim();
			let regionKg = (item.region_kg || '').trim();

			if (regionRu.includes('(')) {
				regionRu = regionRu.split('(')[0].trim();
			}
			if (regionKg.includes('(')) {
				regionKg = regionKg.split('(')[0].trim();
			}

			const key = `${cityRu}_${regionRu}`;

			if (!groupMap[key]) {
				groupMap[key] = {
					id: key,
					cityRu,
					cityKg,
					regionRu,
					regionKg,
					count: 0,
					trainersCount: 0,
				};
			}
			groupMap[key].count += 1;
			if (item.isTrainer) {
				groupMap[key].trainersCount += 1;
			}
		});

		const sortedRegions = Object.values(groupMap).sort((a, b) => b.count - a.count);
		const max = sortedRegions.length > 0 ? sortedRegions[0].count : 1;

		// 3. ДИНАМИЧЕСКАЯ ГРУППИРОВКА ПО ОТРАСЛЯМ И СПЕЦИАЛЬНОСТЯМ
		const sectors: Record<string, SectorStat> = {
			hospitality: {
				id: 'hospitality',
				nameRu: 'Гостиничный и ресторанный бизнес',
				nameKg: 'Мейманкана жана ресторан бизнеси',
				nameEn: 'Hotel & Restaurant Industry',
				icon: '🍽️',
				count: 0,
				professions: [],
			},
			textile: {
				id: 'textile',
				nameRu: 'Швейное производство',
				nameKg: 'Тигүү өндүрүшү',
				nameEn: 'Garment Manufacturing',
				icon: '🧵',
				count: 0,
				professions: [],
			},
			other: {
				id: 'other',
				nameRu: 'Другие сферы',
				nameKg: 'Башка тармактар',
				nameEn: 'Other sectors',
				icon: '🛠️',
				count: 0,
				professions: [],
			},
		};

		const profMap: Record<string, Record<string, number>> = {
			hospitality: {},
			textile: {},
			other: {},
		};

		uniqueExpertsList.forEach((item) => {
			const profRu = (item.profession_ru || '').trim();
			const pLower = profRu.toLowerCase();

			let sectorKey = 'other';
			if (pLower.includes('повар') || pLower.includes('кондитер') || pLower.includes('горничн')) {
				sectorKey = 'hospitality';
			} else if (pLower.includes('шве') || pLower.includes('портн') || pLower.includes('крои')) {
				sectorKey = 'textile';
			}

			sectors[sectorKey].count += 1;
			if (profRu && profRu !== 'Тренер-оценщик') {
				profMap[sectorKey][profRu] = (profMap[sectorKey][profRu] || 0) + 1;
			}
		});

		// Формируем список топ-профессий для каждого сектора
		Object.keys(sectors).forEach((key) => {
			sectors[key].professions = Object.entries(profMap[key])
				.map(([name, count]) => ({ name, count }))
				.sort((a, b) => b.count - a.count);
		});

		// Отбираем только те отрасли, в которых есть специалисты (>0)
		const activeSectors = Object.values(sectors).filter((s) => s.count > 0);

		return {
			totalAll: rawExperts.length,
			totalUniqueExperts: uniqueExpertsList.length,
			totalTrainers: uniqueExpertsList.filter((e) => e.isTrainer).length,
			regionStats: sortedRegions,
			sectorStats: activeSectors,
			maxCount: max,
		};
	}, []);

	// 8 показателей по сентябрю 2026 г.
	const stats: StatItem[] = [
		{
			id: 'candidates',
			prefix: '~',
			value: 1200,
			titleKey: 'stats.candidates_title',
			descKey: 'stats.candidates_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
				</svg>
			),
		},
		{
			id: 'migrants',
			prefix: '~',
			displayStr: '250+',
			titleKey: 'stats.migrants_title',
			descKey: 'stats.migrants_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
				</svg>
			),
		},
		{
			id: 'professions',
			prefix: '~',
			value: 20,
			titleKey: 'stats.professions_title',
			descKey: 'stats.professions_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
				</svg>
			),
		},
		{
			id: 'tools',
			value: 400,
			suffix: '+',
			titleKey: 'stats.tools_title',
			descKey: 'stats.tools_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' />
				</svg>
			),
		},
		{
			id: 'assessors',
			value: totalAll,
			titleKey: 'stats.assessors_title',
			descKey: 'stats.assessors_desc_updated',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
				</svg>
			),
		},
		{
			id: 'standards',
			value: 29,
			titleKey: 'stats.standards_title',
			descKey: 'stats.standards_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
				</svg>
			),
		},
		{
			id: 'labs',
			value: 11,
			titleKey: 'stats.labs_title',
			descKey: 'stats.labs_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' />
				</svg>
			),
		},
		{
			id: 'price',
			value: 10000,
			suffix: ' сом',
			titleKey: 'stats.price_title',
			descKey: 'stats.price_desc',
			icon: (
				<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
				</svg>
			),
		},
	];

	const currentLang = i18n.language || 'ru';

	return (
		<section ref={sectionRef} className='py-12 md:py-16'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12'>
				{/* 1. БЛОК ЦИФР И МЕТРИК */}
				<div>
					{/* Заголовок */}
					<div className='flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 border-b-2 border-gray-100 dark:border-blue-900/30 pb-4 gap-4'>
						<div>
							<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-[#283375] dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-100 dark:border-blue-800/40'>
								<span className='w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse' />
								{t('stats.badge', 'Статистика и показатели')}
							</div>
							<h2 className='text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
								{t('stats.title_main', 'Центр в цифрах')}{' '}
								<span className='text-[#8B1E1E] dark:text-rose-400 font-medium text-lg sm:text-xl md:text-2xl block sm:inline mt-1 sm:mt-0'>
									({t('stats.subtitle_updated', 'данные на сентябрь 2026 г.')})
								</span>
							</h2>
						</div>
						<p className='text-sm text-gray-500 dark:text-gray-400 max-w-md'>
							{t('stats.footnote', 'Результаты деятельности и динамика развития Центра независимой сертификации и валидации')}
						</p>
					</div>

					{/* Сетка показателей 4 в ряд на desktop */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
						{stats.map((item, idx) => (
							<StatCard
								key={item.id}
								item={item}
								isVisible={isVisible}
								delay={idx * 60}
							/>
						))}
					</div>
				</div>

				{/* 2. БЛОК ГРАФИКА НА ОСНОВЕ НАШЕЙ РЕАЛЬНОЙ БАЗЫ ДАННЫХ */}
				<div className='bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-[#11162b] dark:via-[#141a33] dark:to-[#171f3d] rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 dark:border-blue-900/40 shadow-sm overflow-hidden transition-colors'>
					<div className='flex flex-col md:flex-row md:items-start justify-between pb-6 mb-8 border-b border-gray-200/80 dark:border-blue-900/50 gap-6'>
						<div>
							<h3 className='text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white'>
								{t('stats.chart.title', 'В 2025 году обучено 111 оценщиков')}
							</h3>
							
							{/* Динамический текст направлений из реальной базы данных */}
							<p className='mt-2.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal'>
								<span className='font-semibold text-gray-900 dark:text-white'>
									{currentLang === 'ky'
										? `${sectorStats.length} негизги багыт: `
										: (currentLang === 'en'
											? `${sectorStats.length} priority fields: `
											: `${sectorStats.length === 2 ? 'Два направления' : `${sectorStats.length} направления`}: `)}
								</span>
								<span className='text-[#283375] dark:text-blue-300 font-medium'>
									{sectorStats.map((s) => (currentLang === 'ky' ? s.nameKg : (currentLang === 'en' ? s.nameEn : s.nameRu)).toLowerCase()).join('; ')}
								</span>
								. {t('stats.chart.tail', 'Мастера производственного обучения и представители работодателей.')}
							</p>
						</div>

						{/* Кнопка перехода в полную базу данных */}
						<div className='flex items-center gap-3 self-start md:self-center flex-shrink-0'>
							<Link
								to='/documents/experts'
								className='inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#283375] dark:bg-blue-600 text-white text-sm font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors shadow-sm'
							>
								<span>{t('stats.chart.view_all_btn', 'Открыть реестр')}</span>
								<span>→</span>
							</Link>
						</div>
					</div>

					{/* Сам график из реальных данных */}
					<div className='space-y-4 max-w-4xl'>
						{regionStats.map((r, i) => {
							const percent = Math.round((r.count / maxCount) * 100);

							const city = currentLang === 'ky' ? (r.cityKg || r.cityRu) : r.cityRu;
							const region = currentLang === 'ky' ? (r.regionKg || r.regionRu) : r.regionRu;

							let labelTitle = city;
							let labelSubtitle = '';

							if (city && region && city !== region && !region.includes(city.replace(/^г\.\s*/, ''))) {
								labelSubtitle = region;
							} else if (!city && region) {
								labelTitle = region;
							}

							return (
								<div key={r.id} className='group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4'>
									{/* Название города и области в скобках */}
									<div className='sm:w-72 text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between sm:justify-start gap-1.5'>
										<div className='truncate'>
											<span className='text-gray-900 dark:text-gray-100'>{labelTitle}</span>
											{labelSubtitle && (
												<span className='text-xs font-normal text-gray-500 dark:text-gray-400 ml-1.5'>
													({labelSubtitle})
												</span>
											)}
										</div>
										<span className='sm:hidden font-bold text-sm text-[#283375] dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded'>
											{r.count}
										</span>
									</div>

									{/* Полоса бара с анимацией */}
									<div className='flex-1 h-9 bg-gray-100/90 dark:bg-slate-800/80 rounded-xl overflow-hidden p-1 relative flex items-center'>
										<div
											className='h-full bg-gradient-to-r from-[#283375] to-blue-600 dark:from-blue-600 dark:to-indigo-500 rounded-lg flex items-center justify-end pr-3 transition-all duration-1000 ease-out shadow-sm group-hover:from-blue-700 group-hover:to-indigo-500'
											style={{
												width: isVisible ? `${percent}%` : '0%',
												transitionDelay: `${i * 90}ms`,
											}}
										>
											<div className='w-full h-full opacity-10 bg-white rounded-lg pointer-events-none' />
										</div>

										{/* Цифра справа от бара */}
										<div className='hidden sm:flex items-center gap-1.5 ml-3'>
											<span className='text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#283375] dark:group-hover:text-blue-400 transition-colors'>
												{r.count}
											</span>
											{r.trainersCount > 0 && (
												<span
													title={`Из них ${r.trainersCount} имеют квалификацию тренера-оценщика`}
													className='text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-md'
												>
													+{r.trainersCount} {currentLang === 'ky' ? 'тренер' : currentLang === 'en' ? 'trainers' : 'тренеров'}
												</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Нижняя информационная плашка с разъяснением по оценщикам и тренерам */}
					<div className='mt-8 pt-6 border-t border-gray-200/60 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400'>
						<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/50 px-4 py-2.5 rounded-xl'>
							<span className='w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0' />
							<span>
								<strong className='text-gray-900 dark:text-white'>{t('stats.chart.qualification_note_title', 'Квалификационная структура:')}</strong>{' '}
								{currentLang === 'ky'
									? `Бардык ${totalUniqueExperts} адис баалоочу болуп саналат, алардын ичинен ${totalTrainers} эксперт башка баалоочуларды даярдоо укугу менен тренер-баалоочу квалификациясына ээ.`
									: currentLang === 'en'
									? `All ${totalUniqueExperts} specialists are certified assessors, of which ${totalTrainers} hold the trainer-assessor qualification with rights to train evaluators.`
									: `Все ${totalUniqueExperts} специалистов являются действующими оценщиками, из них ${totalTrainers} экспертов обладают квалификацией тренера-оценщика с правом подготовки специалистов.`}
							</span>
						</div>
						<div className='text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap'>
							{t('stats.chart.total_counter', 'Всего в базе: {{total}} записей', { total: totalAll })}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function StatCard({
	item,
	isVisible,
	delay,
}: {
	item: StatItem;
	isVisible: boolean;
	delay: number;
}) {
	const { t } = useTranslation();
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!isVisible || item.value === undefined) return;

		const end = item.value;
		const duration = 1200;
		const frameRate = 1000 / 60;
		const totalFrames = Math.round(duration / frameRate);
		let frame = 0;

		const timeout = setTimeout(() => {
			const timer = setInterval(() => {
				frame++;
				const progress = frame / totalFrames;
				const current = Math.round(end * (progress * (2 - progress)));
				setCount(current);

				if (frame >= totalFrames) {
					setCount(end);
					clearInterval(timer);
				}
			}, frameRate);

			return () => clearInterval(timer);
		}, delay);

		return () => clearTimeout(timeout);
	}, [isVisible, item.value, delay]);

	const formattedCount = item.value !== undefined
		? (item.value >= 1000 ? count.toLocaleString('ru-RU') : count)
		: item.displayStr;

	return (
		<div className='group relative bg-white dark:bg-[#11162b] rounded-2xl p-6 border border-gray-100/90 dark:border-blue-900/40 shadow-sm hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden'>
			<div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#283375] to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

			<div>
				<div className='flex items-center justify-between mb-4'>
					<div className='w-12 h-12 rounded-xl bg-blue-50/80 dark:bg-blue-950/70 text-[#283375] dark:text-blue-300 flex items-center justify-center group-hover:bg-[#283375] group-hover:text-white dark:group-hover:bg-blue-600 transition-colors duration-300 shadow-sm border border-transparent dark:border-blue-800/40'>
						{item.icon}
					</div>
					<div className='w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-500 transition-colors duration-300' />
				</div>

				<div className='text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2 group-hover:text-[#283375] dark:group-hover:text-blue-400 transition-colors duration-300'>
					{item.prefix && <span className='text-gray-400 dark:text-gray-500 font-bold mr-0.5'>{item.prefix}</span>}
					<span>{formattedCount}</span>
					{item.suffix && <span className='text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400 ml-1'>{item.suffix}</span>}
				</div>

				<div className='text-sm text-gray-600 dark:text-gray-400 leading-snug font-normal'>
					{t(item.descKey)}
				</div>
			</div>
		</div>
	);
}
