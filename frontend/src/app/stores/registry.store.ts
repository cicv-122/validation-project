// frontend/src/app/stores/registry.store.ts
import { create } from 'zustand';

export type RegistryTab = 'applications' | 'registry';

interface RegistryStore {
	activeTab: RegistryTab;
	selectedCandidateId: number | null;
	selectedCertifiedUserId: number | null;
	isFiltersDrawerOpen: boolean;
	setActiveTab: (tab: RegistryTab) => void;
	setSelectedCandidateId: (id: number | null) => void;
	setSelectedCertifiedUserId: (id: number | null) => void;
	setFiltersDrawerOpen: (isOpen: boolean) => void;
}

export const useRegistryStore = create<RegistryStore>((set) => ({
	activeTab: 'applications',
	selectedCandidateId: null,
	selectedCertifiedUserId: null,
	isFiltersDrawerOpen: false,
	setActiveTab: (activeTab) => set({ activeTab }),
	setSelectedCandidateId: (selectedCandidateId) => set({ selectedCandidateId }),
	setSelectedCertifiedUserId: (selectedCertifiedUserId) => set({ selectedCertifiedUserId }),
	setFiltersDrawerOpen: (isFiltersDrawerOpen) => set({ isFiltersDrawerOpen }),
}));
