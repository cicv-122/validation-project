import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PhotoCropperModalProps {
	file: File;
	onConfirm: (croppedFile: File) => void;
	onCancel: () => void;
}

export default function PhotoCropperModal({ file, onConfirm, onCancel }: PhotoCropperModalProps) {
	const { t } = useTranslation();
	const [imageSrc, setImageSrc] = useState<string>('');
	const [zoom, setZoom] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const imageRef = useRef<HTMLImageElement>(null);

	// 35 x 45 mm aspect ratio = 7:9
	const CROP_WIDTH = 280;
	const CROP_HEIGHT = 360;

	useEffect(() => {
		const reader = new FileReader();
		reader.onload = () => {
			setImageSrc(reader.result as string);
		};
		reader.readAsDataURL(file);
	}, [file]);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		setPosition({
			x: e.clientX - dragStart.x,
			y: e.clientY - dragStart.y,
		});
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	// Touch events for mobile
	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			setIsDragging(true);
			setDragStart({
				x: e.touches[0].clientX - position.x,
				y: e.touches[0].clientY - position.y,
			});
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging || e.touches.length !== 1) return;
		setPosition({
			x: e.touches[0].clientX - dragStart.x,
			y: e.touches[0].clientY - dragStart.y,
		});
	};

	const handleCrop = () => {
		if (!imageRef.current) return;

		const canvas = document.createElement('canvas');
		// Output high resolution (600x780 at 300dpi standard)
		canvas.width = 600;
		canvas.height = (600 / 35) * 45; // ~771 px
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = imageRef.current;
		const scale = canvas.width / CROP_WIDTH;

		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Calculate scaled draw coordinates
		const imgDisplayedWidth = img.width * zoom;
		const imgDisplayedHeight = img.height * zoom;

		ctx.drawImage(
			img,
			(position.x - (imgDisplayedWidth - CROP_WIDTH) / 2) * scale,
			(position.y - (imgDisplayedHeight - CROP_HEIGHT) / 2) * scale,
			imgDisplayedWidth * scale,
			imgDisplayedHeight * scale
		);

		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				const croppedFile = new File([blob], 'photo_35x45.jpg', { type: 'image/jpeg' });
				onConfirm(croppedFile);
			},
			'image/jpeg',
			0.95
		);
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm'>
			<div className='bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col'>
				{/* Header */}
				<div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
					<div>
						<h3 className='font-bold text-gray-900 text-lg'>
							{t('Кадрирование фотографии')}
						</h3>
						<p className='text-xs text-gray-500'>
							{t('Расположите лицо по центру рамки (светлый фон, анфас)')}
						</p>
					</div>
					<button
						type='button'
						onClick={onCancel}
						className='text-gray-400 hover:text-gray-600 text-xl font-bold p-1'
					>
						✕
					</button>
				</div>

				{/* Cropper viewport */}
				<div
					className='relative bg-slate-900 overflow-hidden flex items-center justify-center select-none cursor-move'
					style={{ height: '420px' }}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleMouseUp}
				>
					{imageSrc && (
						<img
							ref={imageRef}
							src={imageSrc}
							alt='Upload Preview'
							draggable={false}
							style={{
								transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
								transition: isDragging ? 'none' : 'transform 0.1s ease-out',
								maxWidth: 'none',
							}}
							className='pointer-events-none'
						/>
					)}

					{/* 35x45 Frame Overlay */}
					<div
						className='absolute border-2 border-blue-500 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none flex flex-col items-center justify-between p-3'
						style={{ width: `${CROP_WIDTH}px`, height: `${CROP_HEIGHT}px` }}
					>
						{/* Head oval guide */}
						<div className='w-32 h-44 border border-dashed border-white/60 rounded-full mt-4 flex items-center justify-center'>
							<span className='text-[10px] text-white/75 uppercase tracking-wider font-medium'>
								{t('Лицо')}
							</span>
						</div>
						<div className='text-[11px] text-white/90 bg-blue-600/80 px-2.5 py-0.5 rounded-full font-medium mb-1'>
							35 × 45 мм
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className='p-6 bg-gray-50 flex flex-col gap-4'>
					<div className='flex items-center gap-3'>
						<span className='text-xs text-gray-500 font-medium'>Zoom:</span>
						<input
							type='range'
							min='0.6'
							max='3.0'
							step='0.05'
							value={zoom}
							onChange={(e) => setZoom(parseFloat(e.target.value))}
							className='flex-1 accent-blue-600 cursor-pointer'
						/>
						<span className='text-xs font-mono text-gray-700 w-8'>{Math.round(zoom * 100)}%</span>
					</div>

					<div className='flex items-center justify-between gap-3 pt-2 border-t border-gray-200'>
						<button
							type='button'
							onClick={() => {
								setPosition({ x: 0, y: 0 });
								setZoom(1);
							}}
							className='px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-xl transition-colors'
						>
							{t('Сброс')}
						</button>
						<div className='flex gap-2'>
							<button
								type='button'
								onClick={onCancel}
								className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors'
							>
								{t('Отмена')}
							</button>
							<button
								type='button'
								onClick={handleCrop}
								className='px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors'
							>
								{t('Применить стандарт 3.5×4.5')}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
