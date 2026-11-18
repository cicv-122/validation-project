import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { NavDropdownMenu, desktopLinkClass } from './NavDropdownMenu';
import { NavLanguageDropdown } from './NavLanguageDropdown';

interface NavDesktopMenuProps {
	activeDropdown: string | null;
	toggleDropdown: (key: string) => void;
	setActiveDropdown: (key: string | null) => void;
	isNewsActive: boolean;
	isAboutActive: boolean;
	isDbActive: boolean;
	isCallbackOpen: boolean;
	setIsCallbackOpen: (open: boolean) => void;
	isLangOpen: boolean;
	setIsLangOpen: (fn: (prev: boolean) => boolean) => void;
}

export function NavDesktopMenu({
	activeDropdown,
	toggleDropdown,
	setActiveDropdown,
	isNewsActive,
	isAboutActive,
	isDbActive,
	isCallbackOpen,
	setIsCallbackOpen,
	isLangOpen,
	setIsLangOpen,
}: NavDesktopMenuProps) {
	const { t } = useTranslation();
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

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
		<div className='hidden sm:flex sm:items-center sm:justify-center sm:space-x-0.5 w-full'>
			<Link to='/' onClick={() => setActiveDropdown(null)} className={desktopLinkClass(isActive('/'))}>
				{t('Главная')}
			</Link>

			<NavDropdownMenu
				label={t('Новости')}
				isActive={isNewsActive}
				isOpen={activeDropdown === 'news'}
				onToggle={() => toggleDropdown('news')}
				items={newsItems}
				minWidthClass='min-w-[210px]'
			/>

			<NavDropdownMenu
				label={t('О центре')}
				isActive={isAboutActive}
				isOpen={activeDropdown === 'about'}
				onToggle={() => toggleDropdown('about')}
				items={aboutItems}
				minWidthClass='min-w-[250px]'
			/>

			<NavDropdownMenu
				label={t('База данных')}
				isActive={isDbActive}
				isOpen={activeDropdown === 'db'}
				onToggle={() => toggleDropdown('db')}
				items={dbItems}
				minWidthClass='min-w-[270px]'
			/>

			<Link to='/apply' onClick={() => setActiveDropdown(null)} className={desktopLinkClass(isActive('/apply'))}>
				{t('Электронная приемная')}
			</Link>

			<Link to='/apply/status' onClick={() => setActiveDropdown(null)} className={desktopLinkClass(isActive('/apply/status'))}>
				{t('Статус заявки')}
			</Link>

			<button
				type='button'
				onClick={() => {
					setActiveDropdown(null);
					setIsCallbackOpen(true);
				}}
				className={desktopLinkClass(isCallbackOpen)}
			>
				{t('Консультация')}
			</button>

			<Link to='/contacts' onClick={() => setActiveDropdown(null)} className={desktopLinkClass(isActive('/contacts'))}>
				{t('Контакты')}
			</Link>

			<NavLanguageDropdown
				isOpen={isLangOpen}
				onToggle={() => {
					setActiveDropdown(null);
					setIsLangOpen((o) => !o);
				}}
				onClose={() => setIsLangOpen(() => false)}
			/>
		</div>
	);
}
