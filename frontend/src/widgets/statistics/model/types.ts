export interface RegionStat {
	id: string;
	cityRu: string;
	cityKg: string;
	regionRu: string;
	regionKg: string;
	count: number;
	trainersCount: number;
}

export interface SectorStat {
	id: string;
	nameRu: string;
	nameKg: string;
	nameEn: string;
	icon: string;
	count: number;
	professions: { name: string; count: number }[];
}

export interface ExpertStatisticsResult {
	totalAll: number;
	totalUniqueExperts: number;
	totalTrainers: number;
	regionStats: RegionStat[];
	sectorStats: SectorStat[];
	maxCount: number;
}
