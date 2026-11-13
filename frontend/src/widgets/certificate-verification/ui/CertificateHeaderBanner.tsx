import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import emblemKyrgyzstan from '../../../assets/logo/emblem-kyrgyzstan.svg';

interface CertificateHeaderBannerProps {
	registrationNumber: string;
}

export function CertificateHeaderBanner({ registrationNumber }: CertificateHeaderBannerProps) {
	const { t, i18n } = useTranslation();
	const [copied, setCopied] = useState(false);

	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	return (
		<>
			{/* 1. ПАРАДНАЯ ГОСУДАРСТВЕННАЯ ШАПКА */}
			<div className='bg-gradient-to-r from-[#172052] via-[#283375] to-[#1c2557] text-white p-6 sm:p-8 border-b-4 border-amber-400'>
				<div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6'>
					<div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left'>
						<img
							src={emblemKyrgyzstan}
							alt='Герб Кыргызской Республики'
							className='w-16 h-16 sm:w-20 sm:h-20 object-contain flex-shrink-0 drop-shadow-md'
						/>
						<div>
							<div className='text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-amber-300'>
								{i18n.language === 'ky'
									? 'Кыргыз Республикасынын Агартуу министрлиги'
									: i18n.language === 'en'
									? 'Ministry of Education of the Kyrgyz Republic'
									: 'Министерство просвещения Кыргызской Республики'}
							</div>
							<h1 className='text-lg sm:text-2xl font-black tracking-tight text-white mt-1 leading-snug'>
								{t('Центр независимой сертификации и валидации')}
							</h1>
							<div className='text-xs text-blue-100 font-medium mt-1 flex items-center justify-center sm:justify-start gap-2 flex-wrap'>
								<span className='inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
								<span>{t('Единый государственный реестр выданных сертификатов квалификации')}</span>
							</div>
						</div>
					</div>

					{/* Номер бланка строгой отчетности */}
					<div className='flex flex-col items-center sm:items-end justify-center bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl px-5 py-3 flex-shrink-0 shadow-inner'>
						<span className='text-[10px] uppercase font-bold text-amber-300 tracking-wider'>
							{t('Бланк строгой отчетности')}
						</span>
						<span className='text-lg sm:text-xl font-black font-mono tracking-wider text-white mt-0.5'>
							{registrationNumber}
						</span>
					</div>
				</div>
			</div>

			{/* 2. ЗЕЛЕНАЯ ЗАЩИТНАЯ ЛЕНТА ПОДЛИННОСТИ */}
			<div className='bg-[#0d8a55] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner'>
				<div className='flex items-center gap-2.5 font-bold text-sm sm:text-base'>
					<div className='w-6 h-6 rounded-full bg-white text-[#0d8a55] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs'>
						✓
					</div>
					<span>{t('ДОКУМЕНТ ПОДЛИННЫЙ И ДЕЙСТВИТЕЛЕН')}</span>
					<span className='hidden md:inline-block text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold ml-1'>
						{t('Зарегистрирован в реестре ЦНСВ МП КР')}
					</span>
				</div>

				<div className='flex items-center gap-2 text-xs'>
					<button
						type='button'
						onClick={handleCopyLink}
						className='inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-full font-bold transition-all cursor-pointer print:hidden'
					>
						<svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
						</svg>
						<span>{copied ? `✓ ${t('Скопировано')}` : t('Ссылка')}</span>
					</button>

					<button
						type='button'
						onClick={() => window.print()}
						className='inline-flex items-center gap-1.5 px-3.5 py-1 bg-white hover:bg-emerald-50 text-emerald-900 rounded-full font-bold shadow-xs transition-colors cursor-pointer print:hidden'
					>
						<svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
						</svg>
						<span>{t('Печать выписки')}</span>
					</button>
				</div>
			</div>
		</>
	);
}
