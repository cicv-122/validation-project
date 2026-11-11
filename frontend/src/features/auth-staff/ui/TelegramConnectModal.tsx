// frontend/src/features/auth-staff/ui/TelegramConnectModal.tsx
import React from 'react';
import type { StaffProfile } from '../../../api/staff';

interface TelegramConnectModalProps {
	isOpen: boolean;
	onClose: () => void;
	profile: StaffProfile | null;
	onCheckStatus: () => Promise<void>;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
	isOpen,
	onClose,
	profile,
	onCheckStatus,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
				<div className="w-12 h-12 rounded-2xl bg-[#283375] text-white flex items-center justify-center mx-auto shadow-md">
					<svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
						<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z" />
					</svg>
				</div>
				<div className="text-center space-y-1">
					<h3 className="text-base font-black text-slate-900">
						Подключение Telegram-бота
					</h3>
					<p className="text-xs text-slate-500 leading-relaxed">
						Перейдите в официальный бот ЦНСВ МП КР и нажмите <b>Запустить (Start)</b> для мгновенных уведомлений о новых заявках граждан.
					</p>
				</div>

				<div className="space-y-2 pt-2">
					<a
						href={profile?.telegram_bot_url}
						target="_blank"
						rel="noreferrer"
						className="w-full py-3.5 px-4 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#283375]/20 cursor-pointer"
					>
						<svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
							<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.194 1.006.131.832.922z" />
						</svg>
						<span>Открыть в Telegram</span>
					</a>

					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onCheckStatus}
							className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
						>
							<svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							<span>Проверить статус</span>
						</button>
						<button
							type="button"
							onClick={onClose}
							className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
						>
							Закрыть
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
