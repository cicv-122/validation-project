interface DocumentCardProps {
	title: string;
	description: string;
	downloadHref?: string;
	downloadLabel: string;
}

export default function DocumentCard({ title, description, downloadHref = '#', downloadLabel }: DocumentCardProps) {
	return (
		<div className='bg-white dark:bg-[#11162b] border border-gray-100 dark:border-blue-900/40 p-8 rounded-2xl shadow-sm hover:shadow-xl dark:hover:border-blue-500/50 transition-all flex flex-col justify-between'>
			<div>
				<div className='w-12 h-12 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40 rounded-xl flex items-center justify-center mb-6'>
					<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
					</svg>
				</div>
				<h3 className='font-bold text-gray-900 dark:text-white text-lg mb-3 leading-snug'>{title}</h3>
				<p className='text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>{description}</p>
			</div>
			<a
				href={downloadHref}
				target='_blank'
				rel='noreferrer'
				className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors'
			>
				<svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
				</svg>
				{downloadLabel}
			</a>
		</div>
	);
}
