import React from 'react';
import { useTranslation } from 'react-i18next';
import { PROFESSIONS } from '../model/constants';
import { CallbackStatus } from '../model/types';

export interface CallbackFormProps {
	firstInputRef: React.RefObject<HTMLInputElement>;
	name: string;
	setName: (val: string) => void;
	phone: string;
	setPhone: (val: string) => void;
	profession: string;
	setProfession: (val: string) => void;
	customProfession: string;
	setCustomProfession: (val: string) => void;
	status: CallbackStatus;
	errorMsg: string;
	onSubmit: (e: React.FormEvent) => void;
}

export const CallbackForm: React.FC<CallbackFormProps> = ({
	firstInputRef,
	name,
	setName,
	phone,
	setPhone,
	profession,
	setProfession,
	customProfession,
	setCustomProfession,
	status,
	errorMsg,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<form onSubmit={onSubmit} className='space-y-4' noValidate>
			{/* Name */}
			<div>
				<label htmlFor='cb-name' className='block text-sm font-semibold text-gray-700 mb-1.5'>
					{t('Как к вам обращаться?')}
				</label>
				<input
					id='cb-name'
					ref={firstInputRef}
					type='text'
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder={t('Например, Айнура')}
					className='w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all text-base outline-none'
				/>
			</div>

			{/* Phone */}
			<div>
				<label htmlFor='cb-phone' className='block text-sm font-semibold text-gray-700 mb-1.5'>
					{t('Ваш номер телефона (WhatsApp)')}
				</label>
				<input
					id='cb-phone'
					type='tel'
					inputMode='tel'
					required
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					placeholder='+996 555 000 000'
					className='w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all text-base outline-none'
				/>
			</div>

			{/* Profession dropdown */}
			<div>
				<label htmlFor='cb-profession' className='block text-sm font-semibold text-gray-700 mb-1.5'>
					{t('Ваша профессия')}
				</label>
				<select
					id='cb-profession'
					value={profession}
					onChange={(e) => setProfession(e.target.value)}
					className='w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all text-base outline-none appearance-none cursor-pointer'
				>
					<option value=''>{t('Выберите профессию...')}</option>
					{PROFESSIONS.map((p) => (
						<option key={p} value={p}>
							{t(p)}
						</option>
					))}
				</select>
			</div>

			{/* Custom profession if "Другое" selected */}
			{profession === 'Другое' && (
				<div>
					<label htmlFor='cb-custom-profession' className='block text-sm font-semibold text-gray-700 mb-1.5'>
						{t('Укажите вашу профессию')}
					</label>
					<input
						id='cb-custom-profession'
						type='text'
						required
						value={customProfession}
						onChange={(e) => setCustomProfession(e.target.value)}
						placeholder={t('Например, Пекарь')}
						className='w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#283375] focus:border-[#283375] transition-all text-base outline-none'
					/>
				</div>
			)}

			{/* Error */}
			{status === 'error' && (
				<div className='bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm'>
					{errorMsg}
				</div>
			)}

			{/* Submit */}
			<button
				type='submit'
				disabled={status === 'loading' || !name || !phone}
				className='w-full bg-[#283375] hover:bg-[#1e2660] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2'
			>
				{status === 'loading' ? (
					<>
						<svg className='animate-spin h-5 w-5' viewBox='0 0 24 24' fill='none'>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							/>
							<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
						</svg>
						{t('Отправка...')}
					</>
				) : (
					<>{t('Перезвоните мне')}</>
				)}
			</button>

			<p className='text-xs text-center text-gray-400'>
				{t('Нажимая кнопку, вы соглашаетесь на обработку персональных данных.')}
				<br />
				{t('Это бесплатно и ни к чему вас не обязывает.')}
			</p>
		</form>
	);
};
