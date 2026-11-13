export interface StatusData {
	registration_number: string;
	short_registration_number: string;
	full_name: string;
	profession: string;
	type_display: string;
	status: string;
	status_display: string;
	scheduled_date: string | null;
	scheduled_location: string;
	created_at: string;
}

export const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
	approved: 'bg-green-100 text-green-800 border-green-300',
	rejected: 'bg-red-100 text-red-800 border-red-300',
	scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
	completed: 'bg-purple-100 text-purple-800 border-purple-300',
};
