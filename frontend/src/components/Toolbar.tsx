import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import emblemKyrgyzstan from '../assets/logo/emblem-kyrgyzstan.svg';
import logoDarkKg from '../assets/logo/logo-dark-bg-kg.svg';
import logoDarkRu from '../assets/logo/logo-dark-bg-ru.svg';

export default function Toolbar() {
	const { t, i18n } = useTranslation();
	const lang = i18n.language;

	const isKyrgyz = lang?.startsWith('ky') || lang?.startsWith('kg');
	const logo = isKyrgyz ? logoDarkKg : logoDarkRu;

	return (
		<header className='bg-white'>
			{/* Main Toolbar Area */}
			<div className='py-5 sm:py-6'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center gap-2 sm:gap-4 md:gap-6'>
						{/* Gov Logo */}
						<div className='animate-fade-in-left flex-shrink-0 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center'>
							<a href='https://www.gov.kg/ky' target='_blank' rel='noreferrer' className='w-full h-full block'>
								<img
									className='w-full h-full object-contain aspect-square'
									src={emblemKyrgyzstan}
									alt='Герб Кыргызстана'
									width={96}
									height={96}
								/>
							</a>
						</div>

						{/* Title */}
						<div className='text-center flex-grow px-2 sm:px-4 min-w-0'>
							<p className='text-xs sm:text-xl md:text-3xl font-extrabold text-[#283375] leading-tight mb-1 uppercase tracking-tight'>
								{t('Центр независимой сертификации и валидации')}
							</p>
							<p className='text-gray-600 font-bold text-[10px] sm:text-sm md:text-base leading-tight'>
								{t('при Министерстве просвещения Кыргызской Республики')}
							</p>
						</div>

						{/* Center Logo */}
						<div className='animate-fade-in-right flex-shrink-0 w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center'>
							<Link to='/' className='w-full h-full block'>
								<img
									className='w-full h-full object-contain aspect-square'
									src={logo}
									alt='Логотип ЦНСВ'
									width={96}
									height={96}
								/>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
