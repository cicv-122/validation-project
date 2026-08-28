import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';

const PROFESSIONS = [
	'Повар',
	'Швея / Портной',
	'Сварщик',
	'Электрик',
	'Сантехник',
	'Водитель',
	'Строитель',
	'Парикмахер',
	'Кондитер',
	'Автомеханик',
	'Плиточник',
	'Плотник',
	'Косметолог',
	'Медицинская сестра',
	'Воспитатель',
	'Другое',
];

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function CallbackModal({ isOpen, onClose }: Props) {
	const { t } = useTranslation();
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [profession, setProfession] = useState('');
	const [customProfession, setCustomProfession] = useState('');
	const [status, setStatus] = useState<Status>('idle');
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

	// Close on Escape
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		if (isOpen) window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	// Read UTM params from URL
	const getUtmParams = () => {
		const p = new URLSearchParams(window.location.search);
		return {
			utm_source: p.get('utm_source') || '',
			utm_medium: p.get('utm_medium') || '',
			utm_campaign: p.get('utm_campaign') || '',
			utm_term: p.get('utm_term') || '',
			utm_content: p.get('utm_content') || '',
		};
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('loading');
		setErrorMsg('');

		const finalProfession = profession === 'Другое' ? customProfession : profession;

		try {
			await apiClient.post('/certification/callback/', {
				name,
				phone,
				profession: finalProfession,
				...getUtmParams(),
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
					) : (
						<form onSubmit={handleSubmit} className='space-y-4' noValidate>
							{/* Name */}
							<div>
								<label
									htmlFor='cb-name'
									className='block text-sm font-semibold text-gray-700 mb-1.5'
								>
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
								<label
									htmlFor='cb-phone'
									className='block text-sm font-semibold text-gray-700 mb-1.5'
								>
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
								<label
									htmlFor='cb-profession'
									className='block text-sm font-semibold text-gray-700 mb-1.5'
								>
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
									<label
										htmlFor='cb-custom-profession'
										className='block text-sm font-semibold text-gray-700 mb-1.5'
									>
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
					)}
				</div>
			</div>
		</div>
	);
}
