// frontend/src/pages/staff/StaffExpertsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/staff/StaffHeader';
import { staffApi, StaffProfile } from '../../api/staff';
import apiClient from '../../api/client';
import { useAssessmentCenters } from '../../entities/center/api/centerHooks';
import professionsDictionary from '../../utils/professions_dictionary.json';
import { useKeyPress, useScrollLock } from '../../shared/lib';

export interface ExpertRecord {
	id: number;
	name: string;
	role_ru: string;
	role_kg?: string;
	profession_ru: string;
	profession_kg?: string;
	organization: string;
	phone?: string;
	city_ru?: string;
	code?: string;
	assessment_center_id?: number | null;
	assessment_center_name?: string;
	is_custom_added?: boolean;
}

export default function StaffExpertsPage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [experts, setExperts] = useState<ExpertRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [centerFilter, setCenterFilter] = useState<string>('all');
	const [orgFilter, setOrgFilter] = useState<string>('all');
	const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
	const [savingId, setSavingId] = useState<number | null>(null);

	// Модальное окно добавления нового эксперта
	const [showAddModal, setShowAddModal] = useState(false);
	const [newName, setNewName] = useState('');
	const [newRole, setNewRole] = useState('Оценщик');
	const [newProfession, setNewProfession] = useState('');
	const [newOrg, setNewOrg] = useState('');
	const [newCity, setNewCity] = useState('г. Бишкек');
	const [newPhone, setNewPhone] = useState('');
	const [newCenterId, setNewCenterId] = useState<string>('');
	const [isSubmittingNew, setIsSubmittingNew] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);
	const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

	// Модальное окно переименования организации
	const [renameOrgModalOpen, setRenameOrgModalOpen] = useState(false);
	const [targetOrgOldName, setTargetOrgOldName] = useState('');
	const [targetOrgNewName, setTargetOrgNewName] = useState('');
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameError, setRenameError] = useState<string | null>(null);

	// Модальное окно редактирования эксперта
	const [editExpertModalOpen, setEditExpertModalOpen] = useState(false);
	const [editingExpertId, setEditingExpertId] = useState<number | null>(null);
	const [editName, setEditName] = useState('');
	const [editRole, setEditRole] = useState('Оценщик');
	const [editProfession, setEditProfession] = useState('');
	const [editOrg, setEditOrg] = useState('');
	const [editCity, setEditCity] = useState('');
	const [editPhone, setEditPhone] = useState('');
	const [editCenterId, setEditCenterId] = useState<string>('');
	const [isSavingEdit, setIsSavingEdit] = useState(false);
	const [editError, setEditError] = useState<string | null>(null);

	const { data: centers } = useAssessmentCenters();

	// Блокировка фонового скролла при открытых модальных окнах
	const isAnyModalOpen = showAddModal || renameOrgModalOpen || editExpertModalOpen;
	useScrollLock(isAnyModalOpen);

	// Слушатель клавиши Escape (Esc) для закрытия любого активного окна
	useKeyPress(
		'Escape',
		() => {
			if (showAddModal) setShowAddModal(false);
			if (renameOrgModalOpen) setRenameOrgModalOpen(false);
			if (editExpertModalOpen) setEditExpertModalOpen(false);
		},
		isAnyModalOpen
	);

	useEffect(() => {
		loadProfile();
		loadExperts();
	}, []);

	const loadProfile = async () => {
		try {
			const p = await staffApi.getProfile();
			setProfile(p);
		} catch {
			navigate('/staff/login');
		}
	};

	const loadExperts = async () => {
		setIsLoading(true);
		try {
			const { data } = await apiClient.get<ExpertRecord[]>('/certification/staff/experts/');
			setExperts(data || []);
		} catch (err) {
			console.error('Ошибка загрузки базы экспертов:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBindCenter = async (expertId: number, centerId: number | null) => {
		setSavingId(expertId);
		try {
			const { data } = await apiClient.patch<ExpertRecord>(`/certification/staff/experts/${expertId}/`, {
				assessment_center_id: centerId,
			});

			setExperts((prev) =>
				prev.map((e) => (e.id === expertId ? { ...e, ...data } : e))
			);
		} catch (err) {
			console.error('Ошибка закрепления эксперта за центром:', err);
		} finally {
			setSavingId(null);
		}
	};

	// Список уникальных организаций для фильтра и автокомплита
	const uniqueOrganizations = useMemo(() => {
		const set = new Set<string>();
		experts.forEach((e) => {
			if (e.organization && e.organization.trim()) {
				set.add(e.organization.trim());
			}
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
	}, [experts]);

	// Фильтрация экспертов
	const filteredExperts = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return experts.filter((e) => {
			if (q) {
				const fullStr = `${e.name} ${e.organization} ${e.profession_ru} ${e.city_ru || ''}`.toLowerCase();
				if (!fullStr.includes(q)) return false;
			}

			if (roleFilter !== 'all') {
				if (!e.role_ru.toLowerCase().includes(roleFilter.toLowerCase())) return false;
			}

			if (centerFilter !== 'all') {
				if (centerFilter === 'unassigned') {
					if (e.assessment_center_id) return false;
				} else {
					if (String(e.assessment_center_id) !== centerFilter) return false;
				}
			}

			if (orgFilter !== 'all') {
				if (e.organization !== orgFilter) return false;
			}

			return true;
		});
	}, [experts, searchQuery, roleFilter, centerFilter, orgFilter]);

	// Группировка по организациям
	const groupedExperts = useMemo(() => {
		const groups: Record<string, ExpertRecord[]> = {};
		filteredExperts.forEach((e) => {
			const orgKey = e.organization?.trim() || 'Организация не указана';
			if (!groups[orgKey]) groups[orgKey] = [];
			groups[orgKey].push(e);
		});
		return groups;
	}, [filteredExperts]);

	// Создание нового эксперта
	const handleCreateExpert = async (e: React.FormEvent) => {
		e.preventDefault();
		setAddError(null);

		const cleanName = newName.trim();
		if (!cleanName) {
			setAddError('Укажите ФИО эксперта');
			return;
		}

		setIsSubmittingNew(true);
		try {
			const { data } = await apiClient.post<ExpertRecord>('/certification/staff/experts/', {
				name: cleanName,
				role_ru: newRole.trim() || 'Оценщик',
				profession_ru: newProfession.trim(),
				organization: newOrg.trim(),
				city_ru: newCity.trim() || 'г. Бишкек',
				phone: newPhone.trim(),
				assessment_center_id: newCenterId ? Number(newCenterId) : null,
			});

			setExperts((prev) => [data, ...prev]);
			setNoticeMsg(`Эксперт «${data.name}» успешно добавлен в базу!`);
			setShowAddModal(false);

			setNewName('');
			setNewRole('Оценщик');
			setNewProfession('');
			setNewOrg('');
			setNewPhone('');
			setNewCenterId('');
		} catch (err: any) {
			setAddError(err?.response?.data?.detail || 'Не удалось сохранить эксперта');
		} finally {
			setIsSubmittingNew(false);
		}
	};

	// Открытие модалки переименования организации
	const openRenameOrgModal = (orgName: string) => {
		setTargetOrgOldName(orgName);
		setTargetOrgNewName(orgName === 'Организация не указана' ? '' : orgName);
		setRenameError(null);
		setRenameOrgModalOpen(true);
	};

	// Сохранение переименования организации
	const handleSaveRenameOrg = async (e: React.FormEvent) => {
		e.preventDefault();
		const cleanNew = targetOrgNewName.trim();
		if (!cleanNew) {
			setRenameError('Укажите новое название организации');
			return;
		}

		setIsRenaming(true);
		setRenameError(null);
		try {
			await apiClient.post('/certification/staff/experts/rename-organization/', {
				old_name: targetOrgOldName,
				new_name: cleanNew,
			});

			// Обновляем состояние экспертов
			setExperts((prev) =>
				prev.map((exp) =>
					exp.organization?.trim() === targetOrgOldName ? { ...exp, organization: cleanNew } : exp
				)
			);

			if (orgFilter === targetOrgOldName) {
				setOrgFilter(cleanNew);
			}

			setNoticeMsg(`Организация успешно переименована в «${cleanNew}»!`);
			setRenameOrgModalOpen(false);
		} catch (err: any) {
			setRenameError(err?.response?.data?.detail || 'Ошибка при переименовании');
		} finally {
			setIsRenaming(false);
		}
	};

	// Открытие модалки редактирования эксперта
	const openEditExpertModal = (exp: ExpertRecord) => {
		setEditingExpertId(exp.id);
		setEditName(exp.name || '');
		setEditRole(exp.role_ru || 'Оценщик');
		setEditProfession(exp.profession_ru || '');
		setEditOrg(exp.organization || '');
		setEditCity(exp.city_ru || 'г. Бишкек');
		setEditPhone(exp.phone || '');
		setEditCenterId(exp.assessment_center_id ? String(exp.assessment_center_id) : '');
		setEditError(null);
		setEditExpertModalOpen(true);
	};

	// Сохранение изменений эксперта
	const handleSaveEditExpert = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingExpertId) return;

		const cleanName = editName.trim();
		if (!cleanName) {
			setEditError('Укажите ФИО эксперта');
			return;
		}

		setIsSavingEdit(true);
		setEditError(null);
		try {
			const { data } = await apiClient.patch<ExpertRecord>(`/certification/staff/experts/${editingExpertId}/`, {
				name: cleanName,
				role_ru: editRole.trim() || 'Оценщик',
				profession_ru: editProfession.trim(),
				organization: editOrg.trim(),
				city_ru: editCity.trim() || 'г. Бишкек',
				phone: editPhone.trim(),
				assessment_center_id: editCenterId ? Number(editCenterId) : null,
			});

			setExperts((prev) =>
				prev.map((exp) => (exp.id === editingExpertId ? { ...exp, ...data } : exp))
			);

			setNoticeMsg(`Данные эксперта «${data.name}» успешно обновлены!`);
			setEditExpertModalOpen(false);
		} catch (err: any) {
			setEditError(err?.response?.data?.detail || 'Ошибка при сохранении данных эксперта');
		} finally {
			setIsSavingEdit(false);
		}
	};

	const renderExpertRow = (exp: ExpertRecord) => {
		const isSaving = savingId === exp.id;
		return (
			<div
				key={exp.id}
				className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
			>
				{/* Информация об эксперте */}
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2.5 flex-wrap">
						<span className="text-sm font-bold text-slate-900">{exp.name}</span>
						<span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
							{exp.role_ru}
						</span>
						{exp.profession_ru && (
							<span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
								{exp.profession_ru}
							</span>
						)}
						{exp.is_custom_added && (
							<span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
								Новый
							</span>
						)}
					</div>

					<div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
						<span className="font-medium text-slate-700">
							{exp.organization || 'Организация не указана'}
						</span>
						{exp.city_ru && <span>• {exp.city_ru}</span>}
						{exp.phone && <span className="text-slate-400">• Тел: {exp.phone}</span>}
					</div>
				</div>

				{/* Действия и селектор привязки к площадке */}
				<div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
					<div className="w-full sm:w-72 lg:w-80">
						<label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
							Центр оценки
						</label>
						<div className="relative">
							<select
								value={exp.assessment_center_id || ''}
								disabled={isSaving}
								onChange={(e) => {
									const val = e.target.value;
									handleBindCenter(exp.id, val ? Number(val) : null);
								}}
								className={`w-full pl-3 pr-10 py-2 text-xs rounded-xl border bg-white outline-none transition-all appearance-none cursor-pointer ${
									exp.assessment_center_id
										? 'border-emerald-300 font-bold text-emerald-900 bg-emerald-50/40 focus:border-emerald-500'
										: 'border-slate-200 text-slate-600 focus:border-[#283375]'
								}`}
							>
								<option value="">⚪ Не закреплён</option>
								{centers?.map((c) => (
									<option key={c.id} value={c.id}>
										{c.organization}
									</option>
								))}
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
								{isSaving ? (
									<span className="text-xs text-blue-600 animate-spin">⏳</span>
								) : (
									<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								)}
							</div>
						</div>
					</div>

					{/* Кнопка редактирования эксперта */}
					<div className="pt-4">
						<button
							type="button"
							onClick={() => openEditExpertModal(exp)}
							className="p-2 rounded-xl border border-slate-200 hover:border-[#283375] hover:bg-slate-50 text-slate-500 hover:text-[#283375] transition-colors cursor-pointer"
							title="Редактировать данные эксперта"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col font-sans">
			<StaffHeader profile={profile} onProfileUpdated={setProfile} />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
				{/* Заголовок страницы */}
				<div className="mb-6">
					<h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
						<span>База аттестованных экспертов</span>
						<span className="text-sm px-2.5 py-0.5 rounded-full bg-indigo-100 text-[#283375] font-bold">
							{filteredExperts.length}
						</span>
					</h1>
					<p className="text-xs text-slate-500 mt-1">
						Официальный реестр экспертов-оценщиков и закрепление специалистов за площадками оценки (БКАМС, FabLab и др.)
					</p>
				</div>

				{noticeMsg && (
					<div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
						<span>✓ {noticeMsg}</span>
						<button
							onClick={() => setNoticeMsg(null)}
							className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
						>
							✕
						</button>
					</div>
				)}

				{/* Панель фильтров и переключатель */}
				<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 space-y-3">
					<div className="flex flex-wrap items-center gap-3">
						{/* Поиск */}
						<div className="relative flex-1 min-w-[240px]">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Поиск эксперта по ФИО, организации, профессии или городу..."
								className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#283375] focus:bg-white focus:ring-1 focus:ring-[#283375]"
							/>
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery('')}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
								>
									✕
								</button>
							)}
						</div>

						{/* Фильтр: Организация */}
						<div className="w-full sm:w-64 relative">
							<select
								value={orgFilter}
								onChange={(e) => setOrgFilter(e.target.value)}
								className="w-full pl-3 pr-10 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#283375] focus:bg-white transition-all appearance-none cursor-pointer"
							>
								<option value="all">Все организации</option>
								{uniqueOrganizations.map((org) => (
									<option key={org} value={org}>
										{org}
									</option>
								))}
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>

						{/* Фильтр по роли */}
						<div className="w-full sm:w-44 relative">
							<select
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
								className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#283375] focus:bg-white transition-all appearance-none cursor-pointer"
							>
								<option value="all">Все роли экспертов</option>
								<option value="оценщик">Оценщики</option>
								<option value="председатель">Председатели</option>
								<option value="консультант">Консультанты</option>
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>

						{/* Фильтр по закреплённой площадке */}
						<div className="w-full sm:w-56 relative">
							<select
								value={centerFilter}
								onChange={(e) => setCenterFilter(e.target.value)}
								className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#283375] focus:bg-white transition-all appearance-none cursor-pointer"
							>
								<option value="all">Все площадки / центры</option>
								<option value="unassigned">Без закрепления</option>
								{centers?.map((c) => (
									<option key={c.id} value={c.id}>
										{c.organization}
									</option>
								))}
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</div>
						</div>
					</div>

					{/* Переключатель вида: Списком / По организациям */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-100 text-xs gap-2">
						<span className="text-slate-500 font-medium">
							Показано экспертов: <strong className="text-slate-900">{filteredExperts.length}</strong>
						</span>

						<div className="flex items-center gap-2 flex-wrap">
							<button
								type="button"
								onClick={() => {
									setNewOrg('');
									setShowAddModal(true);
								}}
								className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
							>
								<svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
								</svg>
								<span>Новая организация</span>
							</button>

							<div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
								<button
									type="button"
									onClick={() => setViewMode('grouped')}
									className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
										viewMode === 'grouped'
											? 'bg-white text-[#283375] shadow-2xs'
											: 'text-slate-600 hover:text-slate-900'
									}`}
								>
									По организациям
								</button>
								<button
									type="button"
									onClick={() => setViewMode('list')}
									className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
										viewMode === 'list'
											? 'bg-white text-[#283375] shadow-2xs'
											: 'text-slate-600 hover:text-slate-900'
									}`}
								>
									Сплошной список
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Таблица / Карточки экспертов */}
				<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
					{isLoading ? (
						<div className="text-center py-20 text-xs text-slate-400">
							<div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-[#283375] rounded-full animate-spin mb-2" />
							<div>Загрузка официальной базы экспертов ЦНСВ...</div>
						</div>
					) : filteredExperts.length === 0 ? (
						<div className="text-center py-20 text-xs text-slate-400">
							{searchQuery ? `Эксперты по запросу «${searchQuery}» не найдены` : 'Эксперты не найдены'}
						</div>
					) : viewMode === 'list' ? (
						<div className="divide-y divide-slate-100">
							{filteredExperts.map((exp) => renderExpertRow(exp))}
						</div>
					) : (
						/* Отображение сгруппированным по организациям */
						<div className="divide-y divide-slate-200">
							{Object.entries(groupedExperts).map(([orgName, groupList]) => (
								<div key={orgName} className="p-4 sm:p-6 bg-white">
									<div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-wrap gap-2">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="w-2.5 h-2.5 rounded-full bg-[#283375]" />
											<h2 className="text-sm font-extrabold text-slate-900">{orgName}</h2>
											{/* Кнопка переименования организации */}
											<button
												type="button"
												onClick={() => openRenameOrgModal(orgName)}
												className="p-1 rounded-lg text-slate-400 hover:text-[#283375] hover:bg-slate-100 transition-colors cursor-pointer"
												title={`Переименовать организацию «${orgName}»`}
											>
												<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
												</svg>
											</button>
										</div>
										<div className="flex items-center gap-2.5">
											<span className="text-xs font-bold text-[#283375] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
												{groupList.length} экспертов
											</span>
											<button
												type="button"
												onClick={() => {
													setNewOrg(orgName === 'Организация не указана' ? '' : orgName);
													setShowAddModal(true);
												}}
												className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
												title={`Добавить нового эксперта в ${orgName}`}
											>
												<svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
												</svg>
												<span>Добавить эксперта</span>
											</button>
										</div>
									</div>
									<div className="divide-y divide-slate-100">
										{groupList.map((exp) => renderExpertRow(exp))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>

			{/* МОДАЛЬНОЕ ОКНО: ПЕРЕИМЕНОВАНИЕ ОРГАНИЗАЦИИ */}
			{renameOrgModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
					onClick={() => setRenameOrgModalOpen(false)}
				>
					<div
						className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-sm font-extrabold text-slate-900">
								Переименование организации
							</h3>
							<button
								type="button"
								onClick={() => setRenameOrgModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								✕
							</button>
						</div>

						{renameError && (
							<div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
								{renameError}
							</div>
						)}

						<form onSubmit={handleSaveRenameOrg} className="mt-4 space-y-3.5">
							<div>
								<label className="block text-[11px] font-bold text-slate-500 mb-1">
									Текущее название
								</label>
								<div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
									{targetOrgOldName}
								</div>
							</div>

							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									Новое название организации *
								</label>
								<input
									type="text"
									required
									value={targetOrgNewName}
									onChange={(e) => setTargetOrgNewName(e.target.value)}
									placeholder="Введите новое название..."
									className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
								/>
								<p className="text-[11px] text-slate-400 mt-1">
									Название автоматически обновится у всех экспертов этой организации.
								</p>
							</div>

							<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setRenameOrgModalOpen(false)}
									disabled={isRenaming}
									className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
								>
									Отмена
								</button>
								<button
									type="submit"
									disabled={isRenaming}
									className="px-4 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
								>
									<span>{isRenaming ? 'Сохранение...' : 'Сохранить название'}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* МОДАЛЬНОЕ ОКНО: РЕДАКТИРОВАНИЕ ДАННЫХ ЭКСПЕРТА */}
			{editExpertModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
					onClick={() => setEditExpertModalOpen(false)}
				>
					<div
						className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<div>
								<h3 className="text-base font-extrabold text-slate-900">
									Редактирование эксперта
								</h3>
								<p className="text-xs text-slate-500 mt-0.5">
									Изменение личных данных, организации и квалификации
								</p>
							</div>
							<button
								type="button"
								onClick={() => setEditExpertModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								✕
							</button>
						</div>

						{editError && (
							<div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
								{editError}
							</div>
						)}

						<form onSubmit={handleSaveEditExpert} className="mt-4 space-y-3.5">
							{/* ФИО */}
							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									ФИО эксперта *
								</label>
								<input
									type="text"
									required
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{/* Роль */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Роль эксперта
									</label>
									<div className="relative">
										<select
											value={editRole}
											onChange={(e) => setEditRole(e.target.value)}
											className="w-full pl-3 pr-10 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none bg-white cursor-pointer appearance-none transition-colors"
										>
											<option value="Оценщик">Оценщик</option>
											<option value="Председатель">Председатель комиссии</option>
											<option value="Эксперт-консультант">Эксперт-консультант</option>
										</select>
										<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</div>
								</div>

								{/* Профессия */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Профессия
									</label>
									<input
										type="text"
										list="edit-expert-prof-list"
										value={editProfession}
										onChange={(e) => setEditProfession(e.target.value)}
										className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
									<datalist id="edit-expert-prof-list">
										{Object.keys(professionsDictionary).map((p) => (
											<option key={p} value={p} />
										))}
									</datalist>
								</div>
							</div>

							{/* Организация */}
							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									Организация
								</label>
								<input
									type="text"
									list="edit-expert-org-list"
									value={editOrg}
									onChange={(e) => setEditOrg(e.target.value)}
									placeholder="Выберите из существующих или введите новую..."
									className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
								/>
								<datalist id="edit-expert-org-list">
									{uniqueOrganizations.map((o) => (
										<option key={o} value={o} />
									))}
								</datalist>
								<p className="text-[10px] text-slate-400 mt-1">
									Изменение организации переместит эксперта в соответствующую группу.
								</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{/* Город */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Город / Регион
									</label>
									<input
										type="text"
										value={editCity}
										onChange={(e) => setEditCity(e.target.value)}
										className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
								</div>

								{/* Телефон */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Номер телефона
									</label>
									<input
										type="text"
										value={editPhone}
										onChange={(e) => setEditPhone(e.target.value)}
										className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
								</div>
							</div>

							{/* Привязка к площадке */}
							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									Закреплённый Центр оценки
								</label>
								<div className="relative">
									<select
										value={editCenterId}
										onChange={(e) => setEditCenterId(e.target.value)}
										className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none bg-white cursor-pointer appearance-none transition-colors"
									>
										<option value="">⚪ Не закреплён за площадкой</option>
										{centers?.map((c) => (
											<option key={c.id} value={c.id}>
												{c.organization}
											</option>
										))}
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
										<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</div>
							</div>

							<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setEditExpertModalOpen(false)}
									disabled={isSavingEdit}
									className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
								>
									Отмена
								</button>
								<button
									type="submit"
									disabled={isSavingEdit}
									className="px-5 py-2.5 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
								>
									<span>{isSavingEdit ? 'Сохранение...' : 'Сохранить изменения'}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* МОДАЛЬНОЕ ОКНО: ДОБАВЛЕНИЕ НОВОГО ЭКСПЕРТА */}
			{showAddModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
					onClick={() => setShowAddModal(false)}
				>
					<div
						className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<div>
								<h3 className="text-base font-extrabold text-slate-900">
									Новый эксперт-оценщик
								</h3>
								<p className="text-xs text-slate-500 mt-0.5">
									{newOrg ? `Добавление в «${newOrg}»` : 'Добавление специалиста в реестр экспертов ЦНСВ'}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setShowAddModal(false)}
								className="text-slate-400 hover:text-slate-600 cursor-pointer"
							>
								✕
							</button>
						</div>

						{addError && (
							<div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
								{addError}
							</div>
						)}

						<form onSubmit={handleCreateExpert} className="mt-4 space-y-3.5">
							{/* ФИО */}
							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									ФИО эксперта *
								</label>
								<input
									type="text"
									required
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="Фамилия Имя Отчество"
									className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{/* Роль */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Роль эксперта
									</label>
									<div className="relative">
										<select
											value={newRole}
											onChange={(e) => setNewRole(e.target.value)}
											className="w-full pl-3 pr-10 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none bg-white cursor-pointer appearance-none transition-colors"
										>
											<option value="Оценщик">Оценщик</option>
											<option value="Председатель">Председатель комиссии</option>
											<option value="Эксперт-консультант">Эксперт-консультант</option>
										</select>
										<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</div>
									</div>
								</div>

								{/* Профессия */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Профессия
									</label>
									<input
										type="text"
										list="expert-prof-list"
										value={newProfession}
										onChange={(e) => setNewProfession(e.target.value)}
										placeholder="Повар, Сварщик..."
										className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
									<datalist id="expert-prof-list">
										{Object.keys(professionsDictionary).map((p) => (
											<option key={p} value={p} />
										))}
									</datalist>
								</div>
							</div>

							{/* Организация */}
							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									Организация
								</label>
								<input
									type="text"
									list="expert-org-list"
									value={newOrg}
									onChange={(e) => setNewOrg(e.target.value)}
									placeholder="Ассоциация поваров Кыргызстана, ПЛ №43..."
									className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
								/>
								<datalist id="expert-org-list">
									{uniqueOrganizations.map((o) => (
										<option key={o} value={o} />
									))}
								</datalist>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{/* Город */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Город / Регион
									</label>
									<input
										type="text"
										value={newCity}
										onChange={(e) => setNewCity(e.target.value)}
										placeholder="г. Бишкек"
										className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
								</div>

								{/* Телефон */}
								<div>
									<label className="block text-[11px] font-bold text-slate-700 mb-1">
										Номер телефона
									</label>
									<input
										type="text"
										value={newPhone}
										onChange={(e) => setNewPhone(e.target.value)}
										placeholder="+996 ..."
										className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none"
									/>
								</div>
							</div>

							{/* Привязка к площадке */}
							<div>
								<label className="block text-[11px] font-bold text-slate-700 mb-1">
									Закреплённый Центр оценки (опционально)
								</label>
								<div className="relative">
									<select
										value={newCenterId}
										onChange={(e) => setNewCenterId(e.target.value)}
										className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none bg-white cursor-pointer appearance-none transition-colors"
									>
										<option value="">⚪ Не закреплён за площадкой</option>
										{centers?.map((c) => (
											<option key={c.id} value={c.id}>
												{c.organization}
											</option>
										))}
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
										<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</div>
								</div>
							</div>

							<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									disabled={isSubmittingNew}
									className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
								>
									Отмена
								</button>
								<button
									type="submit"
									disabled={isSubmittingNew}
									className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
								>
									<span>{isSubmittingNew ? 'Сохранение...' : 'Добавить эксперта'}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
