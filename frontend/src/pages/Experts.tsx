import { useTranslation } from 'react-i18next';
import { PageHero, SEO } from '../components/ui';
import {
	useExpertsRegistry,
	ExpertsFilterBar,
	ExpertsRegionTable,
} from '../widgets/experts-registry';

export default function Experts() {
	const { t, i18n } = useTranslation();
	const isKg = i18n.language.startsWith('k') || i18n.language === 'ky';
	const isEn = i18n.language.startsWith('en');

	const {
		selectedRegionCode,
		setSelectedRegionCode,
		selectedProfession,
		setSelectedProfession,
		searchQuery,
		setSearchQuery,
		professions,
		availableRegions,
		groupedByRegion,
	} = useExpertsRegistry();

	return (
		<div className='bg-gray-50 min-h-screen pb-16'>
			<SEO
				title={`${t('База данных экспертов и оценщиков')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Полный реестр экспертов-оценщиков и тренеров центров оценки квалификации по областям и регионам Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('База данных экспертов и оценщиков')} />

			<div className='max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6'>
				<ExpertsFilterBar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedProfession={selectedProfession}
					onProfessionChange={setSelectedProfession}
					professions={professions}
					selectedRegionCode={selectedRegionCode}
					onRegionSelect={setSelectedRegionCode}
					availableRegions={availableRegions}
					isKg={isKg}
					isEn={isEn}
				/>

				{groupedByRegion.length === 0 ? (
					<div className='bg-white p-12 rounded-xl text-center border border-gray-200 text-gray-500'>
						{t('По вашему запросу эксперты не найдены.')}
					</div>
				) : (
					<div className='space-y-8'>
						{groupedByRegion.map(({ regionMeta, items }) => (
							<ExpertsRegionTable
								key={regionMeta.code}
								regionMeta={regionMeta}
								items={items}
								isKg={isKg}
								isEn={isEn}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
