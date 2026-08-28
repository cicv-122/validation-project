import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		const fromPartners = sessionStorage.getItem('from_partners');
		if (fromPartners === 'true' && pathname === '/documents/partners') {
			return;
		}

		const fromCenters = sessionStorage.getItem('from_centers');
		if (fromCenters === 'true' && pathname === '/documents/assessment-centers') {
			return;
		}

		const fromNews = sessionStorage.getItem('from_news');
		if (fromNews === 'true' && pathname === '/news') {
			return;
		}

		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}
