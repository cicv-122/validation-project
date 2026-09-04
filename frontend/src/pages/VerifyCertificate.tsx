import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCertifiedUserVerification } from '../hooks/useApi';
import { Spinner, SEO } from '../components/ui';
import { transliterate } from '../utils/transliterate';
import { translateProfession } from '../utils/translateProfession';

export default function VerifyCertificate() {
	const { id } = useParams<{ id: string }>();
	const { t, i18n } = useTranslation();
	const { data: user, isLoading, error } = useCertifiedUserVerification(id);

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<Spinner />
			</div>
		);
	}

	if (error || !user) {
		return (
			<div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4'>
				<SEO 
					title={`${t('Проверка сертификата')} — ${t('ЦНСВ при МП КР')}`}
					description={t('Проверка подлинности сертификата')}
				/>
				<div className='bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center'>
					<div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl'>
						❌
					</div>
					<h1 className='text-2xl font-extrabold text-gray-900 mb-2'>
						{t('Сертификат не найден')}
					</h1>
					<p className='text-gray-500 mb-6'>
						{t('Проверьте правильность ссылки или регистрационного номера.')}
					</p>
					<Link
						to='/'
						className='inline-block bg-[#283375] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors'
					>
						{t('На главную')}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
			<SEO 
				title={`${t('Проверка сертификата')} — ${i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}`} 
				description={`${t('Цифровой паспорт сертификата:')} ${i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}`}
			/>
			
			<div className='max-w-2xl w-full'>
				<div className='bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100'>
					{/* Header Status */}
					<div className='bg-green-500 py-4 px-6 text-center'>
						<p className='text-white font-bold text-lg flex items-center justify-center gap-2'>
							<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
							</svg>
							{t('Сертификат подтверждён')}
						</p>
					</div>

					<div className='p-8 sm:p-12'>
						<div className='flex flex-col sm:flex-row gap-8 items-center sm:items-start'>
							{/* Photo */}
							<div className='w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0'>
								{user.image ? (
									<img
										src={user.image}
										alt={i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
										className='w-full h-full object-cover rounded-2xl shadow-md border-4 border-white'
									/>
								) : (
									<div className='w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-md'>
										<svg className='w-16 h-16 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
											<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
										</svg>
									</div>
								)}
							</div>

							{/* Details */}
							<div className='flex-1 text-center sm:text-left'>
								<h1 className='text-3xl font-extrabold text-gray-900 mb-2 leading-tight'>
									{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
								</h1>
								{user.profession && (
									<p className='text-xl text-blue-600 font-medium mb-6'>
										{translateProfession(user.profession, i18n.language)}
									</p>
								)}
								
								<div className='space-y-4'>
									<div className='bg-gray-50 p-4 rounded-xl'>
										<p className='text-xs text-gray-500 uppercase font-bold tracking-wider mb-1'>
											{t('Регистрационный номер')}
										</p>
										<p className='text-lg font-mono font-semibold text-gray-900'>
											{user.registration_number}
										</p>
									</div>
									
									{user.issued_date && (
										<div className='bg-gray-50 p-4 rounded-xl'>
											<p className='text-xs text-gray-500 uppercase font-bold tracking-wider mb-1'>
												{t('Дата выдачи')}
											</p>
											<p className='text-lg font-semibold text-gray-900'>
												{new Date(user.issued_date).toLocaleDateString(
													i18n.language === 'en' ? 'en-US' : i18n.language === 'ky' ? 'ky-KG' : 'ru-RU',
													{ day: 'numeric', month: 'long', year: 'numeric' }
												)}
											</p>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Related News Articles */}
						{user.news_articles && user.news_articles.length > 0 && (
							<div className='mt-8 border-t border-gray-100 pt-6'>
								<h3 className='text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2'>
									<svg className='w-5 h-5 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' />
									</svg>
									{t('Публикации и новости со специалистом')}
								</h3>
								<div className='space-y-3'>
									{user.news_articles.map((news) => (
										<Link
											key={news.id}
											to={`/news/${news.slug}`}
											className='block bg-blue-50/70 hover:bg-blue-100 border border-blue-100 rounded-2xl p-4 transition-all duration-200 group'
										>
											<div className='flex items-center justify-between gap-3'>
												<div>
													<p className='text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors'>
														{news.title}
													</p>
													<p className='text-xs text-gray-400 mt-1'>
														{new Date(news.created).toLocaleDateString()}
													</p>
												</div>
												<svg className='w-5 h-5 text-blue-600 flex-shrink-0 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
													<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
												</svg>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
					
					{/* Footer */}
					<div className='bg-gray-50 px-8 py-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100'>
						<p className='text-sm text-gray-500 font-medium'>
							{t('Центр независимой сертификации и валидации КР')}
						</p>
						<Link
							to={`/documents/certified-users?highlight=${encodeURIComponent(user.registration_number)}`}
							className='text-sm text-blue-600 hover:text-blue-800 font-bold transition-colors'
						>
							{t('В базу данных')} &rarr;
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
