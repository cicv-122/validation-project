import { useTranslation } from 'react-i18next';
import { PageHero, SEO } from '../components/ui';

// Точные координаты: ул. Байтик баатыра, 122 / ул. Жусупа Абдрахманова, 276 (Бишкек)
const BISHKEK_LAT = 42.859331;
const BISHKEK_LON = 74.610250;

export default function Contacts() {
	const { t, i18n } = useTranslation();
	const yandexLang = i18n.language === 'en' ? 'en_US' : 'ru_RU';

	// Прямые ссылки на официальные сервисы навигации
	const link2gis = 'https://2gis.kg/bishkek/firm/70000001097169216';
	const linkYandex = `https://yandex.ru/maps/?text=%D0%B3.+%D0%91%D0%B8%D1%88%D0%BA%D0%B5%D0%BA%2C+%D1%83%D0%BB%D0%B8%D1%86%D0%B0+%D0%91%D0%B0%D0%B9%D1%82%D0%B8%D0%BA+%D0%91%D0%B0%D0%B0%D1%82%D1%8B%D1%80%D0%B0%2C+122&ll=${BISHKEK_LON}%2C${BISHKEK_LAT}&z=18`;
	const linkGoogle = `https://maps.google.com/?q=${BISHKEK_LAT},${BISHKEK_LON}`;

	return (
		<div className='bg-gray-50 min-h-screen'>
			<SEO
				title={`${t('Контакты')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Контактная информация Центра независимой сертификации и валидации при МП КР: адрес, телефоны, график работы, схема проезда.'
				)}
			/>

			{/* Фирменный верхний баннер портала */}
			<PageHero title={t('Контакты')} />

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
				{/* 1. Контактная информация — 4 карточки в едином стиле портала (сверху над картой) */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
					{/* Карточка 1: Адрес центра */}
					<div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between'>
						<div>
							<div className='w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5'>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
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
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
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
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
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
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
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

				{/* 2. Блок интерактивной карты с быстрыми кнопками навигатора (снизу под карточками) */}
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
								href={link2gis}
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
								href={linkYandex}
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
								href={linkGoogle}
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

					{/* Сама встроенная карта (Яндекс Карты: быстро, детально и без блокировок) */}
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
			</div>
		</div>
	);
}
