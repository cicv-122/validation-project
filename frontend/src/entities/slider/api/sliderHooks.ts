import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { Slider } from '../../../types';

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
