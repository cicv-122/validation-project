// frontend/src/app/stores/session.store.ts
import { create } from 'zustand';
import type { StaffProfile } from '../../api/staff';

interface SessionStore {
	staff: StaffProfile | null;
	token: string | null;
	setStaff: (staff: StaffProfile | null) => void;
	setToken: (token: string | null) => void;
	clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
	staff: null,
	token: typeof window !== 'undefined' ? localStorage.getItem('staff_access_token') : null,
	setStaff: (staff) => set({ staff }),
	setToken: (token) => {
		if (token) {
			localStorage.setItem('staff_access_token', token);
		} else {
			localStorage.removeItem('staff_access_token');
		}
		set({ token });
	},
	clearSession: () => {
		localStorage.removeItem('staff_access_token');
		localStorage.removeItem('staff_refresh_token');
		set({ staff: null, token: null });
	},
}));
