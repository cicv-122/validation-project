import React from 'react';
import { useTranslation } from 'react-i18next';

export const ContactInfoCards: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
			{/* Карточка 1: Адрес центра */}
			<div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
				<div>
					<div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5'>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
							/>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
							/>
						</svg>
					</div>
					<h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2'>
						{t('Адрес центра')}
					</h3>
					<p className='text-base font-bold text-gray-900 leading-snug'>
						{t('720005, г. Бишкек, ул. Жусупа Абдрахманова, 276')}
					</p>
					<p className='text-xs text-gray-500 mt-1 font-medium'>
						{t('(бывш. ул. Байтик баатыра, 122)')}
					</p>
				</div>
				<p className='text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5'>
					<span className='w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0'></span>
					<span>{t('Вход со стороны ул. Жусупа Абдрахманова и ул. Кулатова')}</span>
				</p>
			</div>

			{/* Карточка 2: Телефоны приёмной */}
			<div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
				<div>
					<div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5'>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
							/>
						</svg>
					</div>
					<h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2'>
						{t('Телефоны приёмной')}
					</h3>
					<div className='space-y-1.5'>
						<a
							href='tel:+996312591401'
							className='block text-base font-bold text-gray-900 hover:text-blue-600 transition-colors'
						>
							+996 312 59 14 01
						</a>
						<a
							href='tel:+996312591404'
							className='block text-base font-bold text-gray-900 hover:text-blue-600 transition-colors'
						>
							+996 312 59 14 04
						</a>
					</div>
				</div>
				<p className='text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100'>
					{t('Приём звонков в рабочие часы')}
				</p>
			</div>

			{/* Карточка 3: Электронная почта */}
			<div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
				<div>
					<div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5'>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
							/>
						</svg>
					</div>
					<h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2'>
						{t('Электронная почта')}
					</h3>
					<a
						href='mailto:icvccentre@gmail.com'
						className='block text-base font-bold text-gray-900 hover:text-blue-600 transition-colors break-all'
					>
						icvccentre@gmail.com
					</a>
				</div>
				<p className='text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100'>
					{t('Для официальной корреспонденции')}
				</p>
			</div>

			{/* Карточка 4: График работы */}
			<div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
				<div>
					<div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5'>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
					</div>
					<h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2'>
						{t('График работы')}
					</h3>
					<p className='text-base font-bold text-gray-900'>
						{t('Понедельник — Пятница')}
					</p>
					<p className='text-xs text-gray-600 font-medium mt-1'>
						{t('с 08:30 до 17:30')}
					</p>
					<p className='text-xs text-gray-500 mt-0.5'>
						{t('(Обед: 12:30 – 13:30)')}
					</p>
				</div>
				<p className='text-xs text-emerald-600 font-medium mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5'>
					<span className='w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block'></span>
					<span>{t('Сб, Вс — выходные дни')}</span>
				</p>
			</div>
		</div>
	);
};
