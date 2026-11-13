import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from './NavLanguageDropdown';
import { NavMobileAccordion } from './NavMobileAccordion';

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

	const newsItems = [
		{ to: '/news', label: t('Все новости'), isActive: location.pathname === '/news' },
		{ to: '/gallery/images', label: t('Фотогалерея'), isActive: location.pathname === '/gallery/images' },
		{ to: '/gallery/videos', label: t('Видео галерея'), isActive: location.pathname === '/gallery/videos' },
	];

	const aboutItems = [
		{ to: '/about/management', label: t('Руководство'), isActive: location.pathname === '/about/management' },
		{ to: '/documents/partners', label: t('Партнеры по развитию'), isActive: location.pathname === '/documents/partners' },
		{ to: '/about/additional-info', label: t('Дополнительная информация'), isActive: location.pathname === '/about/additional-info' },
	];

	const dbItems = [
		{ to: '/documents/assessment-centers', label: t('Центры оценки компетенций'), isActive: location.pathname === '/documents/assessment-centers' },
		{ to: '/documents/experts', label: t('База данных экспертов'), isActive: location.pathname === '/documents/experts' },
	];

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

					<NavMobileAccordion
						title={t('Новости')}
						isSectionActive={isNewsActive}
						isOpen={mobileNewsOpen}
						onToggle={() => setMobileNewsOpen((prev) => !prev)}
						items={newsItems}
						onClose={onClose}
						mobileLinkClass={mobileLinkClass}
					/>

					<NavMobileAccordion
						title={t('О центре')}
						isSectionActive={isAboutActive}
						isOpen={mobileAboutOpen}
						onToggle={() => setMobileAboutOpen((prev) => !prev)}
						items={aboutItems}
						onClose={onClose}
						mobileLinkClass={mobileLinkClass}
					/>

					<NavMobileAccordion
						title={t('База данных')}
						isSectionActive={isDbActive}
						isOpen={mobileDbOpen}
						onToggle={() => setMobileDbOpen((prev) => !prev)}
						items={dbItems}
						onClose={onClose}
						mobileLinkClass={mobileLinkClass}
					/>

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
							onClick={() => {
								onClose();
								onOpenCallback();
							}}
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
