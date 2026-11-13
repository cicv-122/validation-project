import type { RegionStat } from '../model/types';

interface RegionBarsProps {
	regionStats: RegionStat[];
	maxCount: number;
	isVisible: boolean;
	currentLang: string;
}

export function RegionBars({
	regionStats,
	maxCount,
	isVisible,
	currentLang,
}: RegionBarsProps) {
	return (
		<div className='space-y-4 max-w-4xl'>
			{regionStats.map((r, i) => {
				const percent = Math.round((r.count / maxCount) * 100);

				const city = currentLang === 'ky' ? r.cityKg || r.cityRu : r.cityRu;
				const region = currentLang === 'ky' ? r.regionKg || r.regionRu : r.regionRu;

				let labelTitle = city;
				let labelSubtitle = '';

				if (
					city &&
					region &&
					city !== region &&
					!region.includes(city.replace(/^г\.\s*/, ''))
				) {
					labelSubtitle = region;
				} else if (!city && region) {
					labelTitle = region;
				}

				return (
					<div
						key={r.id}
						className='group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4'
					>
						{/* Название города и области в скобках */}
						<div className='sm:w-72 text-sm font-semibold text-gray-800 flex items-center justify-between sm:justify-start gap-1.5'>
							<div className='truncate'>
								<span className='text-gray-900'>{labelTitle}</span>
								{labelSubtitle && (
									<span className='text-xs font-normal text-gray-500 ml-1.5'>
										({labelSubtitle})
									</span>
								)}
							</div>
							<span className='sm:hidden font-bold text-sm text-[#283375] bg-blue-50 px-2 py-0.5 rounded'>
								{r.count}
							</span>
						</div>

						{/* Полоса бара с анимацией */}
						<div className='flex-1 h-9 bg-gray-100/90 rounded-xl overflow-hidden p-1 relative flex items-center'>
							<div
								className='h-full bg-gradient-to-r from-[#283375] to-blue-600 rounded-lg flex items-center justify-end pr-3 transition-all duration-1000 ease-out shadow-sm group-hover:from-blue-700 group-hover:to-indigo-500'
								style={{
									width: isVisible ? `${percent}%` : '0%',
									transitionDelay: `${i * 90}ms`,
								}}
							>
								<div className='w-full h-full opacity-10 bg-white rounded-lg pointer-events-none' />
							</div>

							{/* Цифра справа от бара */}
							<div className='hidden sm:flex items-center gap-1.5 ml-3'>
								<span className='text-sm font-extrabold text-gray-900 group-hover:text-[#283375] transition-colors'>
									{r.count}
								</span>
								{r.trainersCount > 0 && (
									<span
										title={`Из них ${r.trainersCount} имеют квалификацию тренера-оценщика`}
										className='text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md'
									>
										+{r.trainersCount}{' '}
										{currentLang === 'ky'
											? 'тренер'
											: currentLang === 'en'
												? 'trainers'
												: 'тренеров'}
									</span>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
