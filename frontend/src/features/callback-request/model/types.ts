export type CallbackStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CallbackPayload {
	name: string;
	phone: string;
	profession: string;
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	utm_term?: string;
	utm_content?: string;
}

export interface CallbackModalProps {
	isOpen: boolean;
	onClose: () => void;
}
