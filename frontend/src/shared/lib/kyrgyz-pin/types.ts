// frontend/src/shared/lib/kyrgyz-pin/types.ts

export type CitizenshipCode = '' | 'KG' | 'RU' | 'KZ' | 'UZ' | 'OTHER';

export const CITIZENSHIP_OPTIONS: {
	value: Exclude<CitizenshipCode, ''>;
	label: string;
	maxLength: number;
	placeholder: string;
}[] = [
	{
		value: 'KG',
		label: '🇰🇬 Кыргызская Республика',
		maxLength: 14,
		placeholder: '14 цифр ПИН паспорта',
	},
	{
		value: 'RU',
		label: '🇷🇺 Российская Федерация',
		maxLength: 12,
		placeholder: '12 цифр ИНН',
	},
	{
		value: 'KZ',
		label: '🇰🇿 Республика Казахстан',
		maxLength: 12,
		placeholder: '12 цифр ИИН',
	},
	{
		value: 'UZ',
		label: '🇺🇿 Республика Узбекистан',
		maxLength: 14,
		placeholder: '14 цифр ПИНФЛ',
	},
	{
		value: 'OTHER',
		label: '🌐 Другое государство',
		maxLength: 14,
		placeholder: '8–14 цифр ИНН / ПИН',
	},
];

export interface PinAnalysisResult {
	isValid: boolean;
	isComplete: boolean;
	errorMessage: string | null;
	birthYear?: number;
}
