import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { CallbackModal } from './ui';

export default function Navbar() {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [isCallbackOpen, setIsCallbackOpen] = useState(false);
	const location = useLocation();

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

	const desktopLinkClass = (active: boolean) =>
		active
			? 'bg-white text-[#283375] inline-flex items-center px-4 h-10 text-sm font-bold transition-all duration-200 rounded-xl'
			: 'text-white hover:bg-white/10 inline-flex items-center px-4 h-full text-sm font-medium transition-all duration-200';

	const mobileLinkClass = (active: boolean) =>
		active
			? 'bg-white text-[#283375] block px-4 py-2 text-base font-bold rounded-xl transition-colors'
			: 'text-white hover:bg-white/5 block px-4 py-2 text-base font-medium rounded-xl transition-colors';

	const toggleMenu = () => setIsOpen(!isOpen);

	return (
		<>
			<nav
				className='shadow-md sticky top-0 border-t border-blue-800/30 z-50 rounded-xl'
				style={{ backgroundColor: '#283375' }}
			>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-center h-14 relative'>
						{/* Desktop Menu */}
						<div className='hidden sm:flex sm:items-center sm:justify-center sm:space-x-1 w-full'>
							<Link to='/' className={desktopLinkClass(isActive('/'))}>
								{t('Главная')}
							</Link>

							{/* Dropdown: Новости */}
							<div className='relative group flex items-center h-full'>
								<button className={desktopLinkClass(isSectionActive(['/news', '/gallery']))}>
									{t('Новости')}
									<svg
										className='ml-2 w-3 h-3 opacity-70'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</button>
								<div
									className='absolute hidden group-hover:block top-full left-0 w-48 shadow-xl py-1 z-50 border border-blue-800/50'
									style={{ backgroundColor: '#283375' }}
								>
									<Link to='/news' className='block px-4 py-2 text-sm text-white hover:bg-white/10'>
										{t('Все новости')}
									</Link>
									<Link
										to='/gallery/images'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('Фотогалерея')}
									</Link>
									<Link
										to='/gallery/videos'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('Видео галерея')}
									</Link>
								</div>
							</div>

							{/* Dropdown: О центре */}
							<div className='relative group flex items-center h-full'>
								<button
									className={desktopLinkClass(
										isSectionActive([
											'/about/management',
											'/documents/partners',
											'/about/additional-info',
										])
									)}
								>
									{t('О центре')}
									<svg
										className='ml-2 w-3 h-3 opacity-70'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</button>
								<div
									className='absolute hidden group-hover:block top-full left-0 w-64 shadow-xl py-1 z-50 border border-blue-800/50'
									style={{ backgroundColor: '#283375' }}
								>
									<Link
										to='/about/management'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('Руководство')}
									</Link>
									<Link
										to='/documents/partners'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('Партнеры по развитию')}
									</Link>
									<Link
										to='/about/additional-info'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('Дополнительная информация')}
									</Link>
								</div>
							</div>

							{/* Dropdown: База данных */}
							<div className='relative group flex items-center h-full'>
								<button
									className={desktopLinkClass(
										isSectionActive([
											'/documents/assessment-centers',
											'/documents/experts',
											'/documents/certified-users',
										])
									)}
								>
									{t('База данных')}
									<svg
										className='ml-2 w-3 h-3 opacity-70'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</button>
								<div
									className='absolute hidden group-hover:block top-full right-0 w-64 shadow-xl py-1 z-50 border border-blue-800/50'
									style={{ backgroundColor: '#283375' }}
								>
									<Link
										to='/documents/assessment-centers'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('Центры оценки компетенций')}
									</Link>
									<Link
										to='/documents/experts'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('База данных экспертов')}
									</Link>
									<Link
										to='/documents/certified-users'
										className='block px-4 py-2 text-sm text-white hover:bg-white/10'
									>
										{t('База данных сертифицированных')}
									</Link>
								</div>
							</div>

							<Link to='/apply' className={desktopLinkClass(isActive('/apply'))}>
								{t('Электронная приемная')}
							</Link>

							<Link to='/apply/status' className={desktopLinkClass(isActive('/apply/status'))}>
								{t('Статус заявки')}
							</Link>

							{/* Кнопка «Консультация» */}
							<button
								onClick={() => setIsCallbackOpen(true)}
								className={desktopLinkClass(isCallbackOpen)}
							>
								{t('Консультация')}
							</button>
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
					<div className='flex-1 overflow-y-auto px-4 py-6 space-y-5'>
						<div className='space-y-1'>
							<Link
								to='/'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/'))}
							>
								{t('Главная')}
							</Link>
						</div>

						{/* Новости */}
						<div className='space-y-1'>
							<div className='px-4 pb-1 text-xs font-bold text-blue-300 uppercase tracking-widest opacity-80'>
								{t('Новости')}
							</div>
							<Link
								to='/news'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/news'))}
							>
								{t('Все новости')}
							</Link>
							<Link
								to='/gallery/images'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/gallery/images'))}
							>
								{t('Фотогалерея')}
							</Link>
							<Link
								to='/gallery/videos'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/gallery/videos'))}
							>
								{t('Видео галерея')}
							</Link>
						</div>

						{/* О центре */}
						<div className='space-y-1'>
							<div className='px-4 pb-1 text-xs font-bold text-blue-300 uppercase tracking-widest opacity-80'>
								{t('О центре')}
							</div>
							<Link
								to='/about/management'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/about/management'))}
							>
								{t('Руководство')}
							</Link>
							<Link
								to='/documents/partners'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/documents/partners'))}
							>
								{t('Партнеры по развитию')}
							</Link>
							<Link
								to='/about/additional-info'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/about/additional-info'))}
							>
								{t('Дополнительная информация')}
							</Link>
						</div>

						{/* База данных */}
						<div className='space-y-1'>
							<div className='px-4 pb-1 text-xs font-bold text-blue-300 uppercase tracking-widest opacity-80'>
								{t('База данных')}
							</div>
							<Link
								to='/documents/assessment-centers'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/documents/assessment-centers'))}
							>
								{t('Центры оценки компетенций')}
							</Link>
							<Link
								to='/documents/experts'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/documents/experts'))}
							>
								{t('База данных экспертов')}
							</Link>
							<Link
								to='/documents/certified-users'
								onClick={() => setIsOpen(false)}
								className={mobileLinkClass(isActive('/documents/certified-users'))}
							>
								{t('База данных сертифицированных')}
							</Link>
						</div>

						{/* Кнопки */}
						<div className='pt-6 border-t border-blue-800/50 space-y-3'>
							<Link
								to='/apply'
								onClick={() => setIsOpen(false)}
								className='bg-white text-[#283375] block w-full text-center py-3 rounded-xl text-base font-bold shadow-lg'
							>
								{t('Подать заявку')}
							</Link>
							<Link
								to='/apply/status'
								onClick={() => setIsOpen(false)}
								className='mt-3 bg-blue-800/40 text-white block w-full text-center py-3 rounded-xl text-base font-medium border border-white/10'
							>
								{t('Статус заявки')}
							</Link>
							<button
								onClick={() => { setIsOpen(false); setIsCallbackOpen(true); }}
								className='mt-3 text-white block w-full text-center py-3 rounded-xl text-base font-medium border border-white/10 hover:bg-white/10'
							>
								{t('Получить консультацию')}
							</button>
						</div>
					</div>
				</div>
			</nav>

			<CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
		</>
	);
}
