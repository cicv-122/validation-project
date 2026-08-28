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

export interface CertifiedUser {
	id: number;
	registration_number: string;
	full_name: string;
	image: string | null;
	profession: string | null;
	issued_date: string | null;
	qr_code: string | null;
	news_articles?: NewsItem[];
}

export interface PaginatedCertifiedUsers {
	count: number;
	next: string | null;
	previous: string | null;
	results: CertifiedUser[];
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
