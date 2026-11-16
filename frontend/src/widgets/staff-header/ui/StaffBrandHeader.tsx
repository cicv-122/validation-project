import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoEmblem from '../../../assets/logo/logo-blue-white-ru.svg';

interface StaffBrandHeaderProps {
	isDossier?: boolean;
}

export const StaffBrandHeader: React.FC<StaffBrandHeaderProps> = ({ isDossier = false }) => {
	const location = useLocation();
	const path = location.pathname;

	let pageTitle = 'Рабочий кабинет сотрудника';
	let isSubpage = false;

	if (path.includes('/staff/professions')) {
		pageTitle = 'Список профессий';
		isSubpage = true;
	} else if (path.includes('/staff/experts')) {
		pageTitle = 'Список экспертов';
		isSubpage = true;
	} else if (path.includes('/staff/candidates/') || isDossier) {
		pageTitle = 'Дело специалиста';
		isSubpage = true;
	}

	const returnUrl =
		typeof window !== 'undefined'
			? sessionStorage.getItem('staff_dashboard_last_url') || '/staff/dashboard'
			: '/staff/dashboard';

	if (!isSubpage) {
		return (
			<Link
				to={returnUrl}
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
					<div className='flex items-center gap-2 mt-0.5'>
						<h1 className='text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#283375] tracking-tight leading-snug transition-colors whitespace-nowrap'>
							Рабочий кабинет сотрудника
						</h1>
					</div>
				</div>
			</Link>
		);
	}

	return (
		<div className='flex items-center gap-3 select-none flex-shrink-0'>
			<Link
				to={returnUrl}
				title='Вернуться в рабочий кабинет'
				className='w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs flex-shrink-0 hover:scale-105 hover:border-[#283375]/40 transition-all cursor-pointer'
			>
				<img
					src={logoEmblem}
					alt='Логотип ЦНСВ'
					className='w-full h-full object-contain'
				/>
			</Link>
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
				<div className='flex items-center gap-2 mt-0.5'>
					<Link
						to={returnUrl}
						className='inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#283375] transition-colors group/nav cursor-pointer'
						title='Вернуться в рабочий кабинет'
					>
						<svg className='w-3.5 h-3.5 text-slate-400 group-hover/nav:text-[#283375] transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
						</svg>
						<span>Кабинет</span>
					</Link>
					<span className='text-slate-300 text-xs sm:text-sm'>/</span>
					<h1 className='text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug whitespace-nowrap'>
						{pageTitle}
					</h1>
				</div>
			</div>
		</div>
	);
};
