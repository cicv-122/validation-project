import React from 'react';
import { useTranslation } from 'react-i18next';
import { RegionMeta, ExpertItem } from '../model/types';
import { ExpertRow } from './ExpertRow';

interface ExpertsRegionTableProps {
	regionMeta: RegionMeta;
	items: ExpertItem[];
	isKg: boolean;
	isEn: boolean;
}

export const ExpertsRegionTable: React.FC<ExpertsRegionTableProps> = ({
	regionMeta,
	items,
	isKg,
	isEn,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
			{/* Region Header Banner in Navy/Blue style */}
			<div className='bg-gradient-to-r from-[#1e2a5e] via-[#253575] to-[#1e2a5e] px-6 py-4 text-white flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<span className='w-2.5 h-2.5 rounded-full bg-emerald-400' />
					<h3 className='text-base sm:text-lg font-bold tracking-wide'>
						{isKg ? regionMeta.kg : isEn ? regionMeta.en : regionMeta.ru}
					</h3>
				</div>
				<span className='text-xs font-medium bg-white/20 px-3 py-1 rounded-full'>
					{items.length} {t('экспертов')}
				</span>
			</div>

			{/* Experts Table */}
			<div className='overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200 text-sm'>
					<thead className='bg-gray-50 text-gray-500 uppercase text-xs tracking-wider'>
						<tr>
							<th className='px-6 py-3.5 text-left font-semibold'>№</th>
							<th className='px-6 py-3.5 text-left font-semibold'>{t('ФИО Эксперта')}</th>
							<th className='px-6 py-3.5 text-left font-semibold'>{t('Роль')}</th>
							<th className='px-6 py-3.5 text-left font-semibold'>{t('Специальность')}</th>
							<th className='px-6 py-3.5 text-left font-semibold'>
								{t('Организация / Заведение')}
							</th>
							<th className='px-6 py-3.5 text-right font-semibold'>{t('Контакты')}</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-200 bg-white'>
						{items.map((exp, idx) => (
							<ExpertRow
								key={exp.id}
								expert={exp}
								index={idx}
								isKg={isKg}
								isEn={isEn}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
