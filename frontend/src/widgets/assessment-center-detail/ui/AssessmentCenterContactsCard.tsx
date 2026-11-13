import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AssessmentCenterContactsCardProps {
	address?: string;
	map_url?: string;
	phone?: string;
	email?: string;
	website?: string;
}

export const AssessmentCenterContactsCard: React.FC<AssessmentCenterContactsCardProps> = ({
	address,
	map_url,
	phone,
	email,
	website,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
			<h3 className='text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4'>
				{t('Контакты Центра')}
			</h3>
			<div className='space-y-4 text-sm text-gray-600'>
				{address && (
					<div className='flex items-start'>
						<svg
							className='w-5 h-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
							/>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
							/>
						</svg>
						<div className='space-y-1.5'>
							{address
								.split(/[\r\n]+/)
								.map((a) => a.trim())
								.filter(Boolean)
								.map((addr, idx) => (
									<div key={idx}>
										<a
											href={map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`}
											target='_blank'
											rel='noopener noreferrer'
											className='text-gray-900 leading-relaxed hover:text-blue-600 font-medium transition-colors inline-block'
											title={t('Открыть на карте')}
										>
											{addr}
										</a>
									</div>
								))}
						</div>
					</div>
				)}

				{phone && (
					<div className='flex items-start'>
						<svg
							className='w-5 h-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0'
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
						<div className='space-y-1'>
							{phone.split('\n').filter(Boolean).map((p, idx) => (
								<div key={idx}>
									<a href={`tel:${p.replace(/[^\d+]/g, '')}`} className='hover:text-blue-600 hover:underline transition-colors'>
										{p}
									</a>
								</div>
							))}
						</div>
					</div>
				)}

				{email && (
					<div className='flex items-center'>
						<svg
							className='w-5 h-5 mr-3 text-blue-500 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
							/>
						</svg>
						<a
							href={`mailto:${email}`}
							className='hover:text-blue-600 hover:underline transition-colors'
						>
							{email}
						</a>
					</div>
				)}

				{website && (
					<div className='flex items-center'>
						<svg
							className='w-5 h-5 mr-3 text-blue-500 flex-shrink-0'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
							/>
						</svg>
						<a
							href={website}
							target='_blank'
							rel='noopener noreferrer'
							className='hover:text-blue-600 hover:underline transition-colors truncate'
						>
							{website.replace(/^https?:\/\//, '')}
						</a>
					</div>
				)}
			</div>
		</div>
	);
};
