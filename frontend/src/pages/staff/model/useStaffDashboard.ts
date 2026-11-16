// frontend/src/pages/staff/model/useStaffDashboard.ts
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useUrlQueryState } from '../../../shared/lib';
import {
	staffApi,
	StaffProfile,
	StaffApplicationItem,
	StaffCertifiedUser,
	CertifiedClusterItem,
} from '../../../api/staff';

export const MAIN_TABS = [
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
] as const;

export type MainTabType = 'applications' | 'certified_registry';

export function useStaffDashboard() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// Active main view: 'applications' | 'certified_registry' (synced with URL ?tab=registry)
	const [tabParam, setTabParam] = useUrlQueryState<string>('tab', {
		defaultValue: '',
		replace: true,
	});

	const activeMainTab: MainTabType = tabParam === 'registry' ? 'certified_registry' : 'applications';

	const location = useLocation();

	// Сохраняем текущий активный URL кабинета (включая ?tab=registry), чтобы возврат возвращал ровно в эту вкладку
	useEffect(() => {
		if (location.pathname === '/staff/dashboard') {
			sessionStorage.setItem('staff_dashboard_last_url', location.pathname + location.search);
		}
	}, [location.pathname, location.search]);

	const switchMainTab = (tabId: MainTabType) => {
		setTabParam(tabId === 'certified_registry' ? 'registry' : '');
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
	);
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

	const loadCertifiedClusters = async () => {
		try {
			const clusters = await staffApi.getCertifiedClusters();
			setCertifiedClustersList(clusters);
		} catch (err) {
			console.error('Ошибка загрузки кластеров профессий:', err);
		}
	};

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

	return {
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
	};
}
