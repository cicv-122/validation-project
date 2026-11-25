import {
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
} from '../../../utils/kyrgyzPinValidator';

interface PersonalContactFieldsProps {
	fullName: string;
	setFullName: (val: string) => void;
	citizenship: CitizenshipCode;
	setCitizenship: (val: CitizenshipCode) => void;
	inn: string;
	setInn: (val: string) => void;
	pinErrorMessage?: string | null;
	isPinValid?: boolean;
	isPinComplete?: boolean;
	phone: string;
	setPhone: (val: string) => void;
	whatsapp: string;
	setWhatsapp: (val: string) => void;
	email: string;
	setEmail: (val: string) => void;
	address: string;
	setAddress: (val: string) => void;
	isLaborMigrant?: boolean;
	setIsLaborMigrant?: (val: boolean) => void;
	migrationCountry?: string;
	setMigrationCountry?: (val: string) => void;
	migrationCategory?: 'returned' | 'planning';
	setMigrationCategory?: (val: 'returned' | 'planning') => void;
}

export function PersonalContactFields({
	fullName,
	setFullName,
	citizenship,
	setCitizenship,
	inn,
	setInn,
	pinErrorMessage,
	isPinValid,
	isPinComplete,
	phone,
	setPhone,
	whatsapp,
	setWhatsapp,
	email,
	setEmail,
	address,
	setAddress,
	isLaborMigrant = false,
	setIsLaborMigrant,
	migrationCountry = '',
	setMigrationCountry,
	migrationCategory = 'returned',
	setMigrationCategory,
}: PersonalContactFieldsProps) {
	return (
		<div className='bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4'>
			<div className='flex items-center justify-between'>
				<h3 className='text-xs font-extrabold uppercase tracking-wider text-[#283375] flex items-center gap-2'>
					<svg className='w-4 h-4 text-[#283375]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
					</svg>
					<span>Личные и контактные данные</span>
				</h3>
				<span className='text-[11px] text-slate-400 font-medium'>Редактируемые поля</span>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
				{/* ФИО */}
				<div className='sm:col-span-2 md:col-span-1'>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						ФИО кандидата
					</label>
					<input
						type='text'
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder='Фамилия Имя Отчество'
						className='w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
					/>
				</div>

				{/* Гражданство */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Гражданство
					</label>
					<div className='relative'>
						<select
							value={citizenship}
							onChange={(e) => setCitizenship(e.target.value as CitizenshipCode)}
							className={`w-full pl-3 pr-9 py-2 text-xs font-semibold rounded-xl border bg-white outline-none transition-colors cursor-pointer appearance-none ${
								inn && !citizenship
									? 'border-red-400 bg-red-50/30 text-red-700'
									: 'border-slate-200 focus:border-[#283375]'
							}`}
						>
							<option value=''>— Выберите —</option>
							{CITIZENSHIP_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400'>
							<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>
					</div>
				</div>

				{/* ПИН / ИНН */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						ПИН / ИНН
					</label>
					<input
						type='text'
						maxLength={
							CITIZENSHIP_OPTIONS.find((c) => c.value === citizenship)?.maxLength || 14
						}
						value={inn}
						onChange={(e) => setInn(e.target.value.replace(/\D/g, ''))}
						placeholder={
							CITIZENSHIP_OPTIONS.find((c) => c.value === citizenship)?.placeholder ||
							'Сначала выберите гражданство'
						}
						className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border bg-white outline-none transition-colors ${
							inn && pinErrorMessage
								? 'border-red-400 bg-red-50/30 focus:border-red-600'
								: inn && isPinValid && isPinComplete
								? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
								: 'border-slate-200 focus:border-[#283375] focus:ring-1 focus:ring-[#283375]'
						}`}
					/>
					{inn && pinErrorMessage && (
						<p className='mt-1 text-[10px] font-bold text-red-600'>
							{pinErrorMessage}
						</p>
					)}
				</div>

				{/* Телефон */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Номер телефона
					</label>
					<input
						type='text'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder='+996 ...'
						className='w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* WhatsApp */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						WhatsApp
					</label>
					<div className='flex items-center gap-1.5'>
						<input
							type='text'
							value={whatsapp}
							onChange={(e) => setWhatsapp(e.target.value)}
							placeholder='996...'
							className='w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
						/>
						{whatsapp && (
							<a
								href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
								target='_blank'
								rel='noreferrer'
								title='Написать в WhatsApp'
								className='p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0 transition-colors'
							>
								<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
									<path d='M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.116-.062-.26-.086-.586-.201-1.009-.387-1.782-.782-2.935-2.586-3.025-2.705-.089-.119-.724-.962-.724-1.836s.456-1.306.619-1.485c.162-.179.355-.224.474-.224.119 0 .237.002.341.007.109.006.257-.041.402.308.149.36.509 1.242.554 1.332.045.09.075.195.015.314-.06.119-.09.194-.179.298-.089.105-.188.234-.269.314-.09.09-.184.188-.079.368.105.18.468.773 1.005 1.251.692.616 1.277.807 1.457.897.18.09.285.075.39-.045.105-.12.449-.523.569-.703.12-.179.24-.149.404-.09.165.06 1.049.495 1.229.585.18.09.3.135.344.21.045.075.045.435-.099.84z' />
								</svg>
							</a>
						)}
					</div>
				</div>

				{/* Email */}
				<div>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Электронная почта
					</label>
					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='email@domain.com'
						className='w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Адрес */}
				<div className='sm:col-span-2 md:col-span-3'>
					<label className='block text-[11px] font-bold text-slate-600 mb-1'>
						Адрес проживания кандидата
					</label>
					<input
						type='text'
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						placeholder='г. Бишкек, район, улица, дом...'
						className='w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white outline-none focus:border-[#283375]'
					/>
				</div>

				{/* Блок трудовой миграции */}
				{setIsLaborMigrant && (
					<div className='sm:col-span-2 md:col-span-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs transition-all'>
						<label className='flex items-center gap-2.5 cursor-pointer select-none'>
							<input
								type='checkbox'
								checked={isLaborMigrant}
								onChange={(e) => {
									setIsLaborMigrant(e.target.checked);
									if (e.target.checked && !migrationCountry && setMigrationCountry) {
										setMigrationCountry('Россия (РФ)');
									}
								}}
								className='w-4 h-4 text-[#283375] rounded border-slate-300 focus:ring-[#283375] cursor-pointer'
							/>
							<span className='text-xs font-bold text-slate-800'>
								Кандидат является трудовым мигрантом (опыт работы за рубежом)
							</span>
						</label>

						{isLaborMigrant && (
							<div className='mt-2.5 pt-2.5 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-150'>
								<div>
									<div className='text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'>
										Страна наработки опыта / миграции:
									</div>
									<div className='flex items-center gap-1.5 flex-wrap'>
										{[
											'Россия (РФ)',
											'Турция',
											'Южная Корея',
											'ОАЭ / Залив',
											'Казахстан',
											'Страны ЕС',
										].map((c) => (
											<button
												key={c}
												type='button'
												onClick={() => setMigrationCountry && setMigrationCountry(c)}
												className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
													migrationCountry === c
														? 'bg-[#283375] text-white shadow-2xs'
														: 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-400'
												}`}
											>
												{c}
											</button>
										))}
									</div>
								</div>

								{setMigrationCategory && (
									<div className='flex items-center gap-4 text-xs font-medium text-slate-700 pt-1'>
										<label className='flex items-center gap-1.5 cursor-pointer'>
											<input
												type='radio'
												name='edit_migration_cat'
												value='returned'
												checked={migrationCategory === 'returned'}
												onChange={() => setMigrationCategory('returned')}
												className='text-[#283375] cursor-pointer'
											/>
											<span>Вернулся в Кыргызстан</span>
										</label>
										<label className='flex items-center gap-1.5 cursor-pointer'>
											<input
												type='radio'
												name='edit_migration_cat'
												value='planning'
												checked={migrationCategory === 'planning'}
												onChange={() => setMigrationCategory('planning')}
												className='text-[#283375] cursor-pointer'
											/>
											<span>Готовится к выезду за рубеж</span>
										</label>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
