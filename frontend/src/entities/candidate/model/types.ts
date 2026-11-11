// frontend/src/entities/candidate/model/types.ts
export type {
	CitizenshipCode,
	PinAnalysisResult,
} from '../../../utils/kyrgyzPinValidator';
export {
	CITIZENSHIP_OPTIONS,
	analyzeKyrgyzPin,
	detectCitizenshipFromExistingInn,
} from '../../../utils/kyrgyzPinValidator';

export type CitizenshipOption = (typeof import('../../../utils/kyrgyzPinValidator').CITIZENSHIP_OPTIONS)[number];

export type CandidateApplicationType = 'certification' | 'validation';

export type CandidateStatus =
	| 'draft'
	| 'submitted'
	| 'under_review'
	| 'documents_required'
	| 'scheduled'
	| 'in_progress'
	| 'approved'
	| 'completed'
	| 'rejected'
	| 'cancelled';

export interface OfficialActSlot {
	type: string;
	title: string;
	subtitle: string;
	descriptionPlaceholder: string;
	required: boolean;
}
