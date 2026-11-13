// frontend/src/shared/lib/kyrgyz-pin/types.ts

export type CitizenshipCode = '' | 'KG' | 'RU' | 'KZ' | 'UZ' | 'OTHER';

export const CITIZENSHIP_OPTIONS: {
	value: Exclude<CitizenshipCode, ''>;
	label: string;
	labelKey?: string;
	maxLength: number;
	placeholder: string;
	placeholderKey?: string;
}[] = [
	{
		value: 'KG',
		label: '🇰🇬 Кыргызская Республика',
		labelKey: 'citizenship.KG',
		maxLength: 14,
		placeholder: '14 цифр ПИН паспорта',
		placeholderKey: 'citizenship.placeholder_KG',
	},
	{
		value: 'RU',
		label: '🇷🇺 Российская Федерация',
		labelKey: 'citizenship.RU',
		maxLength: 12,
		placeholder: '12 цифр ИНН',
		placeholderKey: 'citizenship.placeholder_RU',
	},
	{
		value: 'KZ',
		label: '🇰🇿 Республика Казахстан',
		labelKey: 'citizenship.KZ',
		maxLength: 12,
		placeholder: '12 цифр ИИН',
		placeholderKey: 'citizenship.placeholder_KZ',
	},
	{
		value: 'UZ',
		label: '🇺🇿 Республика Узбекистан',
		labelKey: 'citizenship.UZ',
		maxLength: 14,
		placeholder: '14 цифр ПИНФЛ',
		placeholderKey: 'citizenship.placeholder_UZ',
	},
	{
		value: 'OTHER',
		label: '🌐 Другое государство',
		labelKey: 'citizenship.OTHER',
		maxLength: 14,
		placeholder: '8–14 цифр ИНН / ПИН',
		placeholderKey: 'citizenship.placeholder_OTHER',
	},
];

export interface PinAnalysisResult {
	isValid: boolean;
	isComplete: boolean;
	errorMessage: string | null;
	birthYear?: number;
}
