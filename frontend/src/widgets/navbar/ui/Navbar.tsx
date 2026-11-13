import { CallbackModal } from '../../../components/ui';
import { useNavState } from '../model/useNavState';
import { NavDesktopMenu } from './NavDesktopMenu';
import { NavMobileDrawer } from './NavMobileDrawer';

export function Navbar() {
	const {
		navRef,
		isOpen,
		setIsOpen,
		isCallbackOpen,
		setIsCallbackOpen,
		isLangOpen,
		setIsLangOpen,
		activeDropdown,
		setActiveDropdown,
		toggleDropdown,
		isNewsActive,
		isAboutActive,
		isDbActive,
	} = useNavState();

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
						<NavDesktopMenu
							activeDropdown={activeDropdown}
							toggleDropdown={toggleDropdown}
							setActiveDropdown={setActiveDropdown}
							isNewsActive={isNewsActive}
							isAboutActive={isAboutActive}
							isDbActive={isDbActive}
							isCallbackOpen={isCallbackOpen}
							setIsCallbackOpen={setIsCallbackOpen}
							isLangOpen={isLangOpen}
							setIsLangOpen={setIsLangOpen}
						/>

						{/* Mobile hamburger button */}
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
