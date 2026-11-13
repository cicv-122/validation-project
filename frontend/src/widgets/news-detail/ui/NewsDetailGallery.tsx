import React from 'react';
import { useTranslation } from 'react-i18next';

export interface NewsDetailGalleryProps {
	images?: Array<{ id: number; image: string }>;
	title: string;
	onImageClick: (index: number) => void;
}

export const NewsDetailGallery: React.FC<NewsDetailGalleryProps> = ({
	images,
	title,
	onImageClick,
}) => {
	const { t } = useTranslation();

	if (!images || images.length === 0) return null;

	return (
		<div className='mt-16'>
			<h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2'>
				{t('Фотогалерея')}
			</h3>
			<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
				{images.map((img, idx) => (
					<div
						key={img.id}
						className='rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer'
						onClick={() => onImageClick(idx)}
					>
						<img
							src={img.image}
							alt={`${title} — ${t('фото')} ${idx + 1}`}
							className='w-full h-48 object-cover hover:scale-105 transition-transform duration-300'
						/>
					</div>
				))}
			</div>
		</div>
	);
};
