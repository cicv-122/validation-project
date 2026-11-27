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
	const [tabParam] = useUrlQueryState<string>('tab', {
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
		if (tabId === 'certified_registry') {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					next.set('tab', 'registry');
					return next;
				},
				{ replace: true }
			);
		} else {
			// При переходе в Электронную приёмную очищаем параметры поиска реестра (?q=..., ?cluster=...)
			setSearchParams(
				() => {
					const next = new URLSearchParams();
					return next;
				},
				{ replace: true }
			);
		}
	};

	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	// Applications State
	const [applications, setApplications] = useState<StaffApplicationItem[]>([]);
	const [loadingApps, setLoadingApps] = useState(false);
	const [activeAppStatus, setActiveAppStatus] = useState('submitted');
	const [activeSubStatus, setActiveSubStatus] = useState('online');
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

	// Кэш страниц реестра в оперативной памяти: key -> { results, count, timestamp }
	const registryCacheRef = useRef<Map<string, { results: StaffCertifiedUser[]; count: number; timestamp: number }>>(new Map());

	const getCacheKey = (cluster?: string, inn?: string, q?: string, page = 1) => {
		return `${cluster || ''}|${inn || ''}|${(q || '').trim()}|${page}`;
	};

	const scrollToTableTop = () => {
		setTimeout(() => {
			const tableEl = document.getElementById('certified-specialists-table');
			if (tableEl) {
				const headerOffset = 100; // отступ под верхнюю панель
				const elementPosition = tableEl.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
				window.scrollTo({
					top: Math.max(0, offsetPosition),
					behavior: 'smooth',
				});
			}
		}, 30);
	};

	const prefetchNextPage = (currentPage: number, totalCount: number, cluster?: string, inn?: string, q?: string) => {
		const nextPage = currentPage + 1;
		if (currentPage * 20 >= totalCount) return;

		const nextCacheKey = getCacheKey(cluster, inn, q, nextPage);
		if (registryCacheRef.current.has(nextCacheKey)) return;

		staffApi.getCertifiedUsers({
			page: nextPage,
			q: (q || '').trim() || undefined,
			has_inn: inn || undefined,
			cluster: cluster || undefined,
		}).then((data) => {
			registryCacheRef.current.set(nextCacheKey, {
				results: data.results,
				count: data.count,
				timestamp: Date.now(),
			});
		}).catch(() => {
			// игнорируем ошибку фонового префетча
		});
	};

	useLayoutEffect(() => {
		if (scrollYBeforeUpdate.current !== null) {
			const savedY = scrollYBeforeUpdate.current;
			scrollYBeforeUpdate.current = null;
			window.scrollTo({ top: savedY, behavior: 'instant' });
		}
	}, [certifiedList]);

	// Предотвращение гонки асинхронных ответов при быстром переключении
	const appsRequestIdRef = useRef<number>(0);

	const loadProfile = async (silent = false) => {
		if (!silent && !profile) setLoadingProfile(true);
		try {
			const data = await staffApi.getProfile();
			setProfile(data);
		} catch (err) {
			staffApi.logout();
			navigate('/staff/login');
		} finally {
			if (!silent && !profile) setLoadingProfile(false);
		}
	};

	const loadApplications = async (
		silent = false,
		overrideStatus?: string,
		overrideSubStatus?: string,
		overrideQ?: string
	) => {
		const reqId = ++appsRequestIdRef.current;
		if (!silent) setLoadingApps(true);
		try {
			const currentStatus = overrideStatus !== undefined ? overrideStatus : activeAppStatus;
			const currentSub = overrideSubStatus !== undefined ? overrideSubStatus : activeSubStatus;
			const currentQ = overrideQ !== undefined ? overrideQ : appSearchQuery;

			let statusParam: string | undefined = currentStatus || undefined;
			let originParam: string | undefined = undefined;

			if (currentSub) {
				if (currentSub === 'online' || currentSub === 'in_person') {
					originParam = currentSub;
				} else {
					statusParam = currentSub;
				}
			}

			const data = await staffApi.getApplications({
				status: statusParam,
				origin: originParam,
				q: currentQ.trim() || undefined,
			});
			if (appsRequestIdRef.current !== reqId) return; // Устаревший ответ игнорируем!
			setApplications(data);

			// Синхронизируем счетчик активного раздела с реальным количеством элементов в ответе
			if (!currentQ.trim()) {
				setProfile((prev) => {
					if (!prev) return prev;
					const updatedStats = { ...prev.stats };
					if (currentStatus === 'submitted') {
						if (currentSub === 'online') {
							updatedStats.submitted_online = data.length;
						} else if (currentSub === 'in_person') {
							updatedStats.submitted_in_person = data.length;
						} else {
							updatedStats.submitted = data.length;
						}
						updatedStats.submitted = (updatedStats.submitted_online ?? 0) + (updatedStats.submitted_in_person ?? 0);
					} else if (currentStatus === 'under_review') {
						if (currentSub === 'under_review_docs') {
							updatedStats.under_review_docs = data.length;
						} else if (currentSub === 'assessment_scheduled') {
							updatedStats.scheduled = data.length;
						} else {
							updatedStats.under_review = data.length;
						}
						updatedStats.under_review = (updatedStats.under_review_docs ?? 0) + (updatedStats.scheduled ?? 0);
					} else if (currentStatus === 'completed') {
						updatedStats.completed = data.length;
					} else if (currentStatus === 'rejected') {
						if (currentSub === 'rejected_exam') {
							updatedStats.rejected_exam = data.length;
						} else if (currentSub === 'rejected_cancelled') {
							updatedStats.rejected_cancelled = data.length;
						} else {
							updatedStats.rejected = data.length;
						}
						updatedStats.rejected = (updatedStats.rejected_exam ?? 0) + (updatedStats.rejected_cancelled ?? 0);
					}
					return { ...prev, stats: updatedStats };
				});
			}
		} catch (err) {
			console.error(err);
		} finally {
			if (appsRequestIdRef.current === reqId && !silent) setLoadingApps(false);
		}
	};

	const optimisticDeleteApp = (id: number) => {
		const targetId = Number(id);
		setApplications((prev) => prev.filter((app) => Number(app.id) !== targetId));
		setProfile((prev) => {
			if (!prev) return prev;
			const target = applications.find((a) => Number(a.id) === targetId);
			const isOnline = target?.origin !== 'in_person';
			const curOnline = prev.stats.submitted_online ?? prev.stats.submitted;
			return {
				...prev,
				stats: {
					...prev.stats,
					total: Math.max(0, prev.stats.total - 1),
					submitted: target?.status === 'submitted' ? Math.max(0, prev.stats.submitted - 1) : prev.stats.submitted,
					submitted_online: target?.status === 'submitted' && isOnline ? Math.max(0, curOnline - 1) : curOnline,
					under_review: target?.status === 'under_review' ? Math.max(0, prev.stats.under_review - 1) : prev.stats.under_review,
					under_review_docs: target?.status === 'under_review' ? Math.max(0, (prev.stats.under_review_docs || 1) - 1) : prev.stats.under_review_docs,
				},
			};
		});
	};

	const optimisticTakeInWork = (id: number) => {
		const targetId = Number(id);
		if (activeAppStatus === 'submitted') {
			setApplications((prev) => prev.filter((app) => Number(app.id) !== targetId));
		}
		setProfile((prev) => {
			if (!prev) return prev;
			const curOnline = prev.stats.submitted_online ?? prev.stats.submitted;
			const newOnline = Math.max(0, curOnline - 1);
			const newSubmitted = Math.max(0, prev.stats.submitted - 1);
			const newDocs = (prev.stats.under_review_docs || 0) + 1;
			const newUnderReview = prev.stats.under_review + 1;
			return {
				...prev,
				stats: {
					...prev.stats,
					submitted: newSubmitted,
					submitted_online: newOnline,
					under_review: newUnderReview,
					under_review_docs: newDocs,
				},
			};
		});
	};

	const optimisticReturnToSubmitted = (id: number) => {
		const targetId = Number(id);
		if (activeAppStatus === 'under_review') {
			setApplications((prev) => prev.filter((app) => Number(app.id) !== targetId));
		}
		setProfile((prev) => {
			if (!prev) return prev;
			const curOnline = prev.stats.submitted_online ?? prev.stats.submitted;
			const newOnline = curOnline + 1;
			const newSubmitted = prev.stats.submitted + 1;
			const newDocs = Math.max(0, (prev.stats.under_review_docs || 1) - 1);
			const newUnderReview = Math.max(0, prev.stats.under_review - 1);
			return {
				...prev,
				stats: {
					...prev.stats,
					under_review: newUnderReview,
					under_review_docs: newDocs,
					submitted: newSubmitted,
					submitted_online: newOnline,
				},
			};
		});
	};

	const loadCertifiedList = async (
		page = 1,
		clusterOverride?: string,
		innOverride?: string,
		qOverride?: string,
		shouldScrollToTable = false
	) => {
		const targetCluster = clusterOverride !== undefined ? clusterOverride : certifiedCluster;
		const targetInn = innOverride !== undefined ? innOverride : certifiedHasInn;
		const targetQ = qOverride !== undefined ? qOverride : certifiedSearch;
		const cacheKey = getCacheKey(targetCluster, targetInn, targetQ, page);

		// Если данные уже есть в кэше оперативной памяти — отдаём моментально (0 мс, 0 сетевых запросов)
		if (registryCacheRef.current.has(cacheKey)) {
			const cached = registryCacheRef.current.get(cacheKey)!;
			if (shouldScrollToTable) {
				scrollYBeforeUpdate.current = null;
			}
			setCertifiedList(cached.results);
			setCertifiedTotal(cached.count);
			setCertifiedPage(page);
			setLoadingCertified(false);

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

			if (shouldScrollToTable) {
				scrollToTableTop();
			}

			prefetchNextPage(page, cached.count, targetCluster, targetInn, targetQ);
			return;
		}

		if (shouldScrollToTable) {
			scrollYBeforeUpdate.current = null;
		} else if (scrollYBeforeUpdate.current === null) {
			scrollYBeforeUpdate.current = window.scrollY;
		}

		setLoadingCertified(true);
		try {
			const data = await staffApi.getCertifiedUsers({
				page,
				q: targetQ.trim() || undefined,
				has_inn: targetInn || undefined,
				cluster: targetCluster || undefined,
			});

			registryCacheRef.current.set(cacheKey, {
				results: data.results,
				count: data.count,
				timestamp: Date.now(),
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

			if (shouldScrollToTable) {
				scrollToTableTop();
			}

			prefetchNextPage(page, data.count, targetCluster, targetInn, targetQ);
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
				loadProfile(true);
			} else {
				loadCertifiedList(certifiedPage);
			}
		}
	}, [Boolean(profile), activeMainTab, activeAppStatus, activeSubStatus]);

	// При нахождении в приёмной заявок очищаем старые параметры поиска реестра (?q=..., ?cluster=...)
	useEffect(() => {
		if (activeMainTab === 'applications') {
			if (searchParams.has('q') || searchParams.has('cluster') || searchParams.has('page') || searchParams.has('has_inn') || searchParams.has('target')) {
				setSearchParams(
					(prev) => {
						const next = new URLSearchParams(prev);
						next.delete('q');
						next.delete('cluster');
						next.delete('page');
						next.delete('has_inn');
						next.delete('target');
						return next;
					},
					{ replace: true }
				);
			}
		}
	}, [activeMainTab]);

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
		registryCacheRef.current.clear();
		loadCertifiedList(1, undefined, undefined, certifiedSearch, true);
	};

	const handleDeleteSpecialist = async () => {
		if (!deletingSpecialist) return;
		setIsDeletingSpecialist(true);
		try {
			await staffApi.deleteCertifiedUser(deletingSpecialist.id);
			setDeletingSpecialist(null);
			registryCacheRef.current.clear();
			await loadCertifiedList(certifiedPage, undefined, undefined, undefined, false);
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
		activeSubStatus,
		setActiveSubStatus,
		handleStatusChange: (status: string) => {
			setActiveAppStatus(status);
			let nextSub = '';
			if (status === 'submitted') {
				nextSub = 'online';
			} else if (status === 'under_review') {
				nextSub = 'under_review_docs';
			} else if (status === 'rejected') {
				nextSub = 'rejected_exam';
			}
			setActiveSubStatus(nextSub);
		},
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
		optimisticDeleteApp,
		optimisticTakeInWork,
		optimisticReturnToSubmitted,
		candidateDossierState,
		handleAppSearch,
		handleCertifiedSearch,
		handleDeleteSpecialist,
		handleDisconnectTelegram,
	};
}
