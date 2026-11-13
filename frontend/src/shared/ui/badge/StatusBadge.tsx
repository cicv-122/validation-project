// frontend/src/shared/ui/badge/StatusBadge.tsx
import React from 'react';

export interface StatusBadgeProps {
	status: string;
	label?: string;
	size?: 'xs' | 'sm' | 'md';
	showDot?: boolean;
	className?: string;
}

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
	draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' },
	submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
	pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
	under_review: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
	assessment_scheduled: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
	scheduled: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
	assessment_in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
	approved: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
	rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
	completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
};

const DEFAULT_STYLE = { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

const SIZE_STYLES = {
	xs: 'text-[10px] px-2 py-0.5',
	sm: 'text-[11px] px-2.5 py-1',
	md: 'text-xs px-3 py-1.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
	status,
	label,
	size = 'sm',
	showDot = false,
	className = '',
}) => {
	const style = STATUS_STYLES[status] || DEFAULT_STYLE;
	const displayLabel = label || status;

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${style.bg} ${style.text} ${style.border} ${SIZE_STYLES[size]} ${className}`}
		>
			{showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
			<span>{displayLabel}</span>
		</span>
	);
};
