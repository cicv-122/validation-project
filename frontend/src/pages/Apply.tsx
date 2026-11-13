import { useTranslation } from 'react-i18next';
import { useApplyWizard, ApplyStepCard } from '../features/apply-form';
import {
	ApplyInfoFooter,
	ApplyStepperHeader,
	ApplySuccessView,
} from '../widgets/apply-wizard';
import { SEO } from '../shared/ui';

export default function Apply() {
	const { t } = useTranslation();
	const wizard = useApplyWizard();
	const { step, setStep, steps, form, submitResult, setValidationError } = wizard;

	// Экран успешной подачи заявки
	if (submitResult?.success && submitResult.regNumber) {
		return (
			<ApplySuccessView
				regNumber={submitResult.regNumber}
				fullName={form.full_name}
				phone={form.phone}
				whatsapp={form.whatsapp}
			/>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-28 pb-12 px-4'>
			<SEO
				title={`${t('Подача заявки')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Подайте заявку на сертификацию или валидацию вашей профессиональной квалификации в Центре независимой сертификации и валидации.'
				)}
			/>
			<div className='max-w-3xl mx-auto'>
				{/* Заголовок */}
				<div className='text-center mb-10'>
					<h1 className='text-3xl font-extrabold text-gray-900'>
						{t('Заявка на сертификацию / валидацию')}
					</h1>
					<p className='mt-3 text-gray-500 text-sm'>
						{t('Приложение №1 — Центр независимой сертификации и валидации при МП КР')}
					</p>
				</div>

				{/* Пошаговая навигация */}
				<ApplyStepperHeader
					steps={steps}
					currentStep={step}
					onSelectStep={(i) => {
						setValidationError(null);
						setStep(i);
					}}
				/>

				{/* Активный шаг и навигация */}
				<ApplyStepCard wizard={wizard} />

				{/* Адрес и контакты */}
				<ApplyInfoFooter />
			</div>
		</div>
	);
}
