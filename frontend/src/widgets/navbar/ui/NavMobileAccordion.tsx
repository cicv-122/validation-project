import { Link } from 'react-router-dom';

interface AccordionItem {
	to: string;
	label: string;
	isActive: boolean;
}

interface NavMobileAccordionProps {
	title: string;
	isSectionActive: boolean;
	isOpen: boolean;
	onToggle: () => void;
	items: AccordionItem[];
	onClose: () => void;
	mobileLinkClass: (active: boolean) => string;
}

export function NavMobileAccordion({
	title,
	isSectionActive,
	isOpen,
	onToggle,
	items,
	onClose,
	mobileLinkClass,
}: NavMobileAccordionProps) {
	return (
		<div className='bg-white/5 rounded-2xl p-1.5 border border-white/5 space-y-1'>
			<button
				type='button'
				onClick={onToggle}
				className='w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-blue-200 uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer select-none'
			>
				<span className='flex items-center gap-2'>
					<span
						className={`w-1.5 h-1.5 rounded-full ${
							isSectionActive ? 'bg-amber-400' : 'bg-transparent'
						}`}
					/>
					{title}
				</span>
				<svg
					className={`w-4 h-4 opacity-75 transition-transform duration-200 ${
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
						d='M19 9l-7 7-7-7'
					/>
				</svg>
			</button>
			{isOpen && (
				<div className='space-y-1 pl-2 border-l-2 border-white/15 ml-2.5 my-1'>
					{items.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							onClick={onClose}
							className={mobileLinkClass(item.isActive)}
						>
							{item.label}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
