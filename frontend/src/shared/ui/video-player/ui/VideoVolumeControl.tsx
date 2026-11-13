import React, { useRef } from 'react';

interface VideoVolumeControlProps {
	volume: number;
	isMuted: boolean;
	onVolumeChange: (newVol: number) => void;
	onToggleMute: () => void;
}

export const VideoVolumeControl: React.FC<VideoVolumeControlProps> = ({
	volume,
	isMuted,
	onVolumeChange,
	onToggleMute,
}) => {
	const volumeTrackRef = useRef<HTMLDivElement>(null);

	const updateVolumeFromClientY = (clientY: number) => {
		if (!volumeTrackRef.current) return;
		const rect = volumeTrackRef.current.getBoundingClientRect();
		const offsetFromBottom = rect.bottom - clientY;
		const newVol = Math.max(0, Math.min(1, offsetFromBottom / rect.height));
		onVolumeChange(newVol);
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		updateVolumeFromClientY(e.clientY);

		const onMouseMove = (moveEvent: MouseEvent) => {
			updateVolumeFromClientY(moveEvent.clientY);
		};
		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	};

	const currentVolPct = isMuted ? 0 : Math.round(volume * 100);

	return (
		<div className='relative group/vol flex items-center'>
			{/* Выпадающая вверх вертикальная плашка со слайдером звука */}
			<div className='absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-3 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 flex flex-col items-center gap-2 z-40 transition-all duration-200 opacity-0 pointer-events-none group-hover/vol:opacity-100 group-hover/vol:pointer-events-auto'>
				{/* Процент громкости */}
				<span className='text-[10px] font-mono font-bold text-white/90 select-none'>
					{currentVolPct}%
				</span>

				{/* Вертикальная дорожка звука */}
				<div
					ref={volumeTrackRef}
					onMouseDown={handleMouseDown}
					className='w-2 h-24 bg-white/20 hover:bg-white/30 rounded-full relative cursor-pointer overflow-hidden transition-colors'
					title='Регулировка громкости'
				>
					{/* Заполненная часть снизу вверх */}
					<div
						className='absolute bottom-0 left-0 right-0 bg-[#3b82f6] rounded-full transition-all'
						style={{ height: `${currentVolPct}%` }}
					/>
				</div>
			</div>

			{/* Кнопка громкости (динамик) */}
			<button
				type='button'
				onClick={onToggleMute}
				className='text-white hover:text-blue-400 transition-colors p-1 rounded-lg cursor-pointer'
				title={isMuted || volume === 0 ? 'Включить звук' : 'Выключить звук'}
			>
				{isMuted || volume === 0 ? (
					<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
						<path d='M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z' />
					</svg>
				) : volume < 0.5 ? (
					<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
						<path d='M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z' />
					</svg>
				) : (
					<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
						<path d='M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z' />
					</svg>
				)}
			</button>
		</div>
	);
};
