import { useTranslation } from 'react-i18next';
import ContactsSection from '../components/home/ContactsSection';
import HeroSection from '../components/home/HeroSection';
import NewsSection from '../components/home/NewsSection';
import { SEO } from '../components/ui';
import { useHomeNews, useSliders } from '../hooks/useApi';

const organizationSchema = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: 'Центр независимой сертификации и валидации при МП КР',
	url: 'https://validation.kg',
	logo: 'https://validation.kg/logo.png',
};

export default function Home() {
	const { t } = useTranslation();
	const { data: sliders, isLoading: slidersLoading } = useSliders();
	const { data: news, isLoading: newsLoading } = useHomeNews();

	return (
		<div className='bg-white'>
			<SEO
				title={t('seo.home.title')}
				description={t('seo.home.description')}
				structuredData={organizationSchema}
			/>
			<HeroSection sliders={sliders} isLoading={slidersLoading} />
			<NewsSection news={news} isLoading={newsLoading} />
			<ContactsSection />
		</div>
	);
}
