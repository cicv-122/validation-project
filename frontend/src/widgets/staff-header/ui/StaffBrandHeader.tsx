import React from 'react';
import { Link } from 'react-router-dom';
import logoEmblem from '../../../assets/logo/logo-blue-white-ru.svg';

interface StaffBrandHeaderProps {
	isDossier?: boolean;
}

export const StaffBrandHeader: React.FC<StaffBrandHeaderProps> = ({ isDossier = false }) => {
	if (isDossier) {
		return (
			<Link
				to='/staff/dashboard'
				title='Вернуться в рабочий кабинет'
				className='flex items-center gap-3 group cursor-pointer select-none flex-shrink-0'
			>
				<div className='w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs flex-shrink-0 group-hover:scale-105 group-hover:border-[#283375]/40 transition-all'>
					<img
						src={logoEmblem}
						alt='Логотип ЦНСВ'
						className='w-full h-full object-contain'
					/>
				</div>
				<div>
					<div className='flex items-center gap-1.5 whitespace-nowrap leading-none'>
						<span className='text-[10px] sm:text-[11px] uppercase font-bold text-[#283375] tracking-wide'>
							Министерство просвещения Кыргызской Республики
						</span>
						<span className='inline-block w-1 h-1 rounded-full bg-slate-300' />
						<span className='text-[10px] sm:text-[11px] font-bold text-slate-400'>
							ЦНСВ
						</span>
					</div>
					<h1 className='text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#283375] tracking-tight leading-snug mt-0.5 transition-colors whitespace-nowrap'>
						Дело сертифицированного специалиста
					</h1>
				</div>
			</Link>
		);
	}

	return (
		<div className='flex items-center gap-3 select-none flex-shrink-0'>
			<div className='w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs flex-shrink-0'>
				<img
					src={logoEmblem}
					alt='Логотип ЦНСВ'
					className='w-full h-full object-contain'
				/>
			</div>
			<div>
				<div className='flex items-center gap-1.5 whitespace-nowrap leading-none'>
					<span className='text-[10px] sm:text-[11px] uppercase font-bold text-[#283375] tracking-wide'>
						Министерство просвещения Кыргызской Республики
					</span>
					<span className='inline-block w-1 h-1 rounded-full bg-slate-300' />
					<span className='text-[10px] sm:text-[11px] font-bold text-slate-400'>
						ЦНСВ
					</span>
				</div>
				<h1 className='text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug mt-0.5 whitespace-nowrap'>
					Рабочий кабинет сотрудника
				</h1>
			</div>
		</div>
	);
};
