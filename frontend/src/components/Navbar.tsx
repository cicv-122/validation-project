import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { CallbackModal } from './ui';

const LANGUAGES = [
	{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
];

export default function Navbar() {
	const { t, i18n } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [isCallbackOpen, setIsCallbackOpen] = useState(false);
	const [isLangOpen, setIsLangOpen] = useState(false);
	const langDropdownRef = useRef<HTMLDivElement>(null);
	const navRef = useRef<HTMLElement>(null);
	const location = useLocation();

	const lang = i18n.language;
	const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

	const handleSelectLang = (code: string) => {
		i18n.changeLanguage(code);
		setIsLangOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				setActiveDropdown(null);
				setIsLangOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	const isActive = (path: string) => location.pathname === path;
	const isSectionActive = (paths: string[]) =>
		paths.some((path) => location.pathname.startsWith(path));

	const isNewsActive = isSectionActive(['/news', '/gallery']);
	const isAboutActive = isSectionActive([
		'/about/management',
		'/documents/partners',
		'/about/additional-info',
	]);
	const isDbActive = isSectionActive([
		'/documents/assessment-centers',
		'/documents/experts',
	]);

	// Проверяем, находится ли пользователь на детальной странице (конкретная новость, партнер или центр)
	// На детальной странице выпадающее меню НЕ должно висеть открытым, перекрывая контент статьи.
	const isDetailPage =
		location.pathname.startsWith('/news/') ||
		/^\/documents\/partners\/.+/.test(location.pathname) ||
		/^\/documents\/assessment-centers\/.+/.test(location.pathname);

	// Автоматически держим дропдаун открытым ТОЛЬКО на разделах-хабах (/news, /gallery/images, /gallery/videos и т.д.)
	// Но НЕ на детальной странице конкретной новости
	const currentSection = !isDetailPage
		? isNewsActive
			? 'news'
			: isAboutActive
			? 'about'
			: isDbActive
			? 'db'
			: null
		: null;

	const [activeDropdown, setActiveDropdown] = useState<string | null>(() => currentSection);

	// Мобильные аккордеоны разделов
	const [mobileNewsOpen, setMobileNewsOpen] = useState(isNewsActive);
	const [mobileAboutOpen, setMobileAboutOpen] = useState(isAboutActive);
	const [mobileDbOpen, setMobileDbOpen] = useState(isDbActive);

	useEffect(() => {
		if (isNewsActive) setMobileNewsOpen(true);
		if (isAboutActive) setMobileAboutOpen(true);
		if (isDbActive) setMobileDbOpen(true);
	}, [location.pathname, isNewsActive, isAboutActive, isDbActive]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsOpen(false);
				setActiveDropdown(null);
				setIsLangOpen(false);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	// При переходе на новую страницу:
	// Если это раздел меню (хаб) — держим открытым ("остается выпавшим")
	// Если перешли на страницу отдельной новости или другой раздел — закрываем
	useEffect(() => {
		if (currentSection) {
			setActiveDropdown(currentSection);
		} else {
			setActiveDropdown(null);
		}
	}, [location.pathname, currentSection]);

	const toggleDropdown = (key: string) => {
		setActiveDropdown((prev) => (prev === key ? null : key));
	};

	const isNewsOpen = activeDropdown === 'news';
	const isAboutOpen = activeDropdown === 'about';
	const isDbOpen = activeDropdown === 'db';

	const desktopLinkClass = (active: boolean) =>
		active
			? 'bg-white text-[#283375] inline-flex items-center justify-center px-3.5 h-10 text-xs lg:text-sm font-semibold transition-colors duration-150 rounded-xl shadow-xs whitespace-nowrap cursor-pointer select-none'
			: 'text-white/90 hover:text-white hover:bg-white/10 inline-flex items-center justify-center px-3.5 h-10 text-xs lg:text-sm font-semibold transition-colors duration-150 rounded-xl whitespace-nowrap cursor-pointer select-none';

	const dropdownItemClass = (active: boolean) =>
		active
			? 'flex items-center justify-between px-3.5 py-2 text-xs lg:text-sm font-semibold text-[#283375] bg-white rounded-xl shadow-xs transition-colors duration-150 cursor-pointer select-none whitespace-nowrap'
			: 'flex items-center justify-between px-3.5 py-2 text-xs lg:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-150 cursor-pointer select-none whitespace-nowrap';

	const mobileLinkClass = (active: boolean) =>
		active
			? 'bg-white text-[#283375] block px-4 py-2 text-base font-bold rounded-xl transition-colors'
			: 'text-white hover:bg-white/5 block px-4 py-2 text-base font-medium rounded-xl transition-colors';

	const toggleMenu = () => setIsOpen(!isOpen);

	return (
		<>
			<nav
				ref={navRef}
				className='shadow-md border-t border-blue-800/30 z-30 rounded-xl'
				style={{ backgroundColor: '#283375' }}
			>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-14 relative'>
						{/* Desktop Menu */}
						<div className='hidden sm:flex sm:items-center sm:justify-center sm:space-x-0.5 w-full'>
							<Link to='/' className={desktopLinkClass(isActive('/'))}>
								{t('Главная')}
							</Link>

							{/* Dropdown: Новости */}
							<div className='relative flex items-center h-full'>
								<button
									type='button'
									onClick={() => toggleDropdown('news')}
									className={desktopLinkClass(isNewsActive)}
								>
									{t('Новости')}
									<svg
										className={`ml-1.5 w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
											isNewsOpen ? 'rotate-180' : ''
										}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 15l7-7 7 7'
										/>
									</svg>
								</button>
								{isNewsOpen && (
									<div className='absolute top-full left-0 pt-1.5 z-50 min-w-[210px]'>
										<div
											className='shadow-2xl p-1.5 border border-blue-700/60 rounded-2xl overflow-hidden space-y-1'
											style={{ backgroundColor: '#283375' }}
										>
											<Link
												to='/news'
												className={dropdownItemClass(location.pathname === '/news')}
											>
												<span>{t('Все новости')}</span>
											</Link>
											<Link
												to='/gallery/images'
												className={dropdownItemClass(location.pathname === '/gallery/images')}
											>
												<span>{t('Фотогалерея')}</span>
											</Link>
											<Link
												to='/gallery/videos'
												className={dropdownItemClass(location.pathname === '/gallery/videos')}
											>
												<span>{t('Видео галерея')}</span>
											</Link>
										</div>
									</div>
								)}
							</div>

							{/* Dropdown: О центре */}
							<div className='relative flex items-center h-full'>
								<button
									type='button'
									onClick={() => toggleDropdown('about')}
									className={desktopLinkClass(isAboutActive)}
								>
									{t('О центре')}
									<svg
										className={`ml-1.5 w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
											isAboutOpen ? 'rotate-180' : ''
										}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 15l7-7 7 7'
										/>
									</svg>
								</button>
								{isAboutOpen && (
									<div className='absolute top-full left-0 pt-1.5 z-50 min-w-[250px]'>
										<div
											className='shadow-2xl p-1.5 border border-blue-700/60 rounded-2xl overflow-hidden space-y-1'
											style={{ backgroundColor: '#283375' }}
										>
											<Link
												to='/about/management'
												className={dropdownItemClass(location.pathname === '/about/management')}
											>
												<span>{t('Руководство')}</span>
											</Link>
											<Link
												to='/documents/partners'
												className={dropdownItemClass(location.pathname === '/documents/partners')}
											>
												<span>{t('Партнеры по развитию')}</span>
											</Link>
											<Link
												to='/about/additional-info'
												className={dropdownItemClass(location.pathname === '/about/additional-info')}
											>
												<span>{t('Дополнительная информация')}</span>
											</Link>
										</div>
									</div>
								)}
							</div>

							{/* Dropdown: База данных */}
							<div className='relative flex items-center h-full'>
								<button
									type='button'
									onClick={() => toggleDropdown('db')}
									className={desktopLinkClass(isDbActive)}
								>
									{t('База данных')}
									<svg
										className={`ml-1.5 w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
											isDbOpen ? 'rotate-180' : ''
										}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 15l7-7 7 7'
										/>
									</svg>
								</button>
								{isDbOpen && (
									<div className='absolute top-full left-0 pt-1.5 z-50 min-w-[270px]'>
										<div
											className='shadow-2xl p-1.5 border border-blue-700/60 rounded-2xl overflow-hidden space-y-1'
											style={{ backgroundColor: '#283375' }}
										>
											<Link
												to='/documents/assessment-centers'
												className={dropdownItemClass(
													location.pathname === '/documents/assessment-centers'
												)}
											>
												<span>{t('Центры оценки компетенций')}</span>
											</Link>
											<Link
												to='/documents/experts'
												className={dropdownItemClass(location.pathname === '/documents/experts')}
											>
												<span>{t('База данных экспертов')}</span>
											</Link>
										</div>
									</div>
								)}
							</div>

							<Link to='/apply' className={desktopLinkClass(isActive('/apply'))}>
								{t('Электронная приемная')}
							</Link>

							<Link to='/apply/status' className={desktopLinkClass(isActive('/apply/status'))}>
								{t('Статус заявки')}
							</Link>

							{/* Кнопка «Консультация» */}
							<button
								type='button'
								onClick={() => setIsCallbackOpen(true)}
								className={desktopLinkClass(isCallbackOpen)}
							>
								{t('Консультация')}
							</button>

							<Link to='/contacts' className={desktopLinkClass(isActive('/contacts'))}>
								{t('Контакты')}
							</Link>

							{/* Переключатель языков в навигационной панели */}
							<div className='border-l border-white/20 pl-2.5 ml-1 flex items-center h-full flex-shrink-0'>
								<div ref={langDropdownRef} className='relative flex items-center h-full'>
									<button
										type='button'
										onClick={() => {
											setActiveDropdown(null);
											setIsLangOpen((o) => !o);
										}}
										className='h-10 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-white/95 hover:text-white hover:bg-white/10 transition-colors duration-150 font-semibold text-xs lg:text-sm cursor-pointer select-none border border-white/20 shadow-2xs'
										title={t('Сменить язык')}
									>
										<span className='text-sm sm:text-base leading-none'>{currentLang.flag}</span>
										<span className='font-bold whitespace-nowrap'>{currentLang.label}</span>
										<svg
											className={`w-3.5 h-3.5 opacity-80 ml-0.5 transition-transform duration-200 ${
												isLangOpen ? 'rotate-180' : ''
											}`}
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M5 15l7-7 7 7'
											/>
										</svg>
									</button>

									{/* Меню выбора языка (по клику) */}
									{isLangOpen && (
										<div className='absolute right-0 top-full pt-1.5 z-[100] min-w-[160px]'>
											<div className='bg-white rounded-xl shadow-2xl py-1 border border-slate-200 overflow-hidden'>
											{LANGUAGES.map(({ code, label, flag }) => (
												<button
													key={code}
													type='button'
													onMouseDown={(e) => {
														e.preventDefault();
														handleSelectLang(code);
													}}
													onClick={() => handleSelectLang(code)}
													className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm transition-colors text-left cursor-pointer ${
														lang === code
															? 'bg-blue-50 text-[#283375] font-bold'
															: 'text-slate-700 hover:bg-slate-100 font-medium'
													}`}
												>
													<span className='text-base leading-none'>{flag}</span>
													<span className='flex-1'>{label}</span>
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
									</div>
								)}
							</div>
							</div>
						</div>

						{/* Mobile hamburger */}
						<div className='absolute right-0 top-0 h-14 flex items-center sm:hidden'>
							<button
								onClick={toggleMenu}
								className='inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none'
							>
								<span className='sr-only'>Open main menu</span>
								<svg
									className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
								<svg
									className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu (Sidebar Drawer) */}
				{/* Backdrop Overlay */}
				<div
					className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 z-[90] sm:hidden ${
						isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
					}`}
					onClick={() => setIsOpen(false)}
				/>

				{/* Drawer Panel */}
				<div
					className={`fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#283375] z-[100] shadow-2xl transition-transform duration-300 ease-in-out sm:hidden flex flex-col ${
						isOpen ? 'translate-x-0' : 'translate-x-full'
					}`}
				>
					{/* Drawer Header */}
					<div className='flex items-center justify-between px-6 py-4 border-b border-blue-800/40 flex-shrink-0'>
						<span className='font-bold text-white text-lg'>{t('Меню')}</span>
						<button
							onClick={() => setIsOpen(false)}
							className='p-1 rounded-md text-white hover:bg-white/10 focus:outline-none'
						>
							<svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>
					</div>

					{/* Drawer Content */}
					<div className='flex-1 overflow-y-auto px-4 py-5 space-y-4'>
						<div className='space-y-1'>
							<Link
								to='/'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/'))}
							>
								{t('Главная')}
							</Link>
						</div>

						{/* Новости (Аккордеон) */}
						<div className='bg-white/5 rounded-2xl p-1.5 border border-white/5 space-y-1'>
							<button
								type='button'
								onClick={() => setMobileNewsOpen((prev) => !prev)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-200 uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer select-none'
							>
								<span className='flex items-center gap-2'>
									<span className={`w-1.5 h-1.5 rounded-full ${isNewsActive ? 'bg-amber-400' : 'bg-transparent'}`} />
									{t('Новости')}
								</span>
								<svg
									className={`w-4 h-4 opacity-75 transition-transform duration-200 ${mobileNewsOpen ? 'rotate-180' : ''}`}
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</button>
							{mobileNewsOpen && (
								<div className='space-y-1 pl-2 border-l-2 border-white/15 ml-2.5 my-1'>
									<Link
										to='/news'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/news')}
									>
										{t('Все новости')}
									</Link>
									<Link
										to='/gallery/images'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/gallery/images')}
									>
										{t('Фотогалерея')}
									</Link>
									<Link
										to='/gallery/videos'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/gallery/videos')}
									>
										{t('Видео галерея')}
									</Link>
								</div>
							)}
						</div>

						{/* О центре (Аккордеон) */}
						<div className='bg-white/5 rounded-2xl p-1.5 border border-white/5 space-y-1'>
							<button
								type='button'
								onClick={() => setMobileAboutOpen((prev) => !prev)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-200 uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer select-none'
							>
								<span className='flex items-center gap-2'>
									<span className={`w-1.5 h-1.5 rounded-full ${isAboutActive ? 'bg-amber-400' : 'bg-transparent'}`} />
									{t('О центре')}
								</span>
								<svg
									className={`w-4 h-4 opacity-75 transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180' : ''}`}
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</button>
							{mobileAboutOpen && (
								<div className='space-y-1 pl-2 border-l-2 border-white/15 ml-2.5 my-1'>
									<Link
										to='/about/management'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/about/management')}
									>
										{t('Руководство')}
									</Link>
									<Link
										to='/documents/partners'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/documents/partners')}
									>
										{t('Партнеры по развитию')}
									</Link>
									<Link
										to='/about/additional-info'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/about/additional-info')}
									>
										{t('Дополнительная информация')}
									</Link>
								</div>
							)}
						</div>

						{/* База данных (Аккордеон) */}
						<div className='bg-white/5 rounded-2xl p-1.5 border border-white/5 space-y-1'>
							<button
								type='button'
								onClick={() => setMobileDbOpen((prev) => !prev)}
								className='w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-200 uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer select-none'
							>
								<span className='flex items-center gap-2'>
									<span className={`w-1.5 h-1.5 rounded-full ${isDbActive ? 'bg-amber-400' : 'bg-transparent'}`} />
									{t('База данных')}
								</span>
								<svg
									className={`w-4 h-4 opacity-75 transition-transform duration-200 ${mobileDbOpen ? 'rotate-180' : ''}`}
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</button>
							{mobileDbOpen && (
								<div className='space-y-1 pl-2 border-l-2 border-white/15 ml-2.5 my-1'>
									<Link
										to='/documents/assessment-centers'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/documents/assessment-centers')}
									>
										{t('Центры оценки компетенций')}
									</Link>
									<Link
										to='/documents/experts'
										onClick={() => setIsOpen(false)}
										className={mobileLinkClass(location.pathname === '/documents/experts')}
									>
										{t('База данных экспертов')}
									</Link>
								</div>
							)}
						</div>

						{/* Кнопки действий */}
						<div className='pt-4 border-t border-blue-800/50 space-y-2.5'>
							<Link
								to='/apply'
								onClick={() => setIsOpen(false)}
								className='bg-white text-[#283375] block w-full text-center py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-100 transition-colors'
							>
								{t('Подать заявку')}
							</Link>
							<Link
								to='/apply/status'
								onClick={() => setIsOpen(false)}
								className='bg-blue-800/40 text-white block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors'
							>
								{t('Статус заявки')}
							</Link>
							<button
								type='button'
								onClick={() => { setIsOpen(false); setIsCallbackOpen(true); }}
								className='text-white block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
							>
								{t('Получить консультацию')}
							</button>
							<Link
								to='/contacts'
								onClick={() => setIsOpen(false)}
								className='bg-blue-800/40 text-white block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors'
							>
								{t('Контакты')}
							</Link>
						</div>

						{/* Выбор языка в мобильном меню */}
						<div className='pt-4 border-t border-blue-800/50 space-y-2'>
							<div className='text-xs font-bold text-blue-300 uppercase tracking-widest px-1 opacity-80'>
								{t('Язык')}
							</div>
							<div className='grid grid-cols-3 gap-2'>
								{LANGUAGES.map(({ code, label, flag }) => (
									<button
										key={code}
										type='button'
										onClick={() => {
											handleSelectLang(code);
											setIsOpen(false);
										}}
										className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
											lang === code
												? 'bg-white text-[#283375] shadow-xs'
												: 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
										}`}
									>
										<span className='text-base'>{flag}</span>
										<span className='text-[10px] truncate w-full text-center'>{label}</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</nav>

			<CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
		</>
	);
}
