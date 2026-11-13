// frontend/src/shared/ui/input/SearchInput.tsx
import React from 'react';
import { SearchIcon, CloseIcon } from '../icons';

export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	onClear?: () => void;
	placeholder?: string;
	className?: string;
	inputClassName?: string;
	isLoading?: boolean;
	autoFocus?: boolean;
	id?: string;
	size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
	sm: 'py-2 pl-9 pr-8 text-xs rounded-xl',
	md: 'py-2.5 pl-10 pr-9 text-sm rounded-xl',
	lg: 'py-3.5 pl-12 pr-10 text-sm rounded-2xl',
};

const ICON_SIZES = {
	sm: 'w-4 h-4 left-3',
	md: 'w-4 h-4 left-3.5',
	lg: 'w-5 h-5 left-4',
};

const CLEAR_SIZES = {
	sm: 'right-2.5',
	md: 'right-3',
	lg: 'right-3.5',
};

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	onClear,
	placeholder = 'Поиск...',
	className = '',
	inputClassName = '',
	isLoading = false,
	autoFocus = false,
	id,
	size = 'md',
}) => {
	const handleClear = () => {
		onChange('');
		onClear?.();
	};

	return (
		<div className={`relative w-full ${className}`}>
			<div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 ${ICON_SIZES[size]}`}>
				<SearchIcon />
			</div>

			<input
				id={id}
				type="text"
				value={value}
				autoFocus={autoFocus}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={`w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all ${SIZE_STYLES[size]} ${inputClassName}`}
			/>

			{isLoading ? (
				<div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 animate-spin ${CLEAR_SIZES[size]}`}>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				</div>
			) : value ? (
				<button
					type="button"
					onClick={handleClear}
					className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100 cursor-pointer ${CLEAR_SIZES[size]}`}
					aria-label="Очистить поиск"
				>
					<CloseIcon className="w-4 h-4" />
				</button>
			) : null}
		</div>
	);
};
