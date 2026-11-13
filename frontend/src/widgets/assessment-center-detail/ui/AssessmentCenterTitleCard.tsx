import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AssessmentCenterTitleCardProps {
	id: number;
	organization: string;
}

export const AssessmentCenterTitleCard: React.FC<AssessmentCenterTitleCardProps> = ({
	id,
	organization,
}) => {
	const { i18n } = useTranslation();

	const organizationTitle =
		id === 4
			? i18n.language.startsWith('k') || i18n.language === 'ky'
				? 'С. Нааматов атындагы Нарын мамлекеттик университетинин Агрардык техникалык-экономикалык колледжи'
				: i18n.language.startsWith('en')
				? 'Agrarian Technical and Economic College of Naryn State University named after S. Naamatov'
				: 'Аграрный технико-экономический колледж Нарынского государственного университета имени С. Нааматова'
			: organization;

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8'>
			<h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4'>
				{organizationTitle}
			</h1>
			<div className='w-20 h-1.5 bg-blue-500 rounded-full'></div>
		</div>
	);
};
