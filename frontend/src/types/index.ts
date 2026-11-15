export interface NewsImage {
	id: number;
	image: string;
}

export interface NewsVideo {
	id: number;
	file: string;
}

export interface NewsDetail {
	id: number;
	title: string;
	slug: string;
	description: string;
	image: string;
	created: string;
	images: NewsImage[];
	videos: NewsVideo[];
	certified_users?: CertifiedUser[];
}

export interface NewsItem {
	id: number;
	title: string;
	slug: string;
	image: string;
	created: string;
	content?: string;
}

// ── Sliders ───────────────────────────────────────────────────────────
export interface Slider {
	id: number;
	image: string;
}

// ── Documents ─────────────────────────────────────────────────────────
export interface ProfStandard {
	id: number;
	title: string;
	file: string;
	created_at: string;
}

export interface DevelopmentPartner {
	id: number;
	title: string;
	file?: string;
	created_at: string;
}

export interface PartnerDetailType extends DevelopmentPartner {
	description?: string;
	url?: string;
	address?: string;
	map_url?: string;
	phone?: string;
	email?: string;
	image?: string;
	facebook_url?: string;
	instagram_url?: string;
	linkedin_url?: string;
	telegram_url?: string;
	whatsapp_url?: string;
	tiktok_url?: string;
	youtube_url?: string;
	twitter_url?: string;
	threads_url?: string;
}

// ── People ────────────────────────────────────────────────────────────
export interface ManagementMember {
	id: number;
	full_name: string;
	position: string;
	image?: string;
	description?: string;
	is_management: boolean;
	email?: string;
	phone?: string;
}

export interface AppraisersExpert {
	id: number;
	name: string;
	assessment_center?: AssessmentCenter;
}

export interface AssessmentCenterDirector {
	id: number;
	name: string;
	phone?: string;
}

export interface AssessmentCenterExpert {
	id: number;
	profession: string;
	appraisers: string;
	appraiser_employer: string;
	consultant: string;
}

export interface AssessmentCenter {
	id: number;
	organization: string;
	address?: string;
	map_url?: string;
	phone?: string;
	email?: string;
	website?: string;
	directors?: AssessmentCenterDirector[];
	experts?: AssessmentCenterExpert[];
}

export interface AssessmentEvidenceDoc {
	id: number;
	doc_type: string;
	doc_type_display: string;
	file_url: string;
	file_name: string;
	description?: string;
}

export interface AssessmentPhotoItem {
	id: number;
	file_url: string;
	description?: string;
}

export interface AssessmentDetails {
	is_archived_record?: boolean;
	application_type: 'certification' | 'validation';
	application_type_display: string;
	qualification_level?: string | null;
	specialization?: string | null;
	scheduled_date?: string | null;
	scheduled_location?: string | null;
	assessor_name?: string | null;
	verified_by_staff_name?: string | null;
	evaluation_documents: AssessmentEvidenceDoc[];
	exam_photos: AssessmentPhotoItem[];
	candidate_documents?: AssessmentEvidenceDoc[];
	certificate_scan_url?: string | null;
}

export interface CertifiedUser {
	id: number;
	registration_number: string;
	full_name: string;
	image: string | null;
	profession: string | null;
	issued_date: string | null;
	qr_code: string | null;
	inn?: string | null;
	inn_masked?: string | null;
	has_inn?: boolean;
	is_qr_scan?: boolean;
	is_masked?: boolean;
	created_at?: string;
	updated_at?: string;
	news_articles?: NewsItem[];
	assessment_details?: AssessmentDetails | null;
}

export interface PaginatedCertifiedUsers {
	count: number;
	next: string | null;
	previous: string | null;
	results: CertifiedUser[];
}

export interface SpecializationItem {
	id: number;
	title_ru: string;
	title_ky: string;
	order: number;
}

export interface ProfessionCatalogItem {
	id: number;
	okz_code: string;
	name_ru: string;
	name_ky: string;
	section: string;
	qual_level_min: number;
	qual_level_max: number;
	specializations: SpecializationItem[];
}

// ── Gallery ───────────────────────────────────────────────────────────
export interface GalleryImage {
	id: string;
	image: string;
	created?: string;
}

export interface GalleryVideo {
	id: string;
	url: string | null;
	embed_url: string | null;
	file_url: string | null;
	created: string;
}
