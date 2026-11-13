// frontend/src/shared/ui/pagination/Pagination.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface PaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (newPage: number) => void;
	isFetching?: boolean;
	className?: string;
	showPageInfo?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
	page,
	totalPages,
	onPageChange,
	isFetching = false,
	className = '',
	showPageInfo = true,
}) => {
	const { t } = useTranslation();

	if (totalPages <= 1) return null;

	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
		.filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
		.reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
			if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
			acc.push(p);
			return acc;
		}, []);

	return (
		<div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
			{showPageInfo && (
				<p className="text-sm text-slate-500">
					{t('Страница')} <span className="font-semibold text-slate-800">{page}</span> {t('из')}{' '}
					<span className="font-semibold text-slate-800">{totalPages}</span>
				</p>
			)}

			<div className="flex items-center gap-1.5 sm:gap-2">
				<button
					type="button"
					onClick={() => onPageChange(Math.max(1, page - 1))}
					disabled={page === 1 || isFetching}
					className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
				>
					← {t('Предыдущая')}
				</button>

				<div className="hidden sm:flex items-center gap-1">
					{pageNumbers.map((p, idx) =>
						p === 'ellipsis' ? (
							<span key={`e-${idx}`} className="px-2 py-1 text-slate-400 text-sm select-none">
								…
							</span>
						) : (
							<button
								type="button"
								key={p}
								onClick={() => onPageChange(p as number)}
								disabled={isFetching}
								className={`w-9 h-9 text-sm font-bold rounded-xl transition-all shadow-2xs ${
									page === p
										? 'bg-[#283375] text-white'
										: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
								}`}
							>
								{p}
							</button>
						)
					)}
				</div>

				<button
					type="button"
					onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					disabled={page === totalPages || isFetching}
					className="px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs"
				>
					{t('Следующая')} →
				</button>
			</div>
		</div>
	);
};
