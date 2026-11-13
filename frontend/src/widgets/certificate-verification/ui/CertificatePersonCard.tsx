import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CertifiedUser } from '../../../types';
import { translateProfession } from '../../../utils/translateProfession';
import { transliterate } from '../../../utils/transliterate';

interface CertificatePersonCardProps {
	user: CertifiedUser;
	activeInn?: string;
}

export function CertificatePersonCard({ user, activeInn }: CertificatePersonCardProps) {
	const { t, i18n } = useTranslation();
	const [qrError, setQrError] = useState(false);

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return '—';
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString(
				i18n.language === 'en' ? 'en-US' : i18n.language === 'ky' ? 'ky-KG' : 'ru-RU',
				{ day: 'numeric', month: 'long', year: 'numeric' }
			);
		} catch {
			return dateStr;
		}
	};

	return (
		<div className='space-y-6'>
			{/* Фото, ФИО и официальный QR-код */}
			<div className='flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b border-slate-200 pb-8'>
				{/* Фотография 3×4 */}
				<div className='flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 text-center sm:text-left'>
					{user.image && (
						<div className='relative flex-shrink-0'>
							<img
								src={user.image}
								alt={user.full_name}
								className='w-28 h-36 sm:w-32 sm:h-40 rounded-2xl object-cover border-2 border-slate-300 shadow-md'
							/>
							<span
								className='absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md'
								title={t('Личность подтверждена в государственном реестре')}
							>
								<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
								</svg>
							</span>
						</div>
					)}

					{/* Имя и квалификация */}
					<div className='flex-1'>
						<span className='text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1'>
							{t('Владелец государственного сертификата')}
						</span>
						<h2 className='text-2xl sm:text-3xl font-black text-slate-900 leading-tight'>
							{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
						</h2>
						{i18n.language === 'en' && (
							<span className='text-xs font-semibold text-slate-400 block mt-0.5'>
								{user.full_name}
							</span>
						)}

						<div className='inline-flex items-center gap-1.5 mt-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold'>
							<span>✓</span>
							<span>{t('Личность подтверждена в государственном реестре')}</span>
						</div>

						{/* Профессия / Квалификация */}
						<div className='mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left'>
							<span className='text-[10px] font-extrabold uppercase tracking-wider text-[#283375] block'>
								{t('Присвоенная профессия и квалификация:')}
							</span>
							<div className='text-lg sm:text-xl font-black text-[#283375] mt-0.5 leading-snug'>
								{translateProfession(user.profession, i18n.language)}
							</div>

							{user.assessment_details?.qualification_level && (
								<div className='text-xs font-bold text-slate-700 mt-1 flex items-center gap-2'>
									<span className='px-2.5 py-0.5 rounded-md bg-white border border-blue-200 text-[#283375]'>
										{t(user.assessment_details.qualification_level)}
									</span>
									{user.assessment_details.specialization && (
										<span className='text-slate-600'>
											{t('Специализация:')} <b>{t(user.assessment_details.specialization)}</b>
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* QR-код бланка */}
				<div className='flex flex-col items-center justify-center p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl flex-shrink-0 shadow-xs self-center sm:self-auto'>
					<img
						src={
							!qrError && user.qr_code
								? user.qr_code
								: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=2&data=${encodeURIComponent(
										window.location.href
								  )}`
						}
						alt='QR-код документа'
						onError={() => setQrError(true)}
						className='w-28 h-28 object-contain rounded-lg bg-white p-1'
					/>
					<span className='text-[9px] text-slate-500 font-mono font-bold mt-1 uppercase tracking-wider text-center'>
						{t('QR-код документа')}
					</span>
				</div>
			</div>

			{/* Сетка официальных реквизитов */}
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200 text-left'>
				<div>
					<span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1'>
						{t('Номер сертификата')}
					</span>
					<span className='text-base sm:text-lg font-mono font-bold text-slate-900'>
						{user.registration_number}
					</span>
				</div>

				<div>
					<span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1'>
						{t('ПИН / ИНН владельца')}
					</span>
					<div className='flex items-center gap-1.5 flex-wrap'>
						<span className='text-sm sm:text-base font-mono font-bold text-slate-900'>
							{user.inn || activeInn || t('Подтвержден')}
						</span>
						<span className='text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded'>
							✓ {t('Сверен')}
						</span>
					</div>
				</div>

				<div>
					<span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1'>
						{t('Дата выдачи')}
					</span>
					<span className='text-sm sm:text-base font-semibold text-slate-900'>
						{formatDate(user.issued_date)}
					</span>
				</div>
			</div>
		</div>
	);
}
