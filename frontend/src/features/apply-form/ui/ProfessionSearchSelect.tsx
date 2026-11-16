import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/client';
import type { ProfessionCatalogItem } from '../../../types';

interface ProfessionSearchSelectProps {
	value: string;
	onChange: (value: string) => void;
	onSelectProfession: (item: ProfessionCatalogItem) => void;
	selectedProf: ProfessionCatalogItem | null;
	setSelectedProf: (item: ProfessionCatalogItem | null) => void;
}

export function ProfessionSearchSelect({
	value,
	onChange,
	onSelectProfession,
	selectedProf,
	setSelectedProf,
}: ProfessionSearchSelectProps) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language || 'ru';

	const [searchQuery, setSearchQuery] = useState(value || '');
	const [professionsList, setProfessionsList] = useState<ProfessionCatalogItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpenDropdown, setIsOpenDropdown] = useState(false);

	useEffect(() => {
		setSearchQuery(value || '');
	}, [value]);

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
		onChange(profTitle);
	};

	return (
		<div className='relative'>
			<label className='block text-sm font-semibold text-gray-800 mb-1.5 flex items-center justify-between'>
				<span>{t('Профессия')}</span>
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
						onChange(val);
					}}
					onFocus={() => {
						if (professionsList.length > 0) setIsOpenDropdown(true);
					}}
					placeholder={t('Начните вводить профессию (напр. Повар, Электрогазосварщик, Швея)...')}
					className='w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#283375] focus:border-[#283375] outline-none text-sm transition-all pr-10'
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
						<svg className='w-5 h-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
						</svg>
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
								className='w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-3 group'
							>
								<div>
									<p className='text-sm font-bold text-gray-900 group-hover:text-blue-700'>
										{title}
									</p>
								</div>
								<span className='text-xs font-mono font-medium text-gray-400 group-hover:text-blue-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shrink-0'>
									{item.okz_code}
								</span>
							</button>
						);
					})}
				</div>
			)}

			{/* Если ничего не найдено в справочнике */}
			{isOpenDropdown && searchQuery.trim().length >= 2 && professionsList.length === 0 && !isLoading && (
				<div className='absolute left-0 right-0 z-30 mt-1.5 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl text-center space-y-2'>
					<p className='text-xs text-gray-500'>
						В справочнике нет точного совпадения «<b>{searchQuery}</b>».
					</p>
					<button
						type='button'
						onClick={() => {
							setIsOpenDropdown(false);
							onChange(searchQuery);
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
	);
}
