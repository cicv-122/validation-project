// frontend/src/shared/lib/hooks/useFormattedDate.ts
import { useTranslation } from 'react-i18next';

export function getLocaleString(lang: string): string {
	if (lang === 'ky' || lang.startsWith('k')) return 'ky-KG';
	if (lang === 'en' || lang.startsWith('en')) return 'en-US';
	return 'ru-RU';
}

export function formatLocalizedDate(
	date: string | number | Date | null | undefined,
	language = 'ru',
	options?: Intl.DateTimeFormatOptions
): string {
	if (!date) return '';
	const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
	if (isNaN(d.getTime())) return '';

	const locale = getLocaleString(language);
	const defaultOptions: Intl.DateTimeFormatOptions = {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	};

	return d.toLocaleDateString(locale, options ?? defaultOptions);
}

export function useFormattedDate() {
	const { i18n } = useTranslation();
	return (date: string | number | Date | null | undefined, options?: Intl.DateTimeFormatOptions) =>
		formatLocalizedDate(date, i18n.language, options);
}
