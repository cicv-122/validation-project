// frontend/src/entities/staff/api/applicationApi.ts
import apiClient from '../../../api/client';
import {
	StaffApplicationItem,
	StaffApplicationDetail,
	StaffApplicationDocument,
} from './types';
import { authHeader } from './token';

export const applicationApi = {
	getApplications: async (params?: {
		status?: string;
		q?: string;
		staff_id?: number;
	}): Promise<StaffApplicationItem[]> => {
		const res = await apiClient.get('/certification/staff/applications/', {
			params,
			headers: authHeader(),
		});
		return res.data;
	},

	getApplicationDetail: async (id: number): Promise<StaffApplicationDetail> => {
		const res = await apiClient.get(`/certification/staff/applications/${id}/`, {
			headers: authHeader(),
		});
		return res.data;
	},

	deleteApplication: async (id: number): Promise<{ status: string; message: string }> => {
		const res = await apiClient.delete(`/certification/staff/applications/${id}/`, {
			headers: authHeader(),
		});
		return res.data;
	},

	updateApplicationDetail: async (
		id: number,
		data: Record<string, any>
	): Promise<StaffApplicationDetail> => {
		const res = await apiClient.patch(`/certification/staff/applications/${id}/`, data, {
			headers: authHeader(),
		});
		return res.data;
	},

	deleteDocument: async (id: number, docId: number): Promise<{ message: string }> => {
		const res = await apiClient.delete(
			`/certification/staff/applications/${id}/documents/${docId}/`,
			{
				headers: authHeader(),
			}
		);
		return res.data;
	},

	updateStatus: async (
		id: number,
		data: {
			status?: string;
			scheduled_date?: string | null;
			scheduled_location?: string;
			admin_notes?: string;
			assessor_name?: string;
		}
	): Promise<StaffApplicationDetail> => {
		const res = await apiClient.patch(
			`/certification/staff/applications/${id}/status/`,
			data,
			{
				headers: authHeader(),
			}
		);
		return res.data;
	},

	uploadDocument: async (
		id: number,
		formData: FormData
	): Promise<StaffApplicationDocument> => {
		const res = await apiClient.post(
			`/certification/staff/applications/${id}/upload-document/`,
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

	issueCertificate: async (
		id: number,
		data: {
			certificate_number: string;
			inn?: string;
			issued_date?: string;
		}
	): Promise<{
		success: boolean;
		message: string;
		certified_user_id: number;
		registration_number: string;
		qr_code_url: string | null;
		verify_url: string;
	}> => {
		const res = await apiClient.post(
			`/certification/staff/applications/${id}/issue-certificate/`,
			data,
			{
				headers: authHeader(),
			}
		);
		return res.data;
	},

	downloadApplicationQR: async (id: number, format: 'svg' | 'png', filename?: string) => {
		const res = await apiClient.get(`/certification/staff/applications/${id}/qr/`, {
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
		link.download = filename || `QR_Application_${id}.${format}`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	},
};
