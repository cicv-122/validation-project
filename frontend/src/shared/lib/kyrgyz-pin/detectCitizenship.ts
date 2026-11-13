// frontend/src/shared/lib/kyrgyz-pin/detectCitizenship.ts
import { CitizenshipCode } from './types';
import { analyzeKyrgyzPin } from './analyzePin';

export function detectCitizenshipFromExistingInn(rawInn: string, fullName = ''): CitizenshipCode {
	const clean = (rawInn || '').replace(/\D/g, '');
	if (!clean) return '';

	if (analyzeKyrgyzPin(clean, fullName, 'KG').isValid) return 'KG';
	if (analyzeKyrgyzPin(clean, fullName, 'KZ').isValid) return 'KZ';
	if (analyzeKyrgyzPin(clean, fullName, 'UZ').isValid) return 'UZ';
	if (analyzeKyrgyzPin(clean, fullName, 'RU').isValid) return 'RU';
	return 'OTHER';
}
