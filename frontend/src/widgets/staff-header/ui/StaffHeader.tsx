import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffProfile, staffApi } from '../../../api/staff';
import { StaffBrandHeader } from './StaffBrandHeader';
import { StaffProfileMenu } from './StaffProfileMenu';
import { StaffTelegramConnectModal } from './StaffTelegramConnectModal';

export interface StaffHeaderProps {
	profile: StaffProfile | null;
	isDossier?: boolean;
	candidateNumber?: string;
	onDisconnectTelegram?: () => void;
	onConnectTelegram?: () => void;
	onProfileUpdated?: (profile: StaffProfile) => void;
}

export const StaffHeader: React.FC<StaffHeaderProps> = ({
	profile,
	isDossier = false,
	onDisconnectTelegram,
	onConnectTelegram,
	onProfileUpdated,
}) => {
	const navigate = useNavigate();
	const [showLocalModal, setShowLocalModal] = useState(false);
	const [checkingStatus, setCheckingStatus] = useState(false);

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
			<header className='bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-30'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4'>
					<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
						<StaffBrandHeader isDossier={isDossier} />

						<StaffProfileMenu
							profile={profile}
							onLogout={handleLogout}
							onConnectTelegram={handleConnectClick}
							onDisconnectTelegram={handleDisconnectClick}
						/>
					</div>
				</div>
			</header>

			<StaffTelegramConnectModal
				isOpen={showLocalModal}
				onClose={() => setShowLocalModal(false)}
				profile={profile}
				checkingStatus={checkingStatus}
				onCheckStatus={handleCheckStatus}
			/>
		</>
	);
};

export default StaffHeader;
