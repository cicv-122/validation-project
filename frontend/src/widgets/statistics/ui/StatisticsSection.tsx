import { useEffect, useRef, useState } from 'react';
import StatsMetricsGrid from './StatsMetricsGrid';
import AssessorsRegionChart from './AssessorsRegionChart';

export default function StatisticsSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<section ref={sectionRef} className='py-12 md:py-16 bg-white'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12'>
				{/* 1. Блок цифр и ключевых метрик */}
				<StatsMetricsGrid isVisible={isVisible} />

				{/* 2. Блок регионального графика оценщиков */}
				<AssessorsRegionChart isVisible={isVisible} />
			</div>
		</section>
	);
}
