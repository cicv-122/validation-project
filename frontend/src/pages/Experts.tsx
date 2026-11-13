import { useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHero, SEO } from '../components/ui';
import localExpertsData from '../data/experts_database.json';
import {
	REGION_ORDER,
	RegionMeta,
	ExpertItem,
	ExpertsFilterBar,
	ExpertsRegionTable,
} from '../widgets/experts-registry';

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
		const groups: { regionMeta: RegionMeta; items: ExpertItem[] }[] = [];

		REGION_ORDER.forEach((meta) => {
			const items = (filteredExperts as ExpertItem[]).filter((e) => e.code === meta.code);
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
		const targetId = hash
			? hash.replace('#', '')
			: searchParams.get('expertId')
			? `expert-${searchParams.get('expertId')}`
			: null;

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
				<ExpertsFilterBar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedProfession={selectedProfession}
					onProfessionChange={setSelectedProfession}
					professions={professions}
					selectedRegionCode={selectedRegionCode}
					onRegionSelect={setSelectedRegionCode}
					availableRegions={availableRegions}
					isKg={isKg}
					isEn={isEn}
				/>

				{groupedByRegion.length === 0 ? (
					<div className='bg-white p-12 rounded-xl text-center border border-gray-200 text-gray-500'>
						{t('По вашему запросу эксперты не найдены.')}
					</div>
				) : (
					<div className='space-y-8'>
						{groupedByRegion.map(({ regionMeta, items }) => (
							<ExpertsRegionTable
								key={regionMeta.code}
								regionMeta={regionMeta}
								items={items}
								isKg={isKg}
								isEn={isEn}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
