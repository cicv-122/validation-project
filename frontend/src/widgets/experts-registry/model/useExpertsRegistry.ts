// frontend/src/widgets/experts-registry/model/useExpertsRegistry.ts
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import localExpertsData from '../../../data/experts_database.json';
import { REGION_ORDER, RegionMeta, ExpertItem } from './types';

export interface UseExpertsRegistryReturn {
	selectedRegionCode: string;
	setSelectedRegionCode: (code: string) => void;
	selectedProfession: string;
	setSelectedProfession: (prof: string) => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	professions: { ru: string; kg: string }[];
	availableRegions: RegionMeta[];
	groupedByRegion: { regionMeta: RegionMeta; items: ExpertItem[] }[];
	totalFilteredCount: number;
	resetFilters: () => void;
}

export function useExpertsRegistry(): UseExpertsRegistryReturn {
	const location = useLocation();

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

	const resetFilters = () => {
		setSelectedRegionCode('all');
		setSelectedProfession('all');
		setSearchQuery('');
	};

	return {
		selectedRegionCode,
		setSelectedRegionCode,
		selectedProfession,
		setSelectedProfession,
		searchQuery,
		setSearchQuery,
		professions,
		availableRegions,
		groupedByRegion,
		totalFilteredCount: filteredExperts.length,
		resetFilters,
	};
}
