import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentCenterDirector } from '../../../types';

export interface AssessmentCenterDirectorsCardProps {
	directors?: AssessmentCenterDirector[];
}

export const AssessmentCenterDirectorsCard: React.FC<AssessmentCenterDirectorsCardProps> = ({
	directors,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
			<h3 className='text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4'>
				{t('Руководство')}
			</h3>
			<div className='space-y-4'>
				{directors && directors.length > 0 ? (
					directors.map((dir) => (
						<div key={dir.id} className='bg-slate-50 rounded-xl p-4 border border-slate-100'>
							<p className='font-semibold text-gray-800 text-sm'>{dir.name}</p>
							{dir.phone && (
								<div className='mt-2 flex items-center text-gray-600 text-xs font-medium'>
									<svg
										className='w-4 h-4 mr-2 text-blue-500 flex-shrink-0'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
										/>
									</svg>
									<span>{dir.phone}</span>
								</div>
							)}
						</div>
					))
				) : (
					<p className='text-gray-400 italic text-sm'>{t('Руководители не указаны')}</p>
				)}
			</div>
		</div>
	);
};
