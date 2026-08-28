import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { CertifiedUser } from '../types';
import { transliterate } from '../utils/transliterate';
import { translateProfession } from '../utils/translateProfession';

interface Props {
	user: CertifiedUser;
	onClose: () => void;
}

export default function CertifiedUserModal({ user, onClose }: Props) {
	const { t, i18n } = useTranslation();

	// Close on Escape key
	const handleKey = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		},
		[onClose]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKey);
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', handleKey);
			document.body.style.overflow = '';
		};
	}, [handleKey]);

	const issuedDate = user.issued_date
		? new Date(user.issued_date).toLocaleDateString(
				i18n.language === 'en' ? 'en-US' : i18n.language === 'ky' ? 'ky-KG' : 'ru-RU',
				{
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				}
		  )
		: null;

	return (
		/* Backdrop */
		<div
			className='fixed inset-0 z-[200] flex items-center justify-center p-4'
			style={{ backgroundColor: 'rgba(10, 15, 40, 0.7)', backdropFilter: 'blur(6px)' }}
			onClick={onClose}
		>
			{/* Modal card */}
			<div
				className='relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden'
				style={{ animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* ── Top green stripe ── */}
				<div className='bg-gradient-to-r from-green-500 to-emerald-400 px-6 py-3 flex items-center justify-between'>
					<div className='flex items-center gap-2 text-white font-bold text-sm'>
						<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
						</svg>
						{t('Сертификат подтверждён')}
					</div>
					<button
						onClick={onClose}
						className='w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors'
						aria-label='Закрыть'
					>
						<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M6 18L18 6M6 6l12 12' />
						</svg>
					</button>
				</div>

				{/* ── Body ── */}
				<div className='p-6 sm:p-8'>
					<div className='flex flex-col sm:flex-row gap-6'>

						{/* Left: photo */}
						<div className='flex-shrink-0 flex flex-col items-center gap-3'>
							<div className='w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-md bg-gray-100 flex items-center justify-center'>
								{user.image ? (
									<img src={user.image} alt={i18n.language === 'en' ? transliterate(user.full_name) : user.full_name} className='w-full h-full object-cover object-top' />
								) : (
									<svg className='w-16 h-16 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
									</svg>
								)}
							</div>

							{/* QR code */}
							{user.qr_code && (
								<div className='flex flex-col items-center gap-1'>
									<img
										src={user.qr_code}
										alt='QR'
										className='w-24 h-24 rounded-xl border border-gray-200 shadow-sm'
									/>
									<p className='text-[10px] text-gray-400 font-medium'>{t('QR для проверки')}</p>
								</div>
							)}
						</div>

						{/* Right: info */}
						<div className='flex-1 min-w-0'>
							<h2 className='text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight mb-1'>
								{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
							</h2>

							{user.profession && (
								<p className='text-sm font-semibold text-[#283375] mb-5 leading-snug'>
									{translateProfession(user.profession, i18n.language)}
								</p>
							)}

							<div className='space-y-3'>
								{/* Reg number */}
								<div className='bg-blue-50 border border-blue-100 rounded-xl px-4 py-3'>
									<p className='text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-0.5'>
										{t('Регистрационный номер')}
									</p>
									<p className='text-base font-mono font-bold text-gray-900'>
										{user.registration_number}
									</p>
								</div>

								{/* Date */}
								{issuedDate && (
									<div className='bg-gray-50 border border-gray-100 rounded-xl px-4 py-3'>
										<p className='text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5'>
											{t('Дата выдачи')}
										</p>
										<p className='text-sm font-semibold text-gray-800'>{issuedDate}</p>
									</div>
								)}

								{/* Issuer */}
								<div className='bg-gray-50 border border-gray-100 rounded-xl px-4 py-3'>
									<p className='text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5'>
										{t('Выдан')}
									</p>
									<p className='text-xs font-medium text-gray-700 leading-snug'>
										{t('Центр независимой сертификации и валидации при МП КР')}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Related News Articles */}
					{user.news_articles && user.news_articles.length > 0 && (
						<div className='mt-6 border-t border-gray-100 pt-5'>
							<p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5'>
								<svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
								</svg>
								{t('Упоминания в публикациях')}
							</p>
							<div className='space-y-2 max-h-40 overflow-y-auto pr-1'>
								{user.news_articles.map((news) => (
									<Link
										key={news.id}
										to={`/news/${news.slug}`}
										onClick={onClose}
										className='block bg-blue-50/60 hover:bg-blue-100/80 border border-blue-100 rounded-xl p-2.5 transition-colors group'
									>
										<div className='flex items-center justify-between gap-2'>
											<span className='text-xs font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-1'>
												{news.title}
											</span>
											<svg className='w-3.5 h-3.5 text-blue-500 flex-shrink-0 group-hover:translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
											</svg>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}
				</div>

				{/* ── Footer ── */}
				<div className='border-t border-gray-100 bg-gray-50 px-6 sm:px-8 py-4 flex items-center justify-between gap-3'>
					<p className='text-xs text-gray-400'>
						{t('Нажмите Esc или вне окна, чтобы закрыть')}
					</p>
					<Link
						to={`/verify/${encodeURIComponent(user.registration_number)}`}
						state={{ fromPage: true }}
						onClick={() => {
							sessionStorage.setItem('certified_users_scroll', window.scrollY.toString());
						}}
						className='flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#283375] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3 py-2 rounded-xl transition-colors'
					>
						<svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
						</svg>
						{t('Открыть страницу')}
					</Link>
				</div>
			</div>

			<style>{`
				@keyframes modalIn {
					from { opacity: 0; transform: scale(0.88) translateY(16px); }
					to   { opacity: 1; transform: scale(1)   translateY(0); }
				}
			`}</style>
		</div>
	);
}
