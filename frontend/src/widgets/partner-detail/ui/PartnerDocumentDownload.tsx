import React from 'react';
import { useTranslation } from 'react-i18next';

interface PartnerDocumentDownloadProps {
	fileUrl?: string;
}

export const PartnerDocumentDownload: React.FC<PartnerDocumentDownloadProps> = ({ fileUrl }) => {
	const { t } = useTranslation();

	if (!fileUrl) return null;

	return (
		<div className='bg-blue-50/50 border-t border-blue-100 p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4'>
			<div className='text-blue-900 font-medium'>
				{t('Дополнительная информация (документ)')}
			</div>
			<a
				href={fileUrl}
				target='_blank'
				rel='noreferrer'
				className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full sm:w-auto justify-center'
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-5 w-5 mr-2'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
					/>
				</svg>
				{t('Скачать документ')}
			</a>
		</div>
	);
};
