// frontend/src/api/staff.ts
import apiClient from './client';

export interface StaffProfession {
	id: number;
	name_ru: string;
	name_ky: string;
	okz_code: string;
	section?: string;
}

export interface StaffProfile {
	id: number;
	username: string;
	full_name: string;
	phone: string;
	role: string;
	role_display: string;
	is_active: boolean;
	assigned_professions: StaffProfession[];
	telegram_chat_id: string | null;
	telegram_username: string | null;
	is_telegram_connected: boolean;
	telegram_bot_url: string;
	stats: {
		total: number;
		submitted: number;
		under_review: number;
		scheduled: number;
		approved: number;
		completed: number;
		rejected: number;
		validation_count: number;
		certification_count: number;
		// Оцифровка государственного реестра (759 специалистов)
		registry_total: number;
		registry_with_inn: number;
		registry_without_inn: number;
		registry_digitized_percent: number;
	};
}

export interface StaffApplicationDocument {
	id: number;
	doc_type: string;
	doc_type_display: string;
	file: string;
	file_url: string;
	description: string;
	uploaded_at: string;
}

export interface StaffApplicationItem {
	id: number;
	registration_number: string;
	short_registration_number: string;
	application_type: 'certification' | 'validation';
	type_display: string;
	full_name: string;
	phone: string;
	whatsapp: string;
	email: string;
	inn: string;
	profession: string;
	qualification_level: string;
	status: string;
	status_display: string;
	scheduled_date: string | null;
	scheduled_location: string;
	assigned_staff_name: string;
	documents_count: number;
	certificate_number_issued: string;
	created_at: string;
	submitted_at: string;
}

export interface StaffApplicationDetail extends StaffApplicationItem {
	birth_year: number | null;
	address: string;
	specialization: string;
	experience_years: number | null;
	experience_desc: string;
	structured_resume: any;
	assessor_name: string;
	admin_notes: string;
	certified_user_id: number | null;
	documents: StaffApplicationDocument[];
	reviewed_at: string | null;
}

export interface CertifiedClusterItem {
	key: string;
	title: string;
	count: number;
}

export interface StaffCertifiedUser {
	id: number;
	registration_number: string;
	full_name: string;
	last_name: string;
	first_name: string;
	sur_name: string;
	inn: string | null;
	has_inn: boolean;
	profession: string;
	issued_date: string | null;
	image: string | null;
	image_url: string | null;
	qr_code: string | null;
	qr_code_url: string | null;
	application: number | null;
	application_id?: number | null;
	scheduled_location?: string;
	scheduled_date?: string | null;
	assessor_name?: string;
	qualification_level?: string;
	specialization?: string;
	phone?: string;
	whatsapp?: string;
	documents?: StaffApplicationDocument[];
	updated_by_name?: string | null;
	created_at: string;
	updated_at: string;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

const TOKEN_KEY = 'staff_token';

export const getStaffToken = (): string | null => {
	return localStorage.getItem(TOKEN_KEY);
};

export const setStaffToken = (token: string): void => {
	localStorage.setItem(TOKEN_KEY, token);
};

export const removeStaffToken = (): void => {
	localStorage.removeItem(TOKEN_KEY);
};

const authHeader = () => {
	const token = getStaffToken();
	return token ? { Authorization: `Token ${token}` } : {};
};

export const staffApi = {
	login: async (username: string, password: string): Promise<{ token: string; profile: StaffProfile }> => {
		const res = await apiClient.post('/certification/staff/auth/login/', { username, password });
		setStaffToken(res.data.token);
		return res.data;
	},

	getProfile: async (): Promise<StaffProfile> => {
		const res = await apiClient.get('/certification/staff/profile/', {
			headers: authHeader(),
		});
		return res.data;
	},

	getApplications: async (params?: { status?: string; q?: string; staff_id?: number }): Promise<StaffApplicationItem[]> => {
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
		const res = await apiClient.delete(`/certification/staff/applications/${id}/documents/${docId}/`, {
			headers: authHeader(),
		});
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
		const res = await apiClient.patch(`/certification/staff/applications/${id}/status/`, data, {
			headers: authHeader(),
		});
		return res.data;
	},

	uploadDocument: async (
		id: number,
		formData: FormData
	): Promise<StaffApplicationDocument> => {
		const res = await apiClient.post(`/certification/staff/applications/${id}/upload-document/`, formData, {
			headers: {
				...authHeader(),
				'Content-Type': 'multipart/form-data',
			},
		});
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
		const res = await apiClient.post(`/certification/staff/applications/${id}/issue-certificate/`, data, {
			headers: authHeader(),
		});
		return res.data;
	},

	getCertifiedUsers: async (params?: { page?: number; q?: string; has_inn?: string; cluster?: string }): Promise<PaginatedResponse<StaffCertifiedUser>> => {
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

	downloadCertifiedUserQR: async (id: number, format: 'svg' | 'png', filename?: string) => {
		const res = await apiClient.get(`/certification/staff/certified-users/${id}/qr/`, {
			params: { qr_format: format, fmt: format },
			headers: authHeader(),
			responseType: 'blob',
		});
		const blob = new Blob([res.data], { type: format === 'svg' ? 'image/svg+xml' : 'image/png' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename || `QR_Certificate_${id}.${format}`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	},

	downloadApplicationQR: async (id: number, format: 'svg' | 'png', filename?: string) => {
		const res = await apiClient.get(`/certification/staff/applications/${id}/qr/`, {
			params: { qr_format: format, fmt: format },
			headers: authHeader(),
			responseType: 'blob',
		});
		const blob = new Blob([res.data], { type: format === 'svg' ? 'image/svg+xml' : 'image/png' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename || `QR_Application_${id}.${format}`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
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

	updateCertifiedUser: async (id: number, formData: FormData | Partial<StaffCertifiedUser>): Promise<StaffCertifiedUser> => {
		const isFormData = formData instanceof FormData;
		const res = await apiClient.patch(`/certification/staff/certified-users/${id}/`, formData, {
			headers: {
				...authHeader(),
				...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {}),
			},
		});
		return res.data;
	},

	uploadCertifiedUserDocument: async (
		id: number,
		formData: FormData
	): Promise<StaffApplicationDocument[]> => {
		const res = await apiClient.post(`/certification/staff/certified-users/${id}/upload-document/`, formData, {
			headers: {
				...authHeader(),
				'Content-Type': 'multipart/form-data',
			},
		});
		return res.data;
	},

	deleteCertifiedUserDocument: async (id: number, docId: number): Promise<{ message: string }> => {
		const res = await apiClient.delete(`/certification/staff/certified-users/${id}/documents/${docId}/`, {
			headers: authHeader(),
		});
		return res.data;
	},

	disconnectTelegram: async (): Promise<{ status: string; message: string }> => {
		const res = await apiClient.post('/certification/staff/profile/telegram/disconnect/', {}, {
			headers: authHeader(),
		});
		return res.data;
	},

	logout: () => {
		removeStaffToken();
	},
};
