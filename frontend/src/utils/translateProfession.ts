import dictionary from './professions_dictionary.json';

interface Translation {
	ru: string;
	ky: string;
	en: string;
}

const professionTranslations: Record<string, Translation> = dictionary as Record<string, Translation>;

export function translateProfession(profession: string | null | undefined, lang: string): string {
	if (!profession) return '';
	const p = profession.toLowerCase().replace(/['"]/g, '').replace(/\s+/g, ' ').trim();

	// Exact dictionary lookup
	if (professionTranslations[profession]) {
		return professionTranslations[profession][lang as 'ru' | 'ky' | 'en'] || profession;
	}

	// Soft matching
	for (const key of Object.keys(professionTranslations)) {
		const cleanKey = key.toLowerCase().replace(/['"]/g, '').replace(/\s+/g, ' ').trim();
		if (cleanKey === p || cleanKey.includes(p) || p.includes(cleanKey)) {
			return professionTranslations[key][lang as 'ru' | 'ky' | 'en'] || key;
		}
	}

	return profession;
}
