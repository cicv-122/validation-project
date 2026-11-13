import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomVideoPlayer } from '../../../components/ui';

export interface NewsDetailVideosProps {
	videos?: Array<{ id: number; file: string }>;
}

export const NewsDetailVideos: React.FC<NewsDetailVideosProps> = ({ videos }) => {
	const { t } = useTranslation();

	if (!videos || videos.length === 0) return null;

	return (
		<div className='mt-16'>
			<h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2'>
				{t('Видео')}
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{videos.map((vid) => (
					<CustomVideoPlayer
						key={vid.id}
						src={vid.file}
						containerClassName='rounded-xl shadow border border-gray-100 aspect-video w-full'
						className='w-full h-full object-cover'
					/>
				))}
			</div>
		</div>
	);
};
