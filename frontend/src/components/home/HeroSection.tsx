import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/effect-fade';
// @ts-ignore
import 'swiper/css/pagination';

interface Slider {
	id: number;
	image: string;
}

interface HeroSectionProps {
	sliders?: Slider[];
	isLoading: boolean;
}

export default function HeroSection({ sliders, isLoading }: HeroSectionProps) {
	const { t } = useTranslation();

	return (
		<section className='relative bg-[#283375] pt-16 md:pt-24 pb-12 md:pb-20 rounded-3xl overflow-hidden'>
			{/* Паттерн топографии */}
			<div className='absolute inset-0 bg-topography pointer-events-none' />
			{/* Градиент, чтобы текст слева легко читался */}
			<div className='absolute inset-0 bg-gradient-to-r from-[#283375] via-transparent to-transparent opacity-80 pointer-events-none z-0' />

			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10'>
				<div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-16'>
					{/* Text */}
					<div className='lg:w-3/5 text-left animate-fade-in-left'>
						<h2 className='text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight tracking-tight drop-shadow-sm'>
							{t('Центр независимой сертификации и валидации')}
						</h2>
						<div className='w-20 h-1 bg-blue-400 mb-8 rounded-full' />
						<p className='text-xl text-blue-50/90 mb-10 leading-relaxed max-w-2xl font-medium'>
							{t(
								'Деятельность Центра направлена на подтверждение и признание компетенций по профессии в целом или по отдельным видам деятельности, полученным путем формального, неформального и информального образования с выдачей документа, о присвоении соответствующей квалификации.'
							)}
						</p>
						<div className='flex flex-wrap gap-4'>
							<Link
								to='/apply'
								className='inline-flex items-center bg-white text-[#283375] font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95'
							>
								✦ {t('Подать заявку')}
							</Link>
							<a
								href='#contacts'
								className='inline-flex items-center text-white border-2 border-white/60 font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-all'
							>
								{t('Связаться с нами')}
							</a>
						</div>
					</div>

					{/* Slider */}
					<div className='lg:w-2/5 w-full animate-fade-in-right'>
						<div className='relative group'>
							<div className='absolute -inset-1 bg-blue-400/20 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200' />
							<div className='relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10'>
								{isLoading ? (
									<div className='h-[300px] md:h-[400px] bg-white/5 animate-pulse flex items-center justify-center'>
										<div className='text-white opacity-40'>Loading gallery...</div>
									</div>
								) : sliders && sliders.length > 0 ? (
									<Swiper
										modules={[EffectFade, Pagination, Autoplay]}
										effect='fade'
										fadeEffect={{ crossFade: true }}
										speed={1000}
										spaceBetween={0}
										slidesPerView={1}
										pagination={{ clickable: true }}
										autoplay={{ delay: 3500, disableOnInteraction: false }}
										className='h-[300px] md:h-[400px] w-full'
									>
										{sliders.map((slide, idx) => (
											<SwiperSlide key={slide.id}>
												<img
													src={slide.image}
													alt='Slider'
													loading={idx === 0 ? 'eager' : 'lazy'}
													decoding='async'
													className='w-full h-full object-cover'
												/>
											</SwiperSlide>
										))}
									</Swiper>
								) : (
									<div className='h-[300px] md:h-[400px] w-full bg-blue-900/50 flex items-center justify-center'>
										<img
											src='/static/dist/images/sliders/5784.svg'
											alt='Default'
											className='object-cover w-full h-full opacity-60'
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
