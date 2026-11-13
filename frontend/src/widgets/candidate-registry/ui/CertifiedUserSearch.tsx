// frontend/src/widgets/candidate-registry/ui/CertifiedUserSearch.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../shared/ui';

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
		<div className="mb-8">
			<div className="max-w-xl mx-auto">
				<SearchInput
					id="certified-users-search"
					value={value}
					onChange={(val) => onChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)}
					onClear={onClear}
					placeholder={t('Поиск по ФИО, профессии или рег. номеру...')}
					size="lg"
				/>
			</div>

			{/* Result count badge */}
			{!isLoading && hasResults && typeof totalCount === 'number' && (
				<p className="mt-3 text-center text-xs text-slate-500">
					{t('Найдено специалистов:')}{' '}
					<span className="font-bold text-[#283375]">{totalCount}</span>
				</p>
			)}

			{/* No results message */}
			{!isLoading && !hasResults && hasSearchQuery && (
				<div className="mt-4 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200/60 max-w-xl mx-auto">
					<p className="text-sm font-semibold text-slate-700">
						{t('По вашему запросу ничего не найдено')}
					</p>
					<p className="text-xs text-slate-400 mt-1">
						{t('Попробуйте изменить поисковый запрос или сбросить фильтры')}
					</p>
					<button
						onClick={onClear}
						className="mt-3 text-xs font-bold text-[#283375] hover:underline cursor-pointer"
					>
						{t('Сбросить поиск')}
					</button>
				</div>
			)}
		</div>
	);
}
