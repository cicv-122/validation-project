import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Toolbar from './components/Toolbar';
import { Spinner } from './components/ui';

const AdditionalInfo = lazy(() => import('./pages/AdditionalInfo'));
const ApplicationStatus = lazy(() => import('./pages/ApplicationStatus'));
const Apply = lazy(() => import('./pages/Apply'));
const AssessmentCenters = lazy(() => import('./pages/AssessmentCenters'));
const AssessmentCenterDetail = lazy(() => import('./pages/AssessmentCenterDetail'));
const CertifiedUsers = lazy(() => import('./pages/CertifiedUsers'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const Experts = lazy(() => import('./pages/Experts'));
const Home = lazy(() => import('./pages/Home'));
const ImageGallery = lazy(() => import('./pages/ImageGallery'));
const Management = lazy(() => import('./pages/Management'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const NewsList = lazy(() => import('./pages/NewsList'));
const PartnerDetail = lazy(() => import('./pages/PartnerDetail'));
const Partners = lazy(() => import('./pages/Partners'));
const VideoGallery = lazy(() => import('./pages/VideoGallery'));
const ProfStandards = lazy(() => import('./pages/ProfStandards'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LanguageRedirect = () => {
	const location = useLocation();
	const cleanPath = location.pathname.replace(/^\/(ru|ky|en)(\/|$)/, '/').replace(/\/+$/, '') || '/';
	return <Navigate to={cleanPath + location.search} replace />;
};

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 минут — данные не перезапрашиваются при переходах
			gcTime: 10 * 60 * 1000,  // 10 минут — кэш хранится в памяти
		},
	},
});

export default function App() {
	return (
		<HelmetProvider>
			<QueryClientProvider client={queryClient}>
				<Router>
					<ScrollToTop />
					<div className='flex flex-col min-h-screen bg-gray-50'>
						<div className='px-5'>
							<Toolbar />
						</div>
						<div className='px-5 mb-5 sticky top-2 z-[60]'>
							<Navbar />
						</div>

						<main className='flex-grow px-5'>
							<Suspense fallback={<Spinner />}>
								<Routes>
									<Route index element={<Home />} />
									<Route path='news' element={<NewsList />} />
									<Route path='news/:slug' element={<NewsDetail />} />
									<Route path='gallery/images' element={<ImageGallery />} />
									<Route path='gallery/videos' element={<VideoGallery />} />
									<Route path='about/additional-info' element={<AdditionalInfo />} />
									<Route path='about/management' element={<Management />} />
									<Route path='documents/partners' element={<Partners />} />
									<Route path='documents/partners/:id' element={<PartnerDetail />} />
									<Route path='documents/assessment-centers' element={<AssessmentCenters />} />
									<Route path='documents/assessment-centers/:id' element={<AssessmentCenterDetail />} />
									<Route path='documents/experts' element={<Experts />} />
									<Route path='documents/certified-users' element={<CertifiedUsers />} />
									<Route path='documents/prof-standards' element={<ProfStandards />} />
									<Route path='verify/:id' element={<VerifyCertificate />} />
									<Route path='apply' element={<Apply />} />
									<Route path='apply/status' element={<ApplicationStatus />} />

									{/* Редиректы со старых языковых префиксов */}
									<Route path='ru/*' element={<LanguageRedirect />} />
									<Route path='ky/*' element={<LanguageRedirect />} />
									<Route path='en/*' element={<LanguageRedirect />} />

									{/* 404 */}
									<Route path='*' element={<NotFound />} />
								</Routes>
							</Suspense>
						</main>

						<Footer />
					</div>
				</Router>
			</QueryClientProvider>
		</HelmetProvider>
	);
}
