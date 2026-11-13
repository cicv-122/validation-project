import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import emblemKyrgyzstan from '../../../assets/logo/emblem-kyrgyzstan.svg';
import type { NewsItem } from '../../../types';

interface CertificateArticlesAndFooterProps {
	newsArticles?: NewsItem[];
	userId: number;
}

export function CertificateArticlesAndFooter({
	newsArticles,
	userId,
}: CertificateArticlesAndFooterProps) {
	const { t } = useTranslation();

	return (
		<>
			{/* УПОМИНАНИЯ В НОВОСТЯХ И ПУБЛИКАЦИЯХ */}
			{newsArticles && newsArticles.length > 0 && (
				<div className='pt-2 border-t border-slate-200'>
					<h4 className='text-xs font-bold uppercase tracking-wider text-slate-500 mb-3'>
						{t('Публикации и события с участием специалиста')} ({newsArticles.length})
					</h4>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
						{newsArticles.map((item: NewsItem) => (
							<Link
								key={item.id}
								to={`/news/${item.slug || item.id}`}
								className='flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs text-slate-800 font-medium'
							>
								{item.image && (
									<img
										src={item.image}
										alt=''
										className='w-12 h-12 rounded-lg object-cover flex-shrink-0'
									/>
								)}
								<span className='line-clamp-2'>{item.title}</span>
							</Link>
						))}
					</div>
				</div>
			)}

			{/* ОФИЦИАЛЬНЫЙ ПОДВАЛ-ЗАВЕРЕНИЕ */}
			<div className='pt-6 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600 bg-slate-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6'>
				<div className='flex items-center gap-3'>
					<img
						src={emblemKyrgyzstan}
						alt=''
						className='w-9 h-9 object-contain opacity-80 flex-shrink-0'
					/>
					<div>
						<div className='font-bold text-slate-800'>
							{t('Центр независимой сертификации и валидации при Министерстве просвещения КР')}
						</div>
						<div className='text-[11px] text-slate-500'>
							{t('г. Бишкек, ул. Жусупа Абдрахманова, 276 (бывш. ул. Байтик баатыра, 122)')} • Тел: +996 312 59 14 01
						</div>
					</div>
				</div>

				<div className='text-right text-[11px] font-mono text-slate-500 sm:self-center'>
					<span>
						{t('ID в реестре:')} <b>{userId}</b>
					</span>
					<span className='block text-[10px] text-slate-400'>
						{t('Юридическая сила подтверждена')}
					</span>
				</div>
			</div>
		</>
	);
}
