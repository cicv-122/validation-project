import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface PartnerHeaderNavProps {
	fromExperts: boolean;
	backToExpertsUrl: string;
}

export const PartnerHeaderNav: React.FC<PartnerHeaderNavProps> = ({
	fromExperts,
	backToExpertsUrl,
}) => {
	const { t } = useTranslation();

	return (
		<div className='mb-8 flex flex-wrap items-center gap-4'>
			<Link
				to='/documents/partners'
				className='inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-5 w-5 mr-1.5'
					viewBox='0 0 20 20'
					fill='currentColor'
				>
					<path
						fillRule='evenodd'
						d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
						clipRule='evenodd'
					/>
				</svg>
				{t('Назад к списку партнеров')}
			</Link>

			{fromExperts && (
				<>
					<span className='text-gray-300'>|</span>
					<Link
						to={backToExpertsUrl}
						className='inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium transition-colors bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 text-sm'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-4 w-4 mr-1.5'
							viewBox='0 0 20 20'
							fill='currentColor'
						>
							<path
								fillRule='evenodd'
								d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
								clipRule='evenodd'
							/>
						</svg>
						{t('Назад к базе экспертов')}
					</Link>
				</>
			)}
		</div>
	);
};
