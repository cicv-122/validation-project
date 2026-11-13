import type { CitizenshipCode } from '../../../shared/lib';

export interface DocUpload {
	file: File;
	doc_type: string;
	description: string;
}

export interface ApplyFormData {
	full_name: string;
	birth_year: string;
	citizenship: CitizenshipCode | '';
	inn: string;
	phone: string;
	whatsapp: string;
	email: string;
	address: string;
	profession_id?: number;
	profession: string;
	specialization_id?: number;
	specialization: string;
	qualification_level: string;
	application_type: string;
	data_consent: boolean;
}

export interface SubmitResult {
	success: boolean;
	regNumber?: string;
	error?: string;
}
