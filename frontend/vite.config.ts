import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				target: 'https://validation.kg',
				changeOrigin: true,
				secure: false,
			},
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
