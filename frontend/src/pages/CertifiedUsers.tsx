import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { PageHero, SEO } from '../components/ui';
import { useCertifiedUsers } from '../hooks/useApi';
import { useDebounce } from '../shared/lib';
import {
	CertifiedUserSearch,
	CertifiedUsersGrid,
	CertifiedUserModal,
	useCandidateScrollRestoration,
} from '../widgets/candidate-registry';
import type { CertifiedUser } from '../types';

function totalPages(count: number, pageSize = 20) {
	return Math.max(1, Math.ceil(count / pageSize));
}

export default function CertifiedUsers() {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const highlightParam = searchParams.get('highlight');
	const [highlightedReg, setHighlightedReg] = useState<string | null>(highlightParam);

	// Restore search state from sessionStorage or URL highlight parameter
	const [inputValue, setInputValue] = useState(() => {
		return highlightParam || sessionStorage.getItem('certified_users_search') || '';
	});
	const [page, setPage] = useState(() => {
		if (highlightParam) return 1;
		const saved = sessionStorage.getItem('certified_users_page');
		return saved ? parseInt(saved, 10) : 1;
	});
	const [selectedUser, setSelectedUser] = useState<CertifiedUser | null>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Handle highlightParam updates if URL changes
	useEffect(() => {
		if (highlightParam) {
			setInputValue(highlightParam);
			setHighlightedReg(highlightParam);
			setPage(1);
		}
	}, [highlightParam]);

	// Debounced search — API call fires 400ms after user stops typing
	const search = useDebounce(inputValue, 400);

	// Cache search and page state to sessionStorage
	useEffect(() => {
		sessionStorage.setItem('certified_users_search', search);
	}, [search]);

	useEffect(() => {
		sessionStorage.setItem('certified_users_page', page.toString());
	}, [page]);

	const { data, isLoading, isFetching, error } = useCertifiedUsers(search, page);

	const users = data?.results ?? [];
	const count = data?.count ?? 0;
	const pages = totalPages(count);

	// Handle seamless scroll restoration and target highlighting
	const { saveScrollPosition } = useCandidateScrollRestoration({
		highlightedReg,
		isLoading,
		hasUsers: users.length > 0,
		page,
		listRef,
		onClearHighlight: () => setHighlightedReg(null),
	});

	const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setPage(1);
	}, []);

	const clearSearch = useCallback(() => {
		setInputValue('');
		sessionStorage.removeItem('certified_users_search');
		setPage(1);
		if (searchParams.has('highlight')) {
			setSearchParams({}, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	return (
		<div className='bg-gray-50 min-h-screen'>
			<SEO
				title={`${t('База данных сертифицированных')} — ЦНСВ`}
				description={t(
					'Список специалистов, прошедших независимую сертификацию или валидацию профессиональной квалификации в Центре независимой сертификации и валидации КР.'
				)}
			/>
			<PageHero title={t('База данных сертифицированных')} />

			<div ref={listRef} className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-28'>
				<CertifiedUserSearch
					value={inputValue}
					onChange={handleSearch}
					onClear={clearSearch}
					totalCount={count}
					isLoading={isLoading}
					hasResults={Boolean(data)}
					hasSearchQuery={Boolean(search)}
				/>

				<CertifiedUsersGrid
					users={users}
					isLoading={isLoading}
					isFetching={isFetching}
					error={error}
					highlightedReg={highlightedReg}
					page={page}
					totalPages={pages}
					hasSearchQuery={Boolean(search)}
					onPageChange={setPage}
					onSelectUser={(u) => {
						saveScrollPosition();
						setSelectedUser(u);
					}}
				/>
			</div>

			{selectedUser && (
				<CertifiedUserModal
					user={selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	);
}
