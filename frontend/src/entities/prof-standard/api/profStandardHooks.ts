import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { ProfStandard } from '../../../types';

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
