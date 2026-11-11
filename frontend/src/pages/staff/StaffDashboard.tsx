// frontend/src/pages/staff/StaffDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
	staffApi,
	StaffProfile,
	StaffApplicationItem,
	StaffApplicationDetail,
	StaffCertifiedUser,
	CertifiedClusterItem,
} from '../../api/staff';
import StaffHeader from '../../components/staff/StaffHeader';
import {
	analyzeKyrgyzPin,
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
	detectCitizenshipFromExistingInn,
} from '../../utils/kyrgyzPinValidator';
import {
	MinistryReportModal,
	ApplicationsStatsBar,
	ApplicationsStatusCards,
	CertifiedClustersBar,
} from '../../features/candidate-filter';
import { TelegramConnectModal } from '../../features/auth-staff';
import { ConfirmDeleteDialog } from '../../features/status-change';
import { DigitizationArchiveHero } from '../../widgets/digitization-stats';
import { CertifiedSpecialistsTable } from '../../widgets/candidate-registry';
import { ApplicationsQueueTable } from '../../widgets/assessment-queue';
import { DossierDocumentSlots } from '../../widgets/dossier-viewer';

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

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
	draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
	submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
	under_review: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
	assessment_scheduled: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
	assessment_in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
	approved: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
	rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
	completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
};

function formatAppDateTime(dateStr?: string): string {
	if (!dateStr) return '—';
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		return d.toLocaleString('ru-RU', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return dateStr;
	}
}

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
	const [appDetail, setAppDetail] = useState<StaffApplicationDetail | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [certNumber, setCertNumber] = useState('');
	const [certInn, setCertInn] = useState('');
	const [issuingCert, setIssuingCert] = useState(false);
	const [issueResult, setIssueResult] = useState<{
		message: string;
		registration_number: string;
		verify_url: string;
	} | null>(null);
	const [uploadingDoc, setUploadingDoc] = useState(false);

	// Candidate Full Edit State
	const [editAppFullName, setEditAppFullName] = useState('');
	const [editAppPhone, setEditAppPhone] = useState('');
	const [editAppWhatsapp, setEditAppWhatsapp] = useState('');
	const [editAppEmail, setEditAppEmail] = useState('');
	const [editAppInn, setEditAppInn] = useState('');
	const [editAppType, setEditAppType] = useState<'certification' | 'validation'>('certification');
	const [editAppProfession, setEditAppProfession] = useState('');
	const [editAppQualLevel, setEditAppQualLevel] = useState('');
	const [editAppExpYears, setEditAppExpYears] = useState<number | string>(0);
	const [editAppExpDesc, setEditAppExpDesc] = useState('');
	const [editAppAddress, setEditAppAddress] = useState('');
	const [editAppAssessor, setEditAppAssessor] = useState('');
	const [editAppDate, setEditAppDate] = useState('');
	const [editAppLocation, setEditAppLocation] = useState('');
	const [editAppNotes, setEditAppNotes] = useState('');
	const [editAppStatus, setEditAppStatus] = useState('submitted');
	const [savingAppDetail, setSavingAppDetail] = useState(false);
	const [appSaveSuccessMsg, setAppSaveSuccessMsg] = useState<string | null>(null);

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
	// Delete Application confirmation
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeletingApp, setIsDeletingApp] = useState(false);
	// Delete Certified Specialist confirmation
	const [deletingSpecialist, setDeletingSpecialist] = useState<StaffCertifiedUser | null>(null);
	const [isDeletingSpecialist, setIsDeletingSpecialist] = useState(false);
	const [appCitizenship, setAppCitizenship] = useState<CitizenshipCode>('');

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
	}, [profile, activeMainTab, activeAppStatus, certifiedHasInn, certifiedCluster]);

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

	// Плавная прокрутка и фокус прямо к той строке кандидата, откуда переходили в карточку
	useEffect(() => {
		const targetId = searchParams.get('target');
		if (targetId && certifiedList.length > 0) {
			const timer = setTimeout(() => {
				const element = document.getElementById(`candidate-row-${targetId}`);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					element.classList.add('bg-blue-100/70', 'ring-2', 'ring-[#283375]/40');
					setTimeout(() => {
						element.classList.remove('bg-blue-100/70', 'ring-2', 'ring-[#283375]/40');
					}, 2500);
				}
			}, 150);
			return () => clearTimeout(timer);
		}
	}, [certifiedList, searchParams]);

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

	const openApplication = async (id: number) => {
		setSelectedAppId(id);
		setLoadingDetail(true);
		setIssueResult(null);
		setAppSaveSuccessMsg(null);
		try {
			const data = await staffApi.getApplicationDetail(id);
			setAppDetail(data);
			setCertNumber(data.certificate_number_issued || '');
			setCertInn(data.inn || '');

			// Заполнение всех редактируемых полей кандидата
			setEditAppFullName(data.full_name || '');
			setEditAppPhone(data.phone || '');
			setEditAppWhatsapp(data.whatsapp || '');
			setEditAppEmail(data.email || '');
			setEditAppInn(data.inn || '');
			setAppCitizenship(detectCitizenshipFromExistingInn(data.inn || '', data.full_name || ''));
			setEditAppType(data.application_type || 'certification');
			setEditAppProfession(data.profession || '');
			setEditAppQualLevel(data.qualification_level || '');
			setEditAppExpYears(data.experience_years ?? 0);
			setEditAppExpDesc(data.experience_desc || '');
			setEditAppAddress(data.address || '');
			setEditAppAssessor(data.assessor_name || '');
			setEditAppDate(data.scheduled_date ? data.scheduled_date.split('T')[0] : '');
			setEditAppLocation(data.scheduled_location || '');
			setEditAppNotes(data.admin_notes || '');
			setEditAppStatus(data.status || 'submitted');
		} catch (err) {
			alert('Не удалось загрузить данные заявки');
		} finally {
			setLoadingDetail(false);
		}
	};

	const editAppPinAnalysis = analyzeKyrgyzPin(editAppInn, editAppFullName, appCitizenship);
	const certPinAnalysis = analyzeKyrgyzPin(certInn, editAppFullName || appDetail?.full_name || '', appCitizenship || 'KG');

	const handleSaveAppDetail = async () => {
		if (!selectedAppId) return;
		if (editAppInn.trim() && !appCitizenship) {
			alert('Выберите гражданство кандидата');
			return;
		}
		if (editAppInn.trim() && !editAppPinAnalysis.isValid) {
			alert('Неправильный ПИН / ИНН');
			return;
		}
		setSavingAppDetail(true);
		setAppSaveSuccessMsg(null);
		try {
			const updated = await staffApi.updateApplicationDetail(selectedAppId, {
				full_name: editAppFullName.trim(),
				phone: editAppPhone.trim(),
				whatsapp: editAppWhatsapp.trim(),
				email: editAppEmail.trim(),
				inn: editAppInn.trim(),
				citizenship: appCitizenship,
				is_foreign_citizen: Boolean(appCitizenship && appCitizenship !== 'KG'),
				application_type: editAppType,
				profession: editAppProfession.trim(),
				qualification_level: editAppQualLevel.trim(),
				experience_years: editAppExpYears,
				experience_desc: editAppExpDesc.trim(),
				address: editAppAddress.trim(),
				assessor_name: editAppAssessor.trim(),
				scheduled_date: editAppDate || null,
				scheduled_location: editAppLocation.trim(),
				admin_notes: editAppNotes.trim(),
				status: editAppStatus,
			} as any);
			setAppDetail(updated);
			setAppSaveSuccessMsg('Данные кандидата и статус дела успешно сохранены!');
			loadApplications();
			loadProfile();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при сохранении данных кандидата');
		} finally {
			setSavingAppDetail(false);
		}
	};

	const handleDeleteApplication = async () => {
		if (!selectedAppId) return;
		setIsDeletingApp(true);
		try {
			await staffApi.deleteApplication(selectedAppId);
			setShowDeleteConfirm(false);
			setSelectedAppId(null);
			setAppDetail(null);
			await loadApplications();
			await loadProfile();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при удалении заявки');
		} finally {
			setIsDeletingApp(false);
		}
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

	const uploadFilesDirectly = async (docType: string, fileList: FileList | File[], description?: string) => {
		if (!selectedAppId || !fileList || fileList.length === 0) return;
		setUploadingDoc(true);
		try {
			const filesArray = Array.from(fileList);
			const formData = new FormData();
			formData.append('doc_type', docType);
			if (description?.trim()) formData.append('description', description.trim());
			filesArray.forEach((file) => {
				formData.append('files', file);
			});

			await staffApi.uploadDocument(selectedAppId, formData);
			const refreshed = await staffApi.getApplicationDetail(selectedAppId);
			setAppDetail(refreshed);
			setAppSaveSuccessMsg(`Файлы успешно загружены (${filesArray.length} шт.)`);
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при загрузке файлов');
		} finally {
			setUploadingDoc(false);
		}
	};

	const handleDeleteDoc = async (docId: number) => {
		if (!selectedAppId) return;
		if (!confirm('Вы уверены, что хотите удалить этот файл из дела?')) return;
		try {
			await staffApi.deleteDocument(selectedAppId, docId);
			const refreshed = await staffApi.getApplicationDetail(selectedAppId);
			setAppDetail(refreshed);
		} catch (err: any) {
			alert('Ошибка при удалении файла');
		}
	};

	const handleIssueCertificate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedAppId || !certNumber.trim()) {
			alert('Укажите номер сертификата');
			return;
		}

		if (certInn.trim() && !certPinAnalysis.isValid) {
			alert('Неправильный ПИН / ИНН');
			return;
		}

		if (!confirm(`Подтверждаете внесение специалиста ${appDetail?.full_name} в государственный реестр с номером бланка: ${certNumber.trim()}?`)) {
			return;
		}

		setIssuingCert(true);
		setIssueResult(null);
		try {
			const res = await staffApi.issueCertificate(selectedAppId, {
				certificate_number: certNumber.trim(),
				inn: certInn.trim() || undefined,
				citizenship: appCitizenship || 'KG',
				is_foreign_citizen: Boolean(appCitizenship && appCitizenship !== 'KG'),
			} as any);
			setIssueResult(res);
			openApplication(selectedAppId);
			loadApplications();
			loadProfile();
		} catch (err: any) {
			alert(err?.response?.data?.detail || 'Ошибка при выпуске сертификата');
		} finally {
			setIssuingCert(false);
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
		<div className="min-h-screen bg-slate-100/70 text-slate-800 pb-16">
			{/* ЕДИНАЯ СЛУЖЕБНАЯ ШАПКА ЦНСВ МП КР */}
			<StaffHeader
				profile={profile}
				onDisconnectTelegram={handleDisconnectTelegram}
				onConnectTelegram={() => setShowTelegramModal(true)}
			/>

			{/* ПОДШАПКА: ЗАКРЕПЛЁННЫЕ ПРОФЕССИИ */}
			<div className="bg-white border-b border-slate-200/80 shadow-2xs">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-2 text-xs">
					<span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
						<svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						Закреплённые профессии:
					</span>
					{profile?.assigned_professions && profile.assigned_professions.length > 0 ? (
						<>
							{profile.assigned_professions.slice(0, 8).map((p) => (
								<span
									key={p.id}
									className="px-3 py-1 rounded-lg bg-blue-50 text-[#283375] font-bold border border-blue-100 shadow-2xs text-[11px]"
								>
									{p.name_ru}
								</span>
							))}
							{profile.assigned_professions.length > 8 && (
								<span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px]">
									+{profile.assigned_professions.length - 8} ещё
								</span>
							)}
						</>
					) : (
						<span className="text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-lg font-medium text-[11px]">
							Не закреплены
						</span>
					)}
				</div>
			</div>

			{/* ОСНОВНОЙ КОНТЕНТ С ПЕРЕКЛЮЧАТЕЛЕМ РЕЖИМОВ */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
				{/* ГЛАВНЫЙ ПЕРЕКЛЮЧАТЕЛЬ РАЗДЕЛОВ: ЗАЯВКИ vs РЕЕСТР ВЫДАННЫХ */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{MAIN_TABS.map((tab) => {
						const isActive = activeMainTab === tab.id;
						const tabTitle =
							tab.id === 'certified_registry'
								? `Оцифровка реестра (Архив: ${profile?.stats?.registry_total || certifiedTotal || 827})`
								: tab.label;
						return (
							<div
								key={tab.id}
								onClick={() => switchMainTab(tab.id as any)}
								className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
									isActive
										? 'bg-white border-[#283375] shadow-md shadow-[#283375]/10 ring-4 ring-[#283375]/5'
										: 'bg-white/80 border-slate-200 hover:border-slate-300 shadow-xs'
								}`}
							>
								<div>
									<div className="flex items-center gap-2 flex-wrap">
										<span className={`text-base font-black ${isActive ? 'text-[#283375]' : 'text-slate-800'}`}>
											{tabTitle}
										</span>
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
							onOpenApplication={(id) => openApplication(id)}
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

			{/* МОДАЛЬНОЕ ОКНО 1: КАРТОЧКА ЗАЯВКИ КАНДИДАТА С ПОЛНЫМ РЕДАКТИРОВАНИЕМ */}
			{selectedAppId && (
				<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
					<div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
						{/* Заголовок модального окна */}
						<div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
							<div>
								<div className="flex items-center gap-2 mb-1 flex-wrap">
									<span className="text-[11px] uppercase font-bold text-slate-400">
										Дело кандидата • {appDetail?.short_registration_number}
									</span>
									{appDetail && (
										<span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_BADGES[appDetail.status]?.bg} ${STATUS_BADGES[appDetail.status]?.text} ${STATUS_BADGES[appDetail.status]?.border}`}>
											{appDetail.status_display}
										</span>
									)}
									{appDetail?.created_at && (
										<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
											<svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<span>Подано: {formatAppDateTime(appDetail.created_at)}</span>
										</span>
									)}
								</div>
								<h2 className="text-xl sm:text-2xl font-black text-slate-900">
									{editAppFullName || appDetail?.full_name || 'Дело кандидата'}
								</h2>
							</div>
							<div className="flex items-center gap-2">
								{/* Кнопка удаления заявки на любом этапе */}
								{appDetail && (
									<button
										type="button"
										onClick={() => setShowDeleteConfirm(true)}
										className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
										title="Переместить заявку в архив"
									>
										<svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										<span className="hidden sm:inline">Удалить заявку</span>
									</button>
								)}
								<button
									onClick={() => setSelectedAppId(null)}
									className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
								>
									✕
								</button>
							</div>
						</div>

						{/* Тело модалки */}
						<div className="p-6 overflow-y-auto space-y-6 flex-1">
							{loadingDetail ? (
								<div className="py-16 text-center text-slate-400">
									<div className="w-8 h-8 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-2" />
									Загрузка дела кандидата...
								</div>
							) : appDetail ? (
								<>
									{/* Уведомление об успешном сохранении */}
									{appSaveSuccessMsg && (
										<div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
											<span>✓ {appSaveSuccessMsg}</span>
											<button onClick={() => setAppSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-950">✕</button>
										</div>
									)}

									{issueResult && (
										<div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
											<div className="font-bold flex items-center gap-2">
												<span>✓ {issueResult.message}</span>
											</div>
											<div className="text-xs">
												Присвоен официальный номер: <b>{issueResult.registration_number}</b>
											</div>
											<a
												href={issueResult.verify_url}
												target="_blank"
												rel="noreferrer"
												className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all mt-2"
											>
												Проверить в открытом реестре (/verify)
											</a>
										</div>
									)}

									{/* БЛОК 1: РЕДАКТИРУЕМЫЕ ЛИЧНЫЕ И КОНТАКТНЫЕ ДАННЫЕ */}
									<div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2">
												<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												<span>Личные и контактные данные</span>
											</h3>
											<span className="text-[11px] text-slate-400 font-medium">Редактируемые поля</span>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
											{/* ФИО */}
											<div className="sm:col-span-2 md:col-span-1">
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													ФИО кандидата *
												</label>
												<input
													type="text"
													value={editAppFullName}
													onChange={(e) => setEditAppFullName(e.target.value)}
													placeholder="Фамилия Имя Отчество"
													className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375]"
												/>
											</div>

											{/* Гражданство */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Гражданство
												</label>
												<select
													value={appCitizenship}
													onChange={(e) => setAppCitizenship(e.target.value as CitizenshipCode)}
													className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border bg-white outline-none transition-colors cursor-pointer ${
														editAppInn && !appCitizenship
															? 'border-red-400 bg-red-50/30 text-red-700'
															: 'border-slate-200 focus:border-[#283375]'
													}`}
												>
													<option value="">— Выберите —</option>
													{CITIZENSHIP_OPTIONS.map((opt) => (
														<option key={opt.value} value={opt.value}>
															{opt.label}
														</option>
													))}
												</select>
											</div>

											{/* ПИН / ИНН */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													ПИН / ИНН
												</label>
												<input
													type="text"
													maxLength={
														CITIZENSHIP_OPTIONS.find((c) => c.value === appCitizenship)?.maxLength || 14
													}
													value={editAppInn}
													onChange={(e) => setEditAppInn(e.target.value.replace(/\D/g, ''))}
													placeholder={
														CITIZENSHIP_OPTIONS.find((c) => c.value === appCitizenship)?.placeholder ||
														'Сначала выберите гражданство'
													}
													className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border bg-white outline-none transition-colors ${
														editAppInn && editAppPinAnalysis.errorMessage
															? 'border-red-400 bg-red-50/30 focus:border-red-600'
															: editAppInn && editAppPinAnalysis.isValid && editAppPinAnalysis.isComplete
															? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
															: 'border-slate-200 focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
													}`}
												/>
												{editAppInn && editAppPinAnalysis.errorMessage && (
													<p className="mt-1 text-[10px] font-bold text-red-600">
														{editAppPinAnalysis.errorMessage}
													</p>
												)}
											</div>

											{/* Телефон */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Номер телефона
												</label>
												<input
													type="text"
													value={editAppPhone}
													onChange={(e) => setEditAppPhone(e.target.value)}
													placeholder="+996 ..."
													className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* WhatsApp */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													WhatsApp
												</label>
												<div className="flex items-center gap-1.5">
													<input
														type="text"
														value={editAppWhatsapp}
														onChange={(e) => setEditAppWhatsapp(e.target.value)}
														placeholder="996..."
														className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
													/>
													{editAppWhatsapp && (
														<a
															href={`https://wa.me/${editAppWhatsapp.replace(/\D/g, '')}`}
															target="_blank"
															rel="noreferrer"
															title="Написать в WhatsApp"
															className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0 transition-colors"
														>
															<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
																<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.116-.062-.26-.086-.586-.201-1.009-.387-1.782-.782-2.935-2.586-3.025-2.705-.089-.119-.724-.962-.724-1.836s.456-1.306.619-1.485c.162-.179.355-.224.474-.224.119 0 .237.002.341.007.109.006.257-.041.402.308.149.36.509 1.242.554 1.332.045.09.075.195.015.314-.06.119-.09.194-.179.298-.089.105-.188.234-.269.314-.09.09-.184.188-.079.368.105.18.468.773 1.005 1.251.692.616 1.277.807 1.457.897.18.09.285.075.39-.045.105-.12.449-.523.569-.703.12-.179.24-.149.404-.09.165.06 1.049.495 1.229.585.18.09.3.135.344.21.045.075.045.435-.099.84z" />
															</svg>
														</a>
													)}
												</div>
											</div>

											{/* Email */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Электронная почта
												</label>
												<input
													type="email"
													value={editAppEmail}
													onChange={(e) => setEditAppEmail(e.target.value)}
													placeholder="email@domain.com"
													className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Адрес */}
											<div className="sm:col-span-2 md:col-span-3">
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Адрес проживания кандидата
												</label>
												<input
													type="text"
													value={editAppAddress}
													onChange={(e) => setEditAppAddress(e.target.value)}
													placeholder="г. Бишкек, район, улица, дом..."
													className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>
										</div>
									</div>

									{/* БЛОК 2: ПРОЦЕДУРА, ПРОФЕССИЯ И СТАЖ */}
									<div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2">
												<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
												</svg>
												<span>Процедура, профессия и квалификация</span>
											</h3>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											{/* Тип процедуры */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Тип процедуры
												</label>
												<select
													value={editAppType}
													onChange={(e) => setEditAppType(e.target.value as 'certification' | 'validation')}
													className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												>
													<option value="certification">Сертификация</option>
													<option value="validation">Валидация</option>
												</select>
											</div>

											{/* Профессия */}
											<div className="sm:col-span-2">
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Профессия *
												</label>
												<input
													type="text"
													value={editAppProfession}
													onChange={(e) => setEditAppProfession(e.target.value)}
													placeholder="Название профессии..."
													className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Разряд / Уровень */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Разряд / Уровень квалификации
												</label>
												<input
													type="text"
													value={editAppQualLevel}
													onChange={(e) => setEditAppQualLevel(e.target.value)}
													placeholder="Напр. 3, 4 разряд"
													className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Стаж лет */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Стаж работы (лет)
												</label>
												<input
													type="number"
													min={0}
													value={editAppExpYears}
													onChange={(e) => setEditAppExpYears(e.target.value)}
													className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Номер выданного сертификата (если выдан) */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Номер сертификата
												</label>
												<div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:border-[#283375] focus-within:ring-1 focus-within:ring-[#283375]">
													<span className="text-xs font-bold font-mono text-slate-700 select-none whitespace-nowrap mr-1.5">
														ЦС №
													</span>
													<input
														type="text"
														value={certNumber.replace(/^ЦС\s*№?\s*/i, '')}
														onChange={(e) => {
															const val = e.target.value.trim();
															setCertNumber(val ? `ЦС № ${val}` : '');
														}}
														placeholder="000760"
														className="w-full text-xs font-bold font-mono text-slate-900 outline-none bg-transparent p-0"
													/>
												</div>
											</div>

											{/* Описание стажа */}
											<div className="sm:col-span-3">
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Описание опыта и навыков
												</label>
												<textarea
													rows={2}
													value={editAppExpDesc}
													onChange={(e) => setEditAppExpDesc(e.target.value)}
													placeholder="Опыт кандидата, места работы, практические навыки..."
													className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>
										</div>
									</div>

									{/* БЛОК 3: НАЗНАЧЕНИЕ ОЦЕНКИ, ЭКЗАМЕНАТОР И СТАТУС ДЕЛА */}
									<div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2">
												<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
												</svg>
												<span>Назначение экзамена и статус дела</span>
											</h3>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											{/* Статус */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Текущий статус дела *
												</label>
												<select
													value={editAppStatus}
													onChange={(e) => setEditAppStatus(e.target.value)}
													className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												>
													<option value="submitted">Входящая (Новая)</option>
													<option value="under_review">На рассмотрении</option>
													<option value="assessment_scheduled">Оценка назначена</option>
													<option value="completed">В реестре (Выдано)</option>
													<option value="rejected">Отклонена</option>
												</select>
											</div>

											{/* Дата экзамена */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Дата практического экзамена
												</label>
												<input
													type="date"
													value={editAppDate}
													onChange={(e) => setEditAppDate(e.target.value)}
													className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Эксперт-оценщик */}
											<div>
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Эксперт-оценщик
												</label>
												<input
													type="text"
													value={editAppAssessor}
													onChange={(e) => setEditAppAssessor(e.target.value)}
													placeholder="ФИО эксперта-оценщика..."
													className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Место проведения */}
											<div className="sm:col-span-3">
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Место проведения оценки (Центр / Лаборатория / Колледж)
												</label>
												<input
													type="text"
													value={editAppLocation}
													onChange={(e) => setEditAppLocation(e.target.value)}
													placeholder="Напр. Бишкекский колледж № 93, лаборатория сварки"
													className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>

											{/* Заметки сотрудника */}
											<div className="sm:col-span-3">
												<label className="block text-[11px] font-bold text-slate-600 mb-1">
													Служебные заметки сотрудника ЦНСВ
												</label>
												<textarea
													rows={2}
													value={editAppNotes}
													onChange={(e) => setEditAppNotes(e.target.value)}
													placeholder="Заметки по кандидату, результат собеседования, замечания к документам..."
													className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]"
												/>
											</div>
										</div>

										{/* КНОПКА СОХРАНЕНИЯ ВСЕХ ИЗМЕНЕНИЙ В ДЕЛЕ */}
										<div className="pt-2 flex justify-end">
											<button
												type="button"
												onClick={handleSaveAppDetail}
												disabled={savingAppDetail}
												className="px-6 py-3 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-black text-xs transition-all shadow-md shadow-[#283375]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
											>
												{savingAppDetail ? (
													<>
														<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
														<span>Сохранение данных...</span>
													</>
												) : (
													<>
														<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
														</svg>
														<span>Сохранить все изменения в деле</span>
													</>
												)}
											</button>
										</div>
									</div>

									{/* БЛОК 4: ОФИЦИАЛЬНЫЕ ДОКУМЕНТЫ ДЕЛА КАНДИДАТА */}
									{appDetail && (
										<DossierDocumentSlots
											documents={appDetail.documents}
											uploadingDoc={uploadingDoc}
											onUploadFiles={uploadFilesDirectly}
											onDeleteDoc={handleDeleteDoc}
										/>
									)}

									{/* БЛОК 5: ВЫПУСК ГОСУДАРСТВЕННОГО СЕРТИФИКАТА В РЕЕСТР */}
									<div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
												<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
												</svg>
											</div>
											<h4 className="text-sm font-black text-purple-950">
												Выпуск государственного сертификата в реестр
											</h4>
										</div>
										<p className="text-xs text-purple-900/80">
											После успешной сдачи экзамена введите номер бланка. Система создаст официальную запись в реестре и сгенерирует QR-код.
										</p>

										<form onSubmit={handleIssueCertificate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
											<div>
												<label className="block text-[11px] font-bold text-purple-900 mb-1">
													Номер сертификата *
												</label>
												<div className="flex items-center px-3 py-2 rounded-xl border border-purple-200 bg-white focus-within:border-purple-600 focus-within:ring-1 focus-within:ring-purple-600">
													<span className="text-xs font-bold font-mono text-purple-950 select-none whitespace-nowrap mr-1.5">
														ЦС №
													</span>
													<input
														type="text"
														required
														placeholder="000760"
														value={certNumber.replace(/^ЦС\s*№?\s*/i, '')}
														onChange={(e) => {
															const val = e.target.value.trim();
															setCertNumber(val ? `ЦС № ${val}` : '');
														}}
														className="w-full text-xs font-bold font-mono text-slate-900 outline-none bg-transparent p-0"
													/>
												</div>
											</div>

											<div>
												<label className="block text-[11px] font-bold text-purple-900 mb-1">
													14-значный ИНН кандидата
												</label>
												<input
													type="text"
													maxLength={14}
													placeholder="14 цифр паспорта"
													value={certInn}
													onChange={(e) => setCertInn(e.target.value)}
													className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-purple-200 bg-white outline-none focus:border-purple-600"
												/>
											</div>

											<div className="flex items-end">
												<button
													type="submit"
													disabled={issuingCert}
													className="w-full py-2.5 px-4 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-all shadow-md shadow-purple-700/20 disabled:opacity-50 cursor-pointer"
												>
													{issuingCert ? 'Внесение в реестр...' : 'Внести в реестр'}
												</button>
											</div>
										</form>
									</div>
								</>
							) : null}
						</div>
					</div>
				</div>
			)}

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

			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ЗАЯВКИ */}
			<ConfirmDeleteDialog
				isOpen={showDeleteConfirm}
				title="Удалить заявку кандидата?"
				description={
					<span>
						Заявка кандидата <b>«{appDetail?.full_name}»</b> (№ {appDetail?.short_registration_number}) будет перемещена в архив ЦНСВ и исключена из активных списков.
					</span>
				}
				isDeleting={isDeletingApp}
				onCancel={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeleteApplication}
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
