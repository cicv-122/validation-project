// frontend/src/app/stores/ui.store.ts
import { create } from 'zustand';

export type ModalType = 'callback' | 'photoCropper' | 'candidatePreview' | 'confirmAction' | null;

export interface ToastItem {
	id: string;
	title?: string;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	duration?: number;
}

interface UIStore {
	activeModal: ModalType;
	modalProps: Record<string, unknown>;
	toasts: ToastItem[];
	openModal: (type: ModalType, props?: Record<string, unknown>) => void;
	closeModal: () => void;
	addToast: (toast: Omit<ToastItem, 'id'>) => string;
	removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	activeModal: null,
	modalProps: {},
	toasts: [],
	openModal: (type, props = {}) => set({ activeModal: type, modalProps: props }),
	closeModal: () => set({ activeModal: null, modalProps: {} }),
	addToast: (toast) => {
		const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
		set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
		if (toast.duration !== 0) {
			setTimeout(() => {
				set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
			}, toast.duration || 4000);
		}
		return id;
	},
	removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
