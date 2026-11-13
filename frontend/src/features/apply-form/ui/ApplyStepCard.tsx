import React from 'react';
import { useTranslation } from 'react-i18next';
import StepPersonal from './StepPersonal';
import StepProfession from './StepProfession';
import StepDocuments from './StepDocuments';
import StepConfirm from './StepConfirm';
import type { useApplyWizard } from '../model/useApplyWizard';

type ApplyWizardState = ReturnType<typeof useApplyWizard>;

interface ApplyStepCardProps {
	wizard: ApplyWizardState;
}

export const ApplyStepCard: React.FC<ApplyStepCardProps> = ({ wizard }) => {
	const { t } = useTranslation();
	const {
		step,
		steps,
		form,
		documents,
		validationError,
		setValidationError,
		isSubmitting,
		submitResult,
		handleChange,
		handleInnChange,
		handleCitizenshipChange,
		handleSelectProfession,
		handleSelectSpecialization,
		handleDocAdd,
		handleNext,
		handlePrev,
		handleSubmit,
	} = wizard;

	return (
		<>
			{/* Ошибка валидации */}
			{validationError && (
				<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between animate-shake'>
					<div className='flex items-center gap-2'>
						<svg
							className='w-4 h-4 text-red-500 flex-shrink-0'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
						<span>{t(validationError)}</span>
					</div>
					<button
						type='button'
						onClick={() => setValidationError(null)}
						className='text-xs text-red-500 hover:underline font-medium'
					>
						✕
					</button>
				</div>
			)}

			{/* Основная карточка активного шага */}
			<div className='bg-white rounded-2xl shadow-lg p-8'>
				{step === 0 && (
					<StepPersonal
						form={form}
						onChange={handleChange}
						onInnChange={handleInnChange}
						onCitizenshipChange={handleCitizenshipChange}
					/>
				)}
				{step === 1 && (
					<StepProfession
						form={form}
						onChange={handleChange}
						onSelectProfession={handleSelectProfession}
						onSelectSpecialization={handleSelectSpecialization}
					/>
				)}
				{step === 2 && <StepDocuments documents={documents} onDocAdd={handleDocAdd} />}
				{step === 3 && (
					<StepConfirm
						form={form}
						documentsCount={documents.length}
						errorMsg={submitResult?.error}
						onChange={handleChange}
					/>
				)}

				{/* Кнопки переключения шагов */}
				<div className='flex justify-between mt-8 pt-6 border-t border-gray-100'>
					<button
						onClick={handlePrev}
						disabled={step === 0}
						className='px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
					>
						{t('← Назад')}
					</button>
					{step < steps.length - 1 ? (
						<button
							type='button'
							onClick={handleNext}
							className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-sm'
						>
							{t('Далее →')}
						</button>
					) : (
						<button
							onClick={handleSubmit}
							disabled={isSubmitting}
							className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2'
						>
							{isSubmitting ? (
								<>
									<svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										/>
										<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
									</svg>
									{t('Отправка...')}
								</>
							) : (
								t('Подать заявку!')
							)}
						</button>
					)}
				</div>
			</div>
		</>
	);
};

export default ApplyStepCard;
