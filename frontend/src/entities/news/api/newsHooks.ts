import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { NewsDetail, NewsItem } from '../../../types';

const NEWS_STALE_TIME = 5 * 60 * 1000; // 5 минут данные считаются свежими (мгновенно из памяти)
const NEWS_GC_TIME = 15 * 60 * 1000; // 15 минут хранить в кэше

export function useHomeNews() {
	const { i18n } = useTranslation();
	return useQuery<NewsItem[]>({
		queryKey: ['news-home', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/news/', { params: { lang: i18n.language, limit: 6 } });
			return data;
		},
		staleTime: NEWS_STALE_TIME,
		gcTime: NEWS_GC_TIME,
	});
}

export function useNews(limit?: number) {
	const { i18n } = useTranslation();
	return useQuery<NewsItem[]>({
		queryKey: ['news', i18n.language, limit],
		queryFn: async () => {
			const params: Record<string, unknown> = { lang: i18n.language };
			if (limit) params.limit = limit;
			const { data } = await apiClient.get('/news/', { params });
			return data;
		},
		staleTime: NEWS_STALE_TIME,
		gcTime: NEWS_GC_TIME,
	});
}

export function useNewsItem(slug: string | undefined) {
	const { i18n } = useTranslation();
	return useQuery<NewsDetail>({
		queryKey: ['news', slug, i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get(`/news/${slug}/`, { params: { lang: i18n.language } });
			return data;
		},
		enabled: !!slug,
		staleTime: NEWS_STALE_TIME,
		gcTime: NEWS_GC_TIME,
	});
}
