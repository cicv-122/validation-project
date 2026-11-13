import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from './NavLanguageDropdown';

interface NavMobileDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	onOpenCallback: () => void;
	isNewsActive: boolean;
	isAboutActive: boolean;
	isDbActive: boolean;
}

export function NavMobileDrawer({
	isOpen,
	onClose,
	onOpenCallback,
	isNewsActive,
	isAboutActive,
	isDbActive,
}: NavMobileDrawerProps) {
	const { t, i18n } = useTranslation();
	const location = useLocation();

	const [mobileNewsOpen, setMobileNewsOpen] = useState(isNewsActive);
	const [mobileAboutOpen, setMobileAboutOpen] = useState(isAboutActive);
	const [mobileDbOpen, setMobileDbOpen] = useState(isDbActive);

	useEffect(() => {
		if (isNewsActive) setMobileNewsOpen(true);
		if (isAboutActive) setMobileAboutOpen(true);
		if (isDbActive) setMobileDbOpen(true);
	}, [location.pathname, isNewsActive, isAboutActive, isDbActive]);

	const lang = i18n.language;

	const handleSelectLang = (code: string) => {
		i18n.changeLanguage(code);
		onClose();
	};

	const isActive = (path: string) => location.pathname === path;

	const mobileLinkClass = (active: boolean) =>
		active
			? 'bg-white text-[#283375] block px-4 py-2 text-base font-bold rounded-xl transition-colors'
			: 'text-white hover:bg-white/5 block px-4 py-2 text-base font-medium rounded-xl transition-colors';

	return (
		<>
			{/* Backdrop Overlay */}
			<div
				className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 z-[90] sm:hidden ${
					isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				}`}
				onClick={onClose}
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
						onClick={onClose}
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
							onClick={onClose}
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
									onClick={onClose}
									className={mobileLinkClass(location.pathname === '/news')}
								>
									{t('Все новости')}
								</Link>
								<Link
									to='/gallery/images'
									onClick={onClose}
									className={mobileLinkClass(location.pathname === '/gallery/images')}
								>
									{t('Фотогалерея')}
								</Link>
								<Link
									to='/gallery/videos'
									onClick={onClose}
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
									onClick={onClose}
									className={mobileLinkClass(location.pathname === '/about/management')}
								>
									{t('Руководство')}
								</Link>
								<Link
									to='/documents/partners'
									onClick={onClose}
									className={mobileLinkClass(location.pathname === '/documents/partners')}
								>
									{t('Партнеры по развитию')}
								</Link>
								<Link
									to='/about/additional-info'
									onClick={onClose}
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
									onClick={onClose}
									className={mobileLinkClass(location.pathname === '/documents/assessment-centers')}
								>
									{t('Центры оценки компетенций')}
								</Link>
								<Link
									to='/documents/experts'
									onClick={onClose}
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
							onClick={onClose}
							className='bg-white text-[#283375] block w-full text-center py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-100 transition-colors'
						>
							{t('Подать заявку')}
						</Link>
						<Link
							to='/apply/status'
							onClick={onClose}
							className='bg-blue-800/40 text-white block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors'
						>
							{t('Статус заявки')}
						</Link>
						<button
							type='button'
							onClick={() => { onClose(); onOpenCallback(); }}
							className='text-white block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors cursor-pointer'
						>
							{t('Получить консультацию')}
						</button>
						<Link
							to='/contacts'
							onClick={onClose}
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
									onClick={() => handleSelectLang(code)}
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
		</>
	);
}
