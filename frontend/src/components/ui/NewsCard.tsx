import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface NewsItem {
	id: number;
	title: string;
	slug: string;
	image?: string | null;
	created: string;
}

interface NewsCardProps {
	item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
	const { t, i18n } = useTranslation();

	return (
		<div className='bg-white border rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group'>
			<Link
				to={`/news/${item.slug}`}
				onClick={() => {
					sessionStorage.setItem('from_news', 'true');
					sessionStorage.setItem('news_scroll_pos', window.scrollY.toString());
				}}
				className='block h-full flex flex-col'
			>
				<div className='h-48 overflow-hidden relative bg-gradient-to-br from-[#1e3a5f] to-[#283375] flex items-center justify-center'>
					{item.image ? (
						<img
							src={item.image}
							alt={item.title}
							loading='lazy'
							decoding='async'
							className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
						/>
					) : (
						<div className='flex flex-col items-center justify-center text-white p-4 text-center group-hover:scale-105 transition-transform duration-300'>
							<div className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:bg-white/30 transition-colors'>
								<svg className='w-6 h-6 text-white ml-0.5' fill='currentColor' viewBox='0 0 24 24'>
									<path d='M8 5v14l11-7z' />
								</svg>
							</div>
							<span className='text-xs font-semibold tracking-wider uppercase bg-white/10 px-2.5 py-1 rounded-full'>
								{t('Видео')}
							</span>
						</div>
					)}
				</div>
				<div className='p-5 flex-grow flex flex-col justify-between'>
					<h4 className='text-lg font-semibold text-gray-900 mb-3 line-clamp-2'>{item.title}</h4>
					<span className='text-sm text-gray-500 block text-right mt-4'>
						{new Date(item.created).toLocaleDateString(i18n.language)}
					</span>
				</div>
			</Link>
		</div>
	);
}
