// frontend/src/pages/staff/StaffDashboard.tsx
import { useState } from 'react';
import StaffHeader from '../../components/staff/StaffHeader';
import {
	MinistryReportModal,
	ApplicationsStatsBar,
	ApplicationsStatusCards,
	CertifiedClustersBar,
} from '../../features/candidate-filter';
import { TelegramConnectModal } from '../../features/auth-staff';
import { ConfirmDeleteDialog } from '../../features/status-change';
import { EditApplicationModal, CreateInPersonApplicationModal } from '../../features/application-edit';
import { DigitizationArchiveHero } from '../../widgets/digitization-stats';
import { CertifiedSpecialistsTable } from '../../widgets/candidate-registry';
import { ApplicationsQueueTable } from '../../widgets/assessment-queue';
import { useStaffDashboard, MAIN_TABS, MainTabType } from './model/useStaffDashboard';

export default function StaffDashboard() {
	const {
		profile,
		loadingProfile,
		loadProfile,
		activeMainTab,
		switchMainTab,
		applications,
		loadingApps,
		activeAppStatus,
		setActiveAppStatus,
		appSearchQuery,
		setAppSearchQuery,
		selectedAppId,
		setSelectedAppId,
		certifiedList,
		certifiedTotal,
		certifiedPage,
		certifiedSearch,
		setCertifiedSearch,
		certifiedHasInn,
		setCertifiedHasInn,
		certifiedCluster,
		setCertifiedCluster,
		certifiedClustersList,
		loadingCertified,
		showTelegramModal,
		setShowTelegramModal,
		showMinistryReportModal,
		setShowMinistryReportModal,
		deletingSpecialist,
		setDeletingSpecialist,
		isDeletingSpecialist,
		loadApplications,
		loadCertifiedList,
		candidateDossierState,
		handleAppSearch,
		handleCertifiedSearch,
		handleDeleteSpecialist,
		handleDisconnectTelegram,
	} = useStaffDashboard();

	const [showCreateInPersonModal, setShowCreateInPersonModal] = useState(false);

	if (loadingProfile) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="w-10 h-10 border-4 border-[#283375]/20 border-t-[#283375] rounded-full animate-spin" />
					<span className="text-sm font-semibold text-slate-600">Загрузка кабинета сотрудника...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
			{/* Верхняя шапка сотрудника */}
			<StaffHeader
				profile={profile}
				onConnectTelegram={() => setShowTelegramModal(true)}
				onDisconnectTelegram={handleDisconnectTelegram}
			/>

			{/* ОСНОВНОЙ ПЕРЕКЛЮЧАТЕЛЬ: Электронная приёмная (заявки) VS Оцифровка архива (759 специалистов) */}
			<div className="bg-white border-b border-slate-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
						{MAIN_TABS.map((tab) => {
							const isActive = activeMainTab === tab.id;
							return (
								<div
									key={tab.id}
									onClick={() => switchMainTab(tab.id as MainTabType)}
									className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
										isActive
											? 'border-[#283375] bg-blue-50/40 shadow-xs'
											: 'border-slate-200 hover:border-slate-300 bg-white'
									}`}
								>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-black text-sm text-slate-900">{tab.label}</span>
											{tab.id === 'applications' && profile?.stats && (
												<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#283375]/10 text-[#283375]">
													{profile.stats.total} заявок
												</span>
											)}
											{tab.id === 'certified_registry' && profile?.stats && (
												<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#283375]/10 text-[#283375]">
													{profile.stats.registry_digitized_percent}% ({profile.stats.registry_with_inn}/{profile.stats.registry_total || 827})
												</span>
											)}
										</div>
										<div className="text-xs text-slate-500 font-medium mt-0.5">
											{tab.desc}
										</div>
									</div>
									<div
										className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
											isActive ? 'bg-[#283375] text-white' : 'bg-slate-100 text-slate-400'
										}`}
									>
										→
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
				{/* ---------------- РЕЖИМ 1: ЗАЯВКИ КАНДИДАТОВ ---------------- */}
				{activeMainTab === 'applications' && (
					<div className="space-y-6">
						<ApplicationsStatsBar
							profile={profile}
							onOpenMinistryReport={() => setShowMinistryReportModal(true)}
						/>
						<ApplicationsStatusCards
							profile={profile}
							activeStatus={activeAppStatus}
							onStatusChange={(status) => setActiveAppStatus(status)}
						/>
						<ApplicationsQueueTable
							loading={loadingApps}
							applications={applications}
							profile={profile}
							activeAppStatus={activeAppStatus}
							appSearchQuery={appSearchQuery}
							onCreateInPerson={() => setShowCreateInPersonModal(true)}
							onOpenApplication={(id) => setSelectedAppId(id)}
							onResetFilters={() => {
								setActiveAppStatus('');
								setAppSearchQuery('');
							}}
							onStatusChange={(status) => setActiveAppStatus(status)}
							onSearchChange={(query) => setAppSearchQuery(query)}
							onSearchSubmit={handleAppSearch}
						/>
					</div>
				)}

				{/* ---------------- РЕЖИМ 2: АРХИВ ВЫДАННЫХ СЕРТИФИКАТОВ (759) ---------------- */}
				{activeMainTab === 'certified_registry' && (
					<div className="space-y-6">
						<DigitizationArchiveHero
							profile={profile}
							certifiedTotal={certifiedTotal}
						/>
						<CertifiedClustersBar
							totalRegistryCount={profile?.stats?.registry_total || 827}
							withInnCount={profile?.stats?.registry_with_inn || 0}
							withoutInnCount={
								profile?.stats?.registry_without_inn ??
								((profile?.stats?.registry_total || 827) - (profile?.stats?.registry_with_inn || 0))
							}
							hasInnFilter={certifiedHasInn}
							onHasInnFilterChange={(val) => {
								setCertifiedHasInn(val);
								loadCertifiedList(1, undefined, val);
							}}
							searchQuery={certifiedSearch}
							onSearchQueryChange={(val) => setCertifiedSearch(val)}
							onSearchSubmit={handleCertifiedSearch}
							clusters={certifiedClustersList}
							activeCluster={certifiedCluster}
							onClusterChange={(nextKey) => {
								setCertifiedCluster(nextKey);
								let nextInn = certifiedHasInn;
								if (nextKey && certifiedHasInn === 'true') {
									nextInn = '';
									setCertifiedHasInn('');
								}
								loadCertifiedList(1, nextKey, nextInn);
							}}
						/>
						<CertifiedSpecialistsTable
							loading={loadingCertified}
							certifiedList={certifiedList}
							certifiedTotal={certifiedTotal}
							certifiedPage={certifiedPage}
							onPageChange={(page) => loadCertifiedList(page, undefined, undefined, undefined, true)}
							onDeleteSpecialist={(item) => setDeletingSpecialist(item)}
							candidateDossierState={candidateDossierState}
							certifiedCluster={certifiedCluster}
							certifiedClustersList={certifiedClustersList}
							certifiedHasInn={certifiedHasInn}
							certifiedSearch={certifiedSearch}
							onResetCluster={() => {
								setCertifiedCluster('');
								loadCertifiedList(1, '');
							}}
							onResetHasInn={() => {
								setCertifiedHasInn('');
								loadCertifiedList(1, undefined, '');
							}}
							onResetSearch={() => {
								setCertifiedSearch('');
								loadCertifiedList(1, undefined, undefined, '');
							}}
						/>
					</div>
				)}
			</main>

			{/* МОДАЛЬНОЕ ОКНО: ОЧНЫЙ ПРИЁМ КАНДИДАТА */}
			<CreateInPersonApplicationModal
				isOpen={showCreateInPersonModal}
				onClose={() => setShowCreateInPersonModal(false)}
				onCreated={(createdId) => {
					loadApplications();
					loadProfile();
					setSelectedAppId(createdId);
				}}
			/>

			{/* МОДАЛЬНОЕ ОКНО: РЕДАКТИРОВАНИЕ ДЕЛА КАНДИДАТА И ВЫПУСК СЕРТИФИКАТА */}
			<EditApplicationModal
				isOpen={Boolean(selectedAppId)}
				applicationId={selectedAppId}
				onClose={() => setSelectedAppId(null)}
				onSaved={() => {
					loadApplications();
					loadProfile();
				}}
				onDeleted={() => {
					setSelectedAppId(null);
					loadApplications();
					loadProfile();
				}}
			/>

			{/* МОДАЛЬНОЕ ОКНО ПОДКЛЮЧЕНИЯ TELEGRAM */}
			<TelegramConnectModal
				isOpen={showTelegramModal}
				onClose={() => setShowTelegramModal(false)}
				profile={profile}
				onCheckStatus={async () => {
					await loadProfile();
					if (profile?.is_telegram_connected) {
						setShowTelegramModal(false);
					}
				}}
			/>

			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ СПЕЦИАЛИСТА ИЗ РЕЕСТРА */}
			<ConfirmDeleteDialog
				isOpen={Boolean(deletingSpecialist)}
				title="Удалить специалиста из реестра?"
				description={
					<span>
						Вы уверены, что хотите удалить <b>«{deletingSpecialist?.full_name}»</b> ({deletingSpecialist?.registration_number}) из государственного реестра? Это действие нельзя отменить.
					</span>
				}
				isDeleting={isDeletingSpecialist}
				onCancel={() => setDeletingSpecialist(null)}
				onConfirm={handleDeleteSpecialist}
			/>

			{/* МОДАЛЬНОЕ ОКНО: ОФИЦИАЛЬНАЯ СВОДКА ДЛЯ МИНИСТЕРСТВА ПРОСВЕЩЕНИЯ КР */}
			<MinistryReportModal
				isOpen={showMinistryReportModal}
				onClose={() => setShowMinistryReportModal(false)}
				profile={profile}
				applications={applications}
			/>
		</div>
	);
}
