import React from 'react';

interface DossierHeaderActionsProps {
	returnUrl: string;
	onNavigateBack: () => void;
	fullRegistrationNumber: string;
	fullName: string;
	candidateName?: string;
	updatedAt?: string | null;
	updatedByName?: string | null;
	onPrint: () => void;
	onSave: () => void;
	saving: boolean;
	onDeleteClick: () => void;
	isSplitMode?: boolean;
	onToggleSplitMode?: () => void;
}

export const DossierHeaderActions: React.FC<DossierHeaderActionsProps> = ({
	onNavigateBack,
	fullRegistrationNumber,
	fullName,
	candidateName,
	updatedAt,
	updatedByName,
	onPrint,
	onSave,
	saving,
	onDeleteClick,
	isSplitMode,
	onToggleSplitMode,
}) => {
	return (
		<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs transition-all">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onNavigateBack}
					className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
					title="Назад к списку специалистов"
				>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				<div>
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
							Дело сертифицированного специалиста
						</span>
						<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
							✓ В реестре (Выдано)
						</span>
						<span className="text-xs font-mono font-bold text-[#283375] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
							{fullRegistrationNumber}
						</span>
					</div>
					<h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
						{fullName || candidateName}
					</h1>
					{(updatedAt || updatedByName) && (
						<div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-0.5 flex-wrap">
							<span>
								Обновлено:{' '}
								{updatedAt
									? new Date(updatedAt).toLocaleString('ru-RU', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})
									: '—'}
							</span>
							{updatedByName && (
								<>
									<span className="text-slate-300">•</span>
									<span className="font-semibold text-slate-700">
										Сотрудник: {updatedByName}
									</span>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2.5 flex-wrap">
				{onToggleSplitMode && (
					<button
						type="button"
						onClick={onToggleSplitMode}
						className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
							isSplitMode
								? 'bg-blue-50 text-[#283375] border-blue-200 shadow-2xs'
								: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
						}`}
						title={isSplitMode ? 'Вернуться к стандартному виду' : 'Разделить экран пополам для удобной сверки'}
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
						</svg>
						<span>{isSplitMode ? 'Вид 50/50' : 'Сверка 50/50'}</span>
					</button>
				)}

				<button
					type="button"
					onClick={onPrint}
					className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
					title="Распечатать карточку дела специалиста"
				>
					<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
					</svg>
					<span>Печать</span>
				</button>

				<button
					type="button"
					onClick={onSave}
					disabled={saving}
					className="px-5 py-2 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-md shadow-[#283375]/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
				>
					{saving ? (
						<>
							<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
							</svg>
							<span>Сохранение...</span>
						</>
					) : (
						<>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							<span>Сохранить дело</span>
						</>
					)}
				</button>

				<button
					type="button"
					onClick={onDeleteClick}
					className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
					title="Удалить дело специалиста"
				>
					<svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					<span>Удалить дело</span>
				</button>
			</div>
		</div>
	);
};
