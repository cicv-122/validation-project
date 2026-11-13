import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { AssessmentCenter } from '../../../types';

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
