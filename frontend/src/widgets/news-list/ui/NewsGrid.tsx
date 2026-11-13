import React from 'react';
import type { NewsItem } from '../../../types';
import { NewsCard } from './NewsCard';

export interface NewsGridProps {
	items: NewsItem[];
	onNewsClick: () => void;
}

export const NewsGrid: React.FC<NewsGridProps> = ({ items, onNewsClick }) => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
			{items.map((item) => (
				<NewsCard key={item.id} item={item} onNewsClick={onNewsClick} />
			))}
		</div>
	);
};
