import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { ErrorMessage, SEO, Spinner } from '../components/ui';
import { useAssessmentCenter } from '../hooks/useApi';
import {
	AssessmentCenterHeaderNav,
	AssessmentCenterTitleCard,
	AssessmentCenterProfessionsTable,
	AssessmentCenterContactsCard,
	AssessmentCenterDirectorsCard,
} from '../widgets/assessment-center-detail';

export default function AssessmentCenterDetail() {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const { data: center, isLoading, error } = useAssessmentCenter(id);

	const searchParams = new URLSearchParams(location.search);
	const fromExperts = searchParams.get('from') === 'experts';
	const expertId = searchParams.get('expertId');
	const backToExpertsUrl = `/documents/experts${expertId ? `?expertId=${expertId}#expert-${expertId}` : ''}`;

	if (isLoading) {
		return <Spinner />;
	}

	if (error || !center) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<ErrorMessage message={t('Ошибка загрузки данных.')} />
			</div>
		);
	}

	return (
		<div className='bg-slate-50 py-12 min-h-screen'>
			<SEO
				title={`${center.organization} — ${t('Центры оценки компетенций')}`}
				description={t('Детальная информация о центре оценки компетенций, контакты, сертифицируемые профессии и эксперты.')}
			/>

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<AssessmentCenterHeaderNav
					fromExperts={fromExperts}
					backToExpertsUrl={backToExpertsUrl}
				/>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Column: Title and Professions/Experts */}
					<div className='lg:col-span-2 space-y-6'>
						<AssessmentCenterTitleCard
							id={center.id}
							organization={center.organization}
						/>
						<AssessmentCenterProfessionsTable
							experts={center.experts}
						/>
					</div>

					{/* Right Column: Sidebar Contacts & Directors */}
					<div className='space-y-6'>
						<AssessmentCenterContactsCard
							address={center.address}
							map_url={center.map_url}
							phone={center.phone}
							email={center.email}
							website={center.website}
						/>
						<AssessmentCenterDirectorsCard
							directors={center.directors}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
