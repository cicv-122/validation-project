import type { NewsItem } from '../types';

export interface NewsStore {
	scrollPos: number;
	loadedCount: number;
	cachedItems: NewsItem[];
	fromDetail: boolean;
}

export const newsStore: NewsStore = {
	scrollPos: 0,
	loadedCount: 9,
	cachedItems: [],
	fromDetail: false,
};
