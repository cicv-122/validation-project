import React from 'react';
import { PartnerDetailType } from '../../../types';
import { PartnerContacts } from './PartnerContacts';
import { PartnerDocumentDownload } from './PartnerDocumentDownload';

interface PartnerCardProps {
	partner: PartnerDetailType;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner }) => {
	return (
		<div
			id='partner-card'
			className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
		>
			<div className='p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start'>
				{/* Logo */}
				<div className='flex-shrink-0 w-full md:w-48 h-48 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden'>
					{partner.image ? (
						<img
							src={partner.image}
							alt={partner.title}
							className='w-full h-full object-contain p-2'
						/>
					) : (
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-16 w-16 text-gray-300'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={1}
								d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
							/>
						</svg>
					)}
				</div>

				{/* Info */}
				<div className='flex-1 w-full flex flex-col justify-center'>
					<h1 className='text-3xl font-extrabold text-gray-900 mb-4'>{partner.title}</h1>

					{partner.description && (
						<p className='text-gray-600 text-base leading-relaxed mb-6 whitespace-pre-line'>
							{partner.description}
						</p>
					)}

					<PartnerContacts partner={partner} />
				</div>
			</div>

			<PartnerDocumentDownload fileUrl={partner.file} />
		</div>
	);
};
