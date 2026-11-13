import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface StatItem {
	id: string;
	prefix?: string;
	value?: number;
	displayStr?: string;
	suffix?: string;
	titleKey: string;
	descKey: string;
	defaultDesc?: string;
	icon: React.ReactNode;
}

interface StatCardProps {
	item: StatItem;
	isVisible: boolean;
	delay: number;
}

export default function StatCard({ item, isVisible, delay }: StatCardProps) {
	const { t, i18n } = useTranslation();
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!isVisible || item.value === undefined) return;

		const end = item.value;
		const duration = 1200;
		const frameRate = 1000 / 60;
		const totalFrames = Math.round(duration / frameRate);
		let frame = 0;

		const timeout = setTimeout(() => {
			const timer = setInterval(() => {
				frame++;
				const progress = frame / totalFrames;
				const current = Math.round(end * (progress * (2 - progress)));
				setCount(current);

				if (frame >= totalFrames) {
					setCount(end);
					clearInterval(timer);
				}
			}, frameRate);

			return () => clearInterval(timer);
		}, delay);

		return () => clearTimeout(timeout);
	}, [isVisible, item.value, delay]);

	const formattedCount =
		item.value !== undefined
			? item.value >= 1000
				? count.toLocaleString(i18n.language === 'en' ? 'en-US' : 'ru-RU')
				: count
			: item.displayStr;

	return (
		<div className='group relative bg-white rounded-2xl p-6 border border-gray-100/90 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden'>
			<div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#283375] to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

			<div>
				<div className='flex items-center justify-between mb-4'>
					<div className='w-12 h-12 rounded-xl bg-blue-50/80 text-[#283375] flex items-center justify-center group-hover:bg-[#283375] group-hover:text-white transition-colors duration-300 shadow-sm border border-transparent'>
						{item.icon}
					</div>
					<div className='w-2 h-2 rounded-full bg-gray-200 group-hover:bg-blue-500 transition-colors duration-300' />
				</div>

				<div className='text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 group-hover:text-[#283375] transition-colors duration-300'>
					{item.prefix && <span className='text-gray-400 font-bold mr-0.5'>{item.prefix}</span>}
					<span>{formattedCount}</span>
					{item.suffix && (
						<span className='text-2xl sm:text-3xl font-bold text-gray-600 ml-1'>{item.suffix}</span>
					)}
				</div>

				<div className='text-sm text-gray-600 leading-snug font-normal'>
					{t(item.descKey, item.defaultDesc || item.descKey)}
				</div>
			</div>
		</div>
	);
}
