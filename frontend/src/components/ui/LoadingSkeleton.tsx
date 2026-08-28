interface SkeletonProps {
	count?: number;
	className?: string;
}

export default function LoadingSkeleton({ count = 3, className = 'h-64' }: SkeletonProps) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />
			))}
		</div>
	);
}
