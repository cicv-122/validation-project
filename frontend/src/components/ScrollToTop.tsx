import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { safeSessionStorage } from '../shared/lib';

export default function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		const fromPartners = safeSessionStorage.getItem('from_partners');
		if (fromPartners === 'true' && pathname === '/documents/partners') {
			return;
		}

		const fromCenters = safeSessionStorage.getItem('from_centers');
		if (fromCenters === 'true' && pathname === '/documents/assessment-centers') {
			return;
		}

		const fromNews = safeSessionStorage.getItem('from_news');
		if (fromNews === 'true' && pathname === '/news') {
			return;
		}

		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}
