import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { CallbackModal } from '../../../components/ui';
import { NavLanguageDropdown } from './NavLanguageDropdown';
import { NavMobileDrawer } from './NavMobileDrawer';

export function Navbar() {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [isCallbackOpen, setIsCallbackOpen] = useState(false);
	const [isLangOpen, setIsLangOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);
	const location = useLocation();

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
	const isDetailPage =
		location.pathname.startsWith('/news/') ||
		/^\/documents\/partners\/.+/.test(location.pathname) ||
		/^\/documents\/assessment-centers\/.+/.test(location.pathname);

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
							<NavLanguageDropdown
								isOpen={isLangOpen}
								onToggle={() => {
									setActiveDropdown(null);
									setIsLangOpen((o) => !o);
								}}
								onClose={() => setIsLangOpen(false)}
							/>
						</div>

						{/* Mobile hamburger */}
						<div className='absolute right-0 top-0 h-14 flex items-center sm:hidden'>
							<button
								onClick={() => setIsOpen((prev) => !prev)}
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
				<NavMobileDrawer
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					onOpenCallback={() => setIsCallbackOpen(true)}
					isNewsActive={isNewsActive}
					isAboutActive={isAboutActive}
					isDbActive={isDbActive}
				/>
			</nav>

			<CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
		</>
	);
}
