import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssessmentCenterExpert } from '../../../types';

export interface AssessmentCenterProfessionsTableProps {
	experts?: AssessmentCenterExpert[];
}

export const AssessmentCenterProfessionsTable: React.FC<AssessmentCenterProfessionsTableProps> = ({
	experts,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8'>
			<h2 className='text-xl font-bold text-gray-900 mb-6'>
				{t('Сертифицируемые направления и эксперты')}
			</h2>

			{experts && experts.length > 0 ? (
				<div className='overflow-x-auto -mx-6 sm:mx-0'>
					<table className='min-w-full divide-y divide-gray-200 text-sm'>
						<thead className='bg-gray-50'>
							<tr>
								<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
									{t('Профессия')}
								</th>
								<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
									{t('Оценщики')}
								</th>
								<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
									{t('Оценщик-работодатель')}
								</th>
								<th className='px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider w-1/4'>
									{t('Консультант')}
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-100'>
							{experts.map((exp) => (
								<tr key={exp.id} className='hover:bg-slate-50/50 transition-colors'>
									<td className='px-6 py-4 font-medium text-gray-900 align-top whitespace-normal'>
										{exp.profession}
									</td>
									<td className='px-6 py-4 text-gray-600 align-top whitespace-normal leading-relaxed'>
										{exp.appraisers}
									</td>
									<td className='px-6 py-4 text-gray-600 align-top whitespace-normal leading-relaxed'>
										{exp.appraiser_employer}
									</td>
									<td className='px-6 py-4 text-gray-600 align-top whitespace-normal'>
										{exp.consultant}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className='text-gray-500 italic text-sm'>
					{t('Информация о направлениях сертификации временно отсутствует.')}
				</p>
			)}
		</div>
	);
};
