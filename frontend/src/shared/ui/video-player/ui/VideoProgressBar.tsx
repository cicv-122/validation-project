import React, { useRef } from 'react';

interface VideoProgressBarProps {
	currentTime: number;
	duration: number;
	onSeek: (newTime: number) => void;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
	currentTime,
	duration,
	onSeek,
}) => {
	const progressRef = useRef<HTMLDivElement>(null);

	const updateProgressFromClientX = (clientX: number) => {
		if (!progressRef.current || duration <= 0) return;
		const rect = progressRef.current.getBoundingClientRect();
		const clickX = clientX - rect.left;
		const pct = Math.max(0, Math.min(1, clickX / rect.width));
		onSeek(pct * duration);
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		updateProgressFromClientX(e.clientX);

		const onMouseMove = (moveEvent: MouseEvent) => {
			updateProgressFromClientX(moveEvent.clientX);
		};
		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	};

	const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div
			ref={progressRef}
			onMouseDown={handleMouseDown}
			className='w-full h-1.5 hover:h-2.5 bg-white/25 hover:bg-white/35 rounded-full cursor-pointer relative transition-all group/progress'
		>
			{/* Заполненная часть */}
			<div
				className='h-full bg-[#3b82f6] rounded-full relative'
				style={{ width: `${progressPct}%` }}
			>
				{/* Ползунок */}
				<div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity' />
			</div>
		</div>
	);
};
