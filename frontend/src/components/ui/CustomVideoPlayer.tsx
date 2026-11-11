// frontend/src/components/ui/CustomVideoPlayer.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CustomVideoPlayerProps {
	src: string;
	poster?: string;
	className?: string;
	containerClassName?: string;
}

function formatTime(seconds: number): string {
	if (isNaN(seconds) || seconds < 0) return '0:00';
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function CustomVideoPlayer({
	src,
	poster,
	className,
	containerClassName,
}: CustomVideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef<HTMLDivElement>(null);
	const volumeTrackRef = useRef<HTMLDivElement>(null);
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

	// Обновление прогресса
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

	// Изменение громкости по вертикальному слайдеру
	const updateVolumeFromClientY = (clientY: number) => {
		if (!volumeTrackRef.current || !videoRef.current) return;
		const rect = volumeTrackRef.current.getBoundingClientRect();
		const offsetFromBottom = rect.bottom - clientY;
		const newVol = Math.max(0, Math.min(1, offsetFromBottom / rect.height));
		videoRef.current.volume = newVol;
		videoRef.current.muted = newVol === 0;
		setVolume(newVol);
		setIsMuted(newVol === 0);
	};

	const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

	// Перемотка видео
	const updateProgressFromClientX = (clientX: number) => {
		if (!progressRef.current || !videoRef.current || duration <= 0) return;
		const rect = progressRef.current.getBoundingClientRect();
		const clickX = clientX - rect.left;
		const pct = Math.max(0, Math.min(1, clickX / rect.width));
		const newTime = pct * duration;
		videoRef.current.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

	const currentVolPct = isMuted ? 0 : Math.round(volume * 100);
	const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

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
			<div
				className={`absolute bottom-0 left-0 right-0 z-30 px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
					showControls || !isPlaying || isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
				}`}
			>
				{/* Полоса прогресса (Scrubber) */}
				<div
					ref={progressRef}
					onMouseDown={handleProgressMouseDown}
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

				{/* Кнопки управления и таймлайн */}
				<div className='flex items-center justify-between text-white text-xs sm:text-sm'>
					{/* Левая группа: Play/Pause и Время */}
					<div className='flex items-center gap-3'>
						<button
							type='button'
							onClick={togglePlay}
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
						{/* ВЕРТИКАЛЬНЫЙ ЗВУК */}
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
									onMouseDown={handleVolumeMouseDown}
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
								onClick={toggleMute}
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

						{/* Кнопка Fullscreen */}
						<button
							type='button'
							onClick={toggleFullscreen}
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
		</div>
	);
}
