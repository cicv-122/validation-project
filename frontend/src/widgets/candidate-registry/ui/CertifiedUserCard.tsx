import { useTranslation } from 'react-i18next';
import { formatLocalizedDate } from '../../../shared/lib';
import type { CertifiedUser } from '../../../types';
import { transliterate } from '../../../utils/transliterate';
import { translateProfession } from '../../../utils/translateProfession';

function PersonIcon() {
	return (
		<svg className='w-16 h-16 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
			<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
		</svg>
	);
}

interface CertifiedUserCardProps {
	user: CertifiedUser;
	isHighlighted?: boolean;
	onClick: (user: CertifiedUser) => void;
}

export default function CertifiedUserCard({
	user,
	isHighlighted,
	onClick,
}: CertifiedUserCardProps) {
	const { t, i18n } = useTranslation();
	const displayName = i18n.language === 'en' ? transliterate(user.full_name) : user.full_name;

	return (
		<div
			id={`user-card-${encodeURIComponent(user.registration_number)}`}
			onClick={() => onClick(user)}
			className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${
				isHighlighted
					? 'ring-4 ring-blue-500 shadow-xl scale-[1.02] border-blue-500 bg-blue-50/30'
					: 'border-gray-100'
			}`}
		>
			{/* Photo */}
			{user.image ? (
				<img
					src={user.image}
					alt={displayName}
					className='w-full h-52 object-cover object-top'
				/>
			) : (
				<div className='w-full h-52 flex items-center justify-center bg-gray-100'>
					<PersonIcon />
				</div>
			)}

			{/* Info */}
			<div className='p-4 text-center space-y-2'>
				<h3 className='text-base font-bold text-gray-900 leading-tight' title={displayName}>
					{displayName}
				</h3>

				{user.profession && (
					<p className='text-xs text-gray-500 line-clamp-2'>
						{translateProfession(user.profession, i18n.language)}
					</p>
				)}

				{!user.registration_number || /^ЦС\s*№?\s*0+$/i.test(user.registration_number.trim()) ? (
					<span className='inline-block text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 py-1 px-3 rounded-full'>
						{t('Рег. номер')}: {t('Не присвоен')}
					</span>
				) : (
					<span className='inline-block text-xs font-semibold text-[#283375] bg-blue-50 border border-blue-100 py-1 px-3 rounded-full'>
						{t('Рег. номер')}: {user.registration_number}
					</span>
				)}

				{user.issued_date && (
					<p className='text-xs text-gray-400'>
						{t('Выдача сертификата')}: {formatLocalizedDate(user.issued_date, i18n.language)}
					</p>
				)}
			</div>
		</div>
	);
}
