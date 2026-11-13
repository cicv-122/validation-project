import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { ProfessionCatalogItem, SpecializationItem } from '../../../types';

interface FormData {
	profession_id?: number;
	profession: string;
	specialization_id?: number;
	specialization?: string;
	qualification_level: string;
	application_type: string;
}

interface StepProfessionProps {
	form: FormData;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	onSelectProfession: (prof: ProfessionCatalogItem) => void;
	onSelectSpecialization: (spec: SpecializationItem | null, customText?: string) => void;
}

const TYPE_OPTIONS = [
	{
		value: 'certification',
		label: 'Сертификация',
		desc: 'Для выпускников колледжей, профлицеев или специализированных курсов',
		icon: '🎓',
	},
	{
		value: 'validation',
		label: 'Валидация',
		desc: 'Для специалистов с практическим опытом работы (без диплома по профессии)',
		icon: '🛠️',
	},
];

export default function StepProfession({
	form,
	onChange,
	onSelectProfession,
	onSelectSpecialization,
}: StepProfessionProps) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language || 'ru';

	const [searchQuery, setSearchQuery] = useState(form.profession || '');
	const [professionsList, setProfessionsList] = useState<ProfessionCatalogItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenDropdown, setIsOpenDropdown] = useState(false);
	const [selectedProf, setSelectedProf] = useState<ProfessionCatalogItem | null>(null);

	// Debounced search from backend API
	useEffect(() => {
		if (!searchQuery || searchQuery.trim().length < 2) {
			setProfessionsList([]);
			return;
		}

		const timer = setTimeout(async () => {
			setIsLoading(true);
			try {
				const { data } = await apiClient.get<ProfessionCatalogItem[]>(
					`/certification/professions/?q=${encodeURIComponent(searchQuery)}&lang=${lang}&active=true`
				);
				setProfessionsList(data);
				setIsOpenDropdown(true);
			} catch (err) {
				console.error('Error fetching professions catalog:', err);
			} finally {
				setIsLoading(false);
			}
		}, 250);

		return () => clearTimeout(timer);
	}, [searchQuery, lang]);

	const handleChooseProfession = (item: ProfessionCatalogItem) => {
		setSelectedProf(item);
		const profTitle = lang === 'ky' && item.name_ky ? item.name_ky : item.name_ru;
		setSearchQuery(profTitle);
		setIsOpenDropdown(false);
		onSelectProfession(item);
		onChange({
			target: { name: 'profession', value: profTitle },
		} as any);
	};

	const availableSpecializations = selectedProf?.specializations || [];

	return (
		<div>
			<h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
				<span className='w-7 h-7 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold'>
					2
				</span>
				{t('Выбор профессии и квалификации')}
			</h2>

			<div className='space-y-6'>
				{/* 1. Поле выбора профессии */}
				<div className='relative'>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5 flex items-center justify-between'>
						<span>
							{t('Профессия')} <span className='text-red-500'>*</span>
						</span>
						{selectedProf?.okz_code && (
							<span className='text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200'>
								ОКЗ: {selectedProf.okz_code}
							</span>
						)}
					</label>

					<div className='relative'>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => {
								const val = e.target.value;
								setSearchQuery(val);
								setIsOpenDropdown(true);
								onChange({
									target: { name: 'profession', value: val },
								} as any);
							}}
							onFocus={() => {
								if (professionsList.length > 0) setIsOpenDropdown(true);
							}}
							placeholder={t('Начните вводить профессию (напр. Повар, Электрогазосварщик, Швея)...')}
							className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all pr-10'
						/>
						{isLoading ? (
							<div className='absolute right-3.5 top-3.5'>
								<svg className='animate-spin h-5 w-5 text-blue-600' viewBox='0 0 24 24' fill='none'>
									<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
									<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
								</svg>
							</div>
						) : (
							<div className='absolute right-3.5 top-3.5 text-gray-400 pointer-events-none'>
								🔍
							</div>
						)}
					</div>

					{/* Выпадающий список профессий */}
					{isOpenDropdown && professionsList.length > 0 && (
						<div className='absolute left-0 right-0 z-30 mt-1.5 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-xl divide-y divide-gray-100'>
							{professionsList.map((item) => {
								const title = lang === 'ky' && item.name_ky ? item.name_ky : item.name_ru;
								return (
									<button
										key={item.id}
										type='button'
										onClick={() => handleChooseProfession(item)}
										className='w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors flex items-start justify-between gap-3 group'
									>
										<div>
											<p className='text-sm font-bold text-gray-900 group-hover:text-blue-700'>
												{title}
											</p>
											{item.section && (
												<p className='text-xs text-gray-500 line-clamp-1 mt-0.5'>
													{item.section}
												</p>
											)}
										</div>
										<span className='text-xs font-mono font-medium text-gray-400 group-hover:text-blue-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shrink-0'>
											{item.okz_code}
										</span>
									</button>
								);
							})}
						</div>
					)}

					{/* Если ничего не найдено в справочнике — возможность использовать введённый вариант */}
					{isOpenDropdown && searchQuery.trim().length >= 2 && professionsList.length === 0 && !isLoading && (
						<div className='absolute left-0 right-0 z-30 mt-1.5 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl text-center space-y-2'>
							<p className='text-xs text-gray-500'>
								В справочнике нет точного совпадения «<b>{searchQuery}</b>».
							</p>
							<button
								type='button'
								onClick={() => {
									setIsOpenDropdown(false);
									onChange({
										target: { name: 'profession', value: searchQuery },
									} as any);
								}}
								className='px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors cursor-pointer'
							>
								✓ Использовать «{searchQuery}»
							</button>
						</div>
					)}

					<div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
						<span>{t('Выберите из списка или напишите наименование')}</span>
						<a
							href='/ru/contacts'
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-600 hover:underline font-medium'
						>
							{t('Не нашли профессию? Свяжитесь с нами')}
						</a>
					</div>
				</div>

				{/* 2. Поле специализации (чистое, без канцелярщины) */}
				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Специализация (необязательно)')}
					</label>
					<input
						type='text'
						value={form.specialization || ''}
						onChange={(e) => {
							const val = e.target.value;
							onSelectSpecialization(null, val);
							onChange({
								target: { name: 'specialization', value: val },
							} as any);
						}}
						placeholder={t('Например: Кондитерские изделия, Сушист, Трубная сварка...')}
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all'
					/>
					<p className='text-xs text-gray-400 mt-1'>
						{t('Укажите, если у вас есть конкретное узкое направление в профессии')}
					</p>

					{/* Быстрые теги специализаций при их наличии для выбранной профессии */}
					{availableSpecializations.length > 0 && (
						<div className='mt-2.5 flex flex-wrap gap-1.5 items-center'>
							<span className='text-xs text-gray-500 font-medium mr-1'>Быстрый выбор:</span>
							{availableSpecializations.map((spec) => {
								const specTitle = lang === 'ky' && spec.title_ky ? spec.title_ky : spec.title_ru;
								const isSelected = form.specialization === specTitle;
								return (
									<button
										key={spec.id}
										type='button'
										onClick={() => {
											onSelectSpecialization(spec, specTitle);
											onChange({
												target: { name: 'specialization', value: specTitle },
											} as any);
										}}
										className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
											isSelected
												? 'bg-blue-600 text-white border-blue-600 shadow-sm'
												: 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-white'
										}`}
									>
										{specTitle}
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* 3. Квалификационный уровень */}
				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
						{t('Квалификационный уровень (разряд)')}
					</label>
					<input
						type='text'
						name='qualification_level'
						value={form.qualification_level}
						onChange={onChange}
						placeholder={
							selectedProf
								? t('Рекомендуемый: {{min}}-{{max}} разряд', {
										min: selectedProf.qual_level_min,
										max: selectedProf.qual_level_max,
								  })
								: t('Например: 3 разряд')
						}
						className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all'
					/>
					<p className='text-xs text-gray-400 mt-1'>
						{t('Необязательно. Если не уверены, уровень будет определен экспертной комиссией')}
					</p>
				</div>

				{/* 4. Тип процедуры (Сертификация / Валидация) */}
				<div>
					<label className='block text-sm font-semibold text-gray-800 mb-2'>
						{t('Тип процедуры')} <span className='text-red-500'>*</span>
					</label>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						{TYPE_OPTIONS.map((opt) => {
							const isChecked = form.application_type === opt.value;
							return (
								<label
									key={opt.value}
									className={`flex flex-col cursor-pointer rounded-2xl border-2 p-5 transition-all ${
										isChecked
											? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
											: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
									}`}
								>
									<input
										type='radio'
										name='application_type'
										value={opt.value}
										checked={isChecked}
										onChange={onChange}
										className='sr-only'
									/>
									<div className='flex items-center justify-between mb-1.5'>
										<div className='flex items-center gap-2'>
											<span className='text-xl'>{opt.icon}</span>
											<span className='font-bold text-gray-900 text-base'>{t(opt.label)}</span>
										</div>
										<span
											className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
												isChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
											}`}
										>
											{isChecked && <span className='w-1.5 h-1.5 bg-white rounded-full' />}
										</span>
									</div>
									<span className='text-xs text-gray-600 leading-relaxed'>{t(opt.desc)}</span>
								</label>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
