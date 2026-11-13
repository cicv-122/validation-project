import { Link } from 'react-router-dom';

export interface NavDropdownItemConfig {
	to: string;
	label: string;
	isActive: boolean;
}

interface NavDropdownMenuProps {
	label: string;
	isActive: boolean;
	isOpen: boolean;
	onToggle: () => void;
	items: NavDropdownItemConfig[];
	minWidthClass?: string;
}

const desktopLinkClass = (active: boolean) =>
	active
		? 'bg-white text-[#283375] inline-flex items-center justify-center px-3.5 h-10 text-xs lg:text-sm font-semibold transition-colors duration-150 rounded-xl shadow-xs whitespace-nowrap cursor-pointer select-none'
		: 'text-white/90 hover:text-white hover:bg-white/10 inline-flex items-center justify-center px-3.5 h-10 text-xs lg:text-sm font-semibold transition-colors duration-150 rounded-xl whitespace-nowrap cursor-pointer select-none';

const dropdownItemClass = (active: boolean) =>
	active
		? 'flex items-center justify-between px-3.5 py-2 text-xs lg:text-sm font-semibold text-[#283375] bg-white rounded-xl shadow-xs transition-colors duration-150 cursor-pointer select-none whitespace-nowrap'
		: 'flex items-center justify-between px-3.5 py-2 text-xs lg:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-150 cursor-pointer select-none whitespace-nowrap';

export function NavDropdownMenu({
	label,
	isActive,
	isOpen,
	onToggle,
	items,
	minWidthClass = 'min-w-[210px]',
}: NavDropdownMenuProps) {
	return (
		<div className='relative flex items-center h-full'>
			<button
				type='button'
				onClick={onToggle}
				className={desktopLinkClass(isActive)}
			>
				{label}
				<svg
					className={`ml-1.5 w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${
						isOpen ? 'rotate-180' : ''
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
			{isOpen && (
				<div className={`absolute top-full left-0 pt-1.5 z-50 ${minWidthClass}`}>
					<div
						className='shadow-2xl p-1.5 border border-blue-700/60 rounded-2xl overflow-hidden space-y-1'
						style={{ backgroundColor: '#283375' }}
					>
						{items.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className={dropdownItemClass(item.isActive)}
							>
								<span>{item.label}</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
export { desktopLinkClass, dropdownItemClass };
