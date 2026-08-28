import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useVideoGallery } from '../hooks/useApi';

export default function VideoGallery() {
	const { t } = useTranslation();
	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useVideoGallery();

	const allVideos = data?.pages.flatMap((page) => page.results) || [];

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('Видео галерея')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Видеозаписи мероприятий, церемоний и рабочих процессов Центра независимой сертификации и валидации Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('Видео галерея')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : allVideos && allVideos.length > 0 ? (
					<>
						<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
							{allVideos.map((video: any) => (
								<div
									key={video.id}
									className='bg-black rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow'
								>
									<div
										className='w-full relative overflow-hidden'
										style={{ paddingTop: '56.25%' }}
									>
										{video.embed_url ? (
											<iframe
												className='absolute top-0 left-0 w-full h-full'
												src={video.embed_url}
												title='YouTube video player'
												frameBorder='0'
												allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
												allowFullScreen
											/>
										) : video.file_url ? (
											<video
												className='absolute top-0 left-0 w-full h-full object-cover'
												controls
												src={video.file_url}
												preload='metadata'
											/>
										) : null}
									</div>
								</div>
							))}
						</div>
						{hasNextPage && (
							<div className='mt-12 flex justify-center'>
								<button
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
									className='px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center'
								>
									{isFetchingNextPage ? (
										<>
											<svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
												<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
												<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
											</svg>
											{t('Загрузка...')}
										</>
									) : (
										t('Показать еще')
									)}
								</button>
							</div>
						)}
					</>
				) : (
					<EmptyState message={t('Видео пока нет.')} />
				)}
			</div>
		</div>
	);
}
