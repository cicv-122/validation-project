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
									className='flex items-center hover:text-white transition-colors'
								>
									<span className='mr-2'>📞</span> +996 312 59 14 01
								</a>
							</li>
							<li>
								<a
									href='tel:+996312591404'
									className='flex items-center hover:text-white transition-colors'
								>
									<span className='mr-2'>📞</span> +996 312 59 14 04
								</a>
							</li>
							<li>
								<a
									href='mailto:icvccentre@gmail.com'
									className='flex items-center hover:text-white transition-colors'
								>
									<span className='mr-2'>✉️</span> icvccentre@gmail.com
								</a>
							</li>
							<li>
								<span className='flex items-start'>
									<span className='mr-2'>📍</span>
									{t('ул. Байтик Баатыра, 122')}
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
