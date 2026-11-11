// frontend/src/features/candidate-filter/ui/CertifiedClustersBar.tsx
import React from 'react';
import type { CertifiedClusterItem } from '../../../api/staff';

interface CertifiedClustersBarProps {
	totalRegistryCount: number;
	withInnCount: number;
	withoutInnCount: number;
	hasInnFilter: '' | 'true' | 'false';
	onHasInnFilterChange: (val: '' | 'true' | 'false') => void;
	searchQuery: string;
	onSearchQueryChange: (val: string) => void;
	onSearchSubmit: (e: React.FormEvent) => void;
	clusters: CertifiedClusterItem[];
	activeCluster: string;
	onClusterChange: (clusterKey: string) => void;
}

export const CertifiedClustersBar: React.FC<CertifiedClustersBarProps> = ({
	totalRegistryCount,
	withInnCount,
	withoutInnCount,
	hasInnFilter,
	onHasInnFilterChange,
	searchQuery,
	onSearchQueryChange,
	onSearchSubmit,
	clusters,
	activeCluster,
	onClusterChange,
}) => {
	return (
		<div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
			<div className="flex flex-col md:flex-row items-center justify-between gap-4">
				{/* Фильтр по наличию ИНН */}
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
						Фильтр по ИНН:
					</span>
					<button
						type="button"
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => onHasInnFilterChange('')}
						className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
							hasInnFilter === ''
								? 'bg-[#283375] text-white shadow-xs border border-transparent'
								: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
						}`}
					>
						<span>Все специалисты</span>
						<span
							className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
								hasInnFilter === ''
									? 'bg-white/20 text-white'
									: 'bg-white text-slate-500 border border-slate-200'
							}`}
						>
							{totalRegistryCount}
						</span>
					</button>

					<button
						type="button"
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => onHasInnFilterChange('true')}
						className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
							hasInnFilter === 'true'
								? 'bg-emerald-600 text-white shadow-xs border border-transparent'
								: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
						}`}
					>
						<span>С ИНН (Сверены)</span>
						<span
							className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
								hasInnFilter === 'true'
									? 'bg-white/20 text-white'
									: 'bg-white text-emerald-700 border border-emerald-200'
							}`}
						>
							{withInnCount}
						</span>
					</button>

					<button
						type="button"
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => onHasInnFilterChange('false')}
						className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
							hasInnFilter === 'false'
								? 'bg-amber-600 text-white shadow-xs border border-transparent'
								: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
						}`}
					>
						<span>Без ИНН (требуют заполнения)</span>
						<span
							className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
								hasInnFilter === 'false'
									? 'bg-white/20 text-white'
									: 'bg-white text-amber-700 border border-amber-200'
							}`}
						>
							{withoutInnCount}
						</span>
					</button>
				</div>

				{/* Поисковая форма */}
				<form onSubmit={onSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => onSearchQueryChange(e.target.value)}
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

			{/* Отраслевые кластеры профессий */}
			{clusters.length > 0 && (
				<div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1">
					<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
						<svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
						Отрасли:
					</span>
					{clusters.map((c) => {
						const isSel = activeCluster === c.key;
						return (
							<button
								key={c.key}
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => onClusterChange(isSel ? '' : c.key)}
								className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 select-none ${
									isSel
										? 'bg-[#283375] text-white shadow-xs border border-transparent'
										: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
								}`}
							>
								<span>{c.title}</span>
								<span
									className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
										isSel ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'
									}`}
								>
									{c.count}
								</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
