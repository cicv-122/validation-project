// frontend/src/entities/staff/api/authApi.ts
import apiClient from '../../../api/client';
import { StaffProfile } from './types';
import { authHeader, removeStaffToken, setStaffToken } from './token';

export const authApi = {
	login: async (username: string, password: string): Promise<{ token: string; profile: StaffProfile }> => {
		const res = await apiClient.post('/certification/staff/auth/login/', { username, password });
		setStaffToken(res.data.token);
		return res.data;
	},

	getProfile: async (): Promise<StaffProfile> => {
		const res = await apiClient.get('/certification/staff/profile/', {
			params: { _t: Date.now() },
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
