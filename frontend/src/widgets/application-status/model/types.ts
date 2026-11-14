// frontend/src/widgets/application-status/model/types.ts

export interface StatusData {
	registration_number: string;
	short_registration_number: string;
	full_name: string;
	profession: string;
	specialization?: string;
	application_type?: string;
	type_display: string;
	status: string;
	status_display: string;
	scheduled_date: string | null;
	scheduled_location: string;
	assessor_name?: string;
	assigned_staff_name?: string;
	assigned_staff_phone?: string;
	certificate_number_issued?: string;
	reviewed_at?: string;
	created_at: string;
}

export const STATUS_COLORS: Record<string, string> = {
	draft: 'bg-slate-100 text-slate-700 border-slate-200',
	submitted: 'bg-blue-50 text-blue-700 border-blue-200',
	under_review: 'bg-amber-50 text-amber-700 border-amber-200',
	assessment_scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
	assessment_in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
	approved: 'bg-purple-50 text-purple-700 border-purple-200',
	rejected: 'bg-red-50 text-red-700 border-red-200',
	completed: 'bg-emerald-50 text-emerald-700 border-emerald-300',
};
