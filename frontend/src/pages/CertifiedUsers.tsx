import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useCertifiedUsers } from '../hooks/useApi';
import CertifiedUserModal from '../components/CertifiedUserModal';
import type { CertifiedUser } from '../types';
import { transliterate } from '../utils/transliterate';
import { translateProfession } from '../utils/translateProfession';

// Search icon SVG
function SearchIcon() {
	return (
		<svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0' />
		</svg>
	);
}

// Person placeholder icon
function PersonIcon() {
	return (
		<svg className='w-16 h-16 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
			<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
		</svg>
	);
}

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
	const { t, i18n } = useTranslation();

	// Continuous passive scroll listener to guarantee 100% accurate scrollPos
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
	
	// Restore search state from sessionStorage
	const [inputValue, setInputValue] = useState(() => {
		return sessionStorage.getItem('certified_users_search') || '';
	});
	const [page, setPage] = useState(() => {
		const saved = sessionStorage.getItem('certified_users_page');
		return saved ? parseInt(saved, 10) : 1;
	});
	const [selectedUser, setSelectedUser] = useState<CertifiedUser | null>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const isFirstPageRender = useRef(true);

	// Debounced search — API call fires 400ms after user stops typing
	const search = useDebounce(inputValue, 400);

	// Cache search and page state to sessionStorage
	useEffect(() => {
		sessionStorage.setItem('certified_users_search', search);
	}, [search]);

	useEffect(() => {
		sessionStorage.setItem('certified_users_page', page.toString());
	}, [page]);

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

	const { data, isLoading, isFetching, error } = useCertifiedUsers(search, page);

	const users = data?.results ?? [];
	const count = data?.count ?? 0;
	const pages = totalPages(count);

	const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setPage(1);
	}, []);

	const clearSearch = useCallback(() => {
		setInputValue('');
		sessionStorage.removeItem('certified_users_search');
		setPage(1);
	}, []);

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

				{/* ── Search bar ───────────────────────────────────────── */}
				<div className='mb-8'>
					<div className='relative max-w-xl mx-auto'>
						<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
							<SearchIcon />
						</div>
						<input
							id='certified-users-search'
							type='text'
							value={inputValue}
							onChange={handleSearch}
							placeholder={t('Поиск по ФИО, профессии или рег. номеру...')}
							className='w-full pl-12 pr-10 py-3.5 text-sm bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all'
						/>
						{inputValue && (
							<button
								onClick={clearSearch}
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
					{!isLoading && data && (
						<p className='text-center text-sm text-gray-500 mt-3'>
							{search
								? <><span className='font-semibold text-[#283375]'>{count}</span> {t('Найдено специалистов')}</>
								: <>{t('Найдено специалистов')}: <span className='font-semibold text-[#283375]'>{count}</span></>
							}
						</p>
					)}
				</div>

				{/* ── Content ──────────────────────────────────────────── */}
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : users.length > 0 ? (
					<>
						{/* Grid with slight opacity while fetching next page */}
						<div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
							{users.map((user) => (
								<div
									key={user.id}
									onClick={() => {
										saveScrollPosition();
										setSelectedUser(user);
									}}
									className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer'
								>
									{/* Photo */}
									{user.image ? (
										<img
											src={user.image}
											alt={i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
											className='w-full h-52 object-cover object-top'
										/>
									) : (
										<div className='w-full h-52 flex items-center justify-center bg-gray-100'>
											<PersonIcon />
										</div>
									)}

									{/* Info */}
									<div className='p-4 text-center space-y-2'>
										<h3 className='text-base font-bold text-gray-900 leading-tight' title={i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}>
											{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
										</h3>

										{user.profession && (
											<p className='text-xs text-gray-500 line-clamp-2'>
												{translateProfession(user.profession, i18n.language)}
											</p>
										)}

										<span className='inline-block text-xs font-semibold text-[#283375] bg-blue-50 border border-blue-100 py-1 px-3 rounded-full'>
											{t('Рег. номер')}: {user.registration_number}
										</span>

										{user.issued_date && (
											<p className='text-xs text-gray-400'>
												{t('Выдача сертификата')}: {new Date(user.issued_date).toLocaleDateString('ru-RU')}
											</p>
										)}
									</div>
								</div>
							))}
						</div>

						{/* ── Pagination ───────────────────────────────────── */}
						{pages > 1 && (
							<div className='mt-10 flex flex-col sm:flex-row items-center justify-between gap-4'>
								{/* Page info */}
								<p className='text-sm text-gray-500'>
									{t('Страница')} <span className='font-semibold text-gray-800'>{page}</span> {t('из')} <span className='font-semibold text-gray-800'>{pages}</span>
								</p>

								{/* Buttons */}
								<div className='flex items-center gap-2'>
									<button
										id='certified-users-prev'
										onClick={() => handlePageChange(Math.max(1, page - 1))}
										disabled={page === 1 || isFetching}
										className='px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
									>
										← {t('Предыдущая')}
									</button>

									{/* Page numbers (show up to 5 around current page) */}
									<div className='hidden sm:flex gap-1'>
										{Array.from({ length: pages }, (_, i) => i + 1)
											.filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 2)
											.reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
												if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
												acc.push(p);
												return acc;
											}, [])
											.map((p, idx) =>
												p === 'ellipsis' ? (
													<span key={`e-${idx}`} className='px-2 py-2 text-gray-400 text-sm'>…</span>
												) : (
													<button
														key={p}
														onClick={() => handlePageChange(p as number)}
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
										onClick={() => handlePageChange(Math.min(pages, page + 1))}
										disabled={page === pages || isFetching}
										className='px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all'
									>
										{t('Следующая')} →
									</button>
								</div>
							</div>
						)}
					</>
				) : (
					/* Empty state — different message when searching vs no data at all */
					search ? (
						<div className='text-center py-20'>
							<div className='text-5xl mb-4'>🔍</div>
							<h3 className='text-xl font-bold text-gray-800 mb-2'>{t('Ничего не найдено')}</h3>
							<p className='text-gray-500'>{t('Попробуйте изменить поисковый запрос.')}</p>
						</div>
					) : (
						<EmptyState message={t('Данных пока нет.')} />
					)
				)}
			</div>

			{/* Detailed View Modal */}
			{selectedUser && (
				<CertifiedUserModal
					user={selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</div>
	);
}
