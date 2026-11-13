import apiClient from '../../../api/client';
import { CallbackPayload } from '../model/types';

export const getUtmParams = () => {
	const p = new URLSearchParams(window.location.search);
	return {
		utm_source: p.get('utm_source') || '',
		utm_medium: p.get('utm_medium') || '',
		utm_campaign: p.get('utm_campaign') || '',
		utm_term: p.get('utm_term') || '',
		utm_content: p.get('utm_content') || '',
	};
};

export const submitCallbackRequest = async (payload: CallbackPayload) => {
	return apiClient.post('/certification/callback/', {
		...payload,
		...getUtmParams(),
	});
};
