import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHero, SEO } from '../components/ui';
import localExpertsData from '../data/experts_database.json';

// Ordered regions according to official numbering
const REGION_ORDER = [
	{ code: '01', key: 'г. Бишкек', ru: 'г. Бишкек', kg: 'Бишкек ш.', en: 'Bishkek' },
	{ code: '02', key: 'г. Ош', ru: 'г. Ош', kg: 'Ош ш.', en: 'Osh' },
	{ code: '03', key: 'Чуйская область', ru: 'Чуйская область', kg: 'Чүй облусу', en: 'Chuy Region' },
	{ code: '04', key: 'Ошская область', ru: 'Ошская область', kg: 'Ош облусу', en: 'Osh Region' },
	{ code: '05', key: 'Нарынская область', ru: 'Нарынская область', kg: 'Нарын облусу', en: 'Naryn Region' },
	{ code: '06', key: 'Джалал-Абадская область (г. Манас)', ru: 'Джалал-Абадская область (г. Манас)', kg: 'Жалал-Абад облусу (Манас ш.)', en: 'Jalal-Abad Region (Manas city)' },
	{ code: '07', key: 'Таласская область', ru: 'Таласская область', kg: 'Талас облусу', en: 'Talas Region' },
	{ code: '08', key: 'Баткенская область', ru: 'Баткенская область', kg: 'Баткен облусу', en: 'Batken Region' },
	{ code: '09', key: 'Иссык-Кульская область', ru: 'Иссык-Кульская область', kg: 'Ысык-Көл облусу', en: 'Issyk-Kul Region' },
];

export interface MergedExpert {
	id: number | string;
	name: string;
	name_en?: string;
	role_ru: string;
	role_kg?: string;
	role_en?: string;
	profession_ru: string;
	profession_kg?: string;
	organization: string;
	organization_kg?: string;
	organization_en?: string;
	phone: string;
	city_ru: string;
	city_kg?: string;
	region_ru: string;
	region_kg?: string;
	code: string;
	assessment_center_id?: number;
	partner_id?: number;
	isTrainer: boolean;
	isAssessor: boolean;
	roles: string[];
	originalRecords: typeof localExpertsData;
}

export default function Experts() {
	const { t, i18n } = useTranslation();
	const isKg = i18n.language.startsWith('k') || i18n.language === 'ky';
	const isEn = i18n.language.startsWith('en');

	const [selectedRegionCode, setSelectedRegionCode] = useState<string>('all');
	const [selectedRole, setSelectedRole] = useState<string>('all');
	const [selectedProfession, setSelectedProfession] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState<string>('');

	// 1. Дедупликация и объединение экспертов: все эксперты являются оценщиками,
	// а 24 эксперта имеют дополнительную квалификацию тренера-оценщика
	const mergedExperts: MergedExpert[] = useMemo(() => {
		const rawList = localExpertsData as any[];
		const trainers = rawList.filter((item) => item.role_ru === 'Тренер');
		const assessors = rawList.filter((item) => item.role_ru === 'Оценщик');

		const synonymPairs: Record<string, string> = {
			'Молдокулова Элина Ашимбековна': 'Молдокулова Элина Эшимбековна',
			'Жунусова Таттыгул Ашырбаевна': 'Жунусова Таттуугул Аширбаевна',
			'Абубакирова Юлдуз Хабибуллаевна': 'Абабакирова Юлдуз Хабибуллоевна',
			'Калданова Гульзат': 'Калданова Гулзат',
			'Молдобаева Майрамкул Акматбековна': 'Молдобаева Майрамкуль Акматбековна',
			'Дженалиева Гульзада Асылбековна': 'Дженалиева Гулзада Асылбековна',
			'Жумабаева Бактыгул Амановна': 'Жумабаева Бактыгуль Амановна',
		};

		const map: Record<string, MergedExpert> = {};

		assessors.forEach((a) => {
			const key = a.name.trim().toLowerCase();
			map[key] = {
				...a,
				isTrainer: false,
				isAssessor: true,
				roles: ['Оценщик'],
				originalRecords: [a],
			};
		});

		trainers.forEach((t) => {
			const exactKey = t.name.trim().toLowerCase();
			const synTarget = synonymPairs[t.name];
			const synKey = synTarget ? synTarget.trim().toLowerCase() : null;

			const match = map[exactKey] || (synKey ? map[synKey] : null);

			if (match) {
				match.isTrainer = true;
				match.roles = ['Оценщик', 'Тренер-оценщик'];
				match.originalRecords.push(t);
				if (!match.phone && t.phone) match.phone = t.phone;
			} else {
				map[exactKey] = {
					...t,
					isTrainer: true,
					isAssessor: true,
					roles: ['Оценщик', 'Тренер-оценщик'],
					originalRecords: [t],
				};
			}
		});

		return Object.values(map);
	}, []);

	// Get unique professions with ru and kg labels (исключая чисто служебную метку "Тренер-оценщик")
	const professions = useMemo(() => {
		const map = new Map<string, string>();
		mergedExperts.forEach((item) => {
			if (item.profession_ru && item.profession_ru !== 'Тренер-оценщик' && !map.has(item.profession_ru)) {
				map.set(item.profession_ru, item.profession_kg || item.profession_ru);
			}
		});
		return Array.from(map.entries()).map(([ru, kg]) => ({ ru, kg }));
	}, [mergedExperts]);

	// Filter experts
	const filteredExperts = useMemo(() => {
		return mergedExperts.filter((expert) => {
			const matchesRegion =
				selectedRegionCode === 'all' || expert.code === selectedRegionCode;

			const matchesRole =
				selectedRole === 'all' ||
				(selectedRole === 'trainer' && expert.isTrainer) ||
				(selectedRole === 'assessor' && !expert.isTrainer);

			const matchesProfession =
				selectedProfession === 'all' || expert.profession_ru === selectedProfession;

			const combinedText = [
				expert.name,
				expert.organization,
				expert.phone,
				expert.profession_ru,
				expert.profession_kg,
				expert.city_ru,
				expert.region_ru,
				expert.isTrainer ? 'тренер тренер-оценщик' : 'оценщик',
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			const matchesSearch =
				searchQuery.trim() === '' ||
				combinedText.includes(searchQuery.toLowerCase().trim());

			return matchesRegion && matchesRole && matchesProfession && matchesSearch;
		});
	}, [mergedExperts, selectedRegionCode, selectedRole, selectedProfession, searchQuery]);

	// Filter only regions that currently have experts
	const availableRegions = useMemo(() => {
		return REGION_ORDER.filter((reg) =>
			mergedExperts.some((e) => e.code === reg.code)
		);
	}, [mergedExperts]);

	// Group by ordered region
	const groupedByRegion = useMemo(() => {
		const groups: { regionMeta: typeof REGION_ORDER[0]; items: MergedExpert[] }[] = [];

		REGION_ORDER.forEach((meta) => {
			const items = filteredExperts.filter((e) => e.code === meta.code);
			if (items.length > 0) {
				groups.push({ regionMeta: meta, items });
			}
		});

		return groups;
	}, [filteredExperts]);

	// Auto scroll to target expert row if hash or expertId is present
	const location = useLocation();
	useEffect(() => {
		const hash = location.hash;
		const searchParams = new URLSearchParams(location.search);
		const targetId = hash ? hash.replace('#', '') : searchParams.get('expertId') ? `expert-${searchParams.get('expertId')}` : null;

		if (targetId) {
			const timeout = setTimeout(() => {
				const el = document.getElementById(targetId);
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'center' });
					el.classList.add('bg-blue-100/70', 'ring-2', 'ring-blue-400');
					setTimeout(() => {
						el.classList.remove('bg-blue-100/70', 'ring-2', 'ring-blue-400');
					}, 2500);
				}
			}, 150);
			return () => clearTimeout(timeout);
		}
	}, [location]);

	return (
		<div className='bg-transparent min-h-screen pb-16 text-gray-900 dark:text-gray-100 transition-colors duration-200'>
			<SEO
				title={`${t('База данных экспертов и оценщиков')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Полный реестр экспертов-оценщиков и тренеров центров оценки квалификации по областям и регионам Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('База данных экспертов и оценщиков')} />

			<div className='max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
				{/* Search & Filters */}
				<div className='bg-white dark:bg-[#11162b] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-blue-900/40 space-y-5 transition-colors'>
					<div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center'>
						{/* Search Input */}
						<div className='relative flex-1'>
							<input
								type='text'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t('Поиск по ФИО, организации или городу...')}
								className='w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#0c0f24] border border-gray-300 dark:border-blue-900/40 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#0c0f24] transition-all'
							/>
							<svg
								className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
								/>
							</svg>
						</div>

						{/* Role Filter Tabs */}
						<div className='flex items-center gap-1.5 bg-gray-100 dark:bg-slate-900 p-1 rounded-lg shrink-0 border border-transparent dark:border-blue-900/30'>
							<button
								type='button'
								onClick={() => setSelectedRole('all')}
								className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
									selectedRole === 'all'
										? 'bg-white dark:bg-blue-600 text-gray-900 dark:text-white shadow-xs'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}`}>
								{t('Все квалификации')} ({mergedExperts.length})
							</button>
							<button
								type='button'
								onClick={() => setSelectedRole('trainer')}
								className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
									selectedRole === 'trainer'
										? 'bg-emerald-600 text-white shadow-xs'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}`}>
								<span>{t('Тренеры-оценщики')}</span>
								<span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
									selectedRole === 'trainer' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
								}`}>
									{mergedExperts.filter((e) => e.isTrainer).length}
								</span>
							</button>
							<button
								type='button'
								onClick={() => setSelectedRole('assessor')}
								className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
									selectedRole === 'assessor'
										? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
										: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
								}`}>
								{t('Только оценщики')} ({mergedExperts.filter((e) => !e.isTrainer).length})
							</button>
						</div>

						{/* Profession Filter */}
						<div className='w-full md:w-72'>
							<select
								value={selectedProfession}
								onChange={(e) => setSelectedProfession(e.target.value)}
								className='w-full py-2.5 px-3 bg-gray-50 dark:bg-[#0c0f24] border border-gray-300 dark:border-blue-900/40 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-[#0c0f24] transition-all'>
								<option value='all'>{t('Все специальности')}</option>
								{professions.map((prof) => (
									<option key={prof.ru} value={prof.ru} className='dark:bg-[#11162b]'>
										{isKg ? prof.kg : prof.ru}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Region Selector Tabs Ordered 01-09 (Empty ones hidden) */}
					<div className='pt-3 border-t border-gray-100 dark:border-blue-900/30 flex flex-wrap gap-2 items-center'>
						<button
							onClick={() => setSelectedRegionCode('all')}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
								selectedRegionCode === 'all'
									? 'bg-blue-900 dark:bg-blue-600 text-white shadow-sm'
									: 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
							}`}>
							{t('Все регионы')}
						</button>

						{availableRegions.map((reg) => {
							const countInRegion = mergedExperts.filter((e) => e.code === reg.code).length;
							return (
								<button
									key={reg.code}
									onClick={() => setSelectedRegionCode(reg.code)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
										selectedRegionCode === reg.code
											? 'bg-blue-900 dark:bg-blue-600 text-white shadow-sm'
											: 'bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
									}`}>
									<span>{isKg ? reg.kg : isEn ? reg.en : reg.ru}</span>
									<span
										className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
											selectedRegionCode === reg.code
												? 'bg-blue-800 dark:bg-blue-700 text-blue-100'
												: 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
										}`}>
										{countInRegion}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Expert List Content */}
				{groupedByRegion.length === 0 ? (
					<div className='bg-white dark:bg-[#11162b] p-12 rounded-2xl text-center border border-gray-200 dark:border-blue-900/40 text-gray-500 dark:text-gray-400'>
						{t('По вашему запросу эксперты не найдены.')}
					</div>
				) : (
					<div className='space-y-8'>
						{groupedByRegion.map(({ regionMeta, items }) => (
							<div
								key={regionMeta.code}
								className='bg-white dark:bg-[#11162b] rounded-2xl shadow-sm border border-gray-200 dark:border-blue-900/40 overflow-hidden'>
								{/* Region Header Banner in Navy/Blue style */}
								<div className='bg-gradient-to-r from-[#1e2a5e] via-[#253575] to-[#1e2a5e] dark:from-[#131a38] dark:via-[#192247] dark:to-[#131a38] px-6 py-4 text-white flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<span className='w-2.5 h-2.5 rounded-full bg-emerald-400' />
										<h3 className='text-base sm:text-lg font-bold tracking-wide'>
											{isKg ? regionMeta.kg : isEn ? regionMeta.en : regionMeta.ru}
										</h3>
									</div>
									<span className='text-xs font-medium bg-white/20 px-3 py-1 rounded-full'>
										{items.length} {t('экспертов')}
									</span>
								</div>

								{/* Experts Table */}
								<div className='overflow-x-auto'>
									<table className='min-w-full divide-y divide-gray-200 dark:divide-blue-900/30 text-sm'>
										<thead className='bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider'>
											<tr>
												<th className='px-6 py-3.5 text-left font-semibold'>№</th>
												<th className='px-6 py-3.5 text-left font-semibold'>
													{t('ФИО Эксперта')}
												</th>
												<th className='px-6 py-3.5 text-left font-semibold'>
													{t('Роль')}
												</th>
												<th className='px-6 py-3.5 text-left font-semibold'>
													{t('Специальность')}
												</th>
												<th className='px-6 py-3.5 text-left font-semibold'>
													{t('Организация / Заведение')}
												</th>
												<th className='px-6 py-3.5 text-right font-semibold'>
													{t('Контакты')}
												</th>
											</tr>
										</thead>
										<tbody className='divide-y divide-gray-200 dark:divide-blue-900/30 bg-white dark:bg-[#11162b]'>
											{items.map((exp, idx) => (
												<tr
													key={exp.id}
													id={`expert-${exp.id}`}
													className='hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors target:bg-amber-50 dark:target:bg-amber-950/40 target:ring-2 target:ring-amber-400'>
													<td className='px-6 py-4 text-gray-400 dark:text-gray-500 font-mono text-xs'>
														{idx + 1}
													</td>
													<td className='px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap'>
														{isEn && (exp as any).name_en ? (exp as any).name_en : exp.name}
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div className='flex flex-wrap items-center gap-1.5'>
															<span className='inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'>
																{isKg ? 'Баалоочу' : isEn ? 'Assessor' : 'Оценщик'}
															</span>
															{exp.isTrainer && (
																<span
																	title={t('Имеет квалификацию тренера и право обучать оценщиков')}
																	className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
																>
																	<span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
																	{isKg ? 'Тренер-баалоочу' : isEn ? 'Trainer-Assessor' : 'Тренер-оценщик'}
																</span>
															)}
														</div>
													</td>
													<td className='px-6 py-4 text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap'>
														<span>
															{exp.profession_ru === 'Тренер-оценщик'
																? (isKg ? 'Квалификацияны баалоо (Тренер)' : isEn ? 'Skills Assessment (Trainer)' : 'Оценка квалификаций (Тренер)')
																: (isKg ? (exp.profession_kg || exp.profession_ru) : exp.profession_ru)}
														</span>
													</td>
													<td className='px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-normal'>
														{exp.organization ? (
															exp.assessment_center_id ? (
																<Link
																	to={`/documents/assessment-centers/${exp.assessment_center_id}?from=experts&expertId=${exp.id}#expert-${exp.id}`}
																	title='Перейти на страницу центра оценки'
																	className='group inline-flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-950 dark:hover:text-white px-3 py-1.5 rounded-md border border-blue-200/80 dark:border-blue-800/60 text-xs sm:text-sm leading-relaxed transition-all shadow-xs'>
																	<span>
																		{exp.assessment_center_id === 4
																			? (isEn ? 'ATEC NSU named after S. Naamatov' : isKg ? 'С. Нааматов атындагы НАМУнун АТЭКи' : 'АТЭК НГУ им. С. Нааматова')
																			: exp.assessment_center_id === 2
																			? (isEn ? 'TC KNAU named after K.I. Skryabin' : isKg ? 'К.И. Скрябин атындагы КУАУнун ТКи' : 'ТК КНАУ им. К. И. Скрябина')
																			: isKg && (exp as any).organization_kg
																			? (exp as any).organization_kg
																			: isEn && (exp as any).organization_en
																			? (exp as any).organization_en
																			: exp.organization}
																	</span>
																	<svg className='w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																		<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
																	</svg>
																</Link>
															) : exp.partner_id ? (
																<Link
																	to={`/documents/partners/${exp.partner_id}?from=experts&expertId=${exp.id}#expert-${exp.id}`}
																	title='Перейти на страницу партнера'
																	className='group inline-flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 hover:text-emerald-950 dark:hover:text-white px-3 py-1.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 text-xs sm:text-sm leading-relaxed transition-all shadow-xs'>
																	<span>
																		{isKg && (exp as any).organization_kg
																			? (exp as any).organization_kg
																			: isEn && (exp as any).organization_en
																			? (exp as any).organization_en
																			: exp.organization}
																	</span>
																	<svg className='w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																		<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
																	</svg>
																</Link>
															) : (
																<span className='font-medium text-gray-800 dark:text-gray-200 inline-block bg-gray-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-md border border-gray-100 dark:border-blue-900/30 text-xs sm:text-sm leading-relaxed'>
																	{isKg && (exp as any).organization_kg
																		? (exp as any).organization_kg
																		: isEn && (exp as any).organization_en
																		? (exp as any).organization_en
																		: exp.organization}
																</span>
															)
														) : (
															<span className='text-gray-400 dark:text-gray-500'>—</span>
														)}
													</td>
													<td className='px-6 py-4 text-right font-mono text-gray-800 dark:text-gray-200 whitespace-nowrap'>
														{exp.phone ? (
															<a
																href={`tel:${exp.phone.replace(/\s+/g, '')}`}
																className='text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline font-semibold'>
																{exp.phone}
															</a>
														) : (
															<span className='text-gray-400 dark:text-gray-500'>—</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
