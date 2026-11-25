import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@app': fileURLToPath(new URL('./src/app', import.meta.url)),
			'@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
			'@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
			'@features': fileURLToPath(new URL('./src/features', import.meta.url)),
			'@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
			'@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
		},
	},
	server: {
		proxy: {
			// Кабинет сотрудника ходит в локальный бэкенд с безопасными тестовыми кандидатами
			'/api/v1/certification/staff': {
				target: 'http://127.0.0.1:8000',
				changeOrigin: true,
			},
			// Все остальные API (новости, слайдеры, документы) читаются с боевого validation.kg
			// С железной защитой от записи: любые POST/PUT/PATCH/DELETE на боевой прод с локалки блокируются!
			'/api': {
				target: 'https://validation.kg',
				changeOrigin: true,
				secure: false,
				bypass: (req, res) => {
					if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
						res.statusCode = 403;
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({
							detail: 'Защита: любые изменения боевого сервера (POST/PUT/DELETE) с локального компьютера заблокированы.'
						}));
						return false;
					}
				},
			},
			// Медиа и статика (картинки новостей, логотипы) грузятся с боевого сайта
			'/media': {
				target: 'https://validation.kg',
				changeOrigin: true,
				secure: false,
			},
			'/static': {
				target: 'https://validation.kg',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'query-vendor': ['@tanstack/react-query'],
					'i18n-vendor': ['i18next', 'react-i18next'],
					'helmet-vendor': ['react-helmet-async'],
				},
			},
		},
		modulePreload: {
			polyfill: true,
		},
		chunkSizeWarningLimit: 500,
		minify: 'esbuild',
		target: 'es2020',
	},
});
