interface PageHeroProps {
	title: string;
	subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
	return (
		<section className='relative bg-gradient-to-br from-[#283375] via-[#222c66] to-[#1c2454] dark:from-[#131a38] dark:via-[#161e40] dark:to-[#0f142b] py-14 rounded-3xl border border-transparent dark:border-blue-500/20 shadow-md dark:shadow-2xl overflow-hidden transition-colors duration-300'>
			{/* Фактурный паттерн с мягким градиентным затемнением */}
			<div className='absolute inset-0 opacity-15 dark:opacity-10 bg-topography pointer-events-none' />
			<div className='absolute inset-0 bg-radial-vignette opacity-0 dark:opacity-60 pointer-events-none' />
			
			{/* Неоновый акцентный блик сверху */}
			<div className='absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 dark:via-blue-400/60 to-transparent' />

			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10'>
				<h1 className='text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-sm tracking-tight leading-tight'>
					{title}
				</h1>
				{subtitle && <p className='text-blue-100/90 dark:text-blue-200/80 text-sm sm:text-base max-w-2xl mx-auto font-medium'>{subtitle}</p>}
				<div className='w-16 h-1 bg-blue-400 dark:bg-blue-500 rounded-full mx-auto mt-4 shadow-sm' />
			</div>
		</section>
	);
}
