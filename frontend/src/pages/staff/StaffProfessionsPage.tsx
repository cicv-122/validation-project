// frontend/src/pages/staff/StaffProfessionsPage.tsx
import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StaffHeader from '../../components/staff/StaffHeader';
import { staffApi, StaffProfile } from '../../api/staff';
import apiClient from '../../api/client';
import localExpertsData from '../../data/experts_database.json';

interface ProfessionItem {
	id: number;
	okz_code: string;
	name_ru: string;
	name_ky: string;
	section?: string;
	is_active: boolean;
	experts_count: number;
	experts?: { id: number; name: string; role_ru: string; organization: string }[];
}

export default function StaffProfessionsPage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [professions, setProfessions] = useState<ProfessionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);

	// Форма добавления/редактирования
	const [formNameRu, setFormNameRu] = useState('');
	const [formNameKy, setFormNameKy] = useState('');
	const [formOkzCode, setFormOkzCode] = useState('');
	const [formSection, setFormSection] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Модальное окно привязки экспертов к профессии
	const [selectedProfForExperts, setSelectedProfForExperts] = useState<ProfessionItem | null>(null);
	const [expertSearch, setExpertSearch] = useState('');
	const [selectedExpertIds, setSelectedExpertIds] = useState<number[]>([]);
	const [isSavingExperts, setIsSavingExperts] = useState(false);

	useEffect(() => {
		loadProfile();
		loadProfessions();
	}, []);

	const loadProfile = async () => {
		try {
			const p = await staffApi.getProfile();
			setProfile(p);
		} catch (err) {
			navigate('/staff/login');
		}
	};

	const loadProfessions = async () => {
		setIsLoading(true);
		try {
			const { data } = await apiClient.get<ProfessionItem[]>('/certification/staff/professions/');
			setProfessions(data || []);
		} catch (err) {
			console.error('Ошибка загрузки профессий:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredProfessions = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return professions;
		return professions.filter(
			(p) =>
				p.name_ru.toLowerCase().includes(q) ||
				(p.name_ky && p.name_ky.toLowerCase().includes(q)) ||
				(p.okz_code && p.okz_code.toLowerCase().includes(q)) ||
				(p.section && p.section.toLowerCase().includes(q))
		);
	}, [professions, searchQuery]);

	const handleSaveNewProfession = async (e: FormEvent) => {
		e.preventDefault();
		if (!formNameRu.trim()) return;
		setIsSubmitting(true);
		try {
			await apiClient.post('/certification/staff/professions/', {
				name_ru: formNameRu.trim(),
				name_ky: formNameKy.trim(),
				okz_code: formOkzCode.trim(),
				section: formSection.trim(),
			});
			setFormNameRu('');
			setFormNameKy('');
			setFormOkzCode('');
			setFormSection('');
			setIsAdding(false);
			await loadProfessions();
		} catch (err) {
			console.error('Ошибка добавления профессии:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStartEdit = (prof: ProfessionItem) => {
		setEditingId(prof.id);
		setFormNameRu(prof.name_ru);
		setFormNameKy(prof.name_ky || '');
		setFormOkzCode(prof.okz_code || '');
		setFormSection(prof.section || '');
	};

	const handleSaveEdit = async (e: FormEvent) => {
		e.preventDefault();
		if (!editingId || !formNameRu.trim()) return;
		setIsSubmitting(true);
		try {
			await apiClient.patch(`/certification/staff/professions/${editingId}/`, {
				name_ru: formNameRu.trim(),
				name_ky: formNameKy.trim(),
				okz_code: formOkzCode.trim(),
				section: formSection.trim(),
			});
			setEditingId(null);
			await loadProfessions();
		} catch (err) {
			console.error('Ошибка обновления профессии:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteProfession = async (id: number, name: string) => {
		if (!window.confirm(`Вы уверены, что хотите удалить профессию «${name}»?`)) return;
		try {
			await apiClient.delete(`/certification/staff/professions/${id}/`);
			await loadProfessions();
		} catch (err) {
			console.error('Ошибка удаления профессии:', err);
		}
	};

	const handleOpenAttachExperts = (prof: ProfessionItem) => {
		setSelectedProfForExperts(prof);
		const initialIds = (prof.experts || []).map((e) => e.id);
		setSelectedExpertIds(initialIds);
		setExpertSearch('');
	};

	const toggleExpertSelection = (expId: number) => {
		setSelectedExpertIds((prev) =>
			prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId]
		);
	};

	const handleSaveAssignedExperts = async () => {
		if (!selectedProfForExperts) return;
		setIsSavingExperts(true);
		try {
			await apiClient.patch(`/certification/staff/professions/${selectedProfForExperts.id}/`, {
				assigned_expert_ids: selectedExpertIds,
			});
			setSelectedProfForExperts(null);
			await loadProfessions();
		} catch (err) {
			console.error('Ошибка закрепления экспертов:', err);
		} finally {
			setIsSavingExperts(false);
		}
	};

	const filteredAllExperts = useMemo(() => {
		const q = expertSearch.toLowerCase().trim();
		return localExpertsData.filter((e) => {
			if (!q) return true;
			return (
				e.name.toLowerCase().includes(q) ||
				(e.organization && e.organization.toLowerCase().includes(q)) ||
				(e.profession_ru && e.profession_ru.toLowerCase().includes(q)) ||
				(e.city_ru && e.city_ru.toLowerCase().includes(q))
			);
		});
	}, [expertSearch]);

	const returnUrl =
		typeof window !== 'undefined'
			? sessionStorage.getItem('staff_dashboard_last_url') || '/staff/dashboard'
			: '/staff/dashboard';

	return (
		<div className='min-h-screen bg-slate-50 flex flex-col font-sans'>
			<StaffHeader profile={profile} onProfileUpdated={setProfile} />

			<main className='flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'>
				{/* Хлебные крошки и заголовок */}
				<div className='mb-6'>
					<Link
						to={returnUrl}
						className='inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#283375] transition-colors mb-3 group'
					>
						<svg className='w-4 h-4 text-slate-400 group-hover:text-[#283375] transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
						</svg>
						<span>Назад в рабочий кабинет</span>
					</Link>

					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
						<div>
							<div className='text-xs font-bold uppercase tracking-wider text-slate-400'>
								Министерство просвещения Кыргызской Республики • ЦНСВ
							</div>
							<h1 className='text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-3'>
								<span>Реестр утверждённых профессий</span>
								<span className='text-sm px-2.5 py-0.5 rounded-full bg-blue-100 text-[#283375] font-bold'>
									{filteredProfessions.length}
								</span>
							</h1>
							<p className='text-xs text-slate-500 mt-1'>
								Официальный справочник сертифицируемых профессий и закрепление аттестованных экспертов ЦНСВ
							</p>
						</div>

						<button
							type='button'
							onClick={() => {
								setIsAdding(!isAdding);
								setEditingId(null);
							}}
							className='px-4 py-2.5 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto'
						>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
							</svg>
							<span>{isAdding ? 'Скрыть форму' : 'Добавить профессию'}</span>
						</button>
					</div>
				</div>

				{/* Форма добавления новой профессии */}
				{isAdding && (
					<form
						onSubmit={handleSaveNewProfession}
						className='mb-6 p-5 bg-white rounded-2xl shadow-sm border border-blue-200 animate-in slide-in-from-top duration-150'
					>
						<div className='font-bold text-sm text-[#283375] mb-3 flex items-center gap-2'>
							<svg className='w-4 h-4 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' />
							</svg>
							<span>Новая сертифицируемая профессия</span>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4'>
							<div>
								<label className='block text-xs font-bold text-slate-700 mb-1.5'>
									Название (на русском языке)
								</label>
								<input
									type='text'
									required
									value={formNameRu}
									onChange={(e) => setFormNameRu(e.target.value)}
									placeholder='Например: Повар, Электрогазосварщик'
									className='w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-slate-700 mb-1.5'>
									Название (кыргызча)
								</label>
								<input
									type='text'
									value={formNameKy}
									onChange={(e) => setFormNameKy(e.target.value)}
									placeholder='Мисалы: Ашпозчу, Электргаз ширетүүчү'
									className='w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-slate-700 mb-1.5'>
									Код по ОКЗ КР
								</label>
								<input
									type='text'
									value={formOkzCode}
									onChange={(e) => setFormOkzCode(e.target.value)}
									placeholder='Например: 5120'
									className='w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
								/>
							</div>
						</div>
						<div className='flex justify-end gap-2.5'>
							<button
								type='button'
								onClick={() => setIsAdding(false)}
								className='px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer'
							>
								Отмена
							</button>
							<button
								type='submit'
								disabled={isSubmitting}
								className='px-5 py-2 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] cursor-pointer shadow-sm'
							>
								{isSubmitting ? 'Сохранение...' : 'Сохранить профессию'}
							</button>
						</div>
					</form>
				)}

				{/* Панель поиска */}
				<div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex items-center justify-between gap-4'>
					<div className='relative flex-1'>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Поиск профессии по названию (RU / KY) или коду ОКЗ...'
							className='w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-[#283375] focus:bg-white focus:ring-1 focus:ring-[#283375]'
						/>
						<svg className='w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
						</svg>
						{searchQuery && (
							<button
								type='button'
								onClick={() => setSearchQuery('')}
								className='absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer'
							>
								✕
							</button>
						)}
					</div>
				</div>

				{/* Таблица профессий */}
				<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
					{isLoading ? (
						<div className='text-center py-20 text-xs text-slate-400'>
							<div className='inline-block w-6 h-6 border-2 border-slate-300 border-t-[#283375] rounded-full animate-spin mb-2' />
							<div>Загрузка реестра утверждённых профессий...</div>
						</div>
					) : filteredProfessions.length === 0 ? (
						<div className='text-center py-20 text-xs text-slate-400'>
							{searchQuery ? `Профессии по запросу «${searchQuery}» не найдены` : 'В справочнике пока нет профессий'}
						</div>
					) : (
						<div className='divide-y divide-slate-100'>
							{filteredProfessions.map((prof) => {
								const isEditing = editingId === prof.id;

								if (isEditing) {
									return (
										<form
											key={prof.id}
											onSubmit={handleSaveEdit}
											className='p-4 bg-amber-50/50 border-y border-amber-200 animate-in fade-in duration-100'
										>
											<div className='font-bold text-xs text-amber-900 mb-2'>
												Редактирование профессии #{prof.id}
											</div>
											<div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3'>
												<input
													type='text'
													required
													value={formNameRu}
													onChange={(e) => setFormNameRu(e.target.value)}
													placeholder='Название (рус)'
													className='px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
												/>
												<input
													type='text'
													value={formNameKy}
													onChange={(e) => setFormNameKy(e.target.value)}
													placeholder='Название (кырг)'
													className='px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
												/>
												<input
													type='text'
													value={formOkzCode}
													onChange={(e) => setFormOkzCode(e.target.value)}
													placeholder='Код ОКЗ'
													className='px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
												/>
											</div>
											<div className='flex justify-end gap-2'>
												<button
													type='button'
													onClick={() => setEditingId(null)}
													className='px-3.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
												>
													Отмена
												</button>
												<button
													type='submit'
													disabled={isSubmitting}
													className='px-4 py-1.5 text-xs rounded-xl bg-[#283375] text-white font-bold cursor-pointer'
												>
													Сохранить
												</button>
											</div>
										</form>
									);
								}

								return (
									<div
										key={prof.id}
										className='p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4'
									>
										<div className='min-w-0 flex-1'>
											<div className='flex items-center gap-2.5 flex-wrap'>
												<span className='text-sm font-bold text-slate-900'>
													{prof.name_ru}
												</span>
												{prof.name_ky && (
													<span className='text-xs text-slate-500 font-medium'>
														• {prof.name_ky}
													</span>
												)}
												{prof.okz_code && (
													<span className='px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200'>
														ОКЗ {prof.okz_code}
													</span>
												)}
											</div>
											{prof.section && (
												<div className='text-[11px] text-slate-400 mt-1 line-clamp-1'>
													{prof.section}
												</div>
											)}
										</div>

										<div className='flex items-center gap-2.5 shrink-0'>
											{/* Кнопка Закрепить экспертов */}
											<button
												type='button'
												onClick={() => handleOpenAttachExperts(prof)}
												className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
													prof.experts_count > 0
														? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
														: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
												}`}
												title='Закрепить экспертов за профессией'
											>
												<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
												</svg>
												<span>Эксперты ({prof.experts_count})</span>
											</button>

											{/* Редактировать */}
											<button
												type='button'
												onClick={() => handleStartEdit(prof)}
												className='p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer'
												title='Редактировать'
											>
												<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
												</svg>
											</button>

											{/* Удалить */}
											<button
												type='button'
												onClick={() => handleDeleteProfession(prof.id, prof.name_ru)}
												className='p-2 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer'
												title='Удалить'
											>
												<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
												</svg>
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>

			{/* Модальное окно закрепления экспертов за профессией */}
			{selectedProfForExperts && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs'>
					<div className='bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150'>
						<div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50'>
							<div>
								<div className='text-xs font-bold text-blue-900'>Закрепление экспертов ЦНСВ</div>
								<h4 className='text-sm font-bold text-slate-900 mt-0.5'>
									Профессия: «{selectedProfForExperts.name_ru}»
								</h4>
							</div>
							<button
								type='button'
								onClick={() => setSelectedProfForExperts(null)}
								className='text-slate-400 hover:text-slate-600 p-1 cursor-pointer'
							>
								✕
							</button>
						</div>

						<div className='p-3 border-b border-slate-100 bg-white'>
							<input
								type='text'
								value={expertSearch}
								onChange={(e) => setExpertSearch(e.target.value)}
								placeholder='Поиск эксперта по ФИО, организации или городу...'
								className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-[#283375]'
							/>
						</div>

						<div className='flex-1 overflow-y-auto p-4 space-y-2'>
							{filteredAllExperts.map((exp) => {
								const isChecked = selectedExpertIds.includes(exp.id);
								return (
									<label
										key={exp.id}
										className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
											isChecked
												? 'bg-blue-50/60 border-blue-200'
												: 'bg-white border-slate-100 hover:bg-slate-50'
										}`}
									>
										<input
											type='checkbox'
											checked={isChecked}
											onChange={() => toggleExpertSelection(exp.id)}
											className='mt-0.5 rounded text-[#283375] focus:ring-[#283375]'
										/>
										<div className='min-w-0 flex-1'>
											<div className='flex items-center gap-2 flex-wrap'>
												<span className='text-xs font-bold text-slate-900'>{exp.name}</span>
												<span className='px-1.5 py-0.5 text-[10px] rounded font-semibold bg-slate-100 text-slate-700'>
													{exp.role_ru}
												</span>
												{exp.city_ru && (
													<span className='text-[10px] text-slate-400'>{exp.city_ru}</span>
												)}
											</div>
											<div className='text-[11px] text-slate-500 mt-0.5'>
												{exp.organization || 'Организация не указана'} • {exp.profession_ru || 'Без специальности'}
											</div>
										</div>
									</label>
								);
							})}
						</div>

						<div className='px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between'>
							<span className='text-xs text-slate-500'>
								Выбрано экспертов: {selectedExpertIds.length}
							</span>
							<div className='flex gap-2'>
								<button
									type='button'
									onClick={() => setSelectedProfForExperts(null)}
									className='px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer'
								>
									Отмена
								</button>
								<button
									type='button'
									disabled={isSavingExperts}
									onClick={handleSaveAssignedExperts}
									className='px-4 py-1.5 rounded-xl bg-[#283375] text-white text-xs font-bold hover:bg-[#1e265c] cursor-pointer'
								>
									{isSavingExperts ? 'Сохранение...' : 'Сохранить закрепление'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
