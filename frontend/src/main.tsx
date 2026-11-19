import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './i18n';
import './index.css';

Sentry.init({
	dsn: import.meta.env.VITE_SENTRY_DSN || 'https://ba15c2634e055355d0e2072f42bc73fc@o4512457042755584.ingest.de.sentry.io/4512457082798160',
	integrations: [
		Sentry.browserTracingIntegration(),
		Sentry.replayIntegration(),
	],
	tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
	beforeSend(event) {
		if (event.request?.headers) {
			delete event.request.headers['Authorization'];
			delete event.request.headers['Cookie'];
		}
		return event;
	},
});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
