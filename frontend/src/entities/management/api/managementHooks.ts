import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { ManagementMember } from '../../../types';

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
