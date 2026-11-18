import { useState } from 'react';
import apiClient from '../../../api/client';
import { analyzeKyrgyzPin, CitizenshipCode, useSessionStorage } from '../../../shared/lib';
import type { ProfessionCatalogItem, SpecializationItem } from '../../../types';
import type { ApplyFormData, DocUpload, SubmitResult } from './types';

export const STEPS = ['Личные данные', 'Профессия', 'Документы', 'Подтверждение'];

const INITIAL_FORM: ApplyFormData = {
	full_name: '',
	birth_year: '',
	citizenship: '' as CitizenshipCode,
	inn: '',
	phone: '',
	whatsapp: '',
	email: '',
	address: '',
	profession_id: undefined,
	profession: '',
	specialization_id: undefined,
	specialization: '',
	qualification_level: '',
	application_type: 'certification',
	data_consent: false,
};

export function useApplyWizard() {
	const [step, setStep] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
	const [form, setForm, removeFormDraft] = useSessionStorage<ApplyFormData>(
		'apply_wizard_form_draft',
		INITIAL_FORM
	);
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

	const handleInnChange = (val: string) => {
		setForm((prev) => ({ ...prev, inn: val }));
	};

	const handleCitizenshipChange = (cit: CitizenshipCode) => {
		setValidationError(null);
		setForm((prev) => ({ ...prev, citizenship: cit }));
	};

	const handleSelectProfession = (prof: ProfessionCatalogItem) => {
		setForm((prev) => ({
			...prev,
			profession_id: prof.id,
			profession: prof.name_ru,
			qualification_level: prof.qual_level_min ? String(prof.qual_level_min) : prev.qualification_level,
			specialization_id: undefined,
			specialization: '',
		}));
	};

	const handleSelectSpecialization = (spec: SpecializationItem | null, customText?: string) => {
		setForm((prev) => ({
			...prev,
			specialization_id: spec ? spec.id : undefined,
			specialization: spec ? spec.title_ru : (customText || ''),
		}));
	};

	const handleDocAdd = (file: File, doc_type: string) => {
		if (!file) return;
		setDocuments((prev) => {
			const filtered = prev.filter((d) => d.doc_type !== doc_type);
			return [...filtered, { file, doc_type, description: '' }];
		});
	};

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
		setStep((s) => Math.min(STEPS.length - 1, s + 1));
	};

	const handlePrev = () => {
		setValidationError(null);
		setStep((s) => Math.max(0, s - 1));
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
			removeFormDraft();
		} catch (err: any) {
			const msg = err?.response?.data
				? Object.values(err.response.data).flat().join(' ')
				: 'Произошла ошибка при отправке заявки. Попробуйте ещё раз.';
			setSubmitResult({ success: false, error: msg });
		} finally {
			setIsSubmitting(false);
		}
	};

	return {
		step,
		setStep,
		steps: STEPS,
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
	};
}
