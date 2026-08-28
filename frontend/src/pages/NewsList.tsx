import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import { EmptyState, ErrorMessage, LoadingSkeleton, PageHero, SEO } from '../components/ui';
import { useNews } from '../hooks/useApi';
import type { NewsItem } from '../types';
import { newsStore } from '../utils/newsStore';

const PAGE_SIZE = 9;

export default function NewsList() {
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

	// Read restoration state synchronously on initial mount
	const [restorationState] = useState(() => {
		const fromNews = sessionStorage.getItem('from_news') === 'true' || newsStore.fromDetail;
		const savedItems = (() => {
			if (newsStore.cachedItems.length > 0) return newsStore.cachedItems;
			try {
				const s = sessionStorage.getItem('news_cached_items');
				return s ? (JSON.parse(s) as NewsItem[]) : [];
			} catch {
				return [];
			}
		})();
		const savedScroll = (() => {
			if (newsStore.scrollPos > 0) return newsStore.scrollPos;
			const s = sessionStorage.getItem('news_scroll_pos');
			return s ? parseInt(s, 10) : 0;
		})();

		const isRestoring = fromNews && savedItems.length > 0;
		return {
			isRestoring,
			items: isRestoring ? savedItems : [],
			scroll: isRestoring ? savedScroll : 0,
		};
	});

	// Unified news list state
	const [items, setItems] = useState<NewsItem[]>(restorationState.items);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	// Fetch initial news if not restoring from cache
	const { data: initialNews, isLoading, error } = useNews(PAGE_SIZE);

	// Sync initialNews when fresh data arrives and we are not restoring
	useEffect(() => {
		if (initialNews && initialNews.length > 0 && !restorationState.isRestoring && items.length === 0) {
			setItems(initialNews);
		}
	}, [initialNews, restorationState.isRestoring, items.length]);

	// Reset list on language switch
	const prevLangRef = useRef(i18n.language);
	useEffect(() => {
		if (prevLangRef.current !== i18n.language) {
			prevLangRef.current = i18n.language;
			setItems([]);
			newsStore.cachedItems = [];
			newsStore.fromDetail = false;
			sessionStorage.removeItem('from_news');
			sessionStorage.removeItem('news_cached_items');
		}
	}, [i18n.language]);

	const targetScrollRef = useRef(restorationState.scroll);

	const handleNewsClick = () => {
		if (items.length > 0) {
			const scroll = activeScrollRef.current || window.scrollY;
			newsStore.scrollPos = scroll;
			newsStore.loadedCount = items.length;
			newsStore.cachedItems = items;
			newsStore.fromDetail = true;

			sessionStorage.setItem('from_news', 'true');
			sessionStorage.setItem('news_scroll_pos', scroll.toString());
			sessionStorage.setItem('news_loaded_count', items.length.toString());
			sessionStorage.setItem('news_cached_items', JSON.stringify(items));
		}
	};

	// 0-flicker instant scroll restoration BEFORE browser paints
	useLayoutEffect(() => {
		if ('scrollRestoration' in window.history) {
			window.history.scrollRestoration = 'manual';
		}
		const targetScroll = targetScrollRef.current;
		if (targetScroll > 0) {
			const applyScroll = () => {
				const origBehavior = document.documentElement.style.scrollBehavior;
				document.documentElement.style.scrollBehavior = 'auto';
				window.scrollTo(0, targetScroll);
				document.documentElement.style.scrollBehavior = origBehavior;
			};

			applyScroll();
			const rAF = requestAnimationFrame(applyScroll);
			const t1 = setTimeout(applyScroll, 50);

			newsStore.fromDetail = false;
			sessionStorage.removeItem('from_news');

			return () => {
				cancelAnimationFrame(rAF);
				clearTimeout(t1);
			};
		}
	}, []);

	const loadMore = async () => {
		setLoadingMore(true);
		try {
			const { data } = await apiClient.get('/news/', {
				params: { lang: i18n.language, limit: PAGE_SIZE, offset: items.length },
			});
			if (data.length < PAGE_SIZE) setHasMore(false);
			setItems((prev) => [...prev, ...data]);
		} catch {
			// тихая ошибка
		} finally {
			setLoadingMore(false);
		}
	};

	const showSkeleton = isLoading && items.length === 0;

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('Новости')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Актуальные новости Центра независимой сертификации и валидации Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('Новости')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{showSkeleton ? (
					<LoadingSkeleton count={6} className='h-72' />
				) : error && items.length === 0 ? (
					<ErrorMessage message={t('Ошибка загрузки новостей. Пожалуйста, попробуйте позже.')} />
				) : items.length > 0 ? (
					<>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
							{items.map((item: NewsItem) => (
								<div
									key={item.id}
									className='bg-white border rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group'
								>
									<Link
										to={`/news/${item.slug}`}
										onClick={handleNewsClick}
										className='flex flex-col h-full'
									>
										<div className='h-56 overflow-hidden relative bg-gradient-to-br from-[#1e3a5f] to-[#283375] flex items-center justify-center'>
											{item.image ? (
												<img
													src={item.image}
													alt={item.title}
													loading='lazy'
													decoding='async'
													className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out'
												/>
											) : (
												<div className='flex flex-col items-center justify-center text-white p-4 text-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out'>
													<div className='w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:bg-white/30 transition-colors'>
														<svg className='w-7 h-7 text-white ml-0.5' fill='currentColor' viewBox='0 0 24 24'>
															<path d='M8 5v14l11-7z' />
														</svg>
													</div>
													<span className='text-xs font-semibold tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full'>
														{t('Видео')}
													</span>
												</div>
											)}
											<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300' />
										</div>
										<div className='p-6 flex-grow flex flex-col justify-between bg-white relative top-[-10px] rounded-t-2xl'>
											<div>
												<span className='inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-3'>
													{new Date(item.created).toLocaleDateString(i18n.language)}
												</span>
												<h2 className='text-xl font-bold text-gray-900 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors'>
													{item.title}
												</h2>
											</div>
										</div>
									</Link>
								</div>
							))}
						</div>

						{hasMore && (
							<div className='text-center mt-12'>
								<button
									onClick={loadMore}
									disabled={loadingMore}
									className='inline-flex items-center gap-3 bg-[#283375] text-white font-semibold px-10 py-3.5 rounded-xl hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
								>
									{loadingMore ? (
										<>
											<svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
												<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
												<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
											</svg>
											{t('Загрузка...')}
										</>
									) : (
										<>
											{t('Показать ещё')}
											<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
											</svg>
										</>
									)}
								</button>
							</div>
						)}
					</>
				) : (
					<EmptyState message={t('Новостей пока нет.')} />
				)}
			</div>
		</div>
	);
}
