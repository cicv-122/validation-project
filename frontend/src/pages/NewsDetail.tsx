import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import CertifiedUserModal from '../components/CertifiedUserModal';
import { ErrorMessage, SEO } from '../components/ui';
import { useNewsItem } from '../hooks/useApi';
import { CertifiedUser } from '../types';
import { newsStore } from '../utils/newsStore';
import { transliterate } from '../utils/transliterate';
import { translateProfession } from '../utils/translateProfession';

export default function NewsDetail() {
	const { slug } = useParams<{ slug: string }>();
	const { t, i18n } = useTranslation();
	const [lightboxIndex, setLightboxIndex] = useState(-1);
	const [selectedUser, setSelectedUser] = useState<CertifiedUser | null>(null);

	const { data: news, isLoading, error } = useNewsItem(slug);

	const seoTitle = news ? `${news.title} — ${t('ЦНСВ при МП КР')}` : t('seo.news.title');

	const seoDescription = news?.description
		? news.description.replace(/<[^>]+>/g, '').slice(0, 160)
		: t('seo.newsDetail.description');

	const newsArticleSchema = news
		? {
				'@context': 'https://schema.org',
				'@type': 'NewsArticle',
				headline: news.title,
				description: seoDescription,
				image: news.image,
				datePublished: news.created,
				dateModified: news.created,
				publisher: {
					'@type': 'Organization',
					name: 'Центр независимой сертификации и валидации при МП КР',
					logo: {
						'@type': 'ImageObject',
						url: 'https://validation.kg/logo.png',
					},
				},
		  }
		: undefined;

	const breadcrumbSchema = news
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
						name: t('Новости'),
						item: `https://validation.kg/${i18n.language}/news`,
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: news.title,
						item: `https://validation.kg/${i18n.language}/news/${slug}`,
					},
				],
		  }
		: undefined;

	if (isLoading) {
		return (
			<div className='max-w-4xl mx-auto px-4 py-12 animate-pulse rounded-xl'>
				<div className='h-10 bg-gray-200 rounded w-3/4 mb-6' />
				<div className='h-64 bg-gray-200 rounded w-full mb-8' />
				<div className='space-y-4'>
					<div className='h-4 bg-gray-200 rounded w-full' />
					<div className='h-4 bg-gray-200 rounded w-5/6' />
					<div className='h-4 bg-gray-200 rounded w-4/6' />
				</div>
			</div>
		);
	}

	if (error || !news) {
		return (
			<div className='max-w-4xl mx-auto px-4 py-20 text-center'>
				<ErrorMessage message={t('Новость не найдена')} />
				<Link to='/news' className='text-blue-600 hover:underline'>
					{t('Вернуться к списку новостей')}
				</Link>
			</div>
		);
	}

	const slides = [
		...(news.image ? [{ src: news.image }] : []),
		...(news.images || []).map((img) => ({ src: img.image })),
	];

	const bottomVideos = !news.image && news.videos && news.videos.length > 0
		? news.videos.slice(1)
		: (news.videos || []);

	return (
		<article className='bg-white py-12'>
			<SEO
				title={seoTitle}
				description={seoDescription}
				ogImage={news.image || undefined}
				structuredData={[newsArticleSchema, breadcrumbSchema]}
			/>

			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Breadcrumbs */}
				<div className='mb-8'>
					<Link
						to='/news'
						onClick={() => {
							newsStore.fromDetail = true;
							sessionStorage.setItem('from_news', 'true');
						}}
						className='text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition-colors'
					>
						<svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M10 19l-7-7m0 0l7-7m-7 7h18'
							/>
						</svg>
						{t('Все новости')}
					</Link>
				</div>
				<header className='mb-10'>
					<span className='block text-gray-500 text-sm font-medium mb-2'>
						{new Date(news.created).toLocaleDateString(i18n.language, {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</span>
					<h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6'>
						{news.title}
					</h1>

					{news.image ? (
						<div
							className='rounded-2xl overflow-hidden shadow-lg mb-10 cursor-pointer'
							onClick={() => setLightboxIndex(0)}
						>
							<img
								src={news.image}
								alt={news.title}
								onError={(e) => {
									e.currentTarget.style.display = 'none';
								}}
								className='w-full h-auto object-cover max-h-[600px] hover:opacity-90 transition-opacity'
							/>
						</div>
					) : news.videos && news.videos.length > 0 ? (
						<div className='rounded-2xl overflow-hidden shadow-lg mb-10 bg-black aspect-video max-h-[600px] flex items-center justify-center'>
							<video
								controls
								className='w-full h-full max-h-[600px] object-contain'
								src={news.videos[0].file}
								preload='metadata'
							/>
						</div>
					) : null}
				</header>

				<div
					className='prose prose-lg prose-blue max-w-none text-gray-700 font-sans'
					dangerouslySetInnerHTML={{ __html: news.description }}
				/>

				{news.images && news.images.length > 0 && (
					<div className='mt-16'>
						<h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2'>
							{t('Фотогалерея')}
						</h3>
						<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
							{news.images.map((img, idx) => (
								<div
									key={img.id}
									className='rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer'
									onClick={() => setLightboxIndex(idx + 1)}
								>
									<img
										src={img.image}
										alt={`${news.title} — ${t('фото')} ${idx + 1}`}
										className='w-full h-48 object-cover hover:scale-105 transition-transform duration-300'
									/>
								</div>
							))}
						</div>
					</div>
				)}

				{bottomVideos.length > 0 && (
					<div className='mt-16'>
						<h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2'>
							{t('Видео')}
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{bottomVideos.map((vid) => (
								<div
									key={vid.id}
									className='rounded-xl overflow-hidden shadow border border-gray-100 bg-black aspect-w-16 aspect-h-9'
								>
									<video
										controls
										className='w-full h-full object-cover'
										src={vid.file}
										preload='metadata'
									/>
								</div>
							))}
						</div>
					</div>
				)}
				{news.certified_users && news.certified_users.length > 0 && (
					<div className='mt-16'>
						<h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2'>
							<svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' />
							</svg>
							{news.certified_users.length === 1 ? t('Специалист в этом материале') : t('Специалисты в этом материале')}
						</h3>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{news.certified_users.map((user) => (
								<div
									key={user.id}
									onClick={() => setSelectedUser(user)}
									className='bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md'
								>
									<div className='w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0 flex items-center justify-center'>
										{user.image ? (
											<img
												src={user.image}
												alt={i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
												className='w-full h-full object-cover'
											/>
										) : (
											<svg className='w-8 h-8 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
												<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
											</svg>
										)}
									</div>
									<div className='min-w-0 flex-1'>
										<h4 className='text-sm font-bold text-gray-900 truncate'>
											{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
										</h4>
										{user.profession && (
											<p className='text-xs text-blue-600 font-medium truncate mt-0.5'>
												{translateProfession(user.profession, i18n.language)}
											</p>
										)}
										<p className='text-[11px] text-gray-400 font-mono mt-1'>{user.registration_number}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			<Lightbox
				index={lightboxIndex}
				open={lightboxIndex >= 0}
				close={() => setLightboxIndex(-1)}
				slides={slides}
			/>

			{selectedUser && (
				<CertifiedUserModal
					user={selectedUser}
					onClose={() => setSelectedUser(null)}
				/>
			)}
		</article>
	);
}
