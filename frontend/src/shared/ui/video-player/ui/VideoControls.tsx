import React from 'react';
import { VideoProgressBar } from './VideoProgressBar';
import { VideoVolumeControl } from './VideoVolumeControl';

function formatTime(seconds: number): string {
	if (isNaN(seconds) || seconds < 0) return '0:00';
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface VideoControlsProps {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isFullscreen: boolean;
	showControls: boolean;
	isHovered: boolean;
	onTogglePlay: () => void;
	onSeek: (newTime: number) => void;
	onVolumeChange: (newVol: number) => void;
	onToggleMute: () => void;
	onToggleFullscreen: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
	isPlaying,
	currentTime,
	duration,
	volume,
	isMuted,
	isFullscreen,
	showControls,
	isHovered,
	onTogglePlay,
	onSeek,
	onVolumeChange,
	onToggleMute,
	onToggleFullscreen,
}) => {
	return (
		<div
			className={`absolute bottom-0 left-0 right-0 z-30 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
				showControls || !isPlaying || isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
			}`}
		>
			{/* Полоса прогресса (Scrubber) */}
			<VideoProgressBar
				currentTime={currentTime}
				duration={duration}
				onSeek={onSeek}
			/>

			{/* Кнопки управления и таймлайн */}
			<div className='flex items-center justify-between text-white text-xs sm:text-sm'>
				{/* Левая группа: Play/Pause и Время */}
				<div className='flex items-center gap-3'>
					<button
						type='button'
						onClick={onTogglePlay}
						className='text-white hover:text-blue-400 transition-colors p-1 rounded-lg cursor-pointer'
						title={isPlaying ? 'Пауза' : 'Воспроизвести'}
					>
						{isPlaying ? (
							<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
								<path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
							</svg>
						) : (
							<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
								<path d='M8 5v14l11-7z' />
							</svg>
						)}
					</button>

					{/* Время: 0:00 / 1:18 */}
					<div className='font-mono text-[11px] sm:text-xs text-white/90 select-none'>
						<span>{formatTime(currentTime)}</span>
						<span className='mx-1 text-white/40'>/</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				{/* Правая группа: Вертикальный регулятор громкости и Fullscreen */}
				<div className='flex items-center gap-3'>
					<VideoVolumeControl
						volume={volume}
						isMuted={isMuted}
						onVolumeChange={onVolumeChange}
						onToggleMute={onToggleMute}
					/>

					{/* Кнопка Fullscreen */}
					<button
						type='button'
						onClick={onToggleFullscreen}
						className='text-white hover:text-blue-400 transition-colors p-1 rounded-lg cursor-pointer'
						title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Во весь экран'}
					>
						{isFullscreen ? (
							<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
								<path d='M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z' />
							</svg>
						) : (
							<svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
								<path d='M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' />
							</svg>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};
