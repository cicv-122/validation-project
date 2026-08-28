import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useImageGallery } from '../hooks/useApi';

export default function ImageGallery() {
	const { t } = useTranslation();
	const [lightboxIndex, setLightboxIndex] = useState(-1);
	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useImageGallery();

	const allImages = data?.pages.flatMap((page) => page.results) || [];
	const slides = allImages.map((img: any) => ({ src: img.image }));

	return (
		<div className='bg-gray-50 min-h-screen'>
			<SEO
				title={`${t('Фотогалерея')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Фотогалерея Центра независимой сертификации и валидации. Фотографии мероприятий, церемоний и работ Центра.'
				)}
			/>
			<PageHero title={t('Фотогалерея')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : allImages && allImages.length > 0 ? (
					<>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
							{allImages.map((img: any, idx: number) => (
								<div
									key={img.id}
									className='bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer relative'
									onClick={() => setLightboxIndex(idx)}
								>
									<div className='aspect-w-3 aspect-h-2 w-full'>
										<img
											src={img.image}
											alt={img.title || `${t('Фотография')} ${idx + 1}`}
											loading='lazy'
											decoding='async'
											className='w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300'
										/>
									</div>
									<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center'>
										<svg
											className='w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
											/>
										</svg>
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
					<EmptyState message={t('Фотографий пока нет.')} />
				)}
			</div>
			<Lightbox
				index={lightboxIndex}
				open={lightboxIndex >= 0}
				close={() => setLightboxIndex(-1)}
				slides={slides}
			/>
		</div>
	);
}
