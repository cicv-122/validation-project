// frontend/src/app/stores/notifications.store.ts
import { create } from 'zustand';

export interface AppNotification {
	id: string;
	title: string;
	message: string;
	timestamp: string;
	read: boolean;
	link?: string;
}

interface NotificationsStore {
	items: AppNotification[];
	unreadCount: number;
	addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
	items: [],
	unreadCount: 0,
	addNotification: (item) =>
		set((state) => {
			const newItem: AppNotification = {
				...item,
				id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
				read: false,
				timestamp: new Date().toISOString(),
			};
			const updated = [newItem, ...state.items];
			return {
				items: updated,
				unreadCount: updated.filter((i) => !i.read).length,
			};
		}),
	markAsRead: (id) =>
		set((state) => {
			const updated = state.items.map((i) => (i.id === id ? { ...i, read: true } : i));
			return {
				items: updated,
				unreadCount: updated.filter((i) => !i.read).length,
			};
		}),
	markAllAsRead: () =>
		set((state) => ({
			items: state.items.map((i) => ({ ...i, read: true })),
			unreadCount: 0,
		})),
	clearNotifications: () => set({ items: [], unreadCount: 0 }),
}));
