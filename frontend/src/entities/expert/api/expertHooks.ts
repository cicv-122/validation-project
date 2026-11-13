import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { AppraisersExpert } from '../../../types';

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
