import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoControls } from './VideoControls';

export interface CustomVideoPlayerProps {
	src: string;
	poster?: string;
	className?: string;
	containerClassName?: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
	src,
	poster,
	className,
	containerClassName,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const hideTimerRef = useRef<any>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [prevVolume, setPrevVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showControls, setShowControls] = useState(true);
	const [isHovered, setIsHovered] = useState(false);

	// Обновление времени
	const handleTimeUpdate = () => {
		if (videoRef.current) {
			setCurrentTime(videoRef.current.currentTime);
		}
	};

	const handleLoadedMetadata = () => {
		if (videoRef.current) {
			setDuration(videoRef.current.duration);
		}
	};

	// Переключение Play / Pause
	const togglePlay = useCallback(() => {
		if (!videoRef.current) return;
		if (videoRef.current.paused) {
			videoRef.current.play();
		} else {
			videoRef.current.pause();
		}
	}, []);

	// Переключение Mute
	const toggleMute = () => {
		if (!videoRef.current) return;
		if (isMuted || volume === 0) {
			const restore = prevVolume > 0 ? prevVolume : 0.8;
			videoRef.current.muted = false;
			videoRef.current.volume = restore;
			setVolume(restore);
			setIsMuted(false);
		} else {
			setPrevVolume(volume);
			videoRef.current.muted = true;
			setIsMuted(true);
		}
	};

	// Изменение громкости
	const handleVolumeChange = (newVol: number) => {
		if (!videoRef.current) return;
		videoRef.current.volume = newVol;
		videoRef.current.muted = newVol === 0;
		setVolume(newVol);
		setIsMuted(newVol === 0);
	};

	// Перемотка
	const handleSeek = (newTime: number) => {
		if (!videoRef.current) return;
		videoRef.current.currentTime = newTime;
		setCurrentTime(newTime);
	};

	// Полноэкранный режим
	const toggleFullscreen = () => {
		if (!containerRef.current) return;
		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen().catch(() => {});
		} else {
			document.exitFullscreen().catch(() => {});
		}
	};

	useEffect(() => {
		const handleFsChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener('fullscreenchange', handleFsChange);
		return () => {
			document.removeEventListener('fullscreenchange', handleFsChange);
		};
	}, []);

	// Остановка текущего видео при запуске любого другого видео (только 1 видео играет одновременно)
	useEffect(() => {
		const handleGlobalPlay = (e: Event) => {
			if (videoRef.current && e.target !== videoRef.current && !videoRef.current.paused) {
				videoRef.current.pause();
			}
		};
		document.addEventListener('play', handleGlobalPlay, true);
		return () => {
			document.removeEventListener('play', handleGlobalPlay, true);
		};
	}, []);

	// Автоматическое скрытие контролов при воспроизведении
	const resetHideTimer = useCallback(() => {
		setShowControls(true);
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
		if (isPlaying) {
			hideTimerRef.current = setTimeout(() => {
				setShowControls(false);
			}, 2500);
		}
	}, [isPlaying]);

	const handleMouseMove = () => {
		resetHideTimer();
	};

	return (
		<div
			ref={containerRef}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => {
				setIsHovered(true);
				resetHideTimer();
			}}
			onMouseLeave={() => {
				setIsHovered(false);
				if (isPlaying) setShowControls(false);
			}}
			className={`relative w-full h-full overflow-hidden bg-black select-none group flex items-center justify-center ${containerClassName || ''}`}
		>
			{/* HTML5 Video Element */}
			<video
				ref={videoRef}
				src={src}
				poster={poster}
				preload='metadata'
				playsInline
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onPlay={() => setIsPlaying(true)}
				onPause={() => {
					setIsPlaying(false);
					setShowControls(true);
				}}
				onEnded={() => {
					setIsPlaying(false);
					setShowControls(true);
				}}
				onClick={togglePlay}
				className={`w-full h-full object-contain cursor-pointer ${className || ''}`}
			/>

			{/* Кнопка Play по центру (когда видео на паузе) */}
			{!isPlaying && (
				<div
					onClick={togglePlay}
					className='absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-all duration-300 cursor-pointer z-20 group/play'
					title='Воспроизвести'
				>
					<button
						type='button'
						onClick={(e) => {
							e.stopPropagation();
							togglePlay();
						}}
						className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 hover:bg-white text-[#283375] shadow-2xl flex items-center justify-center transition-all duration-200 group-hover/play:scale-110 active:scale-95 cursor-pointer ring-4 ring-white/30 backdrop-blur-xs'
						aria-label='Воспроизвести видео'
					>
						<svg
							className='w-7 h-7 sm:w-8 sm:h-8 fill-[#283375] translate-x-0.5'
							viewBox='0 0 24 24'
						>
							<path d='M8 5v14l11-7z' />
						</svg>
					</button>
				</div>
			)}

			{/* Нижняя панель управления */}
			<VideoControls
				isPlaying={isPlaying}
				currentTime={currentTime}
				duration={duration}
				volume={volume}
				isMuted={isMuted}
				isFullscreen={isFullscreen}
				showControls={showControls}
				isHovered={isHovered}
				onTogglePlay={togglePlay}
				onSeek={handleSeek}
				onVolumeChange={handleVolumeChange}
				onToggleMute={toggleMute}
				onToggleFullscreen={toggleFullscreen}
			/>
		</div>
	);
};

export default CustomVideoPlayer;
