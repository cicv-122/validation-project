import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useClickOutside, useScrollLock, useKeyPress } from '../../../shared/lib';

export function useNavState() {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [isCallbackOpen, setIsCallbackOpen] = useState(false);
	const [isLangOpen, setIsLangOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

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

	useClickOutside(navRef, () => {
		setActiveDropdown(null);
		setIsLangOpen(false);
	});

	useScrollLock(isOpen);

	useKeyPress('Escape', () => {
		setIsOpen(false);
		setActiveDropdown(null);
		setIsLangOpen(false);
	});

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

	return {
		navRef,
		location,
		isOpen,
		setIsOpen,
		isCallbackOpen,
		setIsCallbackOpen,
		isLangOpen,
		setIsLangOpen,
		activeDropdown,
		setActiveDropdown,
		toggleDropdown,
		isActive,
		isNewsActive,
		isAboutActive,
		isDbActive,
	};
}
