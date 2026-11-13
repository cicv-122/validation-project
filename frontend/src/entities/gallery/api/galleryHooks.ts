import { useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { GalleryImage, GalleryVideo } from '../../../types';

export function useImageGallery() {
	const { i18n } = useTranslation();
	return useInfiniteQuery<{
		count: number;
		next: string | null;
		previous: string | null;
		results: GalleryImage[];
	}>({
		queryKey: ['gallery-images', i18n.language],
		queryFn: async ({ pageParam = 1 }) => {
			const { data } = await apiClient.get('/gallery/images/', {
				params: { lang: i18n.language, page: pageParam },
			});
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.next) {
				const url = new URL(lastPage.next);
				return url.searchParams.get('page') || null;
			}
			return undefined;
		},
	});
}

export function useVideoGallery() {
	const { i18n } = useTranslation();
	return useInfiniteQuery<{
		count: number;
		next: string | null;
		previous: string | null;
		results: GalleryVideo[];
	}>({
		queryKey: ['gallery-videos', i18n.language],
		queryFn: async ({ pageParam = 1 }) => {
			const { data } = await apiClient.get('/gallery/videos/', {
				params: { lang: i18n.language, page: pageParam },
			});
			return data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.next) {
				const url = new URL(lastPage.next);
				return url.searchParams.get('page') || null;
			}
			return undefined;
		},
	});
}
