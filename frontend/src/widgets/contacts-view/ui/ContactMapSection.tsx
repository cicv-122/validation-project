import React from 'react';
import { useTranslation } from 'react-i18next';
import { BISHKEK_LAT, BISHKEK_LON, MAP_LINKS } from '../model/constants';

export interface ContactMapSectionProps {
	yandexLang: string;
}

export const ContactMapSection: React.FC<ContactMapSectionProps> = ({ yandexLang }) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
			{/* Шапка карты */}
			<div className='p-4 sm:p-5 bg-white border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
				<div>
					<h2 className='text-lg font-bold text-gray-900'>
						{t('Схема проезда')}
					</h2>
					<p className='text-xs sm:text-sm text-gray-500 mt-0.5'>
						{t('г. Бишкек, ул. Жусупа Абдрахманова, 276 (бывш. ул. Байтик баатыра, 122)')}
					</p>
				</div>

				{/* Кнопки быстрого открытия в любимом навигаторе пользователя */}
				<div className='flex items-center gap-2 flex-wrap'>
					<span className='text-xs font-semibold text-gray-400 mr-1 hidden lg:inline-block'>
						{t('Открыть в навигаторе:')}
					</span>

					{/* 2ГИС — №1 в Бишкеке */}
					<a
						href={MAP_LINKS.link2gis}
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95'
						title={t('Открыть карточку организации в 2ГИС')}
					>
						<span className='w-2 h-2 rounded-full bg-emerald-500'></span>
						<span>{t('2ГИС')}</span>
						<span className='text-[10px] opacity-60'>↗</span>
					</a>

					{/* Яндекс Карты */}
					<a
						href={MAP_LINKS.linkYandex}
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/80 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95'
						title={t('Открыть в Яндекс Картах')}
					>
						<span className='w-2 h-2 rounded-full bg-red-500'></span>
						<span>{t('Яндекс Карты')}</span>
						<span className='text-[10px] opacity-60'>↗</span>
					</a>

					{/* Google Maps */}
					<a
						href={MAP_LINKS.linkGoogle}
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95'
						title={t('Открыть в Google Maps')}
					>
						<span className='w-2 h-2 rounded-full bg-blue-500'></span>
						<span>{t('Google Карты')}</span>
						<span className='text-[10px] opacity-60'>↗</span>
					</a>
				</div>
			</div>

			{/* Встроенная карта Яндекс */}
			<div className='w-full h-[520px] bg-slate-100'>
				<iframe
					title={t('Карта проезда к ЦНСВ')}
					src={`https://yandex.ru/map-widget/v1/?ll=${BISHKEK_LON}%2C${BISHKEK_LAT}&z=18&pt=${BISHKEK_LON},${BISHKEK_LAT},pm2blm&lang=${yandexLang}`}
					className='w-full h-full border-0'
					loading='lazy'
					allowFullScreen
				/>
			</div>
		</div>
	);
};
