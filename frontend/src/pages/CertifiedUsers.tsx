import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useCertifiedUsers } from '../hooks/useApi';
import {
	CertifiedUserCard,
	CertifiedUserModal,
	CertifiedUserPagination,
	CertifiedUserSearch,
} from '../widgets/candidate-registry';
import type { CertifiedUser } from '../types';

// Debounce hook — delays API call by 400ms after user stops typing
function useDebounce(value: string, delay: number) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debounced;
}

// Total pages calculation
function totalPages(count: number, pageSize = 20) {
	return Math.max(1, Math.ceil(count / pageSize));
}

export default function CertifiedUsers() {
	const { t } = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();
	const highlightParam = searchParams.get('highlight');
	const [highlightedReg, setHighlightedReg] = useState<string | null>(highlightParam);

	// Continuous passive scroll listener to guarantee accurate scrollPos
	const activeScrollRef = useRef(0);
	useEffect(() => {
		const onScroll = () => {
			if (window.scrollY > 0) {
				activeScrollRef.current = window.scrollY;
			}
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

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
	const isFirstPageRender = useRef(true);

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

	// Smoothly scroll to highlighted card and glow
	useEffect(() => {
		if (highlightedReg && !isLoading && users.length > 0) {
			const targetCard = document.getElementById(`user-card-${encodeURIComponent(highlightedReg)}`);
			if (targetCard) {
				const scrollTimer = setTimeout(() => {
					targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}, 150);
				const removeHighlightTimer = setTimeout(() => {
					setHighlightedReg(null);
				}, 4000);
				return () => {
					clearTimeout(scrollTimer);
					clearTimeout(removeHighlightTimer);
				};
			}
		}
	}, [highlightedReg, isLoading, users]);

	// 0-flicker instant scroll restoration BEFORE browser paints on initial mount
	useLayoutEffect(() => {
		if ('scrollRestoration' in window.history) {
			window.history.scrollRestoration = 'manual';
		}
		const savedScroll = sessionStorage.getItem('certified_users_scroll');
		if (savedScroll) {
			const scrollY = parseInt(savedScroll, 10);
			if (!isNaN(scrollY) && scrollY > 0) {
				const applyScroll = () => {
					const origBehavior = document.documentElement.style.scrollBehavior;
					document.documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, scrollY);
					document.documentElement.style.scrollBehavior = origBehavior;
				};

				applyScroll();
				const rAF = requestAnimationFrame(applyScroll);
				const t1 = setTimeout(applyScroll, 50);

				sessionStorage.removeItem('certified_users_scroll');
				return () => {
					cancelAnimationFrame(rAF);
					clearTimeout(t1);
				};
			}
		}
	}, []);

	// Scroll to start of list on page change
	useLayoutEffect(() => {
		if (isFirstPageRender.current) {
			isFirstPageRender.current = false;
			return;
		}
		if (listRef.current) {
			const yOffset = -120;
			const y = listRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
			const targetY = Math.max(0, y);

			const applyScroll = () => {
				const origBehavior = document.documentElement.style.scrollBehavior;
				document.documentElement.style.scrollBehavior = 'auto';
				window.scrollTo(0, targetY);
				document.documentElement.style.scrollBehavior = origBehavior;
			};

			applyScroll();
			const rAF = requestAnimationFrame(applyScroll);
			const t1 = setTimeout(applyScroll, 50);

			return () => {
				cancelAnimationFrame(rAF);
				clearTimeout(t1);
			};
		}
	}, [page]);

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

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	const saveScrollPosition = () => {
		const scroll = activeScrollRef.current || window.scrollY;
		sessionStorage.setItem('certified_users_scroll', scroll.toString());
	};

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
				{/* Поисковая строка */}
				<CertifiedUserSearch
					value={inputValue}
					onChange={handleSearch}
					onClear={clearSearch}
					totalCount={count}
					isLoading={isLoading}
					hasResults={Boolean(data)}
					hasSearchQuery={Boolean(search)}
				/>

				{/* Контент: спиннер, ошибка или список специалистов */}
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : users.length > 0 ? (
					<>
						{/* Сетка специалистов */}
						<div
							className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${
								isFetching ? 'opacity-60' : 'opacity-100'
							}`}
						>
							{users.map((user) => (
								<CertifiedUserCard
									key={user.id}
									user={user}
									isHighlighted={highlightedReg === user.registration_number}
									onClick={(u) => {
										saveScrollPosition();
										setSelectedUser(u);
									}}
								/>
							))}
						</div>

						{/* Пагинация */}
						<CertifiedUserPagination
							page={page}
							totalPages={pages}
							isFetching={isFetching}
							onPageChange={handlePageChange}
						/>
					</>
				) : (
					/* Пустое состояние */
					search ? (
						<div className='text-center py-20'>
							<div className='w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400'>
								<svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
								</svg>
							</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>{t('Ничего не найдено')}</h3>
							<p className='text-gray-500'>{t('Попробуйте изменить поисковый запрос.')}</p>
						</div>
					) : (
						<EmptyState message={t('Данных пока нет.')} />
					)
				)}
			</div>

			{/* Модальное окно профиля специалиста */}
			{selectedUser && (
				<CertifiedUserModal
					user={selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	);
}
