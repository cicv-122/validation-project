// frontend/src/entities/staff/api/token.ts

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

export const authHeader = () => {
	const token = getStaffToken();
	return token ? { Authorization: `Token ${token}` } : {};
};
