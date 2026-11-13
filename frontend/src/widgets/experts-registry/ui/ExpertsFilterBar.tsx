import React from 'react';
import { useTranslation } from 'react-i18next';
import { RegionMeta } from '../model/types';
import localExpertsData from '../../../data/experts_database.json';

interface ExpertsFilterBarProps {
	searchQuery: string;
	onSearchChange: (q: string) => void;
	selectedProfession: string;
	onProfessionChange: (p: string) => void;
	professions: { ru: string; kg: string }[];
	selectedRegionCode: string;
	onRegionSelect: (code: string) => void;
	availableRegions: RegionMeta[];
	isKg: boolean;
	isEn: boolean;
}

export const ExpertsFilterBar: React.FC<ExpertsFilterBarProps> = ({
	searchQuery,
	onSearchChange,
	selectedProfession,
	onProfessionChange,
	professions,
	selectedRegionCode,
	onRegionSelect,
	availableRegions,
	isKg,
	isEn,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5'>
			<div className='flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center'>
				{/* Search Input */}
				<div className='relative flex-1'>
					<input
						type='text'
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={t('Поиск по ФИО, организации или городу...')}
						className='w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all'
					/>
					<svg
						className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
				</div>

				{/* Profession Filter */}
				<div className='w-full md:w-80'>
					<select
						value={selectedProfession}
						onChange={(e) => onProfessionChange(e.target.value)}
						className='w-full py-2.5 px-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all'
					>
						<option value='all'>{t('Все специальности / направления')}</option>
						{professions.map((prof) => (
							<option key={prof.ru} value={prof.ru}>
								{isKg ? prof.kg : prof.ru}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Region Selector Tabs Ordered 01-09 */}
			<div className='pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center'>
				<button
					type='button'
					onClick={() => onRegionSelect('all')}
					className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
						selectedRegionCode === 'all'
							? 'bg-blue-900 text-white shadow-sm'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
					}`}
				>
					{t('Все регионы')}
				</button>

				{availableRegions.map((reg) => {
					const countInRegion = localExpertsData.filter((e) => e.code === reg.code).length;
					return (
						<button
							type='button'
							key={reg.code}
							onClick={() => onRegionSelect(reg.code)}
							className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
								selectedRegionCode === reg.code
									? 'bg-blue-900 text-white shadow-sm'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							<span>{isKg ? reg.kg : isEn ? reg.en : reg.ru}</span>
							<span
								className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
									selectedRegionCode === reg.code
										? 'bg-blue-800 text-blue-100'
										: 'bg-gray-200 text-gray-600'
								}`}
							>
								{countInRegion}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};
