import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { CertifiedUser, PaginatedCertifiedUsers } from '../../../types';

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

export function useCertifiedUserVerification(
	registrationNumber: string | undefined,
	inn?: string,
	token?: string,
	isDirectScan?: boolean
) {
	const { i18n } = useTranslation();
	const shouldFetch = !!registrationNumber;
	return useQuery<CertifiedUser>({
		queryKey: ['certified-user-verify', registrationNumber, inn, token, isDirectScan, i18n.language],
		queryFn: async () => {
			const { data } = await apiClient.get(`/documents/certified-users/verify/`, {
				params: {
					reg: registrationNumber,
					inn: inn || undefined,
					token: token || undefined,
					direct: isDirectScan ? '1' : undefined,
					lang: i18n.language,
				},
			});
			return data;
		},
		enabled: shouldFetch,
		retry: false,
	});
}
