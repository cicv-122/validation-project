import React from 'react';
import { useTranslation } from 'react-i18next';
import { CertifiedUser } from '../../../types';
import { transliterate } from '../../../utils/transliterate';
import { translateProfession } from '../../../utils/translateProfession';

export interface NewsDetailCertifiedUsersProps {
	users?: CertifiedUser[];
	onSelectUser: (user: CertifiedUser) => void;
}

export const NewsDetailCertifiedUsers: React.FC<NewsDetailCertifiedUsersProps> = ({
	users,
	onSelectUser,
}) => {
	const { t, i18n } = useTranslation();

	if (!users || users.length === 0) return null;

	return (
		<div className='mt-16'>
			<h3 className='text-2xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2'>
				<svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
					/>
				</svg>
				{users.length === 1 ? t('Специалист в этом материале') : t('Специалисты в этом материале')}
			</h3>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{users.map((user) => (
					<div
						key={user.id}
						onClick={() => onSelectUser(user)}
						className='bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md'
					>
						<div className='w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0 flex items-center justify-center'>
							{user.image ? (
								<img
									src={user.image}
									alt={i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
									className='w-full h-full object-cover'
								/>
							) : (
								<svg className='w-8 h-8 text-gray-300' fill='currentColor' viewBox='0 0 24 24'>
									<path d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z' />
								</svg>
							)}
						</div>
						<div className='min-w-0 flex-1'>
							<h4 className='text-sm font-bold text-gray-900 truncate'>
								{i18n.language === 'en' ? transliterate(user.full_name) : user.full_name}
							</h4>
							{user.profession && (
								<p className='text-xs text-blue-600 font-medium truncate mt-0.5'>
									{translateProfession(user.profession, i18n.language)}
								</p>
							)}
							<p className='text-[11px] text-gray-400 font-mono mt-1'>{user.registration_number}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
