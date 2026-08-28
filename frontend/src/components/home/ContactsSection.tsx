import { useTranslation } from 'react-i18next';

export default function ContactsSection() {
	const { t } = useTranslation();

	return (
		<section id='contacts' className='bg-[#283375] py-14 rounded-3xl mb-5'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 '>
				<div className='text-center mb-10'>
					<h2 className='text-3xl font-extrabold text-white mb-2'>{t('Контакты')}</h2>
					<div className='w-16 h-1 bg-blue-400 rounded mx-auto' />
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
					{/* Address */}
					<div className='bg-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors'>
						<div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-6 h-6 text-white'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
								/>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
								/>
							</svg>
						</div>
						<h3 className='text-white font-semibold mb-1'>{t('Адрес')}</h3>
						<p className='text-blue-200 text-sm'>{t('ул. Байтик Баатыра, 122')}</p>
						<p className='text-blue-200 text-sm'>{t('г. Бишкек, Кыргызстан')}</p>
					</div>

					{/* Phone */}
					<div className='bg-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors'>
						<div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
								<path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
							</svg>
						</div>
						<h3 className='text-white font-semibold mb-1'>{t('Телефон')}</h3>
						<a
							href='tel:+996312591401'
							className='text-blue-200 text-sm hover:text-white transition-colors block'
						>
							+996 312 59 14 01
						</a>
						<a
							href='tel:+996312591404'
							className='text-blue-200 text-sm hover:text-white transition-colors block'
						>
							+996 312 59 14 04
						</a>
					</div>

					{/* Email */}
					<div className='bg-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors'>
						<div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-6 h-6 text-white'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
								/>
							</svg>
						</div>
						<h3 className='text-white font-semibold mb-1'>Email</h3>
						<a
							href='mailto:icvccentre@gmail.com'
							className='text-blue-200 text-sm hover:text-white transition-colors'
						>
							icvccentre@gmail.com
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
