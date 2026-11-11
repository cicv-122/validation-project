// frontend/src/pages/staff/StaffDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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

export function formatProfessionTitle(prof: string | null | undefined): string {
	if (!prof) return '—';
	const trimmed = prof.trim();
	if (trimmed === trimmed.toUpperCase() && /[А-ЯЁA-Z]/.test(trimmed)) {
		return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
	}
	return trimmed;
}

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

interface OfficialActSlot {
	type: string;
	title: string;
	subtitle: string;
	descriptionPlaceholder: string;
	required: boolean;
}

const OFFICIAL_EXAM_SLOTS: OfficialActSlot[] = [
	{
		type: 'exam_protocol',
		title: 'Протокол квалификационной комиссии',
		subtitle: 'Итоговый официальный протокол заседания с решением о признании квалификации',
		descriptionPlaceholder: 'Протокол заседания отраслевой квалификационной комиссии',
		required: true,
	},
	{
		type: 'evaluation_sheet',
		title: 'Оценочный лист квалификационного экзамена',
		subtitle: 'Ведомость баллов по теории, технике безопасности и практике',
		descriptionPlaceholder: 'Официальный оценочный лист с подписями экспертов комиссии',
		required: true,
	},
	{
		type: 'exam_task',
		title: 'Экзаменационный билет и практические задания',
		subtitle: 'Билеты, тестовые задания и технические задания с ответами',
		descriptionPlaceholder: 'Экзаменационные билеты и бланки выполнения заданий',
		required: false,
	},
	{
		type: 'photo',
		title: 'Фотофиксация квалификационного экзамена',
		subtitle: 'Фотографии с места аттестации: подтверждение выполнения практических заданий',
		descriptionPlaceholder: 'Фото процесса прохождения практического экзамена',
		required: false,
	},
];

const PERSONAL_DOC_SLOTS: OfficialActSlot[] = [
	{
		type: 'passport',
		title: 'Копия паспорта заявителя (ПИН / ID)',
		subtitle: 'Удостоверение личности гражданина с персональным идентификационным номером',
		descriptionPlaceholder: 'Копия паспорта заявителя',
		required: true,
	},
	{
		type: 'application_form',
		title: 'Заявление кандидата на сертификацию',
		subtitle: 'Официальное подписанное заявление установленного образца',
		descriptionPlaceholder: 'Скан заявления кандидата',
		required: true,
	},
	{
		type: 'diploma',
		title: 'Документ об образовании / Диплом',
		subtitle: 'Диплом, свидетельство или аттестат о профессиональном образовании',
		descriptionPlaceholder: 'Копия диплома или свидетельства об образовании',
		required: false,
	},
	{
		type: 'resume',
		title: 'Трудовая книжка / Подтверждение стажа',
		subtitle: 'Трудовая книжка, справка с места работы или подтвержденное резюме',
		descriptionPlaceholder: 'Копия трудовой книжки / резюме',
		required: false,
	},
	{
		type: 'contract',
		title: 'Договор на проведение сертификации',
		subtitle: 'Подписанный двухсторонний договор между кандидатом и ЦНСВ',
		descriptionPlaceholder: 'Копия подписанного договора',
		required: false,
	},
	{
		type: 'payment_receipt',
		title: 'Квитанция об оплате процедуры',
		subtitle: 'Банковский чек, квитанция или платежное поручение',
		descriptionPlaceholder: 'Квитанция об оплате',
		required: false,
	},
];

const APPLICATION_STATUS_TABS = [
	{ id: '', label: 'Все заявки', statKey: 'total' },
	{ id: 'submitted', label: 'Новые', statKey: 'submitted' },
	{ id: 'under_review', label: 'На рассмотрении', statKey: 'under_review' },
	{ id: 'completed', label: 'Выдано', statKey: 'completed' },
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

function getInitials(name: string): string {
	if (!name) return 'ЦН';
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatAppDate(dateStr?: string): string {
	if (!dateStr) return '—';
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		return d.toLocaleDateString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	} catch {
		return dateStr;
	}
}

function formatAppTime(dateStr?: string): string {
	if (!dateStr) return '';
	try {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return '';
		return d.toLocaleTimeString('ru-RU', {
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return '';
	}
}

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
	const [docSubTab, setDocSubTab] = useState<'exam' | 'personal'>('exam');

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
	const [certifiedHasInn, setCertifiedHasInn] = useState<string>(initialHasInn); // '', 'true', 'false'
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
						{/* 1. Блок мониторинга Электронной приёмной (Министерство просвещения Кыргызской Республики) */}
						<div className="bg-gradient-to-r from-[#1b2559] via-[#283375] to-[#1e3a8a] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-blue-900/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
							<div className="space-y-1.5 max-w-xl">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
										Министерство просвещения Кыргызской Республики (МП КР)
									</span>
									<span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[10px] font-bold border border-white/20 flex items-center gap-1">
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
										Электронная приёмная
									</span>
								</div>
								<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
									Мониторинг цифрового потока приёмной ЦНСВ
								</h2>
								<p className="text-xs text-blue-100/80 leading-relaxed">
									Сводный учёт онлайн-обращений граждан Кыргызской Республики на признание и сертификацию квалификаций через цифровую приемную.
								</p>
							</div>

							<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
								<div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial min-w-[90px]">
									<span className="text-[10px] uppercase font-bold text-blue-200 block">
										Всего в приёмной
									</span>
									<span className="text-2xl font-black text-white">
										{profile?.stats.total || 0}
									</span>
								</div>
								<div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial min-w-[90px]">
									<span className="text-[10px] uppercase font-bold text-blue-200 block">
										Валидация
									</span>
									<span className="text-2xl font-black text-white">
										{profile?.stats.validation_count || 0}
									</span>
								</div>
								<div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center flex-1 sm:flex-initial min-w-[90px]">
									<span className="text-[10px] uppercase font-bold text-blue-200 block">
										Сертификация
									</span>
									<span className="text-2xl font-black text-white">
										{profile?.stats.certification_count || 0}
									</span>
								</div>
								<button
									type="button"
									onClick={() => setShowMinistryReportModal(true)}
									className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white text-[#283375] font-extrabold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
								>
									<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<span>Сводка для Министерства</span>
								</button>
							</div>
						</div>

						{/* 2. Карточки быстрой статистики и переключения статусов заявок */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{/* 2.0. Всего заявок */}
							<div
								onClick={() => setActiveAppStatus('')}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									activeAppStatus === ''
										? 'bg-[#283375]/[0.04] border-[#283375] shadow-sm ring-2 ring-[#283375]/10'
										: 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
								}`}
							>
								<span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${activeAppStatus === '' ? 'text-[#283375]' : 'text-slate-500'}`}>
									Всего заявок
								</span>
								<div className="flex items-baseline justify-between">
									<span className={`text-2xl font-black ${activeAppStatus === '' ? 'text-[#283375]' : 'text-slate-900'}`}>
										{profile?.stats.total || 0}
									</span>
									{activeAppStatus === '' && (
										<span className="w-2 h-2 rounded-full bg-[#283375]" />
									)}
								</div>
							</div>

							{/* 2.1. Новые */}
							<div
								onClick={() => setActiveAppStatus('submitted')}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									activeAppStatus === 'submitted'
										? 'bg-[#283375]/[0.04] border-[#283375] shadow-sm ring-2 ring-[#283375]/10'
										: 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
								}`}
							>
								<span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${activeAppStatus === 'submitted' ? 'text-[#283375]' : 'text-slate-500'}`}>
									Новые
								</span>
								<div className="flex items-baseline justify-between">
									<span className={`text-2xl font-black ${activeAppStatus === 'submitted' ? 'text-[#283375]' : 'text-slate-900'}`}>
										{profile?.stats.submitted || 0}
									</span>
									{activeAppStatus === 'submitted' && (
										<span className="w-2 h-2 rounded-full bg-[#283375]" />
									)}
								</div>
							</div>

							{/* 2.2. На рассмотрении */}
							<div
								onClick={() => setActiveAppStatus('under_review')}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									activeAppStatus === 'under_review'
										? 'bg-[#283375]/[0.04] border-[#283375] shadow-sm ring-2 ring-[#283375]/10'
										: 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
								}`}
							>
								<span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${activeAppStatus === 'under_review' ? 'text-[#283375]' : 'text-slate-500'}`}>
									На рассмотрении
								</span>
								<div className="flex items-baseline justify-between">
									<span className={`text-2xl font-black ${activeAppStatus === 'under_review' ? 'text-[#283375]' : 'text-slate-900'}`}>
										{profile?.stats.under_review || 0}
									</span>
									{activeAppStatus === 'under_review' && (
										<span className="w-2 h-2 rounded-full bg-[#283375]" />
									)}
								</div>
							</div>

							{/* 2.3. Выдано */}
							<div
								onClick={() => setActiveAppStatus('completed')}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									activeAppStatus === 'completed'
										? 'bg-[#283375]/[0.04] border-[#283375] shadow-sm ring-2 ring-[#283375]/10'
										: 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
								}`}
							>
								<span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${activeAppStatus === 'completed' ? 'text-[#283375]' : 'text-slate-500'}`}>
									Выдано
								</span>
								<div className="flex items-baseline justify-between">
									<span className={`text-2xl font-black ${activeAppStatus === 'completed' ? 'text-[#283375]' : 'text-slate-900'}`}>
										{profile?.stats.completed || 0}
									</span>
									{activeAppStatus === 'completed' && (
										<span className="w-2 h-2 rounded-full bg-[#283375]" />
									)}
								</div>
							</div>
						</div>

						{/* 3. Фильтры-табы с бейджами и поиск */}
						<div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
							<div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
								{APPLICATION_STATUS_TABS.map((tab) => {
									const count = tab.statKey ? (profile?.stats as any)?.[tab.statKey] : profile?.stats.total;
									const isActive = activeAppStatus === tab.id;
									return (
										<button
											key={tab.id}
											type="button"
											onClick={() => setActiveAppStatus(tab.id)}
											className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
												isActive
													? 'bg-[#283375] text-white shadow-xs'
													: 'text-slate-600 hover:bg-slate-100'
											}`}
										>
											<span>{tab.label}</span>
											<span
												className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
													isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
												}`}
											>
												{count ?? 0}
											</span>
										</button>
									);
								})}
							</div>

							<form onSubmit={handleAppSearch} className="w-full md:w-80 flex items-center gap-2">
								<input
									type="text"
									value={appSearchQuery}
									onChange={(e) => setAppSearchQuery(e.target.value)}
									placeholder="ФИО, ИНН, телефон или номер..."
									className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
								/>
								<button
									type="submit"
									className="px-4 py-2 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] transition-all flex-shrink-0 cursor-pointer"
								>
									Найти
								</button>
							</form>
						</div>

						{/* 4. Таблица кандидатов */}
						<div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
							{loadingApps ? (
								<div className="py-16 text-center text-slate-400 text-sm">
									<div className="w-8 h-8 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-2" />
									Загрузка списка заявок...
								</div>
							) : applications.length === 0 ? (
								<div className="py-16 text-center text-slate-400 text-sm space-y-2">
									<div>В этом разделе пока нет заявок кандидатов.</div>
									{activeAppStatus && (
										<button
											onClick={() => setActiveAppStatus('')}
											className="text-xs font-bold text-blue-600 hover:underline"
										>
											Показать все заявки ({profile?.stats.total || 0})
										</button>
									)}
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left text-xs">
										<thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
											<tr>
												<th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">№ Рег</th>
												<th className="py-3.5 px-4">Кандидат</th>
												<th className="py-3.5 px-4">Профессия</th>
												<th className="py-3.5 px-4 whitespace-nowrap">Тип</th>
												<th className="py-3.5 px-4 whitespace-nowrap">Контакты</th>
												<th className="py-3.5 px-4 whitespace-nowrap">Дата подачи</th>
												<th className="py-3.5 px-4 whitespace-nowrap">Статус</th>
												<th className="py-3.5 px-4 text-right whitespace-nowrap">Действие</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100">
											{applications.map((app) => {
												const badgeStyle = STATUS_BADGES[app.status] || STATUS_BADGES.draft;
												const rawPhone = app.phone || '';
												const rawWhatsapp = app.whatsapp || '';
												const cleanPhone = rawWhatsapp.replace(/[^0-9]/g, '') || rawPhone.replace(/[^0-9]/g, '');

												return (
													<tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
														<td className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">
															<div className="font-mono font-bold text-slate-900 text-xs">
																{app.short_registration_number}
															</div>
															{app.certificate_number_issued && (
																<span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono font-bold text-[10px] whitespace-nowrap">
																	{app.certificate_number_issued}
																</span>
															)}
														</td>
														<td className="py-3.5 px-4">
															<div className="font-bold text-slate-900 text-sm">{app.full_name}</div>
															{app.inn && (
																<span className="text-[11px] text-slate-400 font-mono">
																	ИНН: {app.inn}
																</span>
															)}
														</td>
														<td className="py-3.5 px-4 font-medium text-slate-800">
															<div>{app.profession}</div>
															{app.qualification_level && (
																<span className="text-[10px] text-slate-400">
																	{app.qualification_level}
																</span>
															)}
														</td>
														<td className="py-3.5 px-4">
															<span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
																{app.type_display}
															</span>
														</td>
														<td className="py-3.5 px-4">
															<div className="font-medium text-slate-800">{rawPhone || '—'}</div>
															{cleanPhone && (
																<a
																	href={`https://wa.me/${cleanPhone}`}
																	target="_blank"
																	rel="noreferrer"
																	className="text-[10px] font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1"
																>
																	<span>WhatsApp</span>
																</a>
															)}
														</td>
														<td className="py-3.5 px-4 whitespace-nowrap">
															<div className="font-bold text-slate-900 text-xs">
																{formatAppDate(app.created_at || app.submitted_at)}
															</div>
															<div className="text-[11px] text-slate-400 font-mono">
																{formatAppTime(app.created_at || app.submitted_at)}
															</div>
														</td>
														<td className="py-3.5 px-4">
															<span
																className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
															>
																{app.status_display}
															</span>
														</td>
														<td className="py-3.5 px-4 text-right">
															<button
																onClick={() => openApplication(app.id)}
																className="px-3.5 py-1.5 rounded-xl bg-[#283375] text-white font-bold hover:bg-[#1e265c] transition-all text-xs cursor-pointer"
															>
																Открыть дело
															</button>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}

							{/* Информационный подвал таблицы с счетчиками */}
							{!loadingApps && applications.length > 0 && (
								<div className="p-3.5 px-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
									<div>
										Показано: <b className="text-slate-900">{applications.length}</b> {applications.length === 1 ? 'заявка' : applications.length < 5 ? 'заявки' : 'заявок'}
										{activeAppStatus && (
											<span className="ml-1 text-slate-500 font-semibold">
												(в статусе «{APPLICATION_STATUS_TABS.find((t) => t.id === activeAppStatus)?.label}»)
											</span>
										)}
										{appSearchQuery && (
											<span className="ml-1 text-slate-500 font-semibold">
												по запросу «<span className="text-slate-900 font-bold">{appSearchQuery}</span>»
											</span>
										)}
									</div>
									{(activeAppStatus || appSearchQuery) && (
										<button
											onClick={() => {
												setActiveAppStatus('');
												setAppSearchQuery('');
											}}
											className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
										>
											Сбросить фильтр и показать все ({profile?.stats.total || 0})
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{/* ---------------- РЕЖИМ 2: АРХИВ ВЫДАННЫХ СЕРТИФИКАТОВ (759) ---------------- */}
				{activeMainTab === 'certified_registry' && (
					<div className="space-y-6">
						{/* 1. Блок мониторинга Оцифровки Госреестра (759 специалистов) */}
						<div className="bg-gradient-to-r from-[#1b2559] via-[#283375] to-[#1e3a8a] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-blue-900/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
							<div className="space-y-1.5 max-w-xl">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[10px] font-extrabold uppercase tracking-wider border border-white/10">
										Государственный архив
									</span>
									<span className="text-[11px] text-blue-100/90 font-medium">
										Министерство просвещения Кыргызской Республики
									</span>
								</div>
								<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
									Оцифровка архива сертифицированных специалистов
								</h2>
								<p className="text-xs text-blue-100/80 leading-relaxed">
									Внесение 14-значных персональных идентификационных номеров (ПИН/ИНН), прикрепление протоколов квалификационных комиссий и электронных сканов к {profile?.stats.registry_total || 827} архивным сертификатам.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
								<div className="w-full sm:w-56 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
									<div className="flex items-center justify-between mb-1.5">
										<span className="text-[10px] uppercase font-bold text-blue-100">Прогресс оцифровки</span>
										<span className="text-sm font-black text-emerald-300">{profile?.stats.registry_digitized_percent || 0}%</span>
									</div>
									<div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
											style={{ width: `${Math.min(100, profile?.stats.registry_digitized_percent || 0)}%` }}
										/>
									</div>
									<span className="text-[10px] text-blue-100/80 font-medium mt-1.5 block text-center">
										{profile?.stats.registry_with_inn || 0} из {profile?.stats.registry_total || 827} оцифровано
									</span>
								</div>
							</div>
						</div>

						{/* 2. Карточки быстрой статистики оцифровки */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							<div
								onClick={() => {
									setCertifiedHasInn('');
									loadCertifiedList(1, undefined, '');
								}}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									certifiedHasInn === ''
										? 'bg-[#283375]/[0.05] border-[#283375] shadow-sm ring-2 ring-[#283375]/10'
										: 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
								}`}
							>
								<span className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${certifiedHasInn === '' ? 'text-[#283375]' : 'text-slate-500'}`}>
									Всего в архиве
								</span>
								<div className="flex items-baseline justify-between">
									<span className={`text-2xl font-black ${certifiedHasInn === '' ? 'text-[#283375]' : 'text-slate-900'}`}>
										{profile?.stats.registry_total || certifiedTotal || 827}
									</span>
									{certifiedHasInn === '' && <span className="w-2 h-2 rounded-full bg-[#283375]" />}
								</div>
								<span className="text-[10px] text-slate-400 font-medium block mt-1">Историческая база</span>
							</div>

							<div
								onClick={() => {
									setCertifiedHasInn('true');
									loadCertifiedList(1, undefined, 'true');
								}}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									certifiedHasInn === 'true'
										? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/15'
										: 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
								}`}
							>
								<span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-emerald-700">
									Оцифровано (с ПИН)
								</span>
								<div className="flex items-baseline justify-between">
									<span className="text-2xl font-black text-emerald-600">
										{profile?.stats.registry_with_inn || 0}
									</span>
									{certifiedHasInn === 'true' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
								</div>
								<span className="text-[10px] text-emerald-700/80 font-medium block mt-1">Доступна онлайн-верификация</span>
							</div>

							<div
								onClick={() => {
									setCertifiedHasInn('false');
									loadCertifiedList(1, undefined, 'false');
								}}
								className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
									certifiedHasInn === 'false'
										? 'bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-500/15'
										: 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
								}`}
							>
								<span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-amber-700">
									Ожидают внесения ПИН
								</span>
								<div className="flex items-baseline justify-between">
									<span className="text-2xl font-black text-amber-600">
										{profile?.stats.registry_without_inn || (profile?.stats.registry_total ? profile.stats.registry_total - (profile.stats.registry_with_inn || 0) : 827)}
									</span>
									{certifiedHasInn === 'false' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
								</div>
								<span className="text-[10px] text-amber-700/80 font-medium block mt-1">Требуется ввод 14 цифр</span>
							</div>

							<div className="p-4 rounded-2xl border-2 bg-white border-slate-200 shadow-xs">
								<span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
									Доля оцифровки
								</span>
								<div className="flex items-baseline justify-between">
									<span className="text-2xl font-black text-[#283375]">
										{profile?.stats.registry_digitized_percent || 0}%
									</span>
									<span className="text-xs font-bold text-slate-400">KPI</span>
								</div>
								<span className="text-[10px] text-slate-400 font-medium block mt-1">Цель: 100% архива</span>
							</div>
						</div>
						{/* Поиск и фильтры по архиву */}
						<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
							<div className="flex flex-col md:flex-row items-center justify-between gap-4">
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
										Фильтр по ИНН:
									</span>
									<button
										onClick={() => {
											setCertifiedHasInn('');
											loadCertifiedList(1, undefined, '');
										}}
										className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
											certifiedHasInn === ''
												? 'bg-[#283375] text-white shadow-xs'
												: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
										}`}
									>
										<span>Все специалисты</span>
										<span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
											certifiedHasInn === '' ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
										}`}>
											{profile?.stats?.registry_total || 827}
										</span>
									</button>
									<button
										onClick={() => {
											setCertifiedHasInn('true');
											loadCertifiedList(1, undefined, 'true');
										}}
										className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
											certifiedHasInn === 'true'
												? 'bg-emerald-600 text-white shadow-xs'
												: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
										}`}
									>
										<span>С ИНН (Сверены)</span>
										<span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
											certifiedHasInn === 'true' ? 'bg-white/20 text-white' : 'bg-white text-emerald-700 border border-emerald-200'
										}`}>
											{profile?.stats?.registry_with_inn || 0}
										</span>
									</button>
									<button
										onClick={() => {
											setCertifiedHasInn('false');
											loadCertifiedList(1, undefined, 'false');
										}}
										className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
											certifiedHasInn === 'false'
												? 'bg-amber-600 text-white shadow-xs'
												: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
										}`}
									>
										<span>Без ИНН (требуют заполнения)</span>
										<span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
											certifiedHasInn === 'false' ? 'bg-white/20 text-white' : 'bg-white text-amber-700 border border-amber-200'
										}`}>
											{profile?.stats?.registry_without_inn ?? ((profile?.stats?.registry_total || 827) - (profile?.stats?.registry_with_inn || 0))}
										</span>
									</button>
								</div>

								<form onSubmit={handleCertifiedSearch} className="w-full md:w-96 flex items-center gap-2">
									<input
										type="text"
										value={certifiedSearch}
										onChange={(e) => setCertifiedSearch(e.target.value)}
										placeholder="Поиск (сварщик, повар, ФИО, ЦС №, ИНН)..."
										className="w-full px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
									<button
										type="submit"
										className="px-4 py-2.5 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] transition-all flex-shrink-0 cursor-pointer"
									>
										Найти
									</button>
								</form>
							</div>

							{/* Отраслевые кластеры профессий (умная фильтрация) */}
							{certifiedClustersList.length > 0 && (
								<div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1">
									<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
										<svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
										</svg>
										Отрасли:
									</span>
									{certifiedClustersList.map((c) => {
										const isSel = certifiedCluster === c.key;
										return (
											<button
												key={c.key}
												type="button"
												onClick={() => {
													const nextKey = isSel ? '' : c.key;
													setCertifiedCluster(nextKey);
													// Если был включен фильтр "Только с ИНН" (где всего 6 записей во всем архиве),
													// при клике на отрасль сбрасываем has_inn в '', чтобы пользователь сразу увидел
													// специалистов выбранной отрасли (например, 135 металлообработчиков)
													let nextInn = certifiedHasInn;
													if (nextKey && certifiedHasInn === 'true') {
														nextInn = '';
														setCertifiedHasInn('');
													}
													loadCertifiedList(1, nextKey, nextInn);
												}}
												className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
													isSel
														? 'bg-[#283375] text-white shadow-xs'
														: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
												}`}
											>
												<span>{c.title}</span>
												<span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
													isSel ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
												}`}>
													{c.count}
												</span>
											</button>
										);
									})}
								</div>
							)}
						</div>

						{/* Таблица 759 специалистов с полным редактированием */}
						<div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
							{loadingCertified ? (
								<div className="py-20 text-center text-slate-400 text-sm">
									<div className="w-8 h-8 border-3 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-2" />
									Загрузка базы специалистов...
								</div>
							) : certifiedList.length === 0 ? (
								<div className="py-16 px-4 text-center max-w-lg mx-auto space-y-3">
									<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
										<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
									</div>
									<div className="text-base font-bold text-slate-800">
										По вашему запросу специалисты не найдены
									</div>
									{certifiedCluster && (
										<div className="text-xs text-slate-500 leading-relaxed">
											{certifiedHasInn === 'true' && (
												<span>
													В отрасли <b>«{certifiedClustersList.find((c) => c.key === certifiedCluster)?.title || certifiedCluster}»</b> пока нет оцифрованных специалистов с подтверждённым ИНН (все специалисты этой отрасли находятся во вкладке «Без ИНН»).
												</span>
											)}
											{certifiedHasInn === 'false' && (
												<span>
													В отрасли <b>«{certifiedClustersList.find((c) => c.key === certifiedCluster)?.title || certifiedCluster}»</b> нет специалистов без ИНН.
												</span>
											)}
											{!certifiedHasInn && certifiedSearch && (
												<span>
													По поисковому запросу «<b>{certifiedSearch}</b>» в выбранной отрасли совпадений не обнаружено.
												</span>
											)}
										</div>
									)}
									<div className="flex flex-wrap items-center justify-center gap-2 pt-2">
										{certifiedHasInn && (
											<button
												type="button"
												onClick={() => {
													setCertifiedHasInn('');
													loadCertifiedList(1, undefined, '');
												}}
												className="px-3.5 py-2 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] transition-all cursor-pointer shadow-xs"
											>
												Показать всех специалистов {certifiedCluster ? `в этой отрасли (${certifiedClustersList.find((c) => c.key === certifiedCluster)?.count || ''})` : ''}
											</button>
										)}
										{certifiedCluster && (
											<button
												type="button"
												onClick={() => {
													setCertifiedCluster('');
													loadCertifiedList(1, '');
												}}
												className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
											>
												Сбросить отрасль
											</button>
										)}
										{certifiedSearch && (
											<button
												type="button"
												onClick={() => {
													setCertifiedSearch('');
													loadCertifiedList(1, undefined, undefined, '');
												}}
												className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
											>
												Очистить поиск
											</button>
										)}
									</div>
								</div>
							) : (
								<>
									<div className="overflow-x-auto">
										<table className="w-full text-left text-xs">
											<thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
												<tr>
													<th className="py-3.5 px-4 w-12 text-center">Фото</th>
													<th className="py-3.5 px-4 whitespace-nowrap">Номер сертификата</th>
													<th className="py-3.5 px-4">ФИО специалиста</th>
													<th className="py-3.5 px-4 whitespace-nowrap">ИНН / ПИН</th>
													<th className="py-3.5 px-4">Присвоенная профессия</th>
													<th className="py-3.5 px-4 whitespace-nowrap">Дата выдачи</th>
													<th className="py-3.5 px-4 text-right whitespace-nowrap">Действие</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{certifiedList.map((item) => (
													<tr
														key={item.id}
														id={`candidate-row-${item.id}`}
														className="hover:bg-slate-50/80 transition-all duration-300"
													>
														<td className="py-3.5 px-4 text-center">
															{item.image_url || item.image ? (
																<img
																	src={item.image_url || item.image || ''}
																	alt={item.full_name}
																	className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs mx-auto"
																/>
															) : (
																<div className="w-10 h-10 rounded-xl bg-[#283375]/8 border border-[#283375]/15 flex items-center justify-center text-[#283375] font-extrabold text-xs mx-auto shadow-2xs">
																	{getInitials(item.full_name)}
																</div>
															)}
														</td>
														<td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
															{item.registration_number}
														</td>
														<td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
															<Link
																to={`/staff/candidates/${item.id}`}
																state={candidateDossierState(item.id)}
																className="hover:text-[#283375] hover:underline transition-colors"
																title="Открыть электронное дело специалиста"
															>
																{item.full_name}
															</Link>
														</td>
														<td className="py-3.5 px-4 whitespace-nowrap font-mono">
															<Link
																to={`/staff/candidates/${item.id}`}
																state={candidateDossierState(item.id)}
																title={item.inn ? 'ИНН подтвержден (нажмите, чтобы открыть дело)' : 'ИНН не указан (нажмите, чтобы внести в деле)'}
																className="inline-block transition-transform hover:scale-105"
															>
																{item.inn ? (
																	<span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
																		<span className="text-emerald-600 font-black">✓</span>
																		<span>{item.inn}</span>
																	</span>
																) : (
																	<span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
																		<span className="text-amber-500 font-black">⚠</span>
																		<span>Не указан</span>
																	</span>
																)}
															</Link>
														</td>
														<td className="py-3.5 px-4 font-medium text-slate-700">
															{formatProfessionTitle(item.profession)}
														</td>
														<td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
															{item.issued_date || '—'}
														</td>
														<td className="py-3.5 px-4 text-right">
															<div className="flex items-center justify-end gap-2">
																<Link
																	to={`/staff/candidates/${item.id}`}
																	state={candidateDossierState(item.id)}
																	className="px-3.5 py-1.5 rounded-xl bg-[#283375] text-white font-bold hover:bg-[#1e265c] transition-all text-xs inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer"
																>
																	<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
																	</svg>
																	<span>Редактировать дело</span>
																</Link>
																<button
																	type="button"
																	onClick={() => setDeletingSpecialist(item)}
																	className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
																	title="Удалить специалиста из реестра"
																>
																	<svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																	</svg>
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Пагинация */}
									<div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
										<span className="text-slate-500">
											Показано {certifiedList.length} из {certifiedTotal} специалистов
										</span>
										<div className="flex items-center gap-2">
											<button
												disabled={certifiedPage <= 1}
												onClick={() => loadCertifiedList(certifiedPage - 1)}
												className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40"
											>
												← Назад
											</button>
											<span className="font-bold text-slate-700 px-2">
												Страница {certifiedPage}
											</span>
											<button
												disabled={certifiedList.length < 20}
												onClick={() => loadCertifiedList(certifiedPage + 1)}
												className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40"
											>
												Вперед →
											</button>
										</div>
									</div>
								</>
							)}
						</div>
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

									{/* БЛОК 4: ОФИЦИАЛЬНЫЕ ДОКУМЕНТЫ ДЕЛА КАНДИДАТА (КОМПАКТНЫЙ РЕЖИМ) */}
									{(() => {
										const examDocs = appDetail.documents.filter(d => ['exam_protocol', 'evaluation_sheet', 'exam_task', 'photo', 'assessment_photo', 'certificate_scan'].includes(d.doc_type));
										const personalDocs = appDetail.documents.filter(d => ['passport', 'id_card', 'application_form', 'diploma', 'resume', 'contract', 'payment_receipt', 'portfolio', 'other'].includes(d.doc_type));

										return (
											<div className="border-t border-slate-200 pt-6 space-y-4">
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
													<div>
														<h3 className="text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2">
															<svg className="w-4 h-4 text-[#283375]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
															</svg>
															<span>Документы дела кандидата</span>
														</h3>
														<p className="text-[11px] text-slate-500">
															Всего прикреплено файлов: <b>{appDetail.documents.length}</b>
														</p>
													</div>

													{/* Переключатель разделов: Экзамен vs Личные документы */}
													<div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
														<button
															type="button"
															onClick={() => setDocSubTab('exam')}
															className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
																docSubTab === 'exam'
																	? 'bg-white text-[#283375] shadow-xs'
																	: 'text-slate-600 hover:text-slate-900'
															}`}
														>
															<span>Экзамен и оценка</span>
															<span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#283375]">
																{examDocs.length}
															</span>
														</button>
														<button
															type="button"
															onClick={() => setDocSubTab('personal')}
															className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
																docSubTab === 'personal'
																	? 'bg-white text-[#283375] shadow-xs'
																	: 'text-slate-600 hover:text-slate-900'
															}`}
														>
															<span>Личные документы</span>
															<span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
																{personalDocs.length}
															</span>
														</button>
													</div>
												</div>

												{/* Индикатор загрузки */}
												{uploadingDoc && (
													<div className="p-3.5 rounded-2xl bg-[#283375] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse">
														<div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
														<span>Идёт загрузка и оптимизация файла... Пожалуйста, подождите</span>
													</div>
												)}

												{/* РАЗДЕЛ 1: ЭКЗАМЕН И КВАЛИФИКАЦИОННАЯ ОЦЕНКА */}
												{docSubTab === 'exam' && (
													<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
														{OFFICIAL_EXAM_SLOTS.map((slot) => {
															const attachedDocs = appDetail.documents.filter(
																(d) => d.doc_type === slot.type || (slot.type === 'photo' && d.doc_type === 'assessment_photo')
															);
															const hasDoc = attachedDocs.length > 0;

															return (
																<div key={slot.type} className="p-4 hover:bg-slate-50/70 transition-colors">
																	<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
																		<div className="min-w-0 flex-1">
																			<div className="flex items-center gap-2">
																				<span className="text-xs font-bold text-slate-900">{slot.title}</span>
																				{hasDoc ? (
																					<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
																						✓ Прикреплен {attachedDocs.length > 1 ? `(${attachedDocs.length})` : ''}
																					</span>
																				) : (
																					<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
																						{slot.required ? 'Обязательный акт' : 'По регламенту'}
																					</span>
																				)}
																			</div>
																			<p className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</p>

																			{/* Прикрепленные документы */}
																			{hasDoc && (
																				<div className="mt-2.5 flex flex-wrap gap-2">
																					{attachedDocs.map((doc) => (
																						<div
																							key={doc.id}
																							className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-slate-800 shadow-2xs"
																						>
																							<a
																								href={doc.file_url || doc.file}
																								target="_blank"
																								rel="noreferrer"
																								className="font-bold text-[#283375] hover:underline truncate max-w-[220px]"
																							>
																								{doc.description || doc.doc_type_display || 'Открыть скан'} ↗
																							</a>
																							<button
																								type="button"
																								onClick={() => handleDeleteDoc(doc.id)}
																								className="text-red-500 hover:text-red-700 p-0.5 ml-1 cursor-pointer font-bold"
																								title="Удалить файл"
																							>
																								✕
																							</button>
																						</div>
																					))}
																				</div>
																			)}
																		</div>

																		{/* Кнопка загрузки */}
																		<label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex-shrink-0 self-start sm:self-center ${
																			hasDoc
																				? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
																				: 'bg-[#283375] hover:bg-[#1e265c] text-white'
																		}`}>
																			<input
																				type="file"
																				multiple
																				accept={slot.type === 'photo' ? 'image/*' : '.pdf,.doc,.docx,image/*'}
																				className="hidden"
																				disabled={uploadingDoc}
																				onChange={(e) => {
																					if (e.target.files && e.target.files.length > 0) {
																						uploadFilesDirectly(slot.type, e.target.files, slot.descriptionPlaceholder);
																						e.target.value = '';
																					}
																				}}
																			/>
																			<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
																			</svg>
																			<span>{hasDoc ? 'Добавить ещё' : 'Загрузить скан'}</span>
																		</label>
																	</div>
																</div>
															);
														})}
													</div>
												)}

												{/* РАЗДЕЛ 2: ЛИЧНЫЕ ДОКУМЕНТЫ КАНДИДАТА */}
												{docSubTab === 'personal' && (
													<div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
														{PERSONAL_DOC_SLOTS.map((slot) => {
															const attachedDocs = appDetail.documents.filter(
																(d) => d.doc_type === slot.type || (slot.type === 'passport' && d.doc_type === 'id_card')
															);
															const hasDoc = attachedDocs.length > 0;

															return (
																<div key={slot.type} className="p-4 hover:bg-slate-50/70 transition-colors">
																	<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
																		<div className="min-w-0 flex-1">
																			<div className="flex items-center gap-2">
																				<span className="text-xs font-bold text-slate-900">{slot.title}</span>
																				{hasDoc ? (
																					<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
																						✓ Прикреплен {attachedDocs.length > 1 ? `(${attachedDocs.length})` : ''}
																					</span>
																				) : (
																					<span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
																						{slot.required ? 'Обязательный' : 'Дополнительный'}
																					</span>
																				)}
																			</div>
																			<p className="text-[11px] text-slate-500 mt-0.5">{slot.subtitle}</p>

																			{/* Прикрепленные документы */}
																			{hasDoc && (
																				<div className="mt-2.5 flex flex-wrap gap-2">
																					{attachedDocs.map((doc) => (
																						<div
																							key={doc.id}
																							className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-slate-800 shadow-2xs"
																						>
																							<a
																								href={doc.file_url || doc.file}
																								target="_blank"
																								rel="noreferrer"
																								className="font-bold text-[#283375] hover:underline truncate max-w-[220px]"
																							>
																								{doc.description || doc.doc_type_display || 'Открыть скан'} ↗
																							</a>
																							<button
																								type="button"
																								onClick={() => handleDeleteDoc(doc.id)}
																								className="text-red-500 hover:text-red-700 p-0.5 ml-1 cursor-pointer font-bold"
																								title="Удалить файл"
																							>
																								✕
																							</button>
																						</div>
																					))}
																				</div>
																			)}
																		</div>

																		{/* Кнопка загрузки */}
																		<label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex-shrink-0 self-start sm:self-center ${
																			hasDoc
																				? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
																				: 'bg-[#283375] hover:bg-[#1e265c] text-white'
																		}`}>
																			<input
																				type="file"
																				multiple
																				accept={slot.type === 'photo' ? 'image/*' : '.pdf,.doc,.docx,image/*'}
																				className="hidden"
																				disabled={uploadingDoc}
																				onChange={(e) => {
																					if (e.target.files && e.target.files.length > 0) {
																						uploadFilesDirectly(slot.type, e.target.files, slot.descriptionPlaceholder);
																						e.target.value = '';
																					}
																				}}
																			/>
																			<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
																			</svg>
																			<span>{hasDoc ? 'Добавить ещё' : 'Загрузить скан'}</span>
																		</label>
																	</div>
																</div>
															);
														})}
													</div>
												)}
											</div>
										);
									})()}

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
			{showTelegramModal && (
				<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 text-center">
						<div className="w-16 h-16 rounded-full bg-[#283375]/10 text-[#283375] flex items-center justify-center mx-auto">
							<svg className="w-9 h-9 fill-[#283375]" viewBox="0 0 24 24">
								<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z"/>
							</svg>
						</div>

						<div>
							<h3 className="text-xl font-black text-slate-900">
								Подключение Telegram-бота
							</h3>
							<p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
								Получайте персональные уведомления о новых заявках кандидатов по вашим профессиям прямо в Telegram с кнопками быстрых действий.
							</p>
						</div>

						<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
							<div className="flex items-start gap-2">
								<span className="font-black text-[#283375]">1.</span>
								<span>Нажмите кнопку <b>«Открыть в Telegram»</b> ниже.</span>
							</div>
							<div className="flex items-start gap-2">
								<span className="font-black text-[#283375]">2.</span>
								<span>В открывшемся боте нажмите <b>Запустить (Start)</b>.</span>
							</div>
							<div className="flex items-start gap-2">
								<span className="font-black text-[#283375]">3.</span>
								<span>Бот автоматически привяжет ваш профиль: <b>{profile?.full_name}</b>.</span>
							</div>
						</div>

						<div className="space-y-2 pt-2">
							<a
								href={profile?.telegram_bot_url}
								target="_blank"
								rel="noreferrer"
								className="w-full py-3.5 px-4 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#283375]/20"
							>
								<svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
									<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z"/>
								</svg>
								<span>Открыть в Telegram</span>
							</a>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={async () => {
										await loadProfile();
										if (profile?.is_telegram_connected) {
											setShowTelegramModal(false);
										}
									}}
									className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
								>
									<svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									<span>Проверить статус</span>
								</button>
								<button
									type="button"
									onClick={() => setShowTelegramModal(false)}
									className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
								>
									Закрыть
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ ЗАЯВКИ */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
						<div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<div className="text-center space-y-1.5">
							<h3 className="text-lg font-black text-slate-900">
								Удалить заявку кандидата?
							</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								Заявка кандидата <b>«{appDetail?.full_name}»</b> (№ {appDetail?.short_registration_number}) будет перемещена в архив ЦНСВ и исключена из активных списков.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2.5 pt-2">
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeletingApp}
								className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={handleDeleteApplication}
								disabled={isDeletingApp}
								className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
							>
								{isDeletingApp ? 'Удаление...' : 'Да, удалить'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ СПЕЦИАЛИСТА ИЗ РЕЕСТРА */}
			{deletingSpecialist && (
				<div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
						<div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
							<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<div className="text-center space-y-1.5">
							<h3 className="text-lg font-black text-slate-900">
								Удалить специалиста из реестра?
							</h3>
							<p className="text-xs text-slate-500 leading-relaxed">
								Вы уверены, что хотите удалить <b>«{deletingSpecialist.full_name}»</b> ({deletingSpecialist.registration_number}) из государственного реестра? Это действие нельзя отменить.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2.5 pt-2">
							<button
								type="button"
								onClick={() => setDeletingSpecialist(null)}
								disabled={isDeletingSpecialist}
								className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
							>
								Отмена
							</button>
							<button
								type="button"
								onClick={handleDeleteSpecialist}
								disabled={isDeletingSpecialist}
								className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
							>
								{isDeletingSpecialist ? 'Удаление...' : 'Да, удалить'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* МОДАЛЬНОЕ ОКНО: ОФИЦИАЛЬНАЯ СВОДКА ДЛЯ МИНИСТЕРСТВА ПРОСВЕЩЕНИЯ КР */}
			{showMinistryReportModal && (
				<div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
					<div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:max-w-none print:max-h-none print:border-none print:rounded-none">
						{/* Шапка отчета */}
						<div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4 print:bg-transparent print:border-b-2 print:border-slate-800">
							<div className="space-y-1">
								<div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
									Кыргыз Республикасынын Агартуу министрлиги
								</div>
								<div className="text-xs font-black text-slate-700 uppercase tracking-wider">
									Министерство просвещения Кыргызской Республики (МП КР)
								</div>
								<h2 className="text-lg sm:text-xl font-black text-[#283375] print:text-black">
									Сводная ведомость Электронной приёмной ЦНСВ
								</h2>
								<div className="text-[11px] text-slate-500">
									По состоянию на: <b>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</b> • Ответственный: <b>{profile?.full_name}</b> ({profile?.role_display})
								</div>
							</div>
							<div className="flex items-center gap-2 print:hidden">
								<button
									type="button"
									onClick={() => window.print()}
									className="px-3.5 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
								>
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
									</svg>
									<span>Печать (PDF)</span>
								</button>
								<button
									type="button"
									onClick={() => setShowMinistryReportModal(false)}
									className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-xs cursor-pointer"
								>
									✕
								</button>
							</div>
						</div>

						{/* Содержимое отчета */}
						<div className="p-6 overflow-y-auto space-y-6 flex-1 print:overflow-visible print:p-2">
							{/* Ключевые показатели цифровой приемной */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
								<div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
									<span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">Всего поступило</span>
									<span className="text-2xl font-black text-[#283375]">{profile?.stats.total || 0}</span>
								</div>
								<div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-center">
									<span className="text-[10px] font-extrabold uppercase text-amber-700 block mb-0.5">Валидация</span>
									<span className="text-2xl font-black text-amber-800">{profile?.stats.validation_count || 0}</span>
								</div>
								<div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50 text-center">
									<span className="text-[10px] font-extrabold uppercase text-cyan-700 block mb-0.5">Сертификация</span>
									<span className="text-2xl font-black text-cyan-800">{profile?.stats.certification_count || 0}</span>
								</div>
								<div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
									<span className="text-[10px] font-extrabold uppercase text-emerald-700 block mb-0.5">Завершено / Выдано</span>
									<span className="text-2xl font-black text-emerald-800">{profile?.stats.completed || 0}</span>
								</div>
							</div>

							{/* Оцифровка Государственного реестра (759 специалистов) */}
							<div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e293b] text-white">
								<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
									<div>
										<span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
											Государственный реестр выданных сертификатов
										</span>
										<h4 className="text-sm font-black text-white">
											Ход цифровизации исторического архива ({profile?.stats.registry_total || 827} специалистов)
										</h4>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs text-slate-300">Прогресс:</span>
										<span className="text-base font-black text-emerald-400">{profile?.stats.registry_digitized_percent || 0}%</span>
									</div>
								</div>
								<div className="grid grid-cols-3 gap-3 text-center">
									<div className="p-2.5 rounded-xl bg-white/10">
										<span className="text-[10px] uppercase font-bold text-slate-300 block">Всего в архиве</span>
										<span className="text-xl font-black text-white">{profile?.stats.registry_total || 827}</span>
									</div>
									<div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
										<span className="text-[10px] uppercase font-bold text-emerald-300 block">Оцифровано (с ПИН)</span>
										<span className="text-xl font-black text-emerald-300">{profile?.stats.registry_with_inn || 0}</span>
									</div>
									<div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
										<span className="text-[10px] uppercase font-bold text-amber-300 block">Ожидают ПИН</span>
										<span className="text-xl font-black text-amber-300">{profile?.stats.registry_without_inn || 0}</span>
									</div>
								</div>
							</div>

							{/* Сводка по этапам рассмотрения */}
							<div className="border border-slate-200 rounded-2xl overflow-hidden">
								<div className="p-3 bg-slate-100 border-b border-slate-200 font-extrabold text-xs text-slate-700 uppercase tracking-wider">
									Статусы обработки заявлений граждан в Электронной приёмной
								</div>
								<table className="w-full text-left text-xs">
									<thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
										<tr>
											<th className="py-2.5 px-4">Этап процедуры</th>
											<th className="py-2.5 px-4 text-center">Количество</th>
											<th className="py-2.5 px-4">Регламентное действие</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 font-medium">
										<tr>
											<td className="py-2.5 px-4 font-bold text-blue-700">Входящие (Новые заявки)</td>
											<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.submitted || 0}</td>
											<td className="py-2.5 px-4 text-slate-500">Первичная модерация и проверка полноты пакета документов</td>
										</tr>
										<tr>
											<td className="py-2.5 px-4 font-bold text-amber-700">На рассмотрении экспертов</td>
											<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.under_review || 0}</td>
											<td className="py-2.5 px-4 text-slate-500">Оценка соответствия профстандарту, портфолио и стажа</td>
										</tr>
										<tr>
											<td className="py-2.5 px-4 font-bold text-cyan-700">Квалификационная оценка назначена</td>
											<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.scheduled || 0}</td>
											<td className="py-2.5 px-4 text-slate-500">Формирование комиссии, выезд на полигон/мастерскую</td>
										</tr>
										<tr>
											<td className="py-2.5 px-4 font-bold text-purple-700">Одобрено комиссией</td>
											<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.approved || 0}</td>
											<td className="py-2.5 px-4 text-slate-500">Успешная сдача экзамена, подготовка к внесению в госреестр</td>
										</tr>
										<tr>
											<td className="py-2.5 px-4 font-bold text-emerald-700">Сертификаты внесены в реестр (Выдано)</td>
											<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.completed || 0}</td>
											<td className="py-2.5 px-4 text-slate-500">Присвоен уникальный номер бланка ЦС, активен QR-код верификации</td>
										</tr>
										<tr>
											<td className="py-2.5 px-4 font-bold text-red-700">Отклонено</td>
											<td className="py-2.5 px-4 text-center font-black text-base">{profile?.stats.rejected || 0}</td>
											<td className="py-2.5 px-4 text-slate-500">Несоответствие критериям или отказ заявителя</td>
										</tr>
									</tbody>
								</table>
							</div>

							{/* Реестр заявлений граждан */}
							<div className="border border-slate-200 rounded-2xl overflow-hidden">
								<div className="p-3 bg-slate-100 border-b border-slate-200 font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
									<span>Поименный реестр онлайн-заявлений граждан</span>
									<span className="text-[11px] font-bold text-slate-500">Всего: {applications.length}</span>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-left text-[11px]">
										<thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
											<tr>
												<th className="py-2 px-3">№ Рег</th>
												<th className="py-2 px-3">ФИО заявителя</th>
												<th className="py-2 px-3">ИНН</th>
												<th className="py-2 px-3">Профессия</th>
												<th className="py-2 px-3">Процедура</th>
												<th className="py-2 px-3">Статус</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100">
											{applications.map((app) => (
												<tr key={app.id}>
													<td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
														{app.short_registration_number}
														{app.certificate_number_issued && (
															<div className="text-[9px] text-emerald-700 font-bold">{app.certificate_number_issued}</div>
														)}
													</td>
													<td className="py-2 px-3 font-bold text-slate-900">{app.full_name}</td>
													<td className="py-2 px-3 font-mono text-slate-500">{app.inn || '—'}</td>
													<td className="py-2 px-3 text-slate-800">{app.profession}</td>
													<td className="py-2 px-3 whitespace-nowrap">{app.type_display}</td>
													<td className="py-2 px-3 whitespace-nowrap">
														<span className="font-bold text-slate-700">{app.status_display}</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Подписи для отчета */}
							<div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700 print:grid-cols-2">
								<div>
									<div className="font-bold">Директор ЦНСВ:</div>
									<div className="mt-8 border-b border-slate-400 w-48" />
									<div className="text-[10px] text-slate-400 mt-1">подпись / печать</div>
								</div>
								<div className="text-right">
									<div className="font-bold">Ответственный исполнитель:</div>
									<div className="mt-8 border-b border-slate-400 w-48 ml-auto" />
									<div className="text-[10px] text-slate-400 mt-1">{profile?.full_name}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
