import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PhotoCropperModal from './PhotoCropperModal';

interface DocUpload {
	file: File;
	doc_type: string;
	description: string;
}

const DOC_TYPES = [
	{
		value: 'photo',
		label: 'Фотография (3×4 см)',
		hint: 'Четкое фото лица на светлом фоне (как на паспорт). Есть встроенная обрезка.',
		badge: 'Для сертификата',
		isPhoto: true,
		requiredBadge: 'Рекомендуется',
	},
	{
		value: 'passport',
		label: 'Копия паспорта (ID-карта)',
		hint: 'Лицевая сторона документа для подтверждения персонального номера (ПИН)',
		requiredBadge: 'Рекомендуется',
	},
	{
		value: 'resume',
		label: 'Трудовая книжка или резюме',
		hint: 'Подтверждение стажа и практического опыта работы по профессии',
	},
	{
		value: 'diploma',
		label: 'Документы об образовании (при наличии)',
		hint: 'Дипломы, аттестаты, свидетельства или сертификаты обучающих курсов',
	},
	{
		value: 'work_sample',
		label: 'Образцы работ или портфолио (по желанию)',
		hint: 'Фотографии изделий, результаты выполненных заказов или отзывы работодателей',
	},
];

interface StepDocumentsProps {
	documents: DocUpload[];
	onDocAdd: (file: File, doc_type: string) => void;
}

export default function StepDocuments({ documents, onDocAdd }: StepDocumentsProps) {
	const { t } = useTranslation();
	const [cropFile, setCropFile] = useState<File | null>(null);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, doc_type: string) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (doc_type === 'photo') {
			setCropFile(file);
			e.target.value = '';
		} else {
			onDocAdd(file, doc_type);
			e.target.value = '';
		}
	};

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 mb-2 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold'>
					3
				</span>
				{t('Прикрепление документов')}
			</h2>
			<p className='text-sm text-gray-500 mb-6'>
				{t(
					'Прикрепите документы для подтверждения личности и опыта. Если какого-то документа нет под рукой, его можно донести позже экспертной комиссии.'
				)}
			</p>

			<div className='space-y-3.5'>
				{DOC_TYPES.map((dt) => {
					const uploaded = documents.find((d) => d.doc_type === dt.value);
					return (
						<div
							key={dt.value}
							className={`rounded-2xl border p-4 sm:p-5 transition-all ${
								uploaded
									? 'border-green-300 bg-green-50/30'
									: 'border-gray-200 bg-white hover:border-gray-300'
							}`}
						>
							<div className='flex items-start justify-between gap-4'>
								<div className='flex-1 min-w-0'>
									<div className='flex flex-wrap items-center gap-2'>
										<p className='text-sm font-bold text-gray-900'>{t(dt.label)}</p>
										{dt.badge && (
											<span className='text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200'>
												{t(dt.badge)}
											</span>
										)}
									</div>
									<p className='text-xs text-gray-500 mt-1 leading-relaxed'>{t(dt.hint)}</p>

									{uploaded && (
										<div className='mt-3 flex items-center gap-3'>
											{dt.isPhoto && (
												<img
													src={URL.createObjectURL(uploaded.file)}
													alt='Uploaded Photo'
													className='w-11 h-14 object-cover rounded-lg border border-green-500 shadow-sm shrink-0'
												/>
											)}
											<div className='min-w-0'>
												<p className='text-xs text-green-700 font-semibold flex items-center gap-1.5 truncate'>
													<svg className='w-4 h-4 text-green-600 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
														<path
															fillRule='evenodd'
															d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
															clipRule='evenodd'
														/>
													</svg>
													<span className='truncate'>{uploaded.file.name}</span>
												</p>
												<span className='text-[11px] text-gray-400'>
													{(uploaded.file.size / 1024).toFixed(0)} КБ
												</span>
											</div>
										</div>
									)}
								</div>

								<div className='flex flex-col sm:flex-row gap-2 shrink-0'>
									<label className='cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm text-center'>
										{uploaded ? t('Заменить') : t('Выбрать файл')}
										<input
											type='file'
											className='sr-only'
											accept={dt.isPhoto ? 'image/jpeg,image/png,image/jpg' : '.pdf,.jpg,.jpeg,.png,.doc,.docx,.mp4'}
											onChange={(e) => handleFileSelect(e, dt.value)}
										/>
									</label>

									{dt.isPhoto && (
										<label className='cursor-pointer px-3 py-2 rounded-xl text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap border border-gray-200 text-center flex items-center justify-center gap-1.5'>
											<svg className='w-4 h-4 text-gray-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' />
												<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 13a3 3 0 11-6 0 3 3 0 016 0z' />
											</svg>
											<span>{t('Камера')}</span>
											<input
												type='file'
												accept='image/*'
												capture='user'
												className='sr-only'
												onChange={(e) => handleFileSelect(e, dt.value)}
											/>
										</label>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Модальное окно кадрирования фото */}
			{cropFile && (
				<PhotoCropperModal
					file={cropFile}
					onConfirm={(cropped) => {
						onDocAdd(cropped, 'photo');
						setCropFile(null);
					}}
					onCancel={() => setCropFile(null)}
				/>
			)}
		</div>
	);
}
