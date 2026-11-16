// frontend/src/pages/staff/StaffExpertsPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/staff/StaffHeader';
import { staffApi, StaffProfile } from '../../api/staff';
import apiClient from '../../api/client';
import { useAssessmentCenters } from '../../entities/center/api/centerHooks';

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
}

export default function StaffExpertsPage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [experts, setExperts] = useState<ExpertRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [centerFilter, setCenterFilter] = useState<string>('all');
	const [savingId, setSavingId] = useState<number | null>(null);

	const { data: centers } = useAssessmentCenters();

	useEffect(() => {
		loadProfile();
		loadExperts();
	}, []);

	const loadProfile = async () => {
		try {
			const p = await staffApi.getProfile();
			setProfile(p);
		} catch (err) {
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

			return true;
		});
	}, [experts, searchQuery, roleFilter, centerFilter]);

	return (
		<div className='min-h-screen bg-slate-50 flex flex-col font-sans'>
			<StaffHeader profile={profile} onProfileUpdated={setProfile} />

			<main className='flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'>
				{/* Заголовок страницы */}
				<div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div>
						<h1 className='text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3'>
							<span>База аттестованных экспертов</span>
							<span className='text-sm px-2.5 py-0.5 rounded-full bg-indigo-100 text-[#283375] font-bold'>
								{filteredExperts.length}
							</span>
						</h1>
						<p className='text-xs text-slate-500 mt-1'>
							Официальный реестр экспертов-оценщиков и закрепление специалистов за площадками оценки (БКАМС, FabLab и др.)
						</p>
					</div>
				</div>

				{/* Панель фильтров */}
				<div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4'>
					{/* Поиск */}
					<div className='relative flex-1 min-w-[260px]'>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Поиск эксперта по ФИО, организации, профессии или городу...'
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

					{/* Фильтр по роли с увеличенным отступом стрелки */}
					<div className='relative min-w-[190px]'>
						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className='w-full pl-3.5 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375] appearance-none cursor-pointer'
						>
							<option value='all'>Все роли экспертов</option>
							<option value='оценщик'>Оценщики</option>
							<option value='работодател'>Оценщики от работодателей</option>
							<option value='консультант'>Консультанты</option>
						</select>
						<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>
					</div>

					{/* Фильтр по центру с увеличенным отступом стрелки */}
					<div className='relative min-w-[220px]'>
						<select
							value={centerFilter}
							onChange={(e) => setCenterFilter(e.target.value)}
							className='w-full pl-3.5 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375] appearance-none cursor-pointer'
						>
							<option value='all'>Все площадки / центры</option>
							<option value='unassigned'>Без закрепления</option>
							{centers?.map((c) => (
								<option key={c.id} value={c.id}>
									{c.organization}
								</option>
							))}
						</select>
						<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>
					</div>
				</div>

				{/* Таблица / Карточки экспертов */}
				<div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
					{isLoading ? (
						<div className='text-center py-20 text-xs text-slate-400'>
							<div className='inline-block w-6 h-6 border-2 border-slate-300 border-t-[#283375] rounded-full animate-spin mb-2' />
							<div>Загрузка официальной базы экспертов ЦНСВ...</div>
						</div>
					) : filteredExperts.length === 0 ? (
						<div className='text-center py-20 text-xs text-slate-400'>
							{searchQuery ? `Эксперты по запросу «${searchQuery}» не найдены` : 'Эксперты не найдены'}
						</div>
					) : (
						<div className='divide-y divide-slate-100'>
							{filteredExperts.map((exp) => {
								const isSaving = savingId === exp.id;
								return (
									<div
										key={exp.id}
										className='p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4'
									>
										{/* Информация об эксперте */}
										<div className='min-w-0 flex-1'>
											<div className='flex items-center gap-2.5 flex-wrap'>
												<span className='text-sm font-bold text-slate-900'>
													{exp.name}
												</span>
												<span className='px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200'>
													{exp.role_ru}
												</span>
												{exp.profession_ru && (
													<span className='px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200'>
														{exp.profession_ru}
													</span>
												)}
											</div>

											<div className='text-xs text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap'>
												<span className='font-medium text-slate-700'>
													{exp.organization || 'Организация не указана'}
												</span>
												{exp.city_ru && <span>• {exp.city_ru}</span>}
												{exp.phone && <span className='text-slate-400'>• Тел: {exp.phone}</span>}
											</div>
										</div>

										{/* Селектор привязки к площадке */}
										<div className='w-full sm:w-80 lg:w-96 shrink-0'>
											<label className='block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider'>
												Закреплённая площадка (Центр оценки)
											</label>
											<div className='relative'>
												<select
													value={exp.assessment_center_id || ''}
													disabled={isSaving}
													onChange={(e) => {
														const val = e.target.value;
														handleBindCenter(exp.id, val ? Number(val) : null);
													}}
													className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border bg-white outline-none transition-all appearance-none cursor-pointer ${
														exp.assessment_center_id
															? 'border-emerald-300 font-bold text-emerald-900 bg-emerald-50/40 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
															: 'border-slate-200 text-slate-600 focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
													}`}
												>
													<option value=''>⚪ Не закреплён за площадкой</option>
													{centers?.map((c) => (
														<option key={c.id} value={c.id}>
															{c.organization}
														</option>
													))}
												</select>
												<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400'>
													{isSaving ? (
														<span className='text-xs text-blue-600 animate-spin'>⏳</span>
													) : (
														<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
															<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
														</svg>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
