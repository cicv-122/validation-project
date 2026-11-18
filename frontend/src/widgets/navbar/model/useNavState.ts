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

	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

	// При смене страницы всегда закрываем выпадающие меню
	useEffect(() => {
		setActiveDropdown(null);
		setIsLangOpen(false);
	}, [location.pathname]);

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
