import apiClient from '../../../api/client';
import { StatusData } from '../model/types';

export const checkApplicationStatus = async (regNumber: string): Promise<StatusData> => {
	const { data } = await apiClient.get<StatusData>(`/certification/status/${regNumber.trim()}/`);
	return data;
};

export const recoverApplicationNumber = async (inn: string, email: string): Promise<{ detail: string }> => {
	const { data } = await apiClient.post<{ detail: string }>('/certification/recover/', {
		inn: inn.trim(),
		email: email.trim(),
	});
	return data;
};
