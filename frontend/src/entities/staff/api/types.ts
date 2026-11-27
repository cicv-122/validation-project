// frontend/src/entities/staff/api/types.ts

export interface StaffProfession {
	id: number;
	name_ru: string;
	name_ky: string;
	okz_code: string;
	section?: string;
}

export interface StaffProfile {
	id: number;
	username: string;
	full_name: string;
	phone: string;
	role: string;
	role_display: string;
	is_superuser?: boolean;
	is_active: boolean;
	assigned_professions: StaffProfession[];
	telegram_chat_id: string | null;
	telegram_username: string | null;
	is_telegram_connected: boolean;
	telegram_bot_url: string;
	stats: {
		total: number;
		submitted: number;
		submitted_online?: number;
		submitted_in_person?: number;
		under_review: number;
		under_review_docs?: number;
		scheduled: number;
		approved: number;
		completed: number;
		rejected: number;
		rejected_exam?: number;
		rejected_cancelled?: number;
		validation_count: number;
		certification_count: number;
		// Оцифровка государственного реестра (759 специалистов)
		registry_total: number;
		registry_with_inn: number;
		registry_without_inn: number;
		registry_digitized_percent: number;
	};
}

export interface StaffApplicationDocument {
	id: number;
	doc_type: string;
	doc_type_display: string;
	file: string;
	file_url: string;
	description: string;
	uploaded_at: string;
}

export interface StaffApplicationItem {
	id: number;
	registration_number: string;
	short_registration_number: string;
	application_type: 'certification' | 'validation';
	type_display: string;
	full_name: string;
	phone: string;
	whatsapp: string;
	email: string;
	inn: string;
	profession: string;
	qualification_level: string;
	status: string;
	status_display: string;
	scheduled_date: string | null;
	scheduled_location: string;
	assigned_staff_name: string;
	assigned_staff_phone?: string;
	documents_count: number;
	certificate_number_issued: string;
	is_labor_migrant?: boolean;
	migration_country?: string;
	migration_category?: string;
	created_at: string;
	submitted_at: string;
}

export interface StaffApplicationDetail extends StaffApplicationItem {
	birth_year: number | null;
	address: string;
	specialization: string;
	experience_years: number | null;
	experience_desc: string;
	structured_resume: any;
	assessor_name: string;
	admin_notes: string;
	certified_user_id: number | null;
	documents: StaffApplicationDocument[];
	reviewed_at: string | null;
}

export interface CertifiedClusterItem {
	key: string;
	title: string;
	count: number;
}

export interface StaffCertifiedUser {
	id: number;
	registration_number: string;
	full_name: string;
	last_name: string;
	first_name: string;
	sur_name: string;
	inn: string | null;
	has_inn: boolean;
	profession: string;
	issued_date: string | null;
	image: string | null;
	image_url: string | null;
	qr_code: string | null;
	qr_code_url: string | null;
	application: number | null;
	application_id?: number | null;
	scheduled_location?: string;
	scheduled_date?: string | null;
	assessor_name?: string;
	qualification_level?: string;
	specialization?: string;
	phone?: string;
	whatsapp?: string;
	documents?: StaffApplicationDocument[];
	updated_by_name?: string | null;
	created_at: string;
	updated_at: string;
}

export interface PaginatedResponse<T> {
	count: number;
	next: string | null;
	previous: string | null;
	results: T[];
}

export interface StaffIndicators2026 {
	start_date: string;
	start_date_display: string;
	today: string;
	days_tracked: number;
	is_started: boolean;
	metrics: {
		certified_since_start: number;
		candidates_since_start?: number;
		certified_all_time: number;
		migrants_since_start: number;
		migrants_completed_since_start?: number;
		migrants_completed_all?: number;
		migrants_total_registered: number;
		migrants_countries: { country: string; count: number }[];
		migrants_categories: {
			returned: number;
			planning: number;
		};
		professions_since_start?: number;
		professions_count: number;
		assessment_tools_count: number;
		assessors_count: number;
		standards_count: number;
		labs_count: number;
		service_cost: number;
	};
}
