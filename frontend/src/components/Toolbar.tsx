import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import emblemKyrgyzstan from '../assets/logo/emblem-kyrgyzstan.svg';
import logoDarkKg from '../assets/logo/logo-dark-bg-kg.svg';
import logoDarkRu from '../assets/logo/logo-dark-bg-ru.svg';
import logoWhiteKg from '../assets/logo/logo-white-transparent-kg.svg';
import logoWhiteRu from '../assets/logo/logo-white-transparent-ru.svg';

const LANGUAGES = [
	{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
];

export default function Toolbar() {
	const { t, i18n } = useTranslation();
	const { theme, toggleTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const lang = i18n.language;

	const isKyrgyz = lang?.startsWith('ky') || lang?.startsWith('kg');
	// В светлой теме - синий логотип на белом фоне (logoDark), в тёмной теме - белоснежный логотип (logoWhite)
	const logo = theme === 'dark'
		? (isKyrgyz ? logoWhiteKg : logoWhiteRu)
		: (isKyrgyz ? logoDarkKg : logoDarkRu);

	const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

	const handleSelect = (code: string) => {
		i18n.changeLanguage(code);
		setIsOpen(false);
	};

	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
			setIsOpen(false);
		}
	};

	return (
		<header className='bg-white dark:bg-[#0f142b] border-b border-gray-100 dark:border-blue-900/30 rounded-2xl shadow-sm transition-colors duration-200 overflow-hidden'>
			{/* Top Bar */}
			<div className='bg-[#283375] dark:bg-[#161d3d] border-b border-blue-800 dark:border-blue-900/40 shadow-sm'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-10 text-xs sm:text-sm gap-2'>
						<div className='flex items-center space-x-4'>
							<a
								href='#contacts'
								className='text-white/90 hover:text-white transition-colors flex items-center font-medium'
							>
								<svg className='w-4 h-4 mr-2 opacity-80' fill='currentColor' viewBox='0 0 20 20'>
									<path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
								</svg>
								{t('Контакты')}
							</a>
						</div>

						{/* Right Actions: Dark Mode Toggle + Language Switcher */}
						<div className='flex items-center space-x-2 sm:space-x-3'>
							{/* Theme Toggle Button */}
							<button
								onClick={toggleTheme}
								type='button'
								title={theme === 'dark' ? t('Светлая тема') : t('Тёмная тема')}
								aria-label='Toggle theme'
								className='flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer select-none'
							>
								{theme === 'dark' ? (
									<>
										<svg className='w-3.5 h-3.5 text-amber-300' fill='currentColor' viewBox='0 0 20 20'>
											<path
												fillRule='evenodd'
												d='M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z'
												clipRule='evenodd'
											/>
										</svg>
										<span className='hidden sm:inline'>{t('Светлая')}</span>
									</>
								) : (
									<>
										<svg className='w-3.5 h-3.5 text-blue-200' fill='currentColor' viewBox='0 0 20 20'>
											<path d='M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z' />
										</svg>
										<span className='hidden sm:inline'>{t('Тёмная')}</span>
									</>
								)}
							</button>

							{/* Language Switcher */}
							<div className='flex items-center border-l border-blue-700/50 pl-2 sm:pl-3'>
								<div ref={dropdownRef} className='relative' onBlur={handleBlur}>
									<button
										onClick={() => setIsOpen((o) => !o)}
										className='flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium cursor-pointer select-none'
									>
										<span className='text-sm sm:text-base leading-none'>{currentLang.flag}</span>
										<span className='truncate max-w-[80px] sm:max-w-none'>{currentLang.label}</span>
										<svg
											className={`w-3 h-3 opacity-70 ml-0.5 transition-transform ${
												isOpen ? 'rotate-180' : ''
											}`}
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path
												fillRule='evenodd'
												d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
												clipRule='evenodd'
											/>
										</svg>
									</button>

									{isOpen && (
										<div className='absolute right-0 top-[calc(100%+8px)] bg-white dark:bg-[#1a224e] rounded-md shadow-xl py-1 z-[200] min-w-[155px] border border-gray-100 dark:border-blue-900/60'>
											{LANGUAGES.map(({ code, label, flag }) => (
												<button
													key={code}
													tabIndex={0}
													onClick={() => handleSelect(code)}
													className='w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-blue-900/40 transition-colors'
												>
													<span className='text-base leading-none'>{flag}</span>
													<span className='flex-1 text-left'>{label}</span>
													{lang === code && (
														<svg
															className='w-4 h-4 text-[#283375] dark:text-blue-400 flex-shrink-0'
															fill='none'
															stroke='currentColor'
															strokeWidth={2.5}
															viewBox='0 0 24 24'
														>
															<path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
														</svg>
													)}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Toolbar Area */}
			<div className='py-6'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center gap-2 sm:gap-4 md:gap-6'>
						{/* Gov Logo */}
						<div className='animate-fade-in-left flex-shrink-0 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center'>
							<a href='https://www.gov.kg/ky' target='_blank' rel='noreferrer' className='w-full h-full block'>
								<img
									className='w-full h-full object-contain aspect-square'
									src={emblemKyrgyzstan}
									alt='Герб Кыргызстана'
									width={96}
									height={96}
								/>
							</a>
						</div>

						{/* Title */}
						<div className='text-center flex-grow px-2 sm:px-4 min-w-0'>
							<p className='text-xs sm:text-xl md:text-3xl font-extrabold text-[#283375] dark:text-blue-300 leading-tight mb-1 uppercase tracking-tight transition-colors'>
								{t('Центр независимой сертификации и валидации')}
							</p>
							<p className='text-gray-600 dark:text-gray-300 font-bold text-[10px] sm:text-sm md:text-base leading-tight transition-colors'>
								{t('при Министерстве просвещения Кыргызской Республики')}
							</p>
						</div>

						{/* Center Logo */}
						<div className='animate-fade-in-right flex-shrink-0 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center'>
							<Link to='/' className='w-full h-full block'>
								<img
									className='w-full h-full object-contain aspect-square'
									src={logo}
									alt='Логотип ЦНСВ'
									width={96}
									height={96}
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
