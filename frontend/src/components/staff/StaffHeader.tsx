// frontend/src/components/staff/StaffHeader.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StaffProfile, staffApi } from '../../api/staff';
import logoEmblem from '../../assets/logo/logo-blue-white-ru.svg';

interface StaffHeaderProps {
	profile: StaffProfile | null;
	isDossier?: boolean;
	candidateNumber?: string;
	onDisconnectTelegram?: () => void;
	onConnectTelegram?: () => void;
	onProfileUpdated?: (profile: StaffProfile) => void;
}

function getInitials(name: string): string {
	if (!name) return 'ЦН';
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function StaffHeader({
	profile,
	isDossier = false,
	onDisconnectTelegram,
	onConnectTelegram,
	onProfileUpdated,
}: StaffHeaderProps) {
	const navigate = useNavigate();
	const [showLocalModal, setShowLocalModal] = useState(false);
	const [checkingStatus, setCheckingStatus] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	// Закрытие меню при клике вне его области
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleLogout = () => {
		staffApi.logout();
		navigate('/staff/login');
	};

	const handleConnectClick = () => {
		if (onConnectTelegram) {
			onConnectTelegram();
		} else {
			setShowLocalModal(true);
		}
	};

	const handleDisconnectClick = async () => {
		if (onDisconnectTelegram) {
			onDisconnectTelegram();
			return;
		}
		if (!confirm('Вы действительно хотите отключить получение уведомлений в Telegram?')) return;
		try {
			await staffApi.disconnectTelegram();
			const updated = await staffApi.getProfile();
			if (onProfileUpdated) onProfileUpdated(updated);
		} catch {
			alert('Ошибка при отключении Telegram');
		}
	};

	const handleCheckStatus = async () => {
		setCheckingStatus(true);
		try {
			const updated = await staffApi.getProfile();
			if (onProfileUpdated) onProfileUpdated(updated);
			if (updated.is_telegram_connected) {
				setShowLocalModal(false);
			}
		} finally {
			setCheckingStatus(false);
		}
	};

	return (
		<>
			<header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						{/* Левая часть: Символика, ведомство и заголовок кабинета */}
						{isDossier ? (
							<Link
								to="/staff/dashboard"
								title="Вернуться в рабочий кабинет"
								className="flex items-center gap-3 group cursor-pointer select-none flex-shrink-0"
							>
								<div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs flex-shrink-0 group-hover:scale-105 group-hover:border-[#283375]/40 transition-all">
									<img
										src={logoEmblem}
										alt="Логотип ЦНСВ"
										className="w-full h-full object-contain"
									/>
								</div>
								<div>
									<div className="flex items-center gap-1.5 whitespace-nowrap leading-none">
										<span className="text-[10px] sm:text-[11px] uppercase font-bold text-[#283375] tracking-wide">
											Министерство просвещения Кыргызской Республики
										</span>
										<span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
										<span className="text-[10px] sm:text-[11px] font-bold text-slate-400">ЦНСВ</span>
									</div>
									<h1 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#283375] tracking-tight leading-snug mt-0.5 transition-colors whitespace-nowrap">
										Дело сертифицированного специалиста
									</h1>
								</div>
							</Link>
						) : (
							<div className="flex items-center gap-3 select-none flex-shrink-0">
								<div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-2xs flex-shrink-0">
									<img
										src={logoEmblem}
										alt="Логотип ЦНСВ"
										className="w-full h-full object-contain"
									/>
								</div>
								<div>
									<div className="flex items-center gap-1.5 whitespace-nowrap leading-none">
										<span className="text-[10px] sm:text-[11px] uppercase font-bold text-[#283375] tracking-wide">
											Министерство просвещения Кыргызской Республики
										</span>
										<span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
										<span className="text-[10px] sm:text-[11px] font-bold text-slate-400">ЦНСВ</span>
									</div>
									<h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug mt-0.5 whitespace-nowrap">
										Рабочий кабинет сотрудника
									</h1>
								</div>
							</div>
						)}

						{/* Правая часть: Профиль сотрудника и кнопка действий с 3 точками ⋮ */}
						<div
							ref={menuRef}
							className="relative flex items-center justify-end gap-2 sm:gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 flex-shrink-0"
						>
							{/* Карточка сотрудника (Аватар, ФИО, Роль, Онлайн) */}
							<div
								onClick={() => setIsMenuOpen((prev) => !prev)}
								className="flex items-center gap-2.5 cursor-pointer select-none group"
								title="Меню профиля"
							>
								<div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#283375] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-2xs relative flex-shrink-0 group-hover:ring-2 group-hover:ring-[#283375]/30 transition-all">
									{getInitials(profile?.full_name || '')}
									<span
										className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-white"
										title="В сети"
									/>
								</div>
								<div className="text-left">
									<div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight whitespace-nowrap group-hover:text-[#283375] transition-colors">
										{profile?.full_name || profile?.username || 'Сотрудник'}
									</div>
									<div className="flex items-center gap-1.5 mt-0.5">
										<span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
											{profile?.role_display || 'Сотрудник / Координатор'}
										</span>
										<span className="text-[9px] font-extrabold bg-slate-100 text-[#283375] px-1.5 py-0.2 rounded-full border border-slate-200 whitespace-nowrap">
											Онлайн
										</span>
										{profile?.is_telegram_connected && (
											<span
												className="inline-flex items-center text-[9px] font-extrabold text-[#283375] bg-[#283375]/10 px-1 py-0.2 rounded"
												title="Telegram подключен"
											>
												TG
											</span>
										)}
									</div>
								</div>
							</div>

							{/* Кнопка с тремя точками ⋮ (kebab-menu) */}
							<button
								type="button"
								onClick={() => setIsMenuOpen((prev) => !prev)}
								className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
									isMenuOpen
										? 'bg-slate-100 border-slate-300 text-[#283375] shadow-xs'
										: 'border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
								}`}
								title="Действия аккаунта"
								aria-label="Действия аккаунта"
							>
								<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
								</svg>
							</button>

							{/* Выпадающее меню действий (в стиле YouTube/Tailwind) */}
							{isMenuOpen && (
								<div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-left select-none animate-in fade-in zoom-in-95 duration-100">
									{/* Блок Telegram */}
									{profile?.is_telegram_connected ? (
										<div className="px-3 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100/90 mb-1">
											<div className="flex items-center justify-between mb-1.5">
												<div className="flex items-center gap-2 min-w-0">
													<svg className="w-4 h-4 fill-[#283375] flex-shrink-0" viewBox="0 0 24 24">
														<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z" />
													</svg>
													<span className="text-xs font-bold text-[#283375] font-mono truncate">
														{profile.telegram_username ? `@${profile.telegram_username}` : 'Telegram'}
													</span>
												</div>
												<span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
													Активен
												</span>
											</div>
											<button
												type="button"
												onClick={() => {
													setIsMenuOpen(false);
													handleDisconnectClick();
												}}
												className="text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50/80 px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer w-full text-left flex items-center gap-1.5"
											>
												<span>✕</span>
												<span>Отключить Telegram-уведомления</span>
											</button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => {
												setIsMenuOpen(false);
												handleConnectClick();
											}}
											className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#283375]/5 text-slate-800 transition-colors group cursor-pointer text-left mb-1"
										>
											<div className="w-8 h-8 rounded-xl bg-[#283375] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
												<svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24">
													<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z" />
												</svg>
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#283375]">
													Подключить Telegram
												</div>
												<div className="text-[11px] text-slate-500">
													Уведомления о новых заявках
												</div>
											</div>
										</button>
									)}

									{/* Разделитель */}
									<div className="my-1 border-t border-slate-100" />

									{/* Кнопка выхода */}
									<button
										type="button"
										onClick={() => {
											setIsMenuOpen(false);
											handleLogout();
										}}
										className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors group cursor-pointer text-left"
									>
										<div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-red-100 text-slate-500 group-hover:text-red-600 flex items-center justify-center flex-shrink-0 transition-colors">
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
											</svg>
										</div>
										<div className="text-xs sm:text-sm font-bold">
											Выйти из кабинета
										</div>
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			{showLocalModal && (
				<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
					<div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 text-center">
						<div className="w-16 h-16 rounded-full bg-[#283375]/10 text-[#283375] flex items-center justify-center mx-auto">
							<svg className="w-9 h-9 fill-[#283375]" viewBox="0 0 24 24">
								<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z"/>
							</svg>
						</div>

						<div>
							<h3 className="text-xl font-black text-slate-900">
								Подключение Telegram-бота
							</h3>
							<p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
								Получайте персональные уведомления о новых заявках кандидатов по вашим профессиям прямо в Telegram с кнопками быстрых действий.
							</p>
						</div>

						<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
							<div className="flex items-start gap-2">
								<span className="font-black text-[#283375]">1.</span>
								<span>Нажмите кнопку <b>«Открыть в Telegram»</b> ниже.</span>
							</div>
							<div className="flex items-start gap-2">
								<span className="font-black text-[#283375]">2.</span>
								<span>В открывшемся боте нажмите <b>Запустить (Start)</b>.</span>
							</div>
							<div className="flex items-start gap-2">
								<span className="font-black text-[#283375]">3.</span>
								<span>Бот автоматически привяжет ваш профиль: <b>{profile?.full_name}</b>.</span>
							</div>
						</div>

						<div className="space-y-2 pt-2">
							<a
								href={profile?.telegram_bot_url}
								target="_blank"
								rel="noreferrer"
								className="w-full py-3.5 px-4 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#283375]/20"
							>
								<svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
									<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z"/>
								</svg>
								<span>Открыть в Telegram</span>
							</a>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handleCheckStatus}
									disabled={checkingStatus}
									className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
								>
									<svg className={`w-3.5 h-3.5 text-slate-500 ${checkingStatus ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									<span>{checkingStatus ? 'Проверка...' : 'Проверить статус'}</span>
								</button>
								<button
									type="button"
									onClick={() => setShowLocalModal(false)}
									className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
								>
									Закрыть
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
