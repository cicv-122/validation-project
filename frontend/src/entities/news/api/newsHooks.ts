import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { NewsDetail, NewsItem } from '../../../types';

export function useHomeNews() {
	const { i18n } = useTranslation();
	return useQuery<NewsItem[]>({
		queryKey: ['news-home', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/news/', { params: { lang: i18n.language, limit: 6 } });
			return data;
		},
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
	});
}
