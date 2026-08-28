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

	const handleSubmit = async () => {
		setIsSubmitting(true);
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

	const canNext = () => {
		if (step === 0)
			return (
				form.full_name &&
				form.inn &&
				form.inn.length === 14 &&
				/^\d+$/.test(form.inn) &&
				form.phone &&
				form.email
			);
		if (step === 1) return form.profession;
		if (step === 2) return true;
		if (step === 3) return form.data_consent;
		return false;
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
					<div className='flex gap-3 justify-center'>
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
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4'>
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
						<div key={i} className='flex-1 flex flex-col items-center'>
							<div
								className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
									i < step
										? 'bg-blue-600 border-blue-600 text-white'
										: i === step
										? 'bg-white border-blue-600 text-blue-600'
										: 'bg-white border-gray-200 text-gray-400'
								}`}
							>
								{i < step ? '✓' : i + 1}
							</div>
							<span
								className={`text-xs mt-1 text-center ${
									i === step ? 'text-blue-600 font-medium' : 'text-gray-400'
								}`}
							>
								{t(label)}
							</span>
						</div>
					))}
				</div>

				{/* Card */}
				<div className='bg-white rounded-2xl shadow-lg p-8'>
					{step === 0 && (
						<StepPersonal
							form={form}
							onChange={handleChange}
							onInnChange={(val) => setForm((prev) => ({ ...prev, inn: val }))}
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
					<div className='flex justify-between mt-8 pt-6 border-t border-gray-100'>
						<button
							onClick={() => setStep((s) => Math.max(0, s - 1))}
							disabled={step === 0}
							className='px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
						>
							{t('← Назад')}
						</button>
						{step < STEPS.length - 1 ? (
							<button
								onClick={() => setStep((s) => s + 1)}
								disabled={!canNext()}
								className='px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
							>
								{t('Далее →')}
							</button>
						) : (
							<button
								onClick={handleSubmit}
								disabled={!canNext() || isSubmitting}
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
					<p>{t('ул. Байтик Баатыра, 122')}</p>
					<p className='mt-1'>Тел: +996703047535, +996755222794</p>
				</div>
			</div>
		</div>
	);
}
