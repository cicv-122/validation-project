// frontend/src/entities/candidate/api/candidateQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	staffApi,
	StaffCertifiedUser,
	StaffApplicationItem,
	StaffApplicationDetail,
	StaffProfile,
} from '../../../api/staff';

const CANDIDATE_STALE_TIME = 3 * 60 * 1000; // 3 минуты

export const candidateKeys = {
	all: ['candidates'] as const,
	registry: (params?: Record<string, any>) => ['candidates', 'registry', params] as const,
	detail: (id: number | string) => ['candidates', 'detail', String(id)] as const,
	applications: (params?: Record<string, any>) => ['candidates', 'applications', params] as const,
	applicationDetail: (id: number | string) => ['candidates', 'application', String(id)] as const,
	profile: ['staff', 'profile'] as const,
};

// 1. Получение профиля сотрудника с кэшированием
export function useStaffProfile() {
	return useQuery<StaffProfile>({
		queryKey: candidateKeys.profile,
		queryFn: () => staffApi.getProfile(),
		staleTime: CANDIDATE_STALE_TIME,
	});
}

// 2. Получение реестра специалистов
export function useCandidatesRegistry(params?: {
	page?: number;
	search?: string;
	cluster?: string;
	pin_status?: string;
}) {
	return useQuery({
		queryKey: candidateKeys.registry(params),
		queryFn: () => staffApi.getCertifiedUsers(params),
		staleTime: CANDIDATE_STALE_TIME,
	});
}

// 3. Получение дела конкретного кандидата
export function useCandidateDossier(id: number | string | undefined, enabled = true) {
	return useQuery<StaffCertifiedUser>({
		queryKey: candidateKeys.detail(id || ''),
		queryFn: () => staffApi.getCertifiedUserDetail(Number(id)),
		enabled: Boolean(id) && enabled,
		staleTime: CANDIDATE_STALE_TIME,
	});
}

// 4. Очередь заявок
export function useCandidateApplications(params?: {
	page?: number;
	search?: string;
	status?: string;
	service_type?: string;
}) {
	return useQuery<StaffApplicationItem[]>({
		queryKey: candidateKeys.applications(params),
		queryFn: () => staffApi.getApplications(params),
		staleTime: CANDIDATE_STALE_TIME,
	});
}

// 5. Детальная информация по заявке
export function useApplicationDetail(id: number | string | undefined, enabled = true) {
	return useQuery<StaffApplicationDetail>({
		queryKey: candidateKeys.applicationDetail(id || ''),
		queryFn: () => staffApi.getApplicationDetail(Number(id)),
		enabled: Boolean(id) && enabled,
		staleTime: CANDIDATE_STALE_TIME,
	});
}

// Мутации с автоматической инвалидацией кэша
export function useUpdateCandidateMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
			staffApi.updateCertifiedUser(id, formData),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.id) });
			queryClient.invalidateQueries({ queryKey: candidateKeys.registry() });
		},
	});
}

export function useDeleteCandidateMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => staffApi.deleteCertifiedUser(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateKeys.registry() });
		},
	});
}

export function useUploadDocumentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
			staffApi.uploadCertifiedUserDocument(id, formData),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.id) });
		},
	});
}

export function useDeleteDocumentMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ candidateId, docId }: { candidateId: number; docId: number }) =>
			staffApi.deleteCertifiedUserDocument(candidateId, docId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: candidateKeys.detail(variables.candidateId) });
		},
	});
}
