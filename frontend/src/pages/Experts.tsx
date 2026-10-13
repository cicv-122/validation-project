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

export default function Experts() {
	const { t, i18n } = useTranslation();
	const isKg = i18n.language.startsWith('k') || i18n.language === 'ky';
	const isEn = i18n.language.startsWith('en');

	const [selectedRegionCode, setSelectedRegionCode] = useState<string>('all');
	const [selectedProfession, setSelectedProfession] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState<string>('');

	// Get unique professions with ru and kg labels
	const professions = useMemo(() => {
		const map = new Map<string, string>();
		localExpertsData.forEach((item) => {
			if (item.profession_ru && !map.has(item.profession_ru)) {
				map.set(item.profession_ru, item.profession_kg || item.profession_ru);
			}
		});
		return Array.from(map.entries()).map(([ru, kg]) => ({ ru, kg }));
	}, []);

	// Filter experts
	const filteredExperts = useMemo(() => {
		return localExpertsData.filter((expert) => {
			const matchesRegion =
				selectedRegionCode === 'all' || expert.code === selectedRegionCode;
			const matchesProfession =
				selectedProfession === 'all' || expert.profession_ru === selectedProfession;
			const matchesSearch =
				searchQuery.trim() === '' ||
				`${expert.name} ${expert.organization} ${expert.phone} ${expert.profession_ru} ${expert.profession_kg}`
					.toLowerCase()
					.includes(searchQuery.toLowerCase().trim());

			return matchesRegion && matchesProfession && matchesSearch;
		});
	}, [selectedRegionCode, selectedProfession, searchQuery]);

	// Filter only regions that currently have experts
	const availableRegions = useMemo(() => {
		return REGION_ORDER.filter((reg) =>
			localExpertsData.some((e) => e.code === reg.code)
		);
	}, []);

	// Group by ordered region
	const groupedByRegion = useMemo(() => {
		const groups: { regionMeta: typeof REGION_ORDER[0]; items: typeof localExpertsData }[] = [];

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
		<div className='bg-gray-50 min-h-screen pb-16'>
			<SEO
				title={`${t('База данных экспертов и оценщиков')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Полный реестр экспертов-оценщиков и тренеров центров оценки квалификации по областям и регионам Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('База данных экспертов и оценщиков')} />

			<div className='max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
				{/* Search & Filters */}
				<div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5'>
					<div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center'>
						{/* Search Input */}
						<div className='relative flex-1'>
							<input
								type='text'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={t('Поиск по ФИО, организации или городу...')}
								className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all'
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

						{/* Profession Filter */}
						<div className='w-full md:w-80'>
							<select
								value={selectedProfession}
								onChange={(e) => setSelectedProfession(e.target.value)}
								className='w-full py-2.5 px-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all'>
								<option value='all'>{t('Все специальности / направления')}</option>
								{professions.map((prof) => (
									<option key={prof.ru} value={prof.ru}>
										{isKg ? prof.kg : prof.ru}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Region Selector Tabs Ordered 01-09 (Empty ones hidden) */}
					<div className='pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center'>
						<button
							onClick={() => setSelectedRegionCode('all')}
							className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
								selectedRegionCode === 'all'
									? 'bg-blue-900 text-white shadow-sm'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}>
							{t('Все регионы')}
						</button>

						{availableRegions.map((reg) => {
							const countInRegion = localExpertsData.filter((e) => e.code === reg.code).length;
							return (
								<button
									key={reg.code}
									onClick={() => setSelectedRegionCode(reg.code)}
									className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
										selectedRegionCode === reg.code
											? 'bg-blue-900 text-white shadow-sm'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}>
									<span>{isKg ? reg.kg : isEn ? reg.en : reg.ru}</span>
									<span
										className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
											selectedRegionCode === reg.code
												? 'bg-blue-800 text-blue-100'
												: 'bg-gray-200 text-gray-600'
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
					<div className='bg-white p-12 rounded-xl text-center border border-gray-200 text-gray-500'>
						{t('По вашему запросу эксперты не найдены.')}
					</div>
				) : (
					<div className='space-y-8'>
						{groupedByRegion.map(({ regionMeta, items }) => (
							<div
								key={regionMeta.code}
								className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
								{/* Region Header Banner in Navy/Blue style */}
								<div className='bg-gradient-to-r from-[#1e2a5e] via-[#253575] to-[#1e2a5e] px-6 py-4 text-white flex items-center justify-between'>
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
									<table className='min-w-full divide-y divide-gray-200 text-sm'>
										<thead className='bg-gray-50 text-gray-500 uppercase text-xs tracking-wider'>
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
										<tbody className='divide-y divide-gray-200 bg-white'>
											{items.map((exp, idx) => (
												<tr
													key={exp.id}
													id={`expert-${exp.id}`}
													className='hover:bg-blue-50/40 transition-colors target:bg-amber-50 target:ring-2 target:ring-amber-400'>
													<td className='px-6 py-4 text-gray-400 font-mono text-xs'>
														{idx + 1}
													</td>
													<td className='px-6 py-4 font-semibold text-gray-900 whitespace-nowrap'>
														{isEn && (exp as any).name_en ? (exp as any).name_en : exp.name}
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<span
															className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
																exp.role_ru === 'Оценщик'
																	? 'bg-blue-50 text-blue-700 border border-blue-200'
																	: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
															}`}>
															{t(exp.role_ru)}
														</span>
													</td>
													<td className='px-6 py-4 text-gray-700 font-medium whitespace-nowrap'>
														{t(exp.profession_ru)}
													</td>
													<td className='px-6 py-4 text-gray-700 whitespace-normal'>
														{exp.organization ? (
															exp.assessment_center_id ? (
																<Link
																	to={`/documents/assessment-centers/${exp.assessment_center_id}?from=experts&expertId=${exp.id}#expert-${exp.id}`}
																	title='Перейти на страницу центра оценки'
																	className='group inline-flex items-center gap-1.5 font-semibold text-blue-900 bg-blue-50/70 hover:bg-blue-100 hover:text-blue-950 px-3 py-1.5 rounded-md border border-blue-200/80 text-xs sm:text-sm leading-relaxed transition-all shadow-xs'>
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
																	<svg className='w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																		<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
																	</svg>
																</Link>
															) : exp.partner_id ? (
																<Link
																	to={`/about/partners/${exp.partner_id}?from=experts&expertId=${exp.id}#expert-${exp.id}`}
																	title='Перейти на страницу партнера'
																	className='group inline-flex items-center gap-1.5 font-semibold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-950 px-3 py-1.5 rounded-md border border-emerald-200/80 text-xs sm:text-sm leading-relaxed transition-all shadow-xs'>
																	<span>
																		{isKg && (exp as any).organization_kg
																			? (exp as any).organization_kg
																			: isEn && (exp as any).organization_en
																			? (exp as any).organization_en
																			: exp.organization}
																	</span>
																	<svg className='w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
																		<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
																	</svg>
																</Link>
															) : (
																<span className='font-medium text-gray-800 inline-block bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100 text-xs sm:text-sm leading-relaxed'>
																	{isKg && (exp as any).organization_kg
																		? (exp as any).organization_kg
																		: isEn && (exp as any).organization_en
																		? (exp as any).organization_en
																		: exp.organization}
																</span>
															)
														) : (
															<span className='text-gray-400'>—</span>
														)}
													</td>
													<td className='px-6 py-4 text-right font-mono text-gray-800 whitespace-nowrap'>
														{exp.phone ? (
															<a
																href={`tel:${exp.phone.replace(/\s+/g, '')}`}
																className='text-blue-700 hover:text-blue-900 hover:underline font-semibold'>
																{exp.phone}
															</a>
														) : (
															<span className='text-gray-400'>—</span>
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
