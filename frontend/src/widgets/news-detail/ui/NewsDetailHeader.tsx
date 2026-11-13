import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomVideoPlayer } from '../../../components/ui';

export interface NewsDetailHeaderProps {
	created: string;
	title: string;
	image?: string | null;
	videos?: Array<{ id: number; file: string }>;
	onImageClick: () => void;
}

export const NewsDetailHeader: React.FC<NewsDetailHeaderProps> = ({
	created,
	title,
	image,
	videos,
	onImageClick,
}) => {
	const { i18n } = useTranslation();

	return (
		<header className='mb-10'>
			<span className='block text-gray-500 text-sm font-medium mb-2'>
				{new Date(created).toLocaleDateString(i18n.language, {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})}
			</span>
			<h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6'>
				{title}
			</h1>

			{image ? (
				<div
					className='rounded-2xl overflow-hidden shadow-lg mb-10 cursor-pointer'
					onClick={onImageClick}
				>
					<img
						src={image}
						alt={title}
						onError={(e) => {
							e.currentTarget.style.display = 'none';
						}}
						className='w-full h-auto object-cover max-h-[600px] hover:opacity-90 transition-opacity'
					/>
				</div>
			) : videos && videos.length > 0 ? (
				<CustomVideoPlayer
					src={videos[0].file}
					containerClassName='rounded-2xl shadow-lg mb-10 aspect-video max-h-[600px] flex items-center justify-center'
					className='w-full h-full max-h-[600px] object-contain'
				/>
			) : null}
		</header>
	);
};
