import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCertifiedUserVerification } from '../hooks/useApi';
import { Spinner, SEO, PageHero } from '../components/ui';
import {
	CertificateVerifySearch,
	CertificateMediaModal,
	CertificateMediaPreview,
	CertificateSheetCard,
	CertificateSupportCard,
} from '../widgets/certificate-verification';

export default function VerifyCertificate() {
	const params = useParams();
	const wildcardId = params['*'] || params.id;
	const [searchParams, setSearchParams] = useSearchParams();
	const { t } = useTranslation();

	const tokenParam = searchParams.get('token') || '';
	const initialReg = wildcardId || searchParams.get('reg') || '';
	const initialDigits = initialReg.replace(/[^0-9/]/g, '');
	const initialInn = searchParams.get('inn') || '';

	const isDirectScan = Boolean(wildcardId || tokenParam);

	const [numberInput, setNumberInput] = useState(initialDigits);
	const [innInput, setInnInput] = useState(initialInn.replace(/[^0-9]/g, '').slice(0, 14));
	const [activeReg, setActiveReg] = useState(initialReg);
	const [activeInn, setActiveInn] = useState(initialInn);
	const [activeToken, setActiveToken] = useState(tokenParam);
	const [showSearch, setShowSearch] = useState(!initialReg && !wildcardId && !tokenParam);

	// Lightbox / Modal preview for exam photos and evaluation documents
	const [previewModal, setPreviewModal] = useState<CertificateMediaPreview | null>(null);

	const {
		data: user,
		isLoading,
		error,
		isFetched,
	} = useCertifiedUserVerification(
		activeReg || undefined,
		activeInn || undefined,
		activeToken || undefined,
		isDirectScan
	);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const cleanDigits = numberInput.trim();
		const cleanInn = innInput.trim();
		if (!cleanDigits) return;

		const fullReg = `ЦС № ${cleanDigits}`;
		setActiveReg(fullReg);
		setActiveInn(cleanInn);
		setActiveToken(''); // manual search
		if (cleanInn) {
			setSearchParams({ reg: fullReg, inn: cleanInn });
		} else {
			setSearchParams({ reg: fullReg });
		}
	};

	const handleSelectPhoto = (index: number) => {
		if (!previewModal?.photos) return;
		const total = previewModal.photos.length;
		const safeIndex = (index + total) % total;
		setPreviewModal({
			...previewModal,
			currentIndex: safeIndex,
			url: previewModal.photos[safeIndex].file_url,
			title: `${t('Фотофиксация квалификационного экзамена')} (${safeIndex + 1} / ${total})`,
		});
	};

	const errorMsg = (error as any)?.response?.data?.detail;

	return (
		<div className='min-h-screen bg-slate-100 flex flex-col text-slate-800'>
			<SEO
				title={`${t('Проверка подлинности сертификата')} — ${t('ЦНСВ при МП КР')}`}
				description={t('Официальный государственный сервис проверки документов о признании профессиональной квалификации.')}
			/>

			<div className='flex-1 flex flex-col'>
				{/* Фирменная шапка сайта: скрываем при открытом подтвержденном сертификате */}
				{!user && <PageHero title={t('Проверка документа о признании квалификации')} />}

				{/* Если сертификат найден, выводим компактную навигацию и кнопку проверки другого */}
				{user && (
					<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 w-full flex items-center justify-between text-xs print:hidden'>
						<Link
							to='/'
							className='inline-flex items-center gap-1.5 text-slate-500 hover:text-[#283375] font-semibold transition-colors'
						>
							<span>←</span>
							<span>{t('Главная')}</span>
						</Link>

						<button
							type='button'
							onClick={() => setShowSearch((prev) => !prev)}
							className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs transition-all cursor-pointer'
						>
							<svg className='w-3.5 h-3.5 text-slate-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
							</svg>
							<span>{showSearch ? t('Скрыть форму поиска') : t('Проверить другой документ')}</span>
						</button>
					</div>
				)}

				{/* БЛОК ПОИСКА СЕРТИФИКАТА */}
				{(!user || showSearch) && (
					<CertificateVerifySearch
						numberInput={numberInput}
						innInput={innInput}
						onNumberChange={setNumberInput}
						onInnChange={setInnInput}
						onSubmit={handleSearch}
						isLoading={isLoading}
					/>
				)}

				{/* ОСНОВНОЙ КОНТЕЙНЕР РЕЗУЛЬТАТОВ */}
				<div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full ${user ? 'pt-2' : ''}`}>
					{/* Loading State */}
					{isLoading && (
						<div className='py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm'>
							<Spinner />
							<p className='text-sm font-semibold text-slate-600 mt-4'>
								{t('Сверка с единым государственным реестром ЦНСВ МП КР...')}
							</p>
						</div>
					)}

					{/* Error / Not Found State */}
					{!isLoading && isFetched && (error || !user) && activeReg && (
						<div className='bg-white rounded-3xl shadow-sm border border-red-200 p-8 text-center'>
							<div className='w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold'>
								✕
							</div>
							<h2 className='text-xl font-bold text-slate-900 mb-2'>
								{t('Документ не подтвержден')}
							</h2>
							<p className='text-sm text-slate-600 max-w-md mx-auto mb-6'>
								{errorMsg || t('Документ с указанным номером не найден в официальном реестре выданных сертификатов ЦНСВ при МП КР.')}
							</p>
							<div className='inline-flex flex-wrap items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 font-mono'>
								<span>{t('Номер:')} {activeReg}</span>
								{activeInn && <span>• {t('ИНН:')} {activeInn}</span>}
							</div>
						</div>
					)}

					{/* ПОДТВЕРЖДЕННЫЙ ГОСУДАРСТВЕННЫЙ СЕРТИФИКАТ (ОФИЦИАЛЬНОЕ ЭЛЕКТРОННОЕ ДЕЛО) */}
					{!isLoading && user && (
						<CertificateSheetCard
							user={user}
							activeInn={activeInn}
							onPreviewDoc={setPreviewModal}
						/>
					)}

					{/* Support Card */}
					<CertificateSupportCard />
				</div>
			</div>

			{/* МОДАЛЬНЫЙ ПРОСМОТР ФОТОГРАФИЙ И АКТОВ ЭКЗАМЕНА (LIGHTBOX) */}
			<CertificateMediaModal
				previewModal={previewModal}
				onClose={() => setPreviewModal(null)}
				onSelectPhoto={handleSelectPhoto}
			/>
		</div>
	);
}
