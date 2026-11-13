import React from 'react';

export interface NewsDetailContentProps {
	descriptionHtml: string;
}

export const NewsDetailContent: React.FC<NewsDetailContentProps> = ({ descriptionHtml }) => {
	return (
		<div
			className='prose prose-lg prose-blue max-w-none text-gray-700 font-sans'
			dangerouslySetInnerHTML={{ __html: descriptionHtml }}
		/>
	);
};
