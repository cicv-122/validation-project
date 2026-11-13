import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { EmptyState, ErrorMessage, LoadingSkeleton, PageHero, SEO } from '../components/ui';
import { useNews } from '../hooks/useApi';
import {
	NewsGrid,
	NewsLoadMoreButton,
	useNewsScrollRestoration,
} from '../widgets/news-list';

const PAGE_SIZE = 9;

export default function NewsList() {
	const { t, i18n } = useTranslation();

	const {
		items,
		setItems,
		isRestoring,
		handleNewsClick,
	} = useNewsScrollRestoration(i18n.language);

	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	// Fetch initial news if not restoring from cache
	const { data: initialNews, isLoading, error } = useNews(PAGE_SIZE);

	// Sync initialNews when fresh data arrives and we are not restoring
	useEffect(() => {
		if (initialNews && initialNews.length > 0 && !isRestoring && items.length === 0) {
			setItems(initialNews);
		}
	}, [initialNews, isRestoring, items.length, setItems]);

	const loadMore = async () => {
		setLoadingMore(true);
		try {
			const { data } = await apiClient.get('/news/', {
				params: { lang: i18n.language, limit: PAGE_SIZE, offset: items.length },
			});
			if (data.length < PAGE_SIZE) setHasMore(false);
			setItems((prev) => [...prev, ...data]);
		} catch {
			// silent error
		} finally {
			setLoadingMore(false);
		}
	};

	const showSkeleton = isLoading && items.length === 0;

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('Новости')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Актуальные новости Центра независимой сертификации и валидации Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('Новости')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{showSkeleton ? (
					<LoadingSkeleton count={6} className='h-72' />
				) : error && items.length === 0 ? (
					<ErrorMessage message={t('Ошибка загрузки новостей. Пожалуйста, попробуйте позже.')} />
				) : items.length > 0 ? (
					<>
						<NewsGrid items={items} onNewsClick={handleNewsClick} />
						{hasMore && (
							<NewsLoadMoreButton loading={loadingMore} onClick={loadMore} />
						)}
					</>
				) : (
					<EmptyState message={t('Новостей пока нет.')} />
				)}
			</div>
		</div>
	);
}
