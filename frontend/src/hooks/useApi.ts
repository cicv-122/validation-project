import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import type {
	AppraisersExpert,
	AssessmentCenter,
	CertifiedUser,
	PaginatedCertifiedUsers,
	DevelopmentPartner,
	GalleryImage,
	GalleryVideo,
	ManagementMember,
	NewsDetail,
	NewsItem,
	PartnerDetailType,
	ProfStandard,
	Slider,
} from '../types';


export function useSliders() {
	const { i18n } = useTranslation();
	return useQuery<Slider[]>({
		queryKey: ['sliders', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/sliders/', { params: { lang: i18n.language } });
			return data;
		},
	});
}

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

export function useProfStandards() {
	const { i18n } = useTranslation();
	return useQuery<ProfStandard[]>({
		queryKey: ['prof-standards', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/documents/prof-standards/', {
				params: { lang: i18n.language },
			});
			return data;
		},
	});
}

export function usePartners() {
	const { i18n } = useTranslation();
	return useQuery<DevelopmentPartner[]>({
		queryKey: ['partners', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/documents/partners/', {
				params: { lang: i18n.language },
			});
			return data;
		},
	});
}

export function usePartner(id: string | undefined) {
	const { i18n } = useTranslation();
	return useQuery<PartnerDetailType>({
		queryKey: ['partner-detail', id, i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get(`/documents/partners/${id}/`, {
				params: { lang: i18n.language },
			});
			return data;
		},
		enabled: !!id,
	});
}

export function useManagement() {
	const { i18n } = useTranslation();
	return useQuery<ManagementMember[]>({
		queryKey: ['management', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/management/', { params: { lang: i18n.language } });
			return data;
		},
	});
}

export function useExperts() {
	const { i18n } = useTranslation();
	return useQuery<AppraisersExpert[]>({
		queryKey: ['experts', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/documents/experts/', {
				params: { lang: i18n.language },
			});
			return data;
		},
	});
}

export function useAssessmentCenters() {
	const { i18n } = useTranslation();
	return useQuery<AssessmentCenter[]>({
		queryKey: ['assessment-centers', i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get('/documents/assessment-centers/', {
				params: { lang: i18n.language },
			});
			return data;
		},
	});
}

export function useAssessmentCenter(id: string | undefined) {
	const { i18n } = useTranslation();
	return useQuery<AssessmentCenter>({
		queryKey: ['assessment-center-detail', id, i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get(`/documents/assessment-centers/${id}/`, {
				params: { lang: i18n.language },
			});
			return data;
		},
		enabled: !!id,
	});
}

export function useCertifiedUsers(search: string = '', page: number = 1) {
	const { i18n } = useTranslation();
	return useQuery<PaginatedCertifiedUsers>({
		queryKey: ['certified-users', i18n.language, search, page],
		queryFn: async () => {
			const { data } = await apiClient.get('/documents/certified-users/', {
				params: { lang: i18n.language, search: search || undefined, page },
			});
			return data;
		},
		placeholderData: (prev) => prev,
	});
}

export function useCertifiedUserVerification(registrationNumber: string | undefined) {
	const { i18n } = useTranslation();
	return useQuery<CertifiedUser>({
		queryKey: ['certified-user-verify', registrationNumber, i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get(`/documents/certified-users/verify/${registrationNumber}/`, {
				params: { lang: i18n.language },
			});
			return data;
		},
		enabled: !!registrationNumber,
		retry: false, // Don't retry if it fails (e.g. 404 not found)
	});
}

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
