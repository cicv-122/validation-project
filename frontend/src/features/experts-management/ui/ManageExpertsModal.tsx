// frontend/src/features/experts-management/ui/ManageExpertsModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../api/client';
import { useAssessmentCenters } from '../../../entities/center/api/centerHooks';

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

interface ManageExpertsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onExpertsUpdated?: () => void;
}

export const ManageExpertsModal: React.FC<ManageExpertsModalProps> = ({
	isOpen,
	onClose,
	onExpertsUpdated,
}) => {
	const [experts, setExperts] = useState<ExpertRecord[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [roleFilter, setRoleFilter] = useState<string>('all');
	const [centerFilter, setCenterFilter] = useState<string>('all');
	const [savingId, setSavingId] = useState<number | null>(null);

	const { data: centers } = useAssessmentCenters();

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

	useEffect(() => {
		if (isOpen) {
			loadExperts();
		}
	}, [isOpen]);

	const handleBindCenter = async (expertId: number, centerId: number | null) => {
		setSavingId(expertId);
		try {
			const { data } = await apiClient.patch<ExpertRecord>(`/certification/staff/experts/${expertId}/`, {
				assessment_center_id: centerId,
			});

			setExperts((prev) =>
				prev.map((e) => (e.id === expertId ? { ...e, ...data } : e))
			);
			onExpertsUpdated?.();
		} catch (err) {
			console.error('Ошибка привязки эксперта к центру оценки:', err);
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

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs'>
			<div className='bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150'>
				{/* Шапка модального окна */}
				<div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50'>
					<div className='flex items-center gap-3'>
						<div className='w-9 h-9 rounded-xl bg-[#283375] text-white flex items-center justify-center font-bold shadow-xs'>
							<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
							</svg>
						</div>
						<div>
							<h3 className='text-base font-bold text-slate-900'>
								База аттестованных экспертов ЦНСВ
							</h3>
							<p className='text-xs text-slate-500'>
								Закрепление экспертов-оценщиков за центрами оценки компетенций
							</p>
						</div>
					</div>
					<button
						type='button'
						onClick={onClose}
						className='w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer'
					>
						✕
					</button>
				</div>

				{/* Панель фильтров */}
				<div className='p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-white'>
					{/* Поиск */}
					<div className='relative flex-1 min-w-[220px]'>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Поиск эксперта по ФИО, организации, городу...'
							className='w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
						/>
						<svg
							className='w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
						</svg>
					</div>

					{/* Фильтр по роли */}
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className='px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#283375]'
					>
						<option value='all'>Все роли экспертов</option>
						<option value='оценщик'>Оценщики</option>
						<option value='работодател'>Оценщики от работодателей</option>
						<option value='консультант'>Консультанты</option>
					</select>

					{/* Фильтр по центру */}
					<select
						value={centerFilter}
						onChange={(e) => setCenterFilter(e.target.value)}
						className='px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-[#283375]'
					>
						<option value='all'>Все площадки / центры</option>
						<option value='unassigned'>Без закрепления</option>
						{centers?.map((c) => (
							<option key={c.id} value={c.id}>
								{c.organization}
							</option>
						))}
					</select>
				</div>

				{/* Таблица экспертов */}
				<div className='flex-1 overflow-y-auto divide-y divide-slate-100'>
					{isLoading ? (
						<div className='text-center py-12 text-xs text-slate-400'>Загрузка базы экспертов...</div>
					) : filteredExperts.length === 0 ? (
						<div className='text-center py-12 text-xs text-slate-400'>Эксперты не найдены</div>
					) : (
						filteredExperts.map((exp) => {
							const isSaving = savingId === exp.id;
							return (
								<div key={exp.id} className='p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4'>
									{/* Данные эксперта */}
									<div className='min-w-0 flex-1'>
										<div className='flex items-center gap-2 flex-wrap'>
											<span className='text-sm font-bold text-slate-900'>{exp.name}</span>
											<span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200'>
												{exp.role_ru}
											</span>
											{exp.profession_ru && (
												<span className='px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200'>
													{exp.profession_ru}
												</span>
											)}
										</div>

										<div className='text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap'>
											<span>{exp.organization || 'Организация не указана'}</span>
											{exp.city_ru && <span>• {exp.city_ru}</span>}
											{exp.phone && <span className='text-slate-400'>• {exp.phone}</span>}
										</div>
									</div>

									{/* Селектор центра оценки */}
									<div className='w-full md:w-80 shrink-0'>
										<label className='block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider'>
											Закреплённая площадка (Центр)
										</label>
										<div className='relative'>
											<select
												value={exp.assessment_center_id || ''}
												disabled={isSaving}
												onChange={(e) => {
													const val = e.target.value;
													handleBindCenter(exp.id, val ? Number(val) : null);
												}}
												className={`w-full px-3 py-1.5 text-xs rounded-xl border bg-white outline-none transition-colors appearance-none pr-8 cursor-pointer ${
													exp.assessment_center_id
														? 'border-emerald-300 font-bold text-emerald-900 bg-emerald-50/30'
														: 'border-slate-200 text-slate-600'
												}`}
											>
												<option value=''>⚪ Не закреплён за площадкой</option>
												{centers?.map((c) => (
													<option key={c.id} value={c.id}>
														{c.organization}
													</option>
												))}
											</select>
											<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400'>
												{isSaving ? (
													<span className='text-[10px] text-blue-600 animate-spin'>⏳</span>
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
						})
					)}
				</div>

				{/* Подвал */}
				<div className='px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500'>
					<span>Всего аттестованных экспертов: {filteredExperts.length}</span>
					<button
						type='button'
						onClick={onClose}
						className='px-4 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 cursor-pointer'
					>
						Закрыть
					</button>
				</div>
			</div>
		</div>
	);
};
