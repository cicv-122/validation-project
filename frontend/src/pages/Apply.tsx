import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import StepConfirm from '../components/apply/StepConfirm';
import StepDocuments from '../components/apply/StepDocuments';
import StepPersonal from '../components/apply/StepPersonal';
import StepProfession from '../components/apply/StepProfession';
import { SEO } from '../components/ui';

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
		inn: '',
		phone: '',
		whatsapp: '',
		email: '',
		address: '',
		profession: '',
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

	const handleDocAdd = (e: React.ChangeEvent<HTMLInputElement>, doc_type: string) => {
		const file = e.target.files?.[0];
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
		if (!form.inn || form.inn.length !== 14 || !/^\d+$/.test(form.inn)) {
			return { isValid: false, stepIndex: 0, error: 'Укажите корректный 14-значный персональный номер (Шаг 1)' };
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
			Object.entries(form).forEach(([key, val]) => data.append(key, String(val)));

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
			<div className='min-h-screen bg-slate-50 dark:bg-[#080b18] text-gray-900 dark:text-gray-100 flex items-center justify-center px-4 py-16 transition-colors'>
				<div className='bg-white dark:bg-[#11162b] rounded-2xl shadow-xl border border-gray-100 dark:border-blue-900/40 p-10 max-w-lg w-full text-center'>
					<div className='w-20 h-20 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-6'>
						<svg
							className='w-10 h-10 text-green-600 dark:text-green-400'
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
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>{t('Заявка успешно подана!')}</h2>
					<p className='text-gray-600 dark:text-gray-300 mb-6'>
						{t('Ваш регистрационный номер для отслеживания статуса:')}
					</p>
					<div className='bg-blue-50 dark:bg-[#0c0f24] border border-blue-200 dark:border-blue-900/50 rounded-xl px-6 py-4 mb-6'>
						<p className='text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1'>
							{t('Регистрационный номер')}
						</p>
						<p className='font-mono text-base font-bold text-blue-800 dark:text-blue-300 break-all'>
							{submitResult.regNumber}
						</p>
					</div>
					<p className='text-sm text-gray-500 dark:text-gray-400 mb-8'>
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
								<span>💬 Сохранить в WhatsApp</span>
							</a>
						)}
						<a
							href={`/apply/status?reg=${submitResult.regNumber}`}
							className='px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors'
						>
							{t('Проверить статус')}
						</a>
						<a
							href='/'
							className='px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#1a213d] dark:hover:bg-[#232c4f] text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors'
						>
							{t('На главную')}
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-slate-50 dark:bg-[#080b18] text-gray-900 dark:text-gray-100 py-12 px-4 transition-colors'>
			<SEO
				title={`${t('Подача заявки')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Подайте заявку на сертификацию или валидацию вашей профессиональной квалификации в Центре независимой сертификации и валидации.'
				)}
			/>
			<div className='max-w-3xl mx-auto'>
				{/* Header */}
				<div className='text-center mb-10'>
					<h1 className='text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
						{t('Заявка на сертификацию / валидацию')}
					</h1>
					<p className='mt-3 text-gray-500 dark:text-gray-400 text-sm'>
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
										? 'bg-white dark:bg-[#11162b] border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-md group-hover:scale-105'
										: 'bg-white dark:bg-[#11162b] border-gray-200 dark:border-blue-900/40 text-gray-400 dark:text-gray-500 group-hover:border-blue-400 group-hover:text-blue-400'
								}`}
							>
								{i < step ? '✓' : i + 1}
							</div>
							<span
								className={`text-xs mt-1 text-center transition-colors ${
									i === step ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
								}`}
							>
								{t(label)}
							</span>
						</button>
					))}
				</div>

				{/* Validation Banner if any error */}
				{validationError && (
					<div className='mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center justify-between animate-shake'>
						<div className='flex items-center gap-2'>
							<span className='text-red-500 font-bold'>⚠️</span>
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
				<div className='bg-white dark:bg-[#11162b] rounded-2xl shadow-lg border border-gray-100 dark:border-blue-900/40 p-8'>
					{step === 0 && (
						<StepPersonal
							form={form}
							onChange={handleChange}
							onInnChange={(val) => {
								setForm((prev) => {
									const updated = { ...prev, inn: val };
									// Если введено 14 цифр — автоматически определяем год рождения из ИНН (позиции 6..10: ДДММГГГГ)
									if (val.length === 14) {
										const yearStr = val.substring(5, 9);
										const yearNum = parseInt(yearStr, 10);
										if (yearNum >= 1930 && yearNum <= 2020) {
											updated.birth_year = String(yearNum);
										}
									}
									return updated;
								});
							}}
						/>
					)}
					{step === 1 && <StepProfession form={form} onChange={handleChange} />}
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
					<div className='flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-blue-900/30'>
						<button
							onClick={() => {
								setValidationError(null);
								setStep((s) => Math.max(0, s - 1));
							}}
							disabled={step === 0}
							className='px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-[#1a213d] dark:hover:bg-[#232c4f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
						>
							{t('← Назад')}
						</button>
						{step < STEPS.length - 1 ? (
							<button
								onClick={() => {
									setValidationError(null);
									setStep((s) => s + 1);
								}}
								className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors shadow-sm'
							>
								{t('Далее →')}
							</button>
						) : (
							<button
								onClick={handleSubmit}
								disabled={isSubmitting}
								className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm'
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
				<div className='mt-6 bg-blue-50 dark:bg-[#11162b] border border-blue-200 dark:border-blue-900/40 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300'>
					<p className='font-semibold mb-1 text-blue-900 dark:text-blue-200'>{t('Адрес Центра:')}</p>
					<p>{t('ул. Жусупа Абдрахманова, 276')}</p>
					<p className='mt-1 text-blue-700 dark:text-blue-400'>Тел: +996703047535, +996755222794</p>
				</div>
			</div>
		</div>
	);
}
