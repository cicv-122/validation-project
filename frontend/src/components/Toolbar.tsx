import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import emblemKyrgyzstan from '../assets/logo/emblem-kyrgyzstan.svg';
import logoDarkKg from '../assets/logo/logo-dark-bg-kg.svg';
import logoDarkRu from '../assets/logo/logo-dark-bg-ru.svg';

const LANGUAGES = [
	{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
];

export default function Toolbar() {
	const { t, i18n } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const lang = i18n.language;

	const isKyrgyz = lang?.startsWith('ky') || lang?.startsWith('kg');
	const logo = isKyrgyz ? logoDarkKg : logoDarkRu;

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
		<header className='bg-white'>
			{/* Top Bar */}
			<div className='bg-[#283375] border-b border-blue-800 shadow-sm rounded-b-xl'>
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

						{/* Language Switcher */}
						<div className='flex items-center border-l border-blue-700/50 pl-4'>
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
									<div className='absolute right-0 top-[calc(100%+8px)] bg-white rounded-md shadow-xl py-1 z-[200] min-w-[155px] border border-gray-100'>
										{LANGUAGES.map(({ code, label, flag }) => (
											<button
												key={code}
												tabIndex={0}
												onClick={() => handleSelect(code)}
												className='w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 transition-colors'
											>
												<span className='text-base leading-none'>{flag}</span>
												<span className='flex-1 text-left'>{label}</span>
												{lang === code && (
													<svg
														className='w-4 h-4 text-[#283375] flex-shrink-0'
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
							<p className='text-xs sm:text-xl md:text-3xl font-extrabold text-[#283375] leading-tight mb-1 uppercase tracking-tight'>
								{t('Центр независимой сертификации и валидации')}
							</p>
							<p className='text-gray-600 font-bold text-[10px] sm:text-sm md:text-base leading-tight'>
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
