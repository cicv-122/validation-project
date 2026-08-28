import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://validation.kg';

interface SEOProps {
	title: string;
	description: string;
	ogImage?: string;
	structuredData?: object | object[];
}

export default function SEO({ title, description, ogImage, structuredData }: SEOProps) {
	const { pathname } = useLocation();
	const canonical = `${BASE_URL}${pathname}`;

	return (
		<Helmet>
			{/* Основные */}
			<title>{title}</title>
			<meta name='description' content={description} />
			<link rel='canonical' href={canonical} />

			{/* Open Graph */}
			<meta property='og:title' content={title} />
			<meta property='og:description' content={description} />
			<meta property='og:url' content={canonical} />
			<meta property='og:type' content='website' />
			<meta property='og:image' content={ogImage || `${BASE_URL}/og-default.jpg`} />

			{/* Twitter Card */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={title} />
			<meta name='twitter:description' content={description} />
			<meta name='twitter:image' content={ogImage || `${BASE_URL}/og-default.jpg`} />

			{structuredData && (
				<script type='application/ld+json'>
					{JSON.stringify(
						Array.isArray(structuredData) ? structuredData.filter(Boolean) : structuredData
					)}
				</script>
			)}
		</Helmet>
	);
}
