import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, Spinner } from '../../../components/ui';
import CertifiedUserCard from './CertifiedUserCard';
import CertifiedUserPagination from './CertifiedUserPagination';
import type { CertifiedUser } from '../../../types';

interface CertifiedUsersGridProps {
	users: CertifiedUser[];
	isLoading: boolean;
	isFetching: boolean;
	error: unknown;
	highlightedReg: string | null;
	page: number;
	totalPages: number;
	hasSearchQuery: boolean;
	onPageChange: (page: number) => void;
	onSelectUser: (user: CertifiedUser) => void;
}

export const CertifiedUsersGrid: React.FC<CertifiedUsersGridProps> = ({
	users,
	isLoading,
	isFetching,
	error,
	highlightedReg,
	page,
	totalPages,
	hasSearchQuery,
	onPageChange,
	onSelectUser,
}) => {
	const { t } = useTranslation();

	if (isLoading) {
		return <Spinner />;
	}

	if (error) {
		return <ErrorMessage message={t('Ошибка загрузки данных.')} />;
	}

	if (users.length > 0) {
		return (
			<>
				<div
					className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${
						isFetching ? 'opacity-60' : 'opacity-100'
					}`}
				>
					{users.map((user) => (
						<CertifiedUserCard
							key={user.id}
							user={user}
							isHighlighted={highlightedReg === user.registration_number}
							onClick={onSelectUser}
						/>
					))}
				</div>

				<CertifiedUserPagination
					page={page}
					totalPages={totalPages}
					isFetching={isFetching}
					onPageChange={onPageChange}
				/>
			</>
		);
	}

	if (hasSearchQuery) {
		return (
			<div className='text-center py-20'>
				<div className='w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400'>
					<svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1.8}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
				</div>
				<h3 className='text-xl font-bold text-gray-800 mb-2'>{t('Ничего не найдено')}</h3>
				<p className='text-gray-500'>{t('Попробуйте изменить поисковый запрос.')}</p>
			</div>
		);
	}

	return <EmptyState message={t('Данных пока нет.')} />;
};

export default CertifiedUsersGrid;
