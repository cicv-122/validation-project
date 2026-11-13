import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { ErrorMessage, SEO, Spinner } from '../components/ui';
import { usePartner } from '../hooks/useApi';
import { PartnerCard, PartnerHeaderNav } from '../widgets/partner-detail';

export default function PartnerDetail() {
	const { id } = useParams<{ id: string }>();
	const { t, i18n } = useTranslation();
	const location = useLocation();

	const searchParams = new URLSearchParams(location.search);
	const fromExperts = searchParams.get('from') === 'experts';
	const expertId = searchParams.get('expertId');
	const backToExpertsUrl = `/documents/experts${expertId ? `?expertId=${expertId}#expert-${expertId}` : ''}`;

	const { data: partner, isLoading, error } = usePartner(id);

	// --- SEO данные из API ---
	const seoTitle = partner
		? `${partner.title} — ${t('Партнеры')} | ${t('ЦНСВ при МП КР')}`
		: t('seo.partners.title');

	const seoDescription = partner?.description
		? partner.description.slice(0, 160)
		: partner
		? `${partner.title} — ${t('Партнер по развитию ЦНСВ')}`
		: t('seo.partners.description');

	const organizationSchema = partner
		? {
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: partner.title,
				description: seoDescription,
				...(partner.image && { image: partner.image }),
				...(partner.url && { url: partner.url }),
				...(partner.email && { email: partner.email.split(/[\r\n,]+/)[0].trim() }),
				...(partner.phone && { telephone: partner.phone.split(/[\r\n,]+/)[0].trim() }),
				...(partner.address && {
					address: {
						'@type': 'PostalAddress',
						streetAddress: partner.address.split(/[\r\n]+/)[0].trim(),
					},
				}),
		  }
		: undefined;

	const breadcrumbSchema = partner
		? {
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: t('Главная'),
						item: `https://validation.kg/${i18n.language}`,
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: t('Партнеры'),
						item: `https://validation.kg/${i18n.language}/documents/partners`,
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: partner.title,
						item: `https://validation.kg/${i18n.language}/documents/partners/${id}`,
					},
				],
		  }
		: undefined;

	useEffect(() => {
		if (partner) {
			const el = document.getElementById('partner-detail-container');
			if (el) {
				const y = el.getBoundingClientRect().top + window.scrollY - 80;
				window.scrollTo({ top: y, behavior: 'smooth' });
			}
		}
	}, [partner]);

	if (isLoading) {
		return <Spinner />;
	}

	if (error || !partner) {
		return (
			<div className='flex items-center justify-center min-h-[50vh]'>
				<ErrorMessage message={t('Ошибка загрузки данных.')} />
			</div>
		);
	}

	return (
		<div className='bg-slate-50 py-12 min-h-screen'>
			<SEO
				title={seoTitle}
				description={seoDescription}
				ogImage={partner.image}
				structuredData={[organizationSchema, breadcrumbSchema]}
			/>

			<div id='partner-detail-container' className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<PartnerHeaderNav
					fromExperts={fromExperts}
					backToExpertsUrl={backToExpertsUrl}
				/>

				<PartnerCard partner={partner} />
			</div>
		</div>
	);
}
