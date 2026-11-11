// frontend/src/features/candidate-filter/ui/ApplicationsStatusCards.tsx
import React from 'react';
import type { StaffProfile } from '../../../api/staff';

interface ApplicationsStatusCardsProps {
	profile: StaffProfile | null;
	activeStatus: string;
	onStatusChange: (status: string) => void;
}

export const ApplicationsStatusCards: React.FC<ApplicationsStatusCardsProps> = ({
	profile,
	activeStatus,
	onStatusChange,
}) => {
	const cards = [
		{ id: '', label: 'Всего заявок', count: profile?.stats.total || 0 },
		{ id: 'submitted', label: 'Новые', count: profile?.stats.submitted || 0 },
		{ id: 'under_review', label: 'На рассмотрении', count: profile?.stats.under_review || 0 },
		{ id: 'completed', label: 'Выдано', count: profile?.stats.completed || 0 },
	];

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{cards.map((card) => {
				const isActive = activeStatus === card.id;
				return (
					<div
						key={card.id || 'all'}
						onClick={() => onStatusChange(card.id)}
						className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
							isActive
								? 'bg-[#283375]/[0.04] border-[#283375] shadow-sm ring-2 ring-[#283375]/10'
								: 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
						}`}
					>
						<span
							className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
								isActive ? 'text-[#283375]' : 'text-slate-500'
							}`}
						>
							{card.label}
						</span>
						<div className="flex items-baseline justify-between">
							<span
								className={`text-2xl font-black ${
									isActive ? 'text-[#283375]' : 'text-slate-900'
								}`}
							>
								{card.count}
							</span>
							{isActive && <span className="w-2 h-2 rounded-full bg-[#283375]" />}
						</div>
					</div>
				);
			})}
		</div>
	);
};
