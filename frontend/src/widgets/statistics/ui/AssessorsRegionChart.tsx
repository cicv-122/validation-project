import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import rawExperts from '../../../data/experts_database.json';

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

interface AssessorsRegionChartProps {
	isVisible: boolean;
}

export default function AssessorsRegionChart({ isVisible }: AssessorsRegionChartProps) {
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language || 'ru';

	// ДИНАМИЧЕСКИЙ РАСЧЕТ ИЗ НАШЕЙ РЕАЛЬНОЙ БАЗЫ ДАННЫХ EXPERTS_DATABASE.JSON
	const { regionStats, sectorStats, maxCount } = useMemo(() => {
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

	return (
		<div className='bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-100 shadow-sm overflow-hidden'>
			<div className='flex flex-col md:flex-row md:items-start justify-between pb-6 mb-8 border-b border-gray-200/80 gap-6'>
				<div>
					<h3 className='text-2xl sm:text-3xl font-extrabold text-gray-900'>
						{t('stats.chart.title', 'В 2025 году обучено 111 оценщиков')}
					</h3>

					{/* Динамический текст направлений из реальной базы данных */}
					<p className='mt-2.5 text-sm text-gray-700 leading-relaxed font-normal'>
						<span className='font-semibold text-gray-900'>
							{currentLang === 'ky'
								? `${sectorStats.length} негизги багыт: `
								: currentLang === 'en'
									? `${sectorStats.length} priority fields: `
									: `${sectorStats.length === 2 ? 'Два направления' : `${sectorStats.length} направления`}: `}
						</span>
						<span className='text-[#283375] font-medium'>
							{sectorStats
								.map((s) =>
									(currentLang === 'ky'
										? s.nameKg
										: currentLang === 'en'
											? s.nameEn
											: s.nameRu
									).toLowerCase()
								)
								.join('; ')}
						</span>
						.{' '}
						{t(
							'stats.chart.tail',
							'Мастера производственного обучения и представители работодателей.'
						)}
					</p>
				</div>

				{/* Кнопка перехода в полную базу данных */}
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

			{/* Сам график из реальных данных */}
			<div className='space-y-4 max-w-4xl'>
				{regionStats.map((r, i) => {
					const percent = Math.round((r.count / maxCount) * 100);

					const city = currentLang === 'ky' ? r.cityKg || r.cityRu : r.cityRu;
					const region = currentLang === 'ky' ? r.regionKg || r.regionRu : r.regionRu;

					let labelTitle = city;
					let labelSubtitle = '';

					if (
						city &&
						region &&
						city !== region &&
						!region.includes(city.replace(/^г\.\s*/, ''))
					) {
						labelSubtitle = region;
					} else if (!city && region) {
						labelTitle = region;
					}

					return (
						<div
							key={r.id}
							className='group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4'
						>
							{/* Название города и области в скобках */}
							<div className='sm:w-72 text-sm font-semibold text-gray-800 flex items-center justify-between sm:justify-start gap-1.5'>
								<div className='truncate'>
									<span className='text-gray-900'>{labelTitle}</span>
									{labelSubtitle && (
										<span className='text-xs font-normal text-gray-500 ml-1.5'>
											({labelSubtitle})
										</span>
									)}
								</div>
								<span className='sm:hidden font-bold text-sm text-[#283375] bg-blue-50 px-2 py-0.5 rounded'>
									{r.count}
								</span>
							</div>

							{/* Полоса бара с анимацией */}
							<div className='flex-1 h-9 bg-gray-100/90 rounded-xl overflow-hidden p-1 relative flex items-center'>
								<div
									className='h-full bg-gradient-to-r from-[#283375] to-blue-600 rounded-lg flex items-center justify-end pr-3 transition-all duration-1000 ease-out shadow-sm group-hover:from-blue-700 group-hover:to-indigo-500'
									style={{
										width: isVisible ? `${percent}%` : '0%',
										transitionDelay: `${i * 90}ms`,
									}}
								>
									<div className='w-full h-full opacity-10 bg-white rounded-lg pointer-events-none' />
								</div>

								{/* Цифра справа от бара */}
								<div className='hidden sm:flex items-center gap-1.5 ml-3'>
									<span className='text-sm font-extrabold text-gray-900 group-hover:text-[#283375] transition-colors'>
										{r.count}
									</span>
									{r.trainersCount > 0 && (
										<span
											title={`Из них ${r.trainersCount} имеют квалификацию тренера-оценщика`}
											className='text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md'
										>
											+{r.trainersCount}{' '}
											{currentLang === 'ky'
												? 'тренер'
												: currentLang === 'en'
													? 'trainers'
													: 'тренеров'}
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Нижняя информационная плашка с разъяснением по оценщикам и тренерам */}
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
						total: 134,
					})}
				</div>
			</div>
		</div>
	);
}
