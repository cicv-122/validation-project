import type { CertifiedUser } from '../../../types';
import { CertificateArticlesAndFooter } from './CertificateArticlesAndFooter';
import { CertificateExamDossier } from './CertificateExamDossier';
import { CertificateHeaderBanner } from './CertificateHeaderBanner';
import type { CertificateMediaPreview } from './CertificateMediaModal';
import { CertificatePersonCard } from './CertificatePersonCard';

interface CertificateSheetCardProps {
	user: CertifiedUser;
	activeInn?: string;
	onPreviewDoc: (preview: CertificateMediaPreview) => void;
}

export function CertificateSheetCard({
	user,
	activeInn,
	onPreviewDoc,
}: CertificateSheetCardProps) {
	return (
		<div className='bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:m-0 scroll-mt-24'>
			{/* Государственная шапка и зеленая лента подлинности */}
			<CertificateHeaderBanner registrationNumber={user.registration_number} />

			{/* Основной паспорт квалификации */}
			<div className='p-6 sm:p-8 space-y-8'>
				<CertificatePersonCard user={user} activeInn={activeInn} />

				{user.assessment_details && (
					<CertificateExamDossier
						assessmentDetails={user.assessment_details}
						issuedDate={user.issued_date}
						registrationNumber={user.registration_number}
						onPreviewDoc={onPreviewDoc}
					/>
				)}

				<CertificateArticlesAndFooter
					newsArticles={user.news_articles}
					userId={user.id}
				/>
			</div>
		</div>
	);
}
