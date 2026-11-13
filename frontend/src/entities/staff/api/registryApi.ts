// frontend/src/entities/staff/api/registryApi.ts
import apiClient from '../../../api/client';
import {
	StaffCertifiedUser,
	CertifiedClusterItem,
	PaginatedResponse,
	StaffApplicationDocument,
} from './types';
import { authHeader } from './token';

export const registryApi = {
	getCertifiedUsers: async (params?: {
		page?: number;
		q?: string;
		has_inn?: string;
		cluster?: string;
	}): Promise<PaginatedResponse<StaffCertifiedUser>> => {
		const res = await apiClient.get('/certification/staff/certified-users/', {
			params,
			headers: authHeader(),
		});
		return res.data;
	},

	getCertifiedClusters: async (): Promise<CertifiedClusterItem[]> => {
		const res = await apiClient.get('/certification/staff/certified-users/clusters/', {
			headers: authHeader(),
		});
		return res.data;
	},

	getCertifiedUserDetail: async (id: number): Promise<StaffCertifiedUser> => {
		const res = await apiClient.get(`/certification/staff/certified-users/${id}/`, {
			headers: authHeader(),
		});
		return res.data;
	},

	deleteCertifiedUser: async (id: number): Promise<{ status: string; message: string }> => {
		const res = await apiClient.delete(`/certification/staff/certified-users/${id}/`, {
			headers: authHeader(),
		});
		return res.data;
	},

	updateCertifiedUser: async (
		id: number,
		formData: FormData | Partial<StaffCertifiedUser>
	): Promise<StaffCertifiedUser> => {
		const isFormData = formData instanceof FormData;
		const res = await apiClient.patch(
			`/certification/staff/certified-users/${id}/`,
			formData,
			{
				headers: {
					...authHeader(),
					...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {}),
				},
			}
		);
		return res.data;
	},

	uploadCertifiedUserDocument: async (
		id: number,
		formData: FormData
	): Promise<StaffApplicationDocument[]> => {
		const res = await apiClient.post(
			`/certification/staff/certified-users/${id}/upload-document/`,
			formData,
			{
				headers: {
					...authHeader(),
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return res.data;
	},

	deleteCertifiedUserDocument: async (
		id: number,
		docId: number
	): Promise<{ message: string }> => {
		const res = await apiClient.delete(
			`/certification/staff/certified-users/${id}/documents/${docId}/`,
			{
				headers: authHeader(),
			}
		);
		return res.data;
	},

	downloadCertifiedUserQR: async (
		id: number,
		format: 'svg' | 'png',
		filename?: string
	) => {
		const res = await apiClient.get(`/certification/staff/certified-users/${id}/qr/`, {
			params: { qr_format: format, fmt: format },
			headers: authHeader(),
			responseType: 'blob',
		});
		const blob = new Blob([res.data], {
			type: format === 'svg' ? 'image/svg+xml' : 'image/png',
		});
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename || `QR_Certificate_${id}.${format}`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	},
};
