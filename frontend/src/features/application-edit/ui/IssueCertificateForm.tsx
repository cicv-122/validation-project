interface IssueCertificateFormProps {
	certNumber: string;
	setCertNumber: (val: string) => void;
	certInn: string;
	setCertInn: (val: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isIssuing: boolean;
	issueResult: {
		message: string;
		registration_number: string;
		verify_url: string;
	} | null;
}

export function IssueCertificateForm({
	certNumber,
	setCertNumber,
	certInn,
	setCertInn,
	onSubmit,
	isIssuing,
	issueResult,
}: IssueCertificateFormProps) {
	return (
		<div className='p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4'>
			<div className='flex items-center gap-2'>
				<div className='w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0'>
					<svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 14l9-5-9-5-9 5 9 5z' />
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' />
					</svg>
				</div>
				<h4 className='text-sm font-black text-purple-950'>
					Выпуск государственного сертификата в реестр
				</h4>
			</div>
			<p className='text-xs text-purple-900/80'>
				После успешной сдачи экзамена введите номер бланка. Система создаст официальную запись в реестре и сгенерирует QR-код.
			</p>

			{issueResult && (
				<div className='p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 space-y-2'>
					<div className='font-bold flex items-center gap-2'>
						<span>✓ {issueResult.message}</span>
					</div>
					<div className='text-xs'>
						Присвоен официальный номер: <b>{issueResult.registration_number}</b>
					</div>
					<a
						href={issueResult.verify_url}
						target='_blank'
						rel='noreferrer'
						className='inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all mt-2'
					>
						Проверить в открытом реестре (/verify)
					</a>
				</div>
			)}

			<form onSubmit={onSubmit} className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
				<div>
					<label className='block text-[11px] font-bold text-purple-900 mb-1'>
						Номер сертификата
					</label>
					<div className='flex items-center px-3 py-2 rounded-xl border border-purple-200 bg-white focus-within:border-purple-600 focus-within:ring-1 focus-within:ring-purple-600'>
						<span className='text-xs font-bold font-mono text-purple-950 select-none whitespace-nowrap mr-1.5'>
							ЦС №
						</span>
						<input
							type='text'
							required
							placeholder='000760'
							value={certNumber.replace(/^ЦС\s*№?\s*/i, '')}
							onChange={(e) => {
								const val = e.target.value.trim();
								setCertNumber(val ? `ЦС № ${val}` : '');
							}}
							className='w-full text-xs font-bold font-mono text-slate-900 outline-none bg-transparent p-0'
						/>
					</div>
				</div>

				<div>
					<label className='block text-[11px] font-bold text-purple-900 mb-1'>
						14-значный ИНН кандидата
					</label>
					<input
						type='text'
						maxLength={14}
						placeholder='14 цифр паспорта'
						value={certInn}
						onChange={(e) => setCertInn(e.target.value)}
						className='w-full px-3 py-2 text-xs font-mono rounded-xl border border-purple-200 bg-white outline-none focus:border-purple-600'
					/>
				</div>

				<div className='flex items-end'>
					<button
						type='submit'
						disabled={isIssuing}
						className='w-full py-2.5 px-4 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition-all shadow-md shadow-purple-700/20 disabled:opacity-50 cursor-pointer'
					>
						{isIssuing ? 'Внесение в реестр...' : 'Внести в реестр'}
					</button>
				</div>
			</form>
		</div>
	);
}
