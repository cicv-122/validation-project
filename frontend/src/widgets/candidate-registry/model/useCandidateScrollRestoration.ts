import { useRef, useEffect, useLayoutEffect } from 'react';

interface UseCandidateScrollRestorationProps {
	highlightedReg: string | null;
	isLoading: boolean;
	hasUsers: boolean;
	page: number;
	listRef: React.RefObject<HTMLDivElement | null>;
	onClearHighlight: () => void;
}

export function useCandidateScrollRestoration({
	highlightedReg,
	isLoading,
	hasUsers,
	page,
	listRef,
	onClearHighlight,
}: UseCandidateScrollRestorationProps) {
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

	const isFirstPageRender = useRef(true);

	// Smoothly scroll to highlighted card and glow
	useEffect(() => {
		if (highlightedReg && !isLoading && hasUsers) {
			const targetCard = document.getElementById(`user-card-${encodeURIComponent(highlightedReg)}`);
			if (targetCard) {
				const scrollTimer = setTimeout(() => {
					targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}, 150);
				const removeHighlightTimer = setTimeout(() => {
					onClearHighlight();
				}, 4000);
				return () => {
					clearTimeout(scrollTimer);
					clearTimeout(removeHighlightTimer);
				};
			}
		}
	}, [highlightedReg, isLoading, hasUsers, onClearHighlight]);

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
	}, [page, listRef]);

	const saveScrollPosition = () => {
		const scroll = activeScrollRef.current || window.scrollY;
		sessionStorage.setItem('certified_users_scroll', scroll.toString());
	};

	return { saveScrollPosition };
}
