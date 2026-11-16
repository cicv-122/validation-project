import React, { useRef, useState } from 'react';
import { StaffProfile } from '../../../api/staff';
import { useClickOutside, useKeyPress } from '../../../shared/lib';
import { ManageProfessionsModal } from '../../../features/professions-management/ui/ManageProfessionsModal';
import { ManageExpertsModal } from '../../../features/experts-management/ui/ManageExpertsModal';

interface StaffProfileMenuProps {
	profile: StaffProfile | null;
	onLogout: () => void;
	onConnectTelegram: () => void;
	onDisconnectTelegram: () => void;
}

function getInitials(name: string): string {
	if (!name) return 'ЦН';
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const StaffProfileMenu: React.FC<StaffProfileMenuProps> = ({
	profile,
	onLogout,
	onConnectTelegram,
	onDisconnectTelegram,
}) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isProfessionsModalOpen, setIsProfessionsModalOpen] = useState(false);
	const [isExpertsModalOpen, setIsExpertsModalOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Закрытие меню при клике вне его области или по Escape
	useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);
	useKeyPress('Escape', () => setIsMenuOpen(false), isMenuOpen);

	return (
		<div
			ref={menuRef}
			className='relative flex items-center justify-end gap-2 sm:gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 flex-shrink-0'
		>
			{/* Карточка сотрудника (Аватар, ФИО, Роль, Онлайн) */}
			<div
				onClick={() => setIsMenuOpen((prev) => !prev)}
				className='flex items-center gap-2.5 cursor-pointer select-none group'
				title='Меню профиля'
			>
				<div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#283375] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-2xs relative flex-shrink-0 group-hover:ring-2 group-hover:ring-[#283375]/30 transition-all'>
					{getInitials(profile?.full_name || '')}
					<span
						className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white'
						title='В сети'
					/>
				</div>
				<div className='text-left'>
					<div className='text-xs sm:text-sm font-bold text-slate-900 leading-tight whitespace-nowrap group-hover:text-[#283375] transition-colors'>
						{profile?.full_name || profile?.username || 'Сотрудник'}
					</div>
					<div className='flex items-center gap-1.5 mt-0.5'>
						<span className='text-[11px] font-medium text-slate-500 whitespace-nowrap'>
							{profile?.role_display || 'Сотрудник / Координатор'}
						</span>
						<span className='text-[9px] font-extrabold bg-slate-100 text-[#283375] px-1.5 py-0.2 rounded-full border border-slate-200 whitespace-nowrap'>
							Онлайн
						</span>
						{profile?.is_telegram_connected && (
							<span
								className='inline-flex items-center text-[9px] font-extrabold text-[#283375] bg-[#283375]/10 px-1 py-0.2 rounded'
								title='Telegram подключен'
							>
								TG
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Кнопка с тремя точками ⋮ (kebab-menu) */}
			<button
				type='button'
				onClick={() => setIsMenuOpen((prev) => !prev)}
				className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
					isMenuOpen
						? 'bg-slate-100 border-slate-300 text-[#283375] shadow-xs'
						: 'border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
				}`}
				title='Действия аккаунта'
				aria-label='Действия аккаунта'
			>
				<svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
					<path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
				</svg>
			</button>

			{/* Выпадающее меню действий */}
			{isMenuOpen && (
				<div className='absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-left select-none animate-in fade-in zoom-in-95 duration-100'>
					{/* Блок Telegram */}
					{profile?.is_telegram_connected ? (
						<div className='px-3 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100/90 mb-1'>
							<div className='flex items-center justify-between mb-1.5'>
								<div className='flex items-center gap-2 min-w-0'>
									<svg className='w-4 h-4 fill-[#283375] flex-shrink-0' viewBox='0 0 24 24'>
										<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z' />
									</svg>
									<span className='text-xs font-bold text-[#283375] font-mono truncate'>
										{profile.telegram_username
											? `@${profile.telegram_username}`
											: 'Telegram'}
									</span>
								</div>
								<span className='text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0'>
									<span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
									Активен
								</span>
							</div>
							<button
								type='button'
								onClick={() => {
									setIsMenuOpen(false);
									onDisconnectTelegram();
								}}
								className='text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50/80 px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer w-full text-left flex items-center gap-1.5'
							>
								<span>✕</span>
								<span>Отключить Telegram-уведомления</span>
							</button>
						</div>
					) : (
						<button
							type='button'
							onClick={() => {
								setIsMenuOpen(false);
								onConnectTelegram();
							}}
							className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#283375]/5 text-slate-800 transition-colors group cursor-pointer text-left mb-1'
						>
							<div className='w-8 h-8 rounded-xl bg-[#283375] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs'>
								<svg className='w-4 h-4 fill-white flex-shrink-0' viewBox='0 0 24 24'>
									<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z' />
								</svg>
							</div>
							<div className='flex-1 min-w-0'>
								<div className='text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#283375]'>
									Подключить Telegram
								</div>
								<div className='text-[11px] text-slate-500'>
									Уведомления о новых заявках
								</div>
							</div>
						</button>
					)}

					{/* Справочник утверждённых профессий */}
					<button
						type='button'
						onClick={() => {
							setIsMenuOpen(false);
							setIsProfessionsModalOpen(true);
						}}
						className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#283375]/5 text-slate-800 transition-colors group cursor-pointer text-left mb-1'
					>
						<div className='w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
							</svg>
						</div>
						<div className='flex-1 min-w-0'>
							<div className='text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#283375]'>
								Список профессий
							</div>
							<div className='text-[11px] text-slate-500'>
								Реестр профессий и закрепление экспертов
							</div>
						</div>
					</button>

					{/* База аттестованных экспертов */}
					<button
						type='button'
						onClick={() => {
							setIsMenuOpen(false);
							setIsExpertsModalOpen(true);
						}}
						className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#283375]/5 text-slate-800 transition-colors group cursor-pointer text-left mb-1'
					>
						<div className='w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
							</svg>
						</div>
						<div className='flex-1 min-w-0'>
							<div className='text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#283375]'>
								Список экспертов
							</div>
							<div className='text-[11px] text-slate-500'>
								База экспертов и привязка к площадкам
							</div>
						</div>
					</button>

					{/* Разделитель */}
					<div className='my-1 border-t border-slate-100' />

					{/* Кнопка выхода */}
					<button
						type='button'
						onClick={() => {
							setIsMenuOpen(false);
							onLogout();
						}}
						className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors group cursor-pointer text-left'
					>
						<div className='w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-red-100 text-slate-500 group-hover:text-red-600 flex items-center justify-center flex-shrink-0 transition-colors'>
							<svg
								className='w-4 h-4'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
								/>
							</svg>
						</div>
						<div className='text-xs sm:text-sm font-bold'>Выйти из кабинета</div>
					</button>
				</div>
			)}

			{/* Модальное окно управления профессиями */}
			<ManageProfessionsModal
				isOpen={isProfessionsModalOpen}
				onClose={() => setIsProfessionsModalOpen(false)}
			/>

			{/* Модальное окно управления экспертами */}
			<ManageExpertsModal
				isOpen={isExpertsModalOpen}
				onClose={() => setIsExpertsModalOpen(false)}
			/>
		</div>
	);
};
