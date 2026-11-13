import { useTranslation } from 'react-i18next';

interface CertifiedUserPaginationProps {
	page: number;
	totalPages: number;
	isFetching: boolean;
	onPageChange: (newPage: number) => void;
}

export default function CertifiedUserPagination({
	page,
	totalPages,
	isFetching,
	onPageChange,
}: CertifiedUserPaginationProps) {
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
		<div className='mt-10 flex flex-col sm:flex-row items-center justify-between gap-4'>
			{/* Page info */}
			<p className='text-sm text-gray-500'>
				{t('Страница')} <span className='font-semibold text-gray-800'>{page}</span> {t('из')} <span className='font-semibold text-gray-800'>{totalPages}</span>
			</p>

			{/* Buttons */}
			<div className='flex items-center gap-2'>
				<button
					id='certified-users-prev'
					onClick={() => onPageChange(Math.max(1, page - 1))}
					disabled={page === 1 || isFetching}
					className='px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
				>
					← {t('Предыдущая')}
				</button>

				{/* Page numbers */}
				<div className='hidden sm:flex gap-1'>
					{pageNumbers.map((p, idx) =>
						p === 'ellipsis' ? (
							<span key={`e-${idx}`} className='px-2 py-2 text-gray-400 text-sm'>…</span>
						) : (
							<button
								key={p}
								onClick={() => onPageChange(p as number)}
								disabled={isFetching}
								className={`w-9 h-9 text-sm font-medium rounded-xl transition-all ${
									page === p
										? 'bg-[#283375] text-white shadow-sm'
										: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
								}`}
							>
								{p}
							</button>
						)
					)}
				</div>

				<button
					id='certified-users-next'
					onClick={() => onPageChange(Math.min(totalPages, page + 1))}
					disabled={page === totalPages || isFetching}
					className='px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
				>
					{t('Следующая')} →
				</button>
			</div>
		</div>
	);
}
