import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SocialLinks from './ui/SocialLinks';

export default function Footer() {
	const { t } = useTranslation();
	const currentYear = new Date().getFullYear();

	return (
		<footer className='bg-gray-900 text-gray-300 py-10'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
					{/* Info */}
					<div className='col-span-1 lg:col-span-2'>
						<h3 className='text-xl font-bold text-white mb-4'>{t('Наши целевые группы')}</h3>
						<p className='text-sm leading-relaxed mb-6 whitespace-pre-line'>
							{t(`Это граждане, не имеющие базового профессионального образования, но обладающие навыками профессиональной деятельности, приобретёнными в процессе жизненного опыта;
граждане, завершившие курсы неформального образования и желающие получить официальный документ, подтверждающий полученные знания и навыки;
граждане, получившие формальное профессиональное образование и стремящиеся подтвердить более высокий уровень квалификации;
лица из числа незанятого населения, потенциальные мигранты, иностранные граждане и другие категории, заинтересованные в подтверждении своих профессиональных навыков и получении официального документа для дальнейшего профессионального роста.`)}
						</p>
						<h3 className='text-lg font-bold text-white mb-3'>{t('Наши социальные сети')}</h3>
						<SocialLinks />
					</div>

					{/* Quick Menu */}
					<div>
						<h3 className='text-xl font-bold text-white mb-4'>{t('Быстрое меню')}</h3>
						<ul className='space-y-2'>
							<li>
								<Link to='/' className='hover:text-white transition-colors'>
									{t('Главная')}
								</Link>
							</li>
							<li>
								<Link to='/news' className='hover:text-white transition-colors'>
									{t('Новости')}
								</Link>
							</li>
							<li>
								<Link
									to='/documents/assessment-centers'
									className='hover:text-white transition-colors'
								>
									{t('Центры оценки компетенций')}
								</Link>
							</li>
						</ul>
					</div>

					{/* Contacts */}
					<div>
						<h3 className='text-xl font-bold text-white mb-4'>{t('Контакты')}</h3>
						<ul className='space-y-3'>
							<li>
								<a
									href='tel:+996312591401'
									className='flex items-center hover:text-white transition-colors gap-2'
								>
									<svg className='w-4 h-4 text-slate-400 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
									</svg>
									<span>+996 312 59 14 01</span>
								</a>
							</li>
							<li>
								<a
									href='tel:+996312591404'
									className='flex items-center hover:text-white transition-colors gap-2'
								>
									<svg className='w-4 h-4 text-slate-400 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
									</svg>
									<span>+996 312 59 14 04</span>
								</a>
							</li>
							<li>
								<a
									href='mailto:icvccentre@gmail.com'
									className='flex items-center hover:text-white transition-colors gap-2'
								>
									<svg className='w-4 h-4 text-slate-400 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
									</svg>
									<span>icvccentre@gmail.com</span>
								</a>
							</li>
							<li>
								<span className='flex items-start gap-2'>
									<svg className='w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
									</svg>
									<span>{t('ул. Жусупа Абдрахманова, 276')}</span>
								</span>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright */}
				<div className='border-t border-gray-800 mt-10 pt-6 text-center text-sm'>
					Copyright © {currentYear} {t('«ЦНСВ» - Все права защищены.')}
				</div>
			</div>
		</footer>
	);
}
