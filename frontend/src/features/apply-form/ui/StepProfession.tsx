import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProfessionCatalogItem, SpecializationItem } from '../../../types';
import { ApplicationTypeCards } from './ApplicationTypeCards';
import { ProfessionSearchSelect } from './ProfessionSearchSelect';
import { SpecializationInput } from './SpecializationInput';

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

export default function StepProfession({
	form,
	onChange,
	onSelectProfession,
	onSelectSpecialization,
}: StepProfessionProps) {
	const { t } = useTranslation();
	const [selectedProf, setSelectedProf] = useState<ProfessionCatalogItem | null>(null);

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
				<ProfessionSearchSelect
					value={form.profession}
					onChange={(val) => {
						onChange({ target: { name: 'profession', value: val } } as any);
					}}
					onSelectProfession={onSelectProfession}
					selectedProf={selectedProf}
					setSelectedProf={setSelectedProf}
				/>

				<SpecializationInput
					value={form.specialization}
					onChange={(val) => {
						onChange({ target: { name: 'specialization', value: val } } as any);
					}}
					onSelectSpecialization={onSelectSpecialization}
					availableSpecializations={availableSpecializations}
				/>

				{/* Квалификационный уровень */}
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

				<ApplicationTypeCards
					value={form.application_type}
					onChange={onChange}
				/>
			</div>
		</div>
	);
}
