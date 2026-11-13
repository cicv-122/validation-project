import { useTranslation } from 'react-i18next';

interface ApplySuccessViewProps {
	regNumber: string;
	fullName: string;
	phone?: string;
	whatsapp?: string;
}

export default function ApplySuccessView({
	regNumber,
	fullName,
	phone,
	whatsapp,
}: ApplySuccessViewProps) {
	const { t } = useTranslation();

	const targetPhone = whatsapp ? whatsapp.replace(/\D/g, '') : phone ? phone.replace(/\D/g, '') : '';
	const shareMessage = `Здравствуйте, ${fullName}!\nВаша заявка на сертификацию/валидацию зарегистрирована в ЦНСВ при МП КР.\nРегистрационный номер: ${regNumber}\nПроверить статус заявки: https://validation.kg/apply/status?reg=${regNumber}`;

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-16'>
			<div className='bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center'>
				<div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
					<svg
						className='w-10 h-10 text-green-600'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M5 13l4 4L19 7'
						/>
					</svg>
				</div>
				<h2 className='text-2xl font-bold text-gray-900 mb-3'>{t('Заявка успешно подана!')}</h2>
				<p className='text-gray-600 mb-6'>
					{t('Ваш регистрационный номер для отслеживания статуса:')}
				</p>
				<div className='bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-6'>
					<p className='text-xs text-blue-500 uppercase tracking-wider mb-1'>
						{t('Регистрационный номер')}
					</p>
					<p className='font-mono text-base font-bold text-blue-800 break-all'>
						{regNumber}
					</p>
				</div>
				<p className='text-sm text-gray-500 mb-8'>
					{t(
						'Сохраните этот номер. Вы можете проверить статус вашей заявки на странице «Статус заявки».'
					)}
				</p>
				<div className='flex gap-3 justify-center flex-wrap'>
					{targetPhone && (
						<a
							href={`https://wa.me/${targetPhone}?text=${encodeURIComponent(shareMessage)}`}
							target='_blank'
							rel='noopener noreferrer'
							className='px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2'
						>
							<svg className='w-4 h-4 fill-white flex-shrink-0' viewBox='0 0 24 24'>
								<path d='M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.539 1.77.828 2.791.828 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.683.07-1.107-.069-.252-.083-.578-.204-1.002-.387-1.799-.778-2.96-2.6-3.05-2.72-.089-.12-.733-.976-.733-1.86 0-.885.464-1.32.629-1.5.165-.18.36-.225.48-.225.12 0 .24.002.345.007.111.005.26-.042.405.308.15.36.51 1.246.555 1.336.045.09.075.195.015.315-.06.12-.09.195-.18.3-.09.105-.189.234-.27.315-.09.09-.184.188-.079.368.105.18.468.772 1.004 1.25.688.614 1.27.804 1.45.894.18.09.285.075.39-.045.105-.12.45-.525.57-.705.12-.18.24-.15.405-.09.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84z' />
							</svg>
							<span>{t('Сохранить в WhatsApp')}</span>
						</a>
					)}
					<a
						href={`/apply/status?reg=${regNumber}`}
						className='px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
					>
						{t('Проверить статус')}
					</a>
					<a
						href='/'
						className='px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'
					>
						{t('На главную')}
					</a>
				</div>
			</div>
		</div>
	);
}
