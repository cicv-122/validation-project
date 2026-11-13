// frontend/src/shared/lib/kyrgyz-pin/detectGender.ts

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
			if (
				w.endsWith('овна') ||
				w.endsWith('евна') ||
				w.endsWith('ична') ||
				w.endsWith('инична')
			) {
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
