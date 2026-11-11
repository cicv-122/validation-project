// frontend/src/pages/staff/StaffDashboard.tsx
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
	staffApi,
	StaffProfile,
	StaffApplicationItem,
	StaffCertifiedUser,
	CertifiedClusterItem,
} from '../../api/staff';
import StaffHeader from '../../components/staff/StaffHeader';
import {
	MinistryReportModal,
	ApplicationsStatsBar,
	ApplicationsStatusCards,
	CertifiedClustersBar,
} from '../../features/candidate-filter';
import { TelegramConnectModal } from '../../features/auth-staff';
import { ConfirmDeleteDialog } from '../../features/status-change';
import { EditApplicationModal } from '../../features/application-edit';
import { DigitizationArchiveHero } from '../../widgets/digitization-stats';
import { CertifiedSpecialistsTable } from '../../widgets/candidate-registry';
import { ApplicationsQueueTable } from '../../widgets/assessment-queue';

const MAIN_TABS = [
	{
		id: 'applications',
		label: 'Электронная приёмная (Online-заявки)',
		desc: 'Входящие обращения граждан через сайт, проверка и экзамены',
	},
	{
		id: 'certified_registry',
		label: 'Оцифровка реестра',
		desc: 'Государственный архив выданных сертификатов, внесение ПИН/ИНН и сканов',
	},
];

export default function StaffDashboard() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// Active main view: 'applications' | 'certified_registry' (synced with URL ?tab=registry)
	const [activeMainTab, setActiveMainTab] = useState<'applications' | 'certified_registry'>(
		searchParams.get('tab') === 'registry' ? 'certified_registry' : 'applications'
	);

	useEffect(() => {
		const tabParam = searchParams.get('tab');
		if (tabParam === 'registry' && activeMainTab !== 'certified_registry') {
			setActiveMainTab('certified_registry');
		} else if (!tabParam && activeMainTab !== 'applications') {
			setActiveMainTab('applications');
		}
	}, [searchParams]);

	const switchMainTab = (tabId: 'applications' | 'certified_registry') => {
		setActiveMainTab(tabId);
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				if (tabId === 'certified_registry') {
					next.set('tab', 'registry');
				} else {
					next.delete('tab');
				}
				return next;
			},
			{ replace: true }
		);
	};

	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	// Applications State
	const [applications, setApplications] = useState<StaffApplicationItem[]>([]);
	const [loadingApps, setLoadingApps] = useState(false);
	const [activeAppStatus, setActiveAppStatus] = useState('');
	const [appSearchQuery, setAppSearchQuery] = useState('');

	// Application Detail Modal State
	const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

	// Initial certified registry params from URL
	const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
	const initialQ = searchParams.get('q') || '';
	const initialHasInn = searchParams.get('has_inn') || '';
	const initialCluster = searchParams.get('cluster') || '';

	// Certified Registry State (759 специалистов)
	const [certifiedList, setCertifiedList] = useState<StaffCertifiedUser[]>([]);
	const [certifiedTotal, setCertifiedTotal] = useState(0);
	const [certifiedPage, setCertifiedPage] = useState(initialPage);
	const [certifiedSearch, setCertifiedSearch] = useState(initialQ);
	const [certifiedHasInn, setCertifiedHasInn] = useState<'' | 'true' | 'false'>(
		(initialHasInn as '' | 'true' | 'false') || ''
	); // '', 'true', 'false'
	const [certifiedCluster, setCertifiedCluster] = useState<string>(initialCluster);
	const [certifiedClustersList, setCertifiedClustersList] = useState<CertifiedClusterItem[]>([]);
	const [loadingCertified, setLoadingCertified] = useState(false);

	// Telegram Linking Modal
	const [showTelegramModal, setShowTelegramModal] = useState(false);
	// Electronic Reception (Ministry) Report Modal
	const [showMinistryReportModal, setShowMinistryReportModal] = useState(false);
	// Delete Certified Specialist confirmation
	const [deletingSpecialist, setDeletingSpecialist] = useState<StaffCertifiedUser | null>(null);
	const [isDeletingSpecialist, setIsDeletingSpecialist] = useState(false);

	// Предотвращение любых прыжков скролла при фильтрации и переключении отраслей
	const scrollYBeforeUpdate = useRef<number | null>(null);

	useLayoutEffect(() => {
		if (scrollYBeforeUpdate.current !== null) {
			const savedY = scrollYBeforeUpdate.current;
			scrollYBeforeUpdate.current = null;
			window.scrollTo({ top: savedY, behavior: 'instant' });
		}
	}, [certifiedList]);

	useEffect(() => {
		loadProfile();
		loadCertifiedClusters();
	}, []);

	useEffect(() => {
		if (profile) {
			if (activeMainTab === 'applications') {
				loadApplications();
			} else {
				loadCertifiedList(certifiedPage);
			}
		}
	}, [profile, activeMainTab, activeAppStatus]);

	const loadProfile = async () => {
		setLoadingProfile(true);
		try {
			const data = await staffApi.getProfile();
			setProfile(data);
		} catch (err) {
			staffApi.logout();
			navigate('/staff/login');
		} finally {
			setLoadingProfile(false);
		}
	};

	const loadApplications = async () => {
		setLoadingApps(true);
		try {
			const data = await staffApi.getApplications({
				status: activeAppStatus || undefined,
				q: appSearchQuery.trim() || undefined,
			});
			setApplications(data);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingApps(false);
		}
	};

	const loadCertifiedList = async (page = 1, clusterOverride?: string, innOverride?: string, qOverride?: string) => {
		if (scrollYBeforeUpdate.current === null) {
			scrollYBeforeUpdate.current = window.scrollY;
		}
		setLoadingCertified(true);
		const targetCluster = clusterOverride !== undefined ? clusterOverride : certifiedCluster;
		const targetInn = innOverride !== undefined ? innOverride : certifiedHasInn;
		const targetQ = qOverride !== undefined ? qOverride : certifiedSearch;
		try {
			const data = await staffApi.getCertifiedUsers({
				page,
				q: targetQ.trim() || undefined,
				has_inn: targetInn || undefined,
				cluster: targetCluster || undefined,
			});
			setCertifiedList(data.results);
			setCertifiedTotal(data.count);
			setCertifiedPage(page);

			// Синхронизируем URL параметры, чтобы состояние сохранялось в адресной строке и истории
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					next.set('tab', 'registry');
					if (page > 1) next.set('page', String(page)); else next.delete('page');
					if (targetQ.trim()) next.set('q', targetQ.trim()); else next.delete('q');
					if (targetInn) next.set('has_inn', targetInn); else next.delete('has_inn');
					if (targetCluster) next.set('cluster', targetCluster); else next.delete('cluster');
					next.delete('target');
					return next;
				},
				{ replace: true }
			);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingCertified(false);
		}
	};

	// Плавная прокрутка и фокус прямо к той строке кандидата, откуда переходили в карточку (только 1 раз при возврате)
	const hasScrolledTargetRef = useRef<boolean>(false);

	useEffect(() => {
		const targetId = searchParams.get('target');
		if (!targetId) return;

		// Сразу же удаляем target из URL, чтобы он никогда не срабатывал повторно при фильтрациях и кликах по отраслям!
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.delete('target');
				return next;
			},
			{ replace: true }
		);

		if (!hasScrolledTargetRef.current && certifiedList.length > 0) {
			hasScrolledTargetRef.current = true;
			const timer = setTimeout(() => {
				const element = document.getElementById(`candidate-row-${targetId}`);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					element.classList.add('bg-blue-100/70', 'ring-2', 'ring-[#283375]/40');
					setTimeout(() => {
						element.classList.remove('bg-blue-100/70', 'ring-2', 'ring-[#283375]/40');
					}, 2500);
				}
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [certifiedList, searchParams, setSearchParams]);

	const candidateDossierState = (candidateId: number) => ({
		from: 'registry',
		returnUrl: `/staff/dashboard?tab=registry${certifiedPage > 1 ? `&page=${certifiedPage}` : ''}${certifiedSearch.trim() ? `&q=${encodeURIComponent(certifiedSearch.trim())}` : ''}${certifiedHasInn ? `&has_inn=${certifiedHasInn}` : ''}${certifiedCluster ? `&cluster=${encodeURIComponent(certifiedCluster)}` : ''}&target=${candidateId}`,
		targetId: candidateId,
	});

	const loadCertifiedClusters = async () => {
		try {
			const clusters = await staffApi.getCertifiedClusters();
			setCertifiedClustersList(clusters);
		} catch (err) {
			console.error('Ошибка загрузки кластеров профессий:', err);
		}
	};

	const handleAppSearch = (e: React.FormEvent) => {
		e.preventDefault();
		loadApplications();
	};

	const handleCertifiedSearch = (e: React.FormEvent) => {
		e.preventDefault();
		loadCertifiedList(1);
	};

	const handleDeleteSpecialist = async () => {
		if (!deletingSpecialist) return;
		setIsDeletingSpecialist(true);
		try {
			await staffApi.deleteCertifiedUser(deletingSpecialist.id);
			setDeletingSpecialist(null);
			await loadCertifiedList(certifiedPage);
			await loadProfile();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при удалении специалиста');
		} finally {
			setIsDeletingSpecialist(false);
		}
	};

	const handleDisconnectTelegram = async () => {
		if (!confirm('Вы действительно хотите отключить получение уведомлений в Telegram?')) return;
		try {
			await staffApi.disconnectTelegram();
			await loadProfile();
		} catch (err) {
			alert('Ошибка при отключении Telegram');
		}
	};

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
									onClick={() => switchMainTab(tab.id as 'applications' | 'certified_registry')}
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
									<div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
										isActive ? 'bg-[#283375] text-white' : 'bg-slate-100 text-slate-400'
									}`}>
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
							onPageChange={(page) => loadCertifiedList(page)}
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
