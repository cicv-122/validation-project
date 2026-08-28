interface PageHeroProps {
	title: string;
	subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
	return (
		<section className='relative bg-[#283375] py-12 rounded-3xl'>
			<div className='absolute inset-0 opacity-10 bg-topography pointer-events-none' />
			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10'>
				<h1 className='text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-sm break-words'>
					{title}
				</h1>
				{subtitle && <p className='text-blue-200 text-base max-w-2xl mx-auto'>{subtitle}</p>}
				<div className='w-16 h-1 bg-blue-400 rounded mx-auto mt-4' />
			</div>
		</section>
	);
}
