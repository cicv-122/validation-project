import { useTranslation } from 'react-i18next';
import type { SpecializationItem } from '../../../types';

interface SpecializationInputProps {
	value?: string;
	onChange: (value: string) => void;
	onSelectSpecialization: (spec: SpecializationItem | null, customText?: string) => void;
	availableSpecializations: SpecializationItem[];
}

export function SpecializationInput({
	value = '',
	onChange,
	onSelectSpecialization,
	availableSpecializations,
}: SpecializationInputProps) {
	const { t, i18n } = useTranslation();
	const lang = i18n.language || 'ru';

	return (
		<div>
			<label className='block text-sm font-semibold text-gray-800 mb-1.5'>
				{t('Специализация')}
			</label>
			<input
				type='text'
				value={value}
				onChange={(e) => {
					const val = e.target.value;
					onSelectSpecialization(null, val);
					onChange(val);
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
						const isSelected = value === specTitle;
						return (
							<button
								key={spec.id}
								type='button'
								onClick={() => {
									onSelectSpecialization(spec, specTitle);
									onChange(specTitle);
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
	);
}
