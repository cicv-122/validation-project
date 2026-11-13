import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import type { NewsItem } from '../../../types';
import { newsStore } from '../../../utils/newsStore';

export function useNewsScrollRestoration(language: string) {
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

	const [items, setItems] = useState<NewsItem[]>(restorationState.items);

	// Reset list on language switch
	const prevLangRef = useRef(language);
	useEffect(() => {
		if (prevLangRef.current !== language) {
			prevLangRef.current = language;
			setItems([]);
			newsStore.cachedItems = [];
			newsStore.fromDetail = false;
			sessionStorage.removeItem('from_news');
			sessionStorage.removeItem('news_cached_items');
		}
	}, [language]);

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

	return {
		items,
		setItems,
		isRestoring: restorationState.isRestoring,
		handleNewsClick,
	};
}
