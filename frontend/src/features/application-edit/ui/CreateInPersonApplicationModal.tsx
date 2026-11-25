import React, { useState } from 'react';
import { Modal } from '../../../shared/ui';
import { staffApi } from '../../../api/staff';
import professionsDictionary from '../../../utils/professions_dictionary.json';
import {
	analyzeKyrgyzPin,
	CITIZENSHIP_OPTIONS,
	CitizenshipCode,
} from '../../../utils/kyrgyzPinValidator';

interface CreateInPersonApplicationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreated: (createdId: number) => void;
}

export const CreateInPersonApplicationModal: React.FC<CreateInPersonApplicationModalProps> = ({
	isOpen,
	onClose,
	onCreated,
}) => {
	const [fullName, setFullName] = useState('');
	const [citizenship, setCitizenship] = useState<CitizenshipCode>('KG');
	const [inn, setInn] = useState('');
	const [phone, setPhone] = useState('');
	const [whatsapp, setWhatsapp] = useState('');
	const [procedureType, setProcedureType] = useState<'certification' | 'validation'>('certification');
	const [profession, setProfession] = useState('');
	const [qualificationLevel, setQualificationLevel] = useState('');
	const [experienceYears, setExperienceYears] = useState<number | string>(0);
	const [isLaborMigrant, setIsLaborMigrant] = useState(false);
	const [migrationCountry, setMigrationCountry] = useState('Россия (РФ)');
	const [migrationCategory, setMigrationCategory] = useState<'returned' | 'planning'>('returned');
	const [address, setAddress] = useState('');
	const [adminNotes, setAdminNotes] = useState('Очный приём в Центре. Документы проверены лично.');
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const pinAnalysis = analyzeKyrgyzPin(inn, fullName, citizenship);

	const resetForm = () => {
		setFullName('');
		setCitizenship('KG');
		setInn('');
		setPhone('');
		setWhatsapp('');
		setProcedureType('certification');
		setProfession('');
		setQualificationLevel('');
		setExperienceYears(0);
		setIsLaborMigrant(false);
		setMigrationCountry('Россия (РФ)');
		setMigrationCategory('returned');
		setAddress('');
		setAdminNotes('Очный приём в Центре. Документы проверены лично.');
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const cleanName = fullName.trim();
		if (!cleanName) {
			setError('Укажите ФИО кандидата');
			return;
		}

		const cleanProf = profession.trim();
		if (!cleanProf) {
			setError('Укажите профессию кандидата');
			return;
		}

		if (inn.trim() && citizenship === 'KG' && !pinAnalysis.isValid) {
			setError(pinAnalysis.errorMessage || 'Указан некорректный 14-значный ПИН Кыргызской Республики');
			return;
		}

		setSubmitting(true);
		try {
			const res = await staffApi.createInPersonApplication({
				full_name: cleanName,
				profession: cleanProf,
				inn: inn.trim() || undefined,
				phone: phone.trim() || undefined,
				whatsapp: whatsapp.trim() || phone.trim() || undefined,
				application_type: procedureType,
				qualification_level: qualificationLevel.trim() || undefined,
				experience_years: Number(experienceYears) || 0,
				address: address.trim() || undefined,
				admin_notes: adminNotes.trim() || undefined,
				is_labor_migrant: isLaborMigrant,
				migration_country: isLaborMigrant ? migrationCountry : undefined,
				migration_category: isLaborMigrant ? migrationCategory : undefined,
			});

			resetForm();
			onClose();
			onCreated(res.id);
		} catch (err: any) {
			setError(err?.response?.data?.detail || 'Не удалось зарегистрировать обращение кандидата');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			maxWidth='2xl'
			title='Очный приём кандидата'
			subtitle='Регистрация гражданина, обратившегося лично в Центр (ЦНСВ)'
		>
			<form onSubmit={handleSubmit} className='space-y-4'>
				{error && (
					<div className='p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold'>
						{error}
					</div>
				)}

				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
					{/* ФИО */}
					<div className='sm:col-span-2'>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							ФИО кандидата
						</label>
						<input
							type='text'
							required
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder='Например: Саманчиев Урмат Белекович'
							className='w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
					</div>

					{/* Гражданство */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Гражданство
						</label>
						<div className='relative'>
							<select
								value={citizenship}
								onChange={(e) => setCitizenship(e.target.value as CitizenshipCode)}
								className='w-full pl-3 pr-9 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-[#283375] outline-none bg-white appearance-none cursor-pointer'
							>
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
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							ПИН / ИНН
						</label>
						<input
							type='text'
							maxLength={14}
							value={inn}
							onChange={(e) => setInn(e.target.value)}
							placeholder='14 цифр паспорта'
							className={`w-full px-3 py-2 text-xs font-mono rounded-xl border outline-none ${
								inn && !pinAnalysis.isValid && citizenship === 'KG'
									? 'border-red-400 bg-red-50/20 text-red-700'
									: 'border-slate-200 focus:border-[#283375]'
							}`}
						/>
						{inn && citizenship === 'KG' && (
							<div className='text-[10px] mt-0.5 font-medium'>
								{pinAnalysis.isValid ? (
									<span className='text-emerald-600'>✓ Корректный ПИН КР</span>
								) : (
									<span className='text-red-500'>{pinAnalysis.errorMessage}</span>
								)}
							</div>
						)}
					</div>

					{/* Номер телефона */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Номер телефона
						</label>
						<input
							type='text'
							required
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder='+996 ...'
							className='w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
					</div>

					{/* WhatsApp */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Номер WhatsApp (для уведомлений)
						</label>
						<input
							type='text'
							value={whatsapp}
							onChange={(e) => setWhatsapp(e.target.value)}
							placeholder='Если совпадает, можно не заполнять'
							className='w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
					</div>

					{/* Тип процедуры */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Тип процедуры
						</label>
						<div className='relative'>
							<select
								value={procedureType}
								onChange={(e) => setProcedureType(e.target.value as 'certification' | 'validation')}
								className='w-full pl-3 pr-9 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none bg-white appearance-none cursor-pointer'
							>
								<option value='certification'>Сертификация (выпускники, специалисты)</option>
								<option value='validation'>Валидация (неформальное обучение, опыт)</option>
							</select>
							<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400'>
								<svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
								</svg>
							</div>
						</div>
					</div>

					{/* Профессия */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Профессия / Квалификация
						</label>
						<input
							type='text'
							list='in-person-professions'
							required
							value={profession}
							onChange={(e) => setProfession(e.target.value)}
							placeholder='Начните ввод (Повар, Сварщик...)'
							className='w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
						<datalist id='in-person-professions'>
							{Object.keys(professionsDictionary).map((name) => (
								<option key={name} value={name} />
							))}
						</datalist>
					</div>

					{/* Уровень квалификации / разряд */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Разряд / Уровень
						</label>
						<input
							type='text'
							value={qualificationLevel}
							onChange={(e) => setQualificationLevel(e.target.value)}
							placeholder='Например: 3 разряд, 4 разряд'
							className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
					</div>

					{/* Стаж работы */}
					<div>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Стаж работы (лет)
						</label>
						<input
							type='number'
							min={0}
							max={60}
							value={experienceYears}
							onChange={(e) => setExperienceYears(e.target.value)}
							className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
					</div>

					{/* Блок трудовой миграции */}
					<div className='sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200 transition-all'>
						<label className='flex items-center gap-2.5 cursor-pointer select-none'>
							<input
								type='checkbox'
								checked={isLaborMigrant}
								onChange={(e) => {
									setIsLaborMigrant(e.target.checked);
									if (e.target.checked && !migrationCountry) {
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
							<div className='mt-2.5 pt-2.5 border-t border-slate-200/90 space-y-2.5 animate-in fade-in duration-150'>
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
												onClick={() => setMigrationCountry(c)}
												className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
													migrationCountry === c
														? 'bg-[#283375] text-white shadow-2xs'
														: 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
												}`}
											>
												{c}
											</button>
										))}
									</div>
								</div>

								<div className='flex items-center gap-4 text-xs font-medium text-slate-700 pt-1'>
									<label className='flex items-center gap-1.5 cursor-pointer'>
										<input
											type='radio'
											name='inperson_migration_cat'
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
											name='inperson_migration_cat'
											value='planning'
											checked={migrationCategory === 'planning'}
											onChange={() => setMigrationCategory('planning')}
											className='text-[#283375] cursor-pointer'
										/>
										<span>Готовится к выезду за рубеж</span>
									</label>
								</div>
							</div>
						)}
					</div>

					{/* Адрес проживания */}
					<div className='sm:col-span-2'>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Адрес проживания кандидата
						</label>
						<input
							type='text'
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder='г. Бишкек, ул. ...'
							className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none'
						/>
					</div>

					{/* Служебная заметка сотрудника */}
					<div className='sm:col-span-2'>
						<label className='block text-[11px] font-bold text-slate-700 mb-1'>
							Служебные заметки сотрудника ЦНСВ
						</label>
						<textarea
							rows={2}
							value={adminNotes}
							onChange={(e) => setAdminNotes(e.target.value)}
							placeholder='Заметки по кандидату, дата визита, предоставленные документы...'
							className='w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#283375] outline-none resize-none'
						/>
					</div>
				</div>

				<div className='pt-3 border-t border-slate-200 flex items-center justify-end gap-2'>
					<button
						type='button'
						onClick={onClose}
						disabled={submitting}
						className='px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer'
					>
						Отмена
					</button>
					<button
						type='submit'
						disabled={submitting}
						className='px-5 py-2.5 rounded-xl bg-[#283375] hover:bg-[#1e265c] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
					>
						<svg className='w-4 h-4 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
						</svg>
						<span>{submitting ? 'Регистрация...' : 'Зарегистрировать и открыть дело'}</span>
					</button>
				</div>
			</form>
		</Modal>
	);
};
