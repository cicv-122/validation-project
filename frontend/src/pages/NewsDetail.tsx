import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { ErrorMessage, SEO } from '../components/ui';
import { useNewsItem } from '../hooks/useApi';
import { newsStore } from '../utils/newsStore';
import {
	NewsDetailHeader,
	NewsDetailContent,
	NewsDetailGallery,
	NewsDetailVideos,
} from '../widgets/news-detail';

export default function NewsDetail() {
	const { slug } = useParams<{ slug: string }>();
	const { t, i18n } = useTranslation();
	const [lightboxIndex, setLightboxIndex] = useState(-1);

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

	const bottomVideos =
		!news.image && news.videos && news.videos.length > 0
			? news.videos.slice(1)
			: news.videos || [];

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
						className='inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors w-fit'
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

				<NewsDetailHeader
					created={news.created}
					title={news.title}
					image={news.image}
					videos={news.videos}
					onImageClick={() => setLightboxIndex(0)}
				/>

				<NewsDetailContent descriptionHtml={news.description} />

				<NewsDetailGallery
					images={news.images}
					title={news.title}
					onImageClick={(idx) => setLightboxIndex(idx + 1)}
				/>

				<NewsDetailVideos videos={bottomVideos} />
			</div>

			<Lightbox
				index={lightboxIndex}
				open={lightboxIndex >= 0}
				close={() => setLightboxIndex(-1)}
				slides={slides}
			/>
		</article>
	);
}
