import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../../types';

export interface NewsCardProps {
	item: NewsItem;
	onNewsClick: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onNewsClick }) => {
	const { t, i18n } = useTranslation();

	return (
		<div className='bg-white border rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group'>
			<Link
				to={`/news/${item.slug}`}
				onClick={onNewsClick}
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
	);
};
