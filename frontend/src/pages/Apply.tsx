import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import {
	StepConfirm,
	StepDocuments,
	StepPersonal,
	StepProfession,
} from '../features/apply-form';
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

	// Success screen
	if (submitResult?.success) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-16'>
				<div className='bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center'>
					<div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
						<svg
							className='w-10 h-10 text-green-600'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M5 13l4 4L19 7'
							/>
						</svg>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-3'>{t('Заявка успешно подана!')}</h2>
					<p className='text-gray-600 mb-6'>
						{t('Ваш регистрационный номер для отслеживания статуса:')}
					</p>
					<div className='bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-6'>
						<p className='text-xs text-blue-500 uppercase tracking-wider mb-1'>
							{t('Регистрационный номер')}
						</p>
						<p className='font-mono text-base font-bold text-blue-800 break-all'>
							{submitResult.regNumber}
						</p>
					</div>
					<p className='text-sm text-gray-500 mb-8'>
						{t(
							'Сохраните этот номер. Вы можете проверить статус вашей заявки на странице «Статус заявки».'
						)}
					</p>
					<div className='flex gap-3 justify-center flex-wrap'>
						{form.phone && (
							<a
								href={`https://wa.me/${form.whatsapp ? form.whatsapp.replace(/\D/g, '') : form.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
									`Здравствуйте, ${form.full_name}!\nВаша заявка на сертификацию/валидацию зарегистрирована в ЦНСВ при МП КР.\nРегистрационный номер: ${submitResult.regNumber}\nПроверить статус заявки: https://validation.kg/apply/status?reg=${submitResult.regNumber}`
								)}`}
								target='_blank'
								rel='noopener noreferrer'
								className='px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2'
							>
								<svg className='w-4 h-4 fill-white flex-shrink-0' viewBox='0 0 24 24'>
									<path d='M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.539 1.77.828 2.791.828 3.18 0 5.767-2.587 5.767-5.766.001-3.181-2.586-5.766-5.767-5.766zm3.385 8.163c-.144.405-.837.774-1.17.822-.312.043-.683.07-1.107-.069-.252-.083-.578-.204-1.002-.387-1.799-.778-2.96-2.6-3.05-2.72-.089-.12-.733-.976-.733-1.86 0-.885.464-1.32.629-1.5.165-.18.36-.225.48-.225.12 0 .24.002.345.007.111.005.26-.042.405.308.15.36.51 1.246.555 1.336.045.09.075.195.015.315-.06.12-.09.195-.18.3-.09.105-.189.234-.27.315-.09.09-.184.188-.079.368.105.18.468.772 1.004 1.25.688.614 1.27.804 1.45.894.18.09.285.075.39-.045.105-.12.45-.525.57-.705.12-.18.24-.15.405-.09.165.06 1.05.495 1.23.585.18.09.3.135.345.21.045.075.045.435-.099.84z' />
								</svg>
								<span>{t('Сохранить в WhatsApp')}</span>
							</a>
						)}
						<a
							href={`/apply/status?reg=${submitResult.regNumber}`}
							className='px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
						>
							{t('Проверить статус')}
						</a>
						<a
							href='/'
							className='px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'
						>
							{t('На главную')}
						</a>
					</div>
				</div>
			</div>
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
				{/* Header */}
				<div className='text-center mb-10'>
					<h1 className='text-3xl font-extrabold text-gray-900'>
						{t('Заявка на сертификацию / валидацию')}
					</h1>
					<p className='mt-3 text-gray-500 text-sm'>
						{t('Приложение №1 — Центр независимой сертификации и валидации при МП КР')}
					</p>
				</div>

				{/* Stepper */}
				<div className='flex items-center mb-8 gap-0'>
					{STEPS.map((label, i) => (
						<button
							key={i}
							type='button'
							onClick={() => {
								setValidationError(null);
								setStep(i);
							}}
							className='flex-1 flex flex-col items-center group cursor-pointer focus:outline-none'
						>
							<div
								className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
									i < step
										? 'bg-blue-600 border-blue-600 text-white group-hover:scale-105'
										: i === step
										? 'bg-white border-blue-600 text-blue-600 shadow-md group-hover:scale-105'
										: 'bg-white border-gray-200 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500'
								}`}
							>
								{i < step ? '✓' : i + 1}
							</div>
							<span
								className={`text-xs mt-1 text-center transition-colors ${
									i === step ? 'text-blue-600 font-semibold' : 'text-gray-400 group-hover:text-gray-600'
								}`}
							>
								{t(label)}
							</span>
						</button>
					))}
				</div>

				{/* Validation Banner if any error */}
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

				{/* Card */}
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

					{/* Navigation */}
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

				{/* Info box */}
				<div className='mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800'>
					<p className='font-semibold mb-1'>{t('Адрес Центра:')}</p>
					<p>{t('ул. Жусупа Абдрахманова, 276')}</p>
					<p className='mt-1'>Тел: +996703047535, +996755222794</p>
				</div>
			</div>
		</div>
	);
}
