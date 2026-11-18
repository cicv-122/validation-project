import React from 'react';
import { useTranslation } from 'react-i18next';

export interface NewsLoadMoreButtonProps {
	loading: boolean;
	onClick: () => void;
}

export const NewsLoadMoreButton: React.FC<NewsLoadMoreButtonProps> = ({ loading, onClick }) => {
	const { t } = useTranslation();

	return (
		<div className='text-center mt-12'>
			<button
				data-keep-nav-dropdown
				onClick={onClick}
				disabled={loading}
				className='inline-flex items-center gap-3 bg-[#283375] text-white font-semibold px-10 py-3.5 rounded-xl hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
			>
				{loading ? (
					<>
						<svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
							<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
							<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
						</svg>
						{t('Загрузка...')}
					</>
				) : (
					<>
						{t('Показать ещё')}
						<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
						</svg>
					</>
				)}
			</button>
		</div>
	);
};
