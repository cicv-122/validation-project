import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import NewsCard from '../ui/NewsCard';

interface NewsItem {
	id: number;
	title: string;
	slug: string;
	image: string;
	created: string;
}

interface NewsSectionProps {
	news?: NewsItem[];
	isLoading: boolean;
}

export default function NewsSection({ news, isLoading }: NewsSectionProps) {
	const { t } = useTranslation();

	return (
		<section className='py-16'>
			<div className='max-w-7xl mx-auto'>
				<div className='flex justify-between items-end mb-8 border-b-2 border-gray-100 pb-4'>
					<h3 className='text-2xl font-bold text-gray-900'>
						<Link to='/news' className='hover:text-blue-600 transition-colors'>
							{t('Новости')}
						</Link>
					</h3>
					<Link
						to='/news'
						className='inline-flex items-center gap-2 text-sm font-semibold text-[#283375] hover:text-blue-700 transition-colors group'
					>
						{t('Все новости')}
						<svg
							className='w-4 h-4 transform group-hover:translate-x-1 transition-transform'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
						</svg>
					</Link>
				</div>

				{isLoading ? (
					<LoadingSkeleton count={3} />
				) : (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
						{news?.map((item) => (
							<NewsCard key={item.id} item={item} />
						))}
					</div>
				)}

				{!isLoading && news && news.length > 0 && (
					<div className='text-center mt-10'>
						<Link
							to='/news'
							className='inline-flex items-center gap-2 bg-[#283375] text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg'
						>
							{t('Все новости')}
							<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
							</svg>
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
