import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import {
	StepConfirm,
	StepDocuments,
	StepPersonal,
	StepProfession,
} from '../features/apply-form';
import {
	ApplyInfoFooter,
	ApplyStepperHeader,
	ApplySuccessView,
} from '../widgets/apply-wizard';
import { SEO } from '../shared/ui';
import { analyzeKyrgyzPin, CitizenshipCode } from '../shared/lib';

interface DocUpload {
	file: File;
	doc_type: string;
	description: string;
}

const STEPS = ['Личные данные', 'Профессия', 'Документы', 'Подтверждение'];

export default function Apply() {
	const { t } = useTranslation();
	const [step, setStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [submitResult, setSubmitResult] = useState<{
		success: boolean;
		regNumber?: string;
		error?: string;
	} | null>(null);

	const [form, setForm] = useState({
		full_name: '',
		birth_year: '',
		citizenship: '' as CitizenshipCode,
		inn: '',
		phone: '',
		whatsapp: '',
		email: '',
		address: '',
		profession_id: undefined as number | undefined,
		profession: '',
		specialization_id: undefined as number | undefined,
		specialization: '',
		qualification_level: '',
		application_type: 'certification',
		data_consent: false,
	});

	const [documents, setDocuments] = useState<DocUpload[]>([]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		setValidationError(null);
		if (type === 'checkbox') {
			setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleDocAdd = (file: File, doc_type: string) => {
		if (!file) return;
		setDocuments((prev) => {
			const filtered = prev.filter((d) => d.doc_type !== doc_type);
			return [...filtered, { file, doc_type, description: '' }];
		});
	};

	// Валидация всей формы перед отправкой
	const validateForm = () => {
		if (!form.full_name.trim()) {
			return { isValid: false, stepIndex: 0, error: 'Укажите ФИО кандидата (Шаг 1)' };
		}
		if (form.birth_year) {
			const by = parseInt(form.birth_year, 10);
			const currentYear = new Date().getFullYear();
			if (isNaN(by) || by < 1935 || by > currentYear - 14) {
				return {
					isValid: false,
					stepIndex: 0,
					error: `Укажите реальный год рождения (от 1935 до ${currentYear - 14}) (Шаг 1)`,
				};
			}
		}
		if (!form.citizenship) {
			return { isValid: false, stepIndex: 0, error: 'Выберите гражданство (Шаг 1)' };
		}
		if (!form.inn.trim()) {
			return { isValid: false, stepIndex: 0, error: 'Укажите персональный номер (ПИН / ИНН) (Шаг 1)' };
		}
		const pinCheck = analyzeKyrgyzPin(form.inn, form.full_name, form.citizenship);
		if (!pinCheck.isValid) {
			return {
				isValid: false,
				stepIndex: 0,
				error: 'Неправильный ПИН / ИНН (Шаг 1)',
			};
		}
		if (
			form.birth_year &&
			pinCheck.birthYear &&
			parseInt(form.birth_year, 10) !== pinCheck.birthYear
		) {
			return {
				isValid: false,
				stepIndex: 0,
				error: `Указанный год рождения (${form.birth_year}) не совпадает с годом рождения в ПИН (${pinCheck.birthYear}) (Шаг 1)`,
			};
		}
		if (!form.phone.trim()) {
			return { isValid: false, stepIndex: 0, error: 'Укажите номер телефона для связи (Шаг 1)' };
		}
		if (!form.profession.trim()) {
			return { isValid: false, stepIndex: 1, error: 'Укажите вашу профессию (Шаг 2)' };
		}
		if (!form.data_consent) {
			return { isValid: false, stepIndex: 3, error: 'Необходимо подтвердить согласие на обработку данных (Шаг 4)' };
		}
		return { isValid: true, stepIndex: 3, error: null };
	};

	const handleNext = () => {
		setValidationError(null);
		if (step === 0) {
			if (!form.full_name.trim()) {
				setValidationError('Укажите ФИО кандидата');
				return;
			}
			if (form.birth_year) {
				const by = parseInt(form.birth_year, 10);
				const currentYear = new Date().getFullYear();
				if (isNaN(by) || by < 1935 || by > currentYear - 14) {
					setValidationError(`Укажите реальный год рождения (от 1935 до ${currentYear - 14})`);
					return;
				}
			}
			if (!form.citizenship) {
				setValidationError('Выберите гражданство');
				return;
			}
			if (!form.inn.trim()) {
				setValidationError('Укажите персональный номер (ПИН / ИНН)');
				return;
			}
			const pinCheck = analyzeKyrgyzPin(form.inn, form.full_name, form.citizenship);
			if (!pinCheck.isValid) {
				setValidationError('Неправильный ПИН / ИНН');
				return;
			}
			if (
				form.birth_year &&
				pinCheck.birthYear &&
				parseInt(form.birth_year, 10) !== pinCheck.birthYear
			) {
				setValidationError(
					`Указанный год рождения (${form.birth_year}) не совпадает с годом рождения в ПИН (${pinCheck.birthYear})`
				);
				return;
			}
			if (!form.phone.trim()) {
				setValidationError('Укажите номер телефона для связи');
				return;
			}
		} else if (step === 1) {
			if (!form.profession.trim()) {
				setValidationError('Укажите вашу профессию');
				return;
			}
		}
		setStep((s) => s + 1);
	};

	const handleSubmit = async () => {
		const check = validateForm();
		if (!check.isValid) {
			setValidationError(check.error);
			setStep(check.stepIndex);
			return;
		}

		setIsSubmitting(true);
		setValidationError(null);
		try {
			const data = new FormData();
			Object.entries(form).forEach(([key, val]) => {
				if (val !== undefined && val !== null && val !== '') {
					data.append(key, String(val));
				}
			});

			const docTypes: string[] = [];
			documents.forEach((doc, i) => {
				data.append(`doc_file_${i}`, doc.file);
				data.append(`doc_desc_${i}`, doc.description);
				docTypes.push(doc.doc_type);
			});
			docTypes.forEach((t) => data.append('doc_types', t));

			const response = await apiClient.post('/certification/apply/', data, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setSubmitResult({ success: true, regNumber: response.data.registration_number });
		} catch (err: any) {
			const msg = err?.response?.data
				? Object.values(err.response.data).flat().join(' ')
				: 'Произошла ошибка при отправке заявки. Попробуйте ещё раз.';
			setSubmitResult({ success: false, error: msg });
		} finally {
			setIsSubmitting(false);
		}
	};

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
					steps={STEPS}
					currentStep={step}
					onSelectStep={(i) => {
						setValidationError(null);
						setStep(i);
					}}
				/>

				{/* Ошибка валидации */}
				{validationError && (
					<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between animate-shake'>
						<div className='flex items-center gap-2'>
							<svg className='w-4 h-4 text-red-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
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

				{/* Основная карточка шага */}
				<div className='bg-white rounded-2xl shadow-lg p-8'>
					{step === 0 && (
						<StepPersonal
							form={form}
							onChange={handleChange}
							onInnChange={(val) => setForm((prev) => ({ ...prev, inn: val }))}
							onCitizenshipChange={(cit) => {
								setValidationError(null);
								setForm((prev) => ({ ...prev, citizenship: cit }));
							}}
						/>
					)}
					{step === 1 && (
						<StepProfession
							form={form}
							onChange={handleChange}
							onSelectProfession={(prof) =>
								setForm((prev) => ({
									...prev,
									profession_id: prof.id,
									profession: prof.name_ru,
									qualification_level: prof.qual_level_min ? String(prof.qual_level_min) : prev.qualification_level,
									specialization_id: undefined,
									specialization: '',
								}))
							}
							onSelectSpecialization={(spec, customText) =>
								setForm((prev) => ({
									...prev,
									specialization_id: spec ? spec.id : undefined,
									specialization: spec ? spec.title_ru : (customText || ''),
								}))
							}
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
							onClick={() => {
								setValidationError(null);
								setStep((s) => Math.max(0, s - 1));
							}}
							disabled={step === 0}
							className='px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
						>
							{t('← Назад')}
						</button>
						{step < STEPS.length - 1 ? (
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

				{/* Адрес и контакты */}
				<ApplyInfoFooter />
			</div>
		</div>
	);
}
