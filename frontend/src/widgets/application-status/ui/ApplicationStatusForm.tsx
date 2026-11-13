import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ApplicationStatusFormProps {
	regNumber: string;
	setRegNumber: (val: string) => void;
	loading: boolean;
	error: string;
	onCheck: () => void;
	onShowRecovery: () => void;
}

export const ApplicationStatusForm: React.FC<ApplicationStatusFormProps> = ({
	regNumber,
	setRegNumber,
	loading,
	error,
	onCheck,
	onShowRecovery,
}) => {
	const { t } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
			<label className='block text-sm font-medium text-gray-700 mb-2'>
				{t('Регистрационный номер')}
			</label>
			<div className='flex flex-col sm:flex-row gap-3'>
				<input
					type='text'
					value={regNumber}
					onChange={(e) => setRegNumber(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && onCheck()}
					placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
					className='flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono'
				/>
				<button
					onClick={onCheck}
					disabled={loading || !regNumber.trim()}
					className='px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors w-full sm:w-auto flex items-center justify-center'
				>
					{loading ? '...' : t('Проверить')}
				</button>
			</div>
			<div className='mt-3 flex items-center justify-between'>
				{error ? <p className='text-sm text-red-600'>{error}</p> : <span></span>}
				<button
					onClick={onShowRecovery}
					className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'
				>
					{t('Забыли номер?')}
				</button>
			</div>
		</div>
	);
};
