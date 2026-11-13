import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ApplicationRecoveryFormProps {
	onBack: () => void;
	recInn: string;
	setRecInn: (val: string) => void;
	recEmail: string;
	setRecEmail: (val: string) => void;
	recLoading: boolean;
	recMessage: { text: string; isError: boolean };
	onRecover: () => void;
}

export const ApplicationRecoveryForm: React.FC<ApplicationRecoveryFormProps> = ({
	onBack,
	recInn,
	setRecInn,
	recEmail,
	setRecEmail,
	recLoading,
	recMessage,
	onRecover,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-blue-500'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-bold text-gray-900'>{t('Восстановление номера')}</h2>
				<button
					onClick={onBack}
					className='text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors'
				>
					{t('Назад')}
				</button>
			</div>
			<p className='text-sm text-gray-500 mb-5 leading-relaxed'>
				{t(
					'Введите данные, указанные при подаче заявки. Мы найдем вашу заявку и отправим регистрационный номер на вашу почту.'
				)}
			</p>
			<div className='space-y-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						{t('Персональный номер')} <span className='text-red-500'>*</span>
					</label>
					<input
						type='text'
						value={recInn}
						onChange={(e) => setRecInn(e.target.value.replace(/\D/g, '').slice(0, 14))}
						placeholder='00000000000000'
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						{t('E-mail')}
					</label>
					<input
						type='email'
						value={recEmail}
						onChange={(e) => setRecEmail(e.target.value)}
						className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
					/>
				</div>
				<button
					onClick={onRecover}
					disabled={recLoading}
					className='w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2'
				>
					{recLoading ? '...' : t('Отправить на почту')}
				</button>
			</div>
			{recMessage.text && (
				<div
					className={`mt-5 p-4 rounded-xl text-sm ${
						recMessage.isError
							? 'bg-red-50 text-red-700 border border-red-200'
							: 'bg-green-50 text-green-700 border border-green-200'
					}`}
				>
					{recMessage.text}
				</div>
			)}
		</div>
	);
};
