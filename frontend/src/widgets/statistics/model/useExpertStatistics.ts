import { useMemo } from 'react';
import rawExperts from '../../../data/experts_database.json';
import type { ExpertStatisticsResult, RegionStat, SectorStat } from './types';

// Таблица сопоставления расхождений написания имен между списками
const SYNONYM_PAIRS: Record<string, string> = {
	'Молдокулова Элина Ашимбековна': 'Молдокулова Элина Эшимбековна',
	'Жунусова Таттыгул Ашырбаевна': 'Жунусова Таттуугул Аширбаевна',
	'Абубакирова Юлдуз Хабибуллаевна': 'Абабакирова Юлдуз Хабибуллоевна',
	'Калданова Гульзат': 'Калданова Гулзат',
	'Молдобаева Майрамкул Акматбековна': 'Молдобаева Майрамкуль Акматбековна',
	'Дженалиева Гульзада Асылбековна': 'Дженалиева Гулзада Асылбековна',
	'Жумабаева Бактыгул Амановна': 'Жумабаева Бактыгуль Амановна',
};

export function useExpertStatistics(): ExpertStatisticsResult {
	return useMemo(() => {
		const rawList = rawExperts as any[];

		const trainers = rawList.filter((item) => item.role_ru === 'Тренер');
		const assessors = rawList.filter((item) => item.role_ru === 'Оценщик');

		// 1. Дедупликация и объединение: все в реестре являются оценщиками,
		// а эксперты имеют дополнительную квалификацию "Тренер-оценщик"
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
			const synTarget = SYNONYM_PAIRS[t.name];
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
		const groupMap: Record<string, RegionStat> = {};

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
}
