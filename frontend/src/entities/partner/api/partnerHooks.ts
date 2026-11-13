import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { DevelopmentPartner, PartnerDetailType } from '../../../types';

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
