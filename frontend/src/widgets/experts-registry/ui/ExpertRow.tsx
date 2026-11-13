import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ExpertItem } from '../model/types';

interface ExpertRowProps {
	expert: ExpertItem;
	index: number;
	isKg: boolean;
	isEn: boolean;
}

export const ExpertRow: React.FC<ExpertRowProps> = ({ expert, index, isKg, isEn }) => {
	const { t } = useTranslation();

	return (
		<tr
			id={`expert-${expert.id}`}
			className='hover:bg-blue-50/40 transition-colors target:bg-amber-50 target:ring-2 target:ring-amber-400'
		>
			<td className='px-6 py-4 text-gray-400 font-mono text-xs'>{index + 1}</td>
			<td className='px-6 py-4 font-semibold text-gray-900 whitespace-nowrap'>
				{isEn && expert.name_en ? expert.name_en : expert.name}
			</td>
			<td className='px-6 py-4 whitespace-nowrap'>
				<span
					className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
						expert.role_ru === 'Оценщик'
							? 'bg-blue-50 text-blue-700 border border-blue-200'
							: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
					}`}
				>
					{t(expert.role_ru)}
				</span>
			</td>
			<td className='px-6 py-4 text-gray-700 font-medium whitespace-nowrap'>
				{t(expert.profession_ru)}
			</td>
			<td className='px-6 py-4 text-gray-700 whitespace-normal'>
				{expert.organization ? (
					expert.assessment_center_id ? (
						<Link
							to={`/documents/assessment-centers/${expert.assessment_center_id}?from=experts&expertId=${expert.id}#expert-${expert.id}`}
							title='Перейти на страницу центра оценки'
							className='group inline-flex items-center gap-1.5 font-semibold text-blue-900 bg-blue-50/70 hover:bg-blue-100 hover:text-blue-950 px-3 py-1.5 rounded-md border border-blue-200/80 text-xs sm:text-sm leading-relaxed transition-all shadow-xs'
						>
							<span>
								{expert.assessment_center_id === 4
									? isEn
										? 'ATEC NSU named after S. Naamatov'
										: isKg
										? 'С. Нааматов атындагы НАМУнун АТЭКи'
										: 'АТЭК НГУ им. С. Нааматова'
									: expert.assessment_center_id === 2
									? isEn
										? 'TC KNAU named after K.I. Skryabin'
										: isKg
										? 'К.И. Скрябин атындагы КУАУнун ТКи'
										: 'ТК КНАУ им. К. И. Скрябина'
									: isKg && expert.organization_kg
									? expert.organization_kg
									: isEn && expert.organization_en
									? expert.organization_en
									: expert.organization}
							</span>
							<svg
								className='w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
								/>
							</svg>
						</Link>
					) : expert.partner_id ? (
						<Link
							to={`/documents/partners/${expert.partner_id}?from=experts&expertId=${expert.id}#expert-${expert.id}`}
							title='Перейти на страницу партнера'
							className='group inline-flex items-center gap-1.5 font-semibold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-950 px-3 py-1.5 rounded-md border border-emerald-200/80 text-xs sm:text-sm leading-relaxed transition-all shadow-xs'
						>
							<span>
								{isKg && expert.organization_kg
									? expert.organization_kg
									: isEn && expert.organization_en
									? expert.organization_en
									: expert.organization}
							</span>
							<svg
								className='w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform shrink-0'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
								/>
							</svg>
						</Link>
					) : (
						<span className='font-medium text-gray-800 inline-block bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100 text-xs sm:text-sm leading-relaxed'>
							{isKg && expert.organization_kg
								? expert.organization_kg
								: isEn && expert.organization_en
								? expert.organization_en
								: expert.organization}
						</span>
					)
				) : (
					<span className='text-gray-400'>—</span>
				)}
			</td>
			<td className='px-6 py-4 text-right font-mono text-gray-800 whitespace-nowrap'>
				{expert.phone ? (
					<a
						href={`tel:${expert.phone.replace(/\s+/g, '')}`}
						className='text-blue-700 hover:text-blue-900 hover:underline font-semibold'
					>
						{expert.phone}
					</a>
				) : (
					<span className='text-gray-400'>—</span>
				)}
			</td>
		</tr>
	);
};
