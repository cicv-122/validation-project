import { useTranslation } from 'react-i18next';

interface CertificateVerifySearchProps {
	numberInput: string;
	innInput: string;
	onNumberChange: (val: string) => void;
	onInnChange: (val: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isLoading: boolean;
}

export function CertificateVerifySearch({
	numberInput,
	innInput,
	onNumberChange,
	onInnChange,
	onSubmit,
	isLoading,
}: CertificateVerifySearchProps) {
	const { t } = useTranslation();

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 w-full'>
			<div className='bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 print:hidden'>
				<form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-12 gap-4 items-end'>
					{/* Номер сертификата */}
					<div className='md:col-span-5'>
						<label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
							{t('Номер сертификата')}
						</label>
						<div className='relative flex items-center h-12 rounded-xl border-2 border-slate-200 focus-within:border-[#283375] bg-white transition-all overflow-hidden'>
							<div className='h-full flex items-center px-3.5 bg-slate-50 border-r border-slate-200 font-mono font-bold text-slate-700 select-none text-sm tracking-wide flex-shrink-0'>
								ЦС №
							</div>
							<input
								type='text'
								value={numberInput}
								onChange={(e) => {
									const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
									onNumberChange(val);
								}}
								placeholder='000761'
								required
								className='w-full h-full pl-3 pr-8 text-sm font-mono tracking-wider outline-none placeholder:text-slate-400 placeholder:font-mono bg-transparent'
							/>
							{numberInput && (
								<button
									type='button'
									onClick={() => onNumberChange('')}
									className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer'
									aria-label='Очистить номер'
								>
									✕
								</button>
							)}
						</div>
					</div>

					{/* ИНН владельца */}
					<div className='md:col-span-4'>
						<div className='flex items-center justify-between mb-1.5'>
							<label className='block text-xs font-bold uppercase tracking-wider text-slate-500'>
								{t('ИНН / ПИН владельца')}
							</label>
							{innInput && (
								<span className='text-[10px] text-slate-400 font-semibold font-mono'>
									{innInput.length}/14
								</span>
							)}
						</div>
						<div className='relative flex items-center h-12 rounded-xl border-2 border-slate-200 focus-within:border-[#283375] bg-white transition-all overflow-hidden'>
							<input
								type='text'
								value={innInput}
								onChange={(e) => {
									const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 14);
									onInnChange(val);
								}}
								placeholder='14 цифр паспорта'
								maxLength={14}
								className='w-full h-full px-3.5 text-sm font-mono tracking-wider outline-none placeholder:text-slate-400 bg-transparent'
							/>
							{innInput && (
								<button
									type='button'
									onClick={() => onInnChange('')}
									className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer'
									aria-label='Очистить ИНН'
								>
									✕
								</button>
							)}
						</div>
					</div>

					{/* Кнопка поиска */}
					<div className='md:col-span-3'>
						<button
							type='submit'
							disabled={isLoading || !numberInput.trim()}
							className='w-full h-12 bg-[#283375] hover:bg-[#1e2759] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'
						>
							{isLoading ? (
								<>
									<svg className='animate-spin h-4 w-4' viewBox='0 0 24 24' fill='none'>
										<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
										<path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
									</svg>
									<span>{t('Сверка...')}</span>
								</>
							) : (
								<>
									<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
									</svg>
									<span>{t('Проверить')}</span>
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
