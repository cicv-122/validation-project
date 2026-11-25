// frontend/src/pages/staff/StaffIndicatorsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/staff/StaffHeader';
import { staffApi, StaffProfile, StaffIndicators2026 } from '../../api/staff';

export default function StaffIndicatorsPage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<StaffProfile | null>(null);
	const [indicators, setIndicators] = useState<StaffIndicators2026 | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		loadProfile();
		loadIndicators();
	}, []);

	const loadProfile = async () => {
		try {
			const p = await staffApi.getProfile();
			setProfile(p);
		} catch {
			navigate('/staff/login');
		}
	};

	const loadIndicators = async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await staffApi.getIndicators2026();
			setIndicators(data);
		} catch (err: any) {
			console.error('Ошибка загрузки показателей:', err);
			setError(err?.response?.data?.detail || 'Не удалось загрузить показатели');
		} finally {
			setIsLoading(false);
		}
	};

	const m = indicators?.metrics;

	return (
		<div className="min-h-screen bg-slate-50 flex flex-col font-sans">
			{/* Шапка кабинета сотрудника */}
			<StaffHeader profile={profile} />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
				{/* Главный информационный баннер */}
				<div className="bg-gradient-to-r from-[#283375] to-[#1a2253] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
					<div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />

					<div className="relative z-10 max-w-3xl">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-[11px] font-bold uppercase tracking-wider mb-3 border border-white/15">
							<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
							<span>Министерство просвещения Кыргызской Республики (МП КР)</span>
						</div>

						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
							Центр в цифрах <span className="text-amber-300 font-semibold">(учёт с 1 декабря 2026 г.)</span>
						</h1>
						<p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
							Динамическая система показателей деятельности Центра независимой сертификации и валидации.
							Все метрики синхронизируются в реальном времени с Государственным реестром и базой экспертов.
						</p>

						<div className="mt-5 flex items-center gap-3 flex-wrap">
							<div className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-xs font-semibold flex items-center gap-2">
								<svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<span>Старт учёта: 1 декабря 2026 г.</span>
							</div>

							<div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
								<span>Режим: Живой подсчёт из БД</span>
							</div>
						</div>
					</div>
				</div>

				{/* Содержимое метрик */}
				{isLoading ? (
					<div className="py-20 text-center text-slate-400">
						<div className="w-10 h-10 border-4 border-slate-200 border-t-[#283375] rounded-full animate-spin mx-auto mb-3" />
						<div className="text-sm font-semibold text-slate-600">Загрузка показателей Центра...</div>
					</div>
				) : error ? (
					<div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 text-sm">
						{error}
					</div>
				) : (
					<>
						{/* Сетка 8 ключевых показателей (как на главной странице) */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
							{/* 1. Сертификация и валидация (отсчёт с 01.12.2026) */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
										</svg>
									</div>
									<span className="w-2 h-2 rounded-full bg-slate-200" />
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										{m?.certified_since_start ?? 0}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										человек прошли сертификацию и валидацию
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										в новом реестре с 01.12.2026 • архив: ~1 434
									</div>
								</div>
							</div>

							{/* 2. Трудовые мигранты (чистый отсчёт по новой) */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<span className="w-2 h-2 rounded-full bg-slate-200" />
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										{m?.migrants_since_start ?? 0}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										из них — трудовые мигранты
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										в новом потоке с 01.12.2026 • архив: ~286
									</div>
								</div>
							</div>

							{/* 3. Профессии (чистый отсчёт по новой из реестра) */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<button
										onClick={() => navigate('/staff/professions')}
										className="text-[11px] font-semibold text-slate-400 group-hover:text-[#283375] flex items-center gap-0.5 transition-colors cursor-pointer"
										title="Перейти к списку профессий"
									>
										<span>Справочник</span>
										<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
										</svg>
									</button>
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										{m?.professions_since_start ?? 0}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										профессий охвачено в новом реестре
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										уровни 3 и 4 НРК • всего в перечне: {m?.professions_count ?? 31}
									</div>
								</div>
							</div>

							{/* 4. Инструменты оценки */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
										</svg>
									</div>
									<span className="w-2 h-2 rounded-full bg-slate-200" />
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										~{m?.assessment_tools_count?.toLocaleString() ?? '1 767'}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										инструментов оценки
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										при поддержке GIZ, АБР, МОТ
									</div>
								</div>
							</div>

							{/* 5. Оценщики в базе */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
									</div>
									<button
										onClick={() => navigate('/staff/experts')}
										className="text-[11px] font-semibold text-slate-400 group-hover:text-[#283375] flex items-center gap-0.5 transition-colors cursor-pointer"
										title="Перейти к базе экспертов"
									>
										<span>Эксперты</span>
										<svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
										</svg>
									</button>
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										{m?.assessors_count ?? 134}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										оценщиков в базе ЦНСВ
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										в т.ч. от работодателей и ассоциаций
									</div>
								</div>
							</div>

							{/* 6. Профессиональные стандарты */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
										</svg>
									</div>
									<span className="w-2 h-2 rounded-full bg-slate-200" />
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										{m?.standards_count ?? 29}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										профессиональных стандартов
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										утверждённых Министерством просвещения КР
									</div>
								</div>
							</div>

							{/* 7. Оснащенные центры и лаборатории */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
										</svg>
									</div>
									<span className="w-2 h-2 rounded-full bg-slate-200" />
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										{m?.labs_count ?? 18}
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										лабораторий оснащены
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										площадки для практической оценки
									</div>
								</div>
							</div>

							{/* 8. Стоимость услуги */}
							<div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-[#283375]/30 hover:shadow-xs transition-all flex flex-col justify-between group">
								<div className="flex items-center justify-between mb-3">
									<div className="w-10 h-10 rounded-xl bg-slate-100 text-[#283375] group-hover:bg-[#283375] group-hover:text-white transition-colors flex items-center justify-center font-bold">
										<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<span className="w-2 h-2 rounded-full bg-slate-200" />
								</div>
								<div>
									<div className="text-3xl font-extrabold text-slate-900 tracking-tight">
										10 000 сом
									</div>
									<div className="text-xs text-slate-600 font-semibold mt-1 leading-snug">
										стоимость государственной услуги
									</div>
									<div className="text-[11px] text-slate-400 mt-1">
										для кандидата за процедуру оценки
									</div>
								</div>
							</div>
						</div>

						{/* Аналитический блок: Учёт трудовых мигрантов */}
						<div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
								<div>
									<h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
										<span className="w-2.5 h-2.5 rounded-full bg-[#283375]" />
										<span>Анализ потока трудовых мигрантов</span>
									</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Официальная статистика для отчётов Министерства просвещения КР и донорских программ (GIZ, АБР, МОТ)
									</p>
								</div>
								<div className="text-xs font-bold text-[#283375] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto">
									Всего в новом реестре: {m?.migrants_since_start ?? 0}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Категории */}
								<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
									<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
										Распределение по статусу
									</h3>
									<div className="space-y-2">
										<div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
											<div className="flex items-center gap-2">
												<span className="text-base">🛬</span>
												<span className="text-xs font-bold text-slate-800">Вернувшиеся в Кыргызстан</span>
											</div>
											<span className="text-xs font-extrabold text-[#283375] px-2.5 py-1 rounded-lg bg-blue-50">
												{m?.migrants_categories.returned ?? 0} чел.
											</span>
										</div>

										<div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
											<div className="flex items-center gap-2">
												<span className="text-base">🛫</span>
												<span className="text-xs font-bold text-slate-800">Готовятся к выезду за рубеж</span>
											</div>
											<span className="text-xs font-extrabold text-[#283375] px-2.5 py-1 rounded-lg bg-blue-50">
												{m?.migrants_categories.planning ?? 0} чел.
											</span>
										</div>
									</div>
								</div>

								{/* География */}
								<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
									<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
										География трудовой миграции
									</h3>
									{m?.migrants_countries && m.migrants_countries.length > 0 ? (
										<div className="space-y-2">
											{m.migrants_countries.map((c) => (
												<div
													key={c.country}
													className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
												>
													<span className="font-bold text-slate-800">{c.country}</span>
													<span className="font-extrabold text-[#283375] px-2 py-0.5 rounded bg-blue-50">
														{c.count} чел.
													</span>
												</div>
											))}
										</div>
									) : (
										<div className="py-6 text-center text-slate-400 text-xs font-medium">
											В новом цифровом потоке пока не зарегистрировано мигрантов.
											При очном приёме или проверке дел куратор может отметить статус кандидата.
										</div>
									)}
								</div>
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}
