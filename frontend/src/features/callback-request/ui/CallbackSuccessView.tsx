import React from 'react';
import { useTranslation } from 'react-i18next';

export interface CallbackSuccessViewProps {
	onClose: () => void;
}

export const CallbackSuccessView: React.FC<CallbackSuccessViewProps> = ({ onClose }) => {
	const { t } = useTranslation();

	return (
		<div className='text-center py-4'>
			<h3 className='text-xl font-bold text-gray-900 mb-2'>{t('Заявка принята!')}</h3>
			<p className='text-gray-500 text-sm leading-relaxed'>
				{t(
					'Наш менеджер напишет вам в WhatsApp или позвонит в течение рабочего дня. Мы поможем вам со всеми документами!'
				)}
			</p>
			<button
				onClick={onClose}
				className='mt-6 px-6 py-2.5 bg-[#283375] text-white rounded-xl font-semibold text-sm hover:bg-[#1e2660] transition-colors'
			>
				{t('Закрыть')}
			</button>
		</div>
	);
};
