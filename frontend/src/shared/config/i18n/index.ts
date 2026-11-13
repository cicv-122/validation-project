import ru from './locales/ru.json';
import ky from './locales/ky.json';
import en from './locales/en.json';

export const resources = {
	ru: { translation: ru },
	ky: { translation: ky },
	en: { translation: en },
} as const;

export { ru, ky, en };
