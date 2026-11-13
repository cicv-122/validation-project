import React from 'react';
import { StaffProfile } from '../../../api/staff';

interface StaffTelegramConnectModalProps {
	isOpen: boolean;
	onClose: () => void;
	profile: StaffProfile | null;
	checkingStatus: boolean;
	onCheckStatus: () => void;
}

export const StaffTelegramConnectModal: React.FC<StaffTelegramConnectModalProps> = ({
	isOpen,
	onClose,
	profile,
	checkingStatus,
	onCheckStatus,
}) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4'>
			<div className='bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 text-center'>
				<div className='w-16 h-16 rounded-full bg-[#283375]/10 text-[#283375] flex items-center justify-center mx-auto'>
					<svg className='w-9 h-9 fill-[#283375]' viewBox='0 0 24 24'>
						<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z' />
					</svg>
				</div>

				<div>
					<h3 className='text-xl font-black text-slate-900'>Подключение Telegram-бота</h3>
					<p className='text-xs text-slate-500 mt-1.5 leading-relaxed'>
						Получайте персональные уведомления о новых заявках кандидатов по вашим профессиям
						прямо в Telegram с кнопками быстрых действий.
					</p>
				</div>

				<div className='p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700'>
					<div className='flex items-start gap-2'>
						<span className='font-black text-[#283375]'>1.</span>
						<span>
							Нажмите кнопку <b>«Открыть в Telegram»</b> ниже.
						</span>
					</div>
					<div className='flex items-start gap-2'>
						<span className='font-black text-[#283375]'>2.</span>
						<span>
							В открывшемся боте нажмите <b>Запустить (Start)</b>.
						</span>
					</div>
					<div className='flex items-start gap-2'>
						<span className='font-black text-[#283375]'>3.</span>
						<span>
							Бот автоматически привяжет ваш профиль: <b>{profile?.full_name}</b>.
						</span>
					</div>
				</div>

				<div className='space-y-2 pt-2'>
					<a
						href={profile?.telegram_bot_url}
						target='_blank'
						rel='noreferrer'
						className='w-full py-3.5 px-4 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#283375]/20'
					>
						<svg className='w-5 h-5 fill-white' viewBox='0 0 24 24'>
							<path d='M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z' />
						</svg>
						<span>Открыть в Telegram</span>
					</a>

					<div className='flex items-center gap-2'>
						<button
							type='button'
							onClick={onCheckStatus}
							disabled={checkingStatus}
							className='flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5'
						>
							<svg
								className={`w-3.5 h-3.5 text-slate-500 ${checkingStatus ? 'animate-spin' : ''}`}
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
								/>
							</svg>
							<span>{checkingStatus ? 'Проверка...' : 'Проверить статус'}</span>
						</button>
						<button
							type='button'
							onClick={onClose}
							className='py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer'
						>
							Закрыть
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
