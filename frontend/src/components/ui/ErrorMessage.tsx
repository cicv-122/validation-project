interface ErrorMessageProps {
	message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
	return (
		<div className='flex flex-col items-center justify-center py-16 text-center'>
			<div className='w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4'>
				<svg className='w-7 h-7 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' />
				</svg>
			</div>
			<p className='text-red-600 font-medium'>{message ?? 'Произошла ошибка загрузки.'}</p>
		</div>
	);
}
