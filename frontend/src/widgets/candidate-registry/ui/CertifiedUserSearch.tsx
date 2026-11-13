import { useTranslation } from 'react-i18next';

function SearchIcon() {
	return (
		<svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0' />
		</svg>
	);
}

interface CertifiedUserSearchProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClear: () => void;
	totalCount?: number;
	isLoading?: boolean;
	hasResults?: boolean;
	hasSearchQuery?: boolean;
}

export default function CertifiedUserSearch({
	value,
	onChange,
	onClear,
	totalCount,
	isLoading,
	hasResults,
	hasSearchQuery,
}: CertifiedUserSearchProps) {
	const { t } = useTranslation();

	return (
		<div className='mb-8'>
			<div className='relative max-w-xl mx-auto'>
				<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
					<SearchIcon />
				</div>
				<input
					id='certified-users-search'
					type='text'
					value={value}
					onChange={onChange}
					placeholder={t('Поиск по ФИО, профессии или рег. номеру...')}
					className='w-full pl-12 pr-10 py-3.5 text-sm bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all'
				/>
				{value && (
					<button
						onClick={onClear}
						className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
						aria-label='Очистить поиск'
					>
						<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
						</svg>
					</button>
				)}
			</div>

			{/* Result count badge */}
			{!isLoading && hasResults && typeof totalCount === 'number' && (
				<p className='text-center text-sm text-gray-500 mt-3'>
					{hasSearchQuery
						? <><span className='font-semibold text-[#283375]'>{totalCount}</span> {t('Найдено специалистов')}</>
						: <>{t('Найдено специалистов')}: <span className='font-semibold text-[#283375]'>{totalCount}</span></>
					}
				</p>
			)}
		</div>
	);
}
