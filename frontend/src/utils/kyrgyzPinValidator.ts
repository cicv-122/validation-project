// frontend/src/utils/kyrgyzPinValidator.ts

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

export function detectGenderFromFio(fullName: string): {
	expectedDigit: '1' | '2' | null;
} {
	if (!fullName || !fullName.trim()) {
		return { expectedDigit: null };
	}

	const matches = fullName.trim().match(/[а-яёңүөА-ЯЁҢҮӨa-zA-Z]+/g) || [];
	const words = matches.map((w) => w.toLowerCase()).filter((w) => w.length >= 2);

	if (words.length === 0) {
		return { expectedDigit: null };
	}

	if (words.includes('кызы') || words.includes('кыз')) {
		return { expectedDigit: '1' };
	}
	if (words.includes('уулу') || words.includes('уул')) {
		return { expectedDigit: '2' };
	}

	for (const w of words) {
		if (w.length > 5) {
			if (w.endsWith('овна') || w.endsWith('евна') || w.endsWith('ична') || w.endsWith('инична')) {
				return { expectedDigit: '1' };
			}
			if (w.endsWith('ович') || w.endsWith('евич')) {
				return { expectedDigit: '2' };
			}
		}
	}

	if (words.length >= 2) {
		const candidates = [words[0], words[words.length - 1]];
		for (const cw of candidates) {
			if (cw.length > 4) {
				if (cw.endsWith('ова') || cw.endsWith('ева') || cw.endsWith('ская')) {
					return { expectedDigit: '1' };
				}
				if (cw.endsWith('ов') || cw.endsWith('ев') || cw.endsWith('ский')) {
					return { expectedDigit: '2' };
				}
			}
		}
	}

	return { expectedDigit: null };
}

export function detectCitizenshipFromExistingInn(rawInn: string, fullName = ''): CitizenshipCode {
	const clean = (rawInn || '').replace(/\D/g, '');
	if (!clean) return '';

	if (analyzeKyrgyzPin(clean, fullName, 'KG').isValid) return 'KG';
	if (analyzeKyrgyzPin(clean, fullName, 'KZ').isValid) return 'KZ';
	if (analyzeKyrgyzPin(clean, fullName, 'UZ').isValid) return 'UZ';
	if (analyzeKyrgyzPin(clean, fullName, 'RU').isValid) return 'RU';
	return 'OTHER';
}

export function analyzeKyrgyzPin(
	rawInn: string,
	fullName = '',
	citizenship: CitizenshipCode = ''
): PinAnalysisResult {
	const clean = (rawInn || '').replace(/\D/g, '');
	const ERROR_TEXT = 'Неправильный ПИН / ИНН';

	if (!clean) {
		return {
			isValid: true,
			isComplete: false,
			errorMessage: null,
		};
	}

	if (!citizenship) {
		return {
			isValid: false,
			isComplete: false,
			errorMessage: 'Выберите гражданство',
		};
	}

	const { expectedDigit } = detectGenderFromFio(fullName);

	// 1. Другое государство (8–14 цифр)
	if (citizenship === 'OTHER') {
		if (clean.length < 8) {
			return { isValid: false, isComplete: false, errorMessage: null };
		}
		if (new Set(clean.split('')).size === 1) {
			return { isValid: false, isComplete: true, errorMessage: ERROR_TEXT };
		}
		return { isValid: true, isComplete: true, errorMessage: null };
	}

	// 2. Российская Федерация (12 цифр)
	if (citizenship === 'RU') {
		if (clean.length >= 2 && clean.startsWith('00')) {
			return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
		}
		if (clean.length < 12) {
			return { isValid: false, isComplete: false, errorMessage: null };
		}
		if (clean.length !== 12 || new Set(clean.split('')).size === 1 || clean === '123456789012') {
			return { isValid: false, isComplete: true, errorMessage: ERROR_TEXT };
		}
		return { isValid: true, isComplete: true, errorMessage: null };
	}

	// 3. Республика Казахстан (ИИН — 12 цифр: ГГММДД + 7-я цифра 3,4,5,6 + 5 цифр)
	if (citizenship === 'KZ') {
		if (clean.length >= 4) {
			const mm = parseInt(clean.slice(2, 4), 10);
			if (mm < 1 || mm > 12) {
				return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
			}
		}
		if (clean.length >= 6) {
			const dd = parseInt(clean.slice(4, 6), 10);
			if (dd < 1 || dd > 31) {
				return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
			}
		}
		let birthYear: number | undefined;
		if (clean.length >= 7) {
			const cg = clean[6];
			if (!['3', '4', '5', '6'].includes(cg)) {
				return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
			}
			const pinGender = cg === '3' || cg === '5' ? '2' : '1';
			if (expectedDigit && expectedDigit !== pinGender) {
				return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
			}
			const yy = parseInt(clean.slice(0, 2), 10);
			const mm = parseInt(clean.slice(2, 4), 10);
			const dd = parseInt(clean.slice(4, 6), 10);
			birthYear = cg === '3' || cg === '4' ? 1900 + yy : 2000 + yy;
			const currentYear = new Date().getFullYear();
			if (birthYear < 1935 || birthYear > currentYear - 14) {
				return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
			}
			const testDate = new Date(birthYear, mm - 1, dd);
			if (
				testDate.getFullYear() !== birthYear ||
				testDate.getMonth() !== mm - 1 ||
				testDate.getDate() !== dd
			) {
				return { isValid: false, isComplete: clean.length === 12, errorMessage: ERROR_TEXT };
			}
		}
		if (clean.length < 12) {
			return { isValid: false, isComplete: false, errorMessage: null, birthYear };
		}
		if (new Set(clean.split('')).size === 1) {
			return { isValid: false, isComplete: true, errorMessage: ERROR_TEXT };
		}
		return { isValid: true, isComplete: true, errorMessage: null, birthYear };
	}

	// 4. Республика Узбекистан (ПИНФЛ — 14 цифр: 1-я цифра 3,4,5,6 + ДДММГГ + 7 цифр)
	if (citizenship === 'UZ') {
		const cg = clean[0];
		if (!['3', '4', '5', '6'].includes(cg)) {
			return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
		}
		const pinGender = cg === '3' || cg === '5' ? '2' : '1';
		if (expectedDigit && expectedDigit !== pinGender) {
			return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
		}
		if (clean.length >= 5) {
			const dd = parseInt(clean.slice(1, 3), 10);
			const mm = parseInt(clean.slice(3, 5), 10);
			if (dd < 1 || dd > 31 || mm < 1 || mm > 12) {
				return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
			}
		}
		let birthYear: number | undefined;
		if (clean.length >= 7) {
			const dd = parseInt(clean.slice(1, 3), 10);
			const mm = parseInt(clean.slice(3, 5), 10);
			const yy = parseInt(clean.slice(5, 7), 10);
			birthYear = cg === '3' || cg === '4' ? 1900 + yy : 2000 + yy;
			const currentYear = new Date().getFullYear();
			if (birthYear < 1935 || birthYear > currentYear - 14) {
				return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
			}
			const testDate = new Date(birthYear, mm - 1, dd);
			if (
				testDate.getFullYear() !== birthYear ||
				testDate.getMonth() !== mm - 1 ||
				testDate.getDate() !== dd
			) {
				return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
			}
		}
		if (clean.length < 14) {
			return { isValid: false, isComplete: false, errorMessage: null, birthYear };
		}
		if (new Set(clean.split('')).size === 1) {
			return { isValid: false, isComplete: true, errorMessage: ERROR_TEXT };
		}
		return { isValid: true, isComplete: true, errorMessage: null, birthYear };
	}

	// 5. Кыргызская Республика (14 цифр: 1/2 + ДДММГГГГ + 5 цифр)
	const genderDigit = clean[0];
	if (genderDigit !== '1' && genderDigit !== '2') {
		return {
			isValid: false,
			isComplete: clean.length === 14,
			errorMessage: ERROR_TEXT,
		};
	}

	if (expectedDigit && expectedDigit !== genderDigit) {
		return {
			isValid: false,
			isComplete: clean.length === 14,
			errorMessage: ERROR_TEXT,
		};
	}

	if (clean.length >= 3) {
		const day = parseInt(clean.slice(1, 3), 10);
		if (day < 1 || day > 31) {
			return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
		}
	}

	if (clean.length >= 5) {
		const month = parseInt(clean.slice(3, 5), 10);
		if (month < 1 || month > 12) {
			return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
		}
	}

	let birthYear: number | undefined;
	if (clean.length >= 9) {
		const day = parseInt(clean.slice(1, 3), 10);
		const month = parseInt(clean.slice(3, 5), 10);
		const year = parseInt(clean.slice(5, 9), 10);
		const currentYear = new Date().getFullYear();
		if (year < 1935 || year > currentYear - 14) {
			return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
		}
		const testDate = new Date(year, month - 1, day);
		if (
			testDate.getFullYear() !== year ||
			testDate.getMonth() !== month - 1 ||
			testDate.getDate() !== day
		) {
			return { isValid: false, isComplete: clean.length === 14, errorMessage: ERROR_TEXT };
		}
		birthYear = year;
	}

	if (clean.length < 14) {
		return {
			isValid: false,
			isComplete: false,
			errorMessage: null,
			birthYear,
		};
	}

	if (
		new Set(clean.split('')).size === 1 ||
		clean === '12345678901234' ||
		clean === '21234567890123' ||
		clean.slice(9, 14) === '00000'
	) {
		return {
			isValid: false,
			isComplete: true,
			errorMessage: ERROR_TEXT,
		};
	}

	return {
		isValid: true,
		isComplete: true,
		errorMessage: null,
		birthYear,
	};
}
