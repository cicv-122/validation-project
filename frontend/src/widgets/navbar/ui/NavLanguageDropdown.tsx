import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const LANGUAGES = [
	{ code: 'ru', label: 'Русский', flag: '🇷🇺' },
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'ky', label: 'Кыргызча', flag: '🇰🇬' },
];

interface NavLanguageDropdownProps {
	isOpen: boolean;
	onToggle: () => void;
	onClose: () => void;
}

export function NavLanguageDropdown({
	isOpen,
	onToggle,
	onClose,
}: NavLanguageDropdownProps) {
	const { t, i18n } = useTranslation();
	const langDropdownRef = useRef<HTMLDivElement>(null);

	const lang = i18n.language;
	const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

	const handleSelectLang = (code: string) => {
		i18n.changeLanguage(code);
		onClose();
	};

	return (
		<div className='border-l border-white/20 pl-2.5 ml-1 flex items-center h-full flex-shrink-0'>
			<div ref={langDropdownRef} className='relative flex items-center h-full'>
				<button
					type='button'
					onClick={onToggle}
					className='h-10 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl text-white/95 hover:text-white hover:bg-white/10 transition-colors duration-150 font-semibold text-xs lg:text-sm cursor-pointer select-none border border-white/20 shadow-2xs'
					title={t('Сменить язык')}
				>
					<span className='text-sm sm:text-base leading-none'>{currentLang.flag}</span>
					<span className='font-bold whitespace-nowrap'>{currentLang.label}</span>
					<svg
						className={`w-3.5 h-3.5 opacity-80 ml-0.5 transition-transform duration-200 ${
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

				{/* Меню выбора языка (по клику) */}
				{isOpen && (
					<div className='absolute right-0 top-full pt-1.5 z-[100] min-w-[160px]'>
						<div className='bg-white rounded-xl shadow-2xl py-1 border border-slate-200 overflow-hidden'>
							{LANGUAGES.map(({ code, label, flag }) => (
								<button
									key={code}
									type='button'
									onMouseDown={(e) => {
										e.preventDefault();
										handleSelectLang(code);
									}}
									onClick={() => handleSelectLang(code)}
									className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm transition-colors text-left cursor-pointer ${
										lang === code
											? 'bg-blue-50 text-[#283375] font-bold'
											: 'text-slate-700 hover:bg-slate-100 font-medium'
									}`}
								>
									<span className='text-base leading-none'>{flag}</span>
									<span className='flex-1'>{label}</span>
									{lang === code && (
										<svg
											className='w-4 h-4 text-[#283375] flex-shrink-0'
											fill='none'
											stroke='currentColor'
											strokeWidth={2.5}
											viewBox='0 0 24 24'
										>
											<path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
										</svg>
									)}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
