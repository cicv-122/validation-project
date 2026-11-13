import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useKeyPress, useScrollLock } from '../../../shared/lib';
import { CallbackModalProps, CallbackStatus } from '../model/types';
import { submitCallbackRequest } from '../api/callbackApi';
import { CallbackSuccessView } from './CallbackSuccessView';
import { CallbackForm } from './CallbackForm';

export const CallbackModal: React.FC<CallbackModalProps> = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [profession, setProfession] = useState('');
	const [customProfession, setCustomProfession] = useState('');
	const [status, setStatus] = useState<CallbackStatus>('idle');
	const [errorMsg, setErrorMsg] = useState('');
	const firstInputRef = useRef<HTMLInputElement>(null);

	// Focus the first input when modal opens
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => firstInputRef.current?.focus(), 100);
		} else {
			// Reset form on close
			setName('');
			setPhone('');
			setProfession('');
			setCustomProfession('');
			setStatus('idle');
			setErrorMsg('');
		}
	}, [isOpen]);

	// Close on Escape & Lock body scroll when open
	useKeyPress('Escape', onClose, isOpen);
	useScrollLock(isOpen);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('loading');
		setErrorMsg('');

		const finalProfession = profession === 'Другое' ? customProfession : profession;

		try {
			await submitCallbackRequest({
				name,
				phone,
				profession: finalProfession,
			});
			setStatus('success');
		} catch (err) {
			const error = err as { response?: { data?: { detail?: string; phone?: string[] } } };
			const msg =
				error?.response?.data?.detail ||
				error?.response?.data?.phone?.[0] ||
				'Что-то пошло не так. Попробуйте ещё раз или позвоните нам.';
			setErrorMsg(msg);
			setStatus('error');
		}
	};

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 z-[9999] flex items-center justify-center px-4'
			aria-modal='true'
			role='dialog'
			aria-labelledby='callback-modal-title'
		>
			{/* Backdrop */}
			<div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={onClose} />

			{/* Modal card */}
			<div className='relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up'>
				{/* Header */}
				<div className='bg-[#283375] px-7 py-6 text-white'>
					<button
						onClick={onClose}
						className='absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1'
						aria-label='Закрыть'
					>
						<svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
					<div className='flex items-center gap-3 mb-2'>
						<div>
							<h2 id='callback-modal-title' className='text-lg font-extrabold leading-tight'>
								{t('Оставьте номер — мы поможем!')}
							</h2>
							<p className='text-white/75 text-sm mt-0.5'>
								{t('Менеджер ответит на все вопросы и поможет собрать документы')}
							</p>
						</div>
					</div>
				</div>

				{/* Body */}
				<div className='px-7 py-6'>
					{status === 'success' ? (
						<CallbackSuccessView onClose={onClose} />
					) : (
						<CallbackForm
							firstInputRef={firstInputRef}
							name={name}
							setName={setName}
							phone={phone}
							setPhone={setPhone}
							profession={profession}
							setProfession={setProfession}
							customProfession={customProfession}
							setCustomProfession={setCustomProfession}
							status={status}
							errorMsg={errorMsg}
							onSubmit={handleSubmit}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
export default CallbackModal;
