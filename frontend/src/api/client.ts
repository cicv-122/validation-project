import axios from 'axios';
import i18n from '../i18n';

// The base API URL goes to the Django server.
// In development Vite proxy can handle this, but for simplicity here we assume
// Django runs on the same domain or handles CORS.
const apiClient = axios.create({
	baseURL: '/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Добавляем перехватчик, чтобы клиент всегда отправлял текущий язык и токен сотрудника в бэкенд
apiClient.interceptors.request.use((config) => {
	// LocaleMiddleware в Django читает заголовок Accept-Language
	if (i18n && i18n.language) {
		config.headers['Accept-Language'] = i18n.language;
	}

	const token =
		localStorage.getItem('staff_token') ||
		localStorage.getItem('staff_access_token');
	if (token && !config.headers['Authorization']) {
		config.headers['Authorization'] = `Token ${token}`;
	}

	return config;
});

export default apiClient;
