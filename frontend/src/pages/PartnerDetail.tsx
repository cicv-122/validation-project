import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, SEO, Spinner } from '../components/ui';
import { usePartner } from '../hooks/useApi';

export default function PartnerDetail() {
	const { id } = useParams<{ id: string }>();
	const { t, i18n } = useTranslation();

	const { data: partner, isLoading, error } = usePartner(id);

	// --- SEO данные из API ---
	const seoTitle = partner
		? `${partner.title} — ${t('Партнеры')} | ${t('ЦНСВ при МП КР')}`
		: t('seo.partners.title');

	const seoDescription = partner?.description
		? partner.description.slice(0, 160)
		: partner
		? `${partner.title} — ${t('Партнер по развитию ЦНСВ')}`
		: t('seo.partners.description');

	const organizationSchema = partner
		? {
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: partner.title,
				description: seoDescription,
				...(partner.image && { image: partner.image }),
				...(partner.url && { url: partner.url }),
				...(partner.email && { email: partner.email.split(/[\r\n,]+/)[0].trim() }),
				...(partner.phone && { telephone: partner.phone.split(/[\r\n,]+/)[0].trim() }),
				...(partner.address && {
					address: {
						'@type': 'PostalAddress',
						streetAddress: partner.address.split(/[\r\n]+/)[0].trim(),
					},
				}),
		  }
		: undefined;

	const breadcrumbSchema = partner
		? {
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: t('Главная'),
						item: `https://validation.kg/${i18n.language}`,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: t('Партнеры'),
						item: `https://validation.kg/${i18n.language}/documents/partners`,
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: partner.title,
						item: `https://validation.kg/${i18n.language}/documents/partners/${id}`,
					},
				],
		  }
		: undefined;

	useEffect(() => {
		if (partner) {
			const el = document.getElementById('partner-detail-container');
			if (el) {
				const y = el.getBoundingClientRect().top + window.scrollY - 80;
				window.scrollTo({ top: y, behavior: 'smooth' });
			}
		}
	}, [partner]);

	if (isLoading) {
		return <Spinner />;
	}

	if (error || !partner) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<ErrorMessage message={t('Ошибка загрузки данных.')} />
			</div>
		);
	}

	const hasSocials = !!(partner.facebook_url || partner.instagram_url || partner.linkedin_url || partner.telegram_url || partner.whatsapp_url || partner.tiktok_url || partner.youtube_url);
	const hasContacts = !!(partner.url || partner.phone || partner.email || partner.address || hasSocials);

	return (
		<div className='bg-slate-50 py-12 min-h-screen'>
			<SEO
				title={seoTitle}
				description={seoDescription}
				ogImage={partner.image}
				structuredData={[organizationSchema, breadcrumbSchema]}
			/>

			{/* остальной JSX без изменений */}
			<div id='partner-detail-container' className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Back Link */}
				<div className='mb-8'>
					<Link
						to='/documents/partners'
						className='inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-5 w-5 mr-1.5'
							viewBox='0 0 20 20'
							fill='currentColor'
						>
							<path
								fillRule='evenodd'
								d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
								clipRule='evenodd'
							/>
						</svg>
						{t('Назад к списку партнеров')}
					</Link>
				</div>
				{/* Profile Card */}
				<div
					id='partner-card'
					className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
				>
					<div className='p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start'>
						{/* Logo */}
						<div className='flex-shrink-0 w-full md:w-48 h-48 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden'>
							{partner.image ? (
								<img
									src={partner.image}
									alt={partner.title}
									className='w-full h-full object-contain p-2'
								/>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-16 w-16 text-gray-300'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={1}
										d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
									/>
								</svg>
							)}
						</div>

						{/* Info */}
						<div className='flex-1 w-full flex flex-col justify-center'>
							<h1 className='text-3xl font-extrabold text-gray-900 mb-4'>{partner.title}</h1>

							{partner.description && (
								<p className='text-gray-600 text-base leading-relaxed mb-6 whitespace-pre-line'>
									{partner.description}
								</p>
							)}

							{hasContacts && (
								<div className='bg-slate-50/50 rounded-2xl p-6 sm:p-8 mt-8 border border-slate-100'>
									<h3 className='text-xs font-bold text-gray-400 uppercase tracking-widest mb-6'>
										{t('Контактная информация')}
									</h3>
									<div className='flex flex-col gap-y-6 text-sm'>
										{partner.url && (
											<div className='flex items-start'>
												<div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 mr-4'>
													<svg
														className='w-5 h-5'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
														/>
													</svg>
												</div>
												<div className='flex flex-col pt-0.5'>
													<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1'>
														{t('Веб-сайт')}
													</span>
													<a
														href={partner.url}
														target='_blank'
														rel='noreferrer'
														className='text-gray-900 font-medium hover:text-blue-600 transition-colors'
													>
														{partner.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
													</a>
												</div>
											</div>
										)}

										{partner.phone && (
											<div className='flex items-start'>
												<div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mr-4'>
													<svg
														className='w-5 h-5'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
														/>
													</svg>
												</div>
												<div className='flex flex-col pt-0.5'>
													<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5'>
														{t('Телефон')}
													</span>
													<div className='flex flex-col gap-1.5'>
														{partner.phone
															.split(/[\r\n,]+/)
															.map((p) => p.trim())
															.filter(Boolean)
															.map((p, i) => (
																<a
																	key={i}
																	href={`tel:${p.replace(/[^\d+]/g, '')}`}
																	className='text-gray-900 font-semibold hover:text-green-600 transition-colors'
																>
																	{p}
																</a>
															))}
													</div>
												</div>
											</div>
										)}

										{partner.email && (
											<div className='flex items-start'>
												<div className='w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0 mr-4'>
													<svg
														className='w-5 h-5'
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
												<div className='flex flex-col pt-0.5'>
													<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5'>
														{t('Email')}
													</span>
													<div className='flex flex-col gap-1.5'>
														{partner.email
															.split(/[\r\n,]+/)
															.map((e) => e.trim())
															.filter(Boolean)
															.map((e, i) => (
																<a
																	key={i}
																	href={`mailto:${e}`}
																	className='text-gray-900 font-medium hover:text-indigo-600 transition-colors break-all'
																>
																	{e}
																</a>
															))}
													</div>
												</div>
											</div>
										)}

										{partner.address && (
											<div className='flex items-start'>
												<div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0 mr-4'>
													<svg
														className='w-5 h-5'
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
												<div className='flex flex-col pt-0.5'>
													<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5'>
														{t('Адрес')}
													</span>
													<div className='flex flex-col gap-2'>
														{partner.address
															.split(/[\r\n]+/)
															.map((a) => a.trim())
															.filter(Boolean)
															.map((a, i) => (
																<a
																	key={i}
																	href={partner.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`}
																	target='_blank'
																	rel='noreferrer'
																	className='text-gray-900 leading-snug hover:text-red-600 transition-colors font-medium block'
																	title={t('Открыть на карте')}
																>
																	{a}
																</a>
															))}
													</div>
												</div>
											</div>
										)}

										{hasSocials && (
											<div className='flex items-start mt-2 pt-6 border-t border-slate-100'>
												<div className='w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 flex-shrink-0 mr-4'>
													<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
														<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' />
													</svg>
												</div>
												<div className='flex flex-col pt-0.5'>
													<span className='text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2'>
														{t('Социальные сети')}
													</span>
													<div className='flex flex-wrap gap-3'>
														{partner.facebook_url && (
															<a href={partner.facebook_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-blue-600 transition-colors' aria-label='Facebook'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
																</svg>
															</a>
														)}
														{partner.instagram_url && (
															<a href={partner.instagram_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-pink-600 transition-colors' aria-label='Instagram'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
																</svg>
															</a>
														)}
														{partner.linkedin_url && (
															<a href={partner.linkedin_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-blue-700 transition-colors' aria-label='LinkedIn'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
																</svg>
															</a>
														)}
														{partner.telegram_url && (
															<a href={partner.telegram_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-sky-500 transition-colors' aria-label='Telegram'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
																</svg>
															</a>
														)}
														{partner.whatsapp_url && (
															<a href={partner.whatsapp_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-green-500 transition-colors' aria-label='WhatsApp'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z'/>
																</svg>
															</a>
														)}
														{partner.tiktok_url && (
															<a href={partner.tiktok_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-black transition-colors' aria-label='TikTok'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'/>
																</svg>
															</a>
														)}
														{partner.youtube_url && (
															<a href={partner.youtube_url} target='_blank' rel='noreferrer' className='text-gray-500 hover:text-red-600 transition-colors' aria-label='YouTube'>
																<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
																	<path d='M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z' />
																</svg>
															</a>
														)}
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>

					{partner.file && (
						<div className='bg-blue-50/50 border-t border-blue-100 p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4'>
							<div className='text-blue-900 font-medium'>
								{t('Дополнительная информация (документ)')}
							</div>
							<a
								href={partner.file}
								target='_blank'
								rel='noreferrer'
								className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full sm:w-auto justify-center'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5 mr-2'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
									/>
								</svg>
								{t('Скачать документ')}
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
