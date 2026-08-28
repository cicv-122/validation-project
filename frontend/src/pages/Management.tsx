import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorMessage, PageHero, SEO, Spinner } from '../components/ui';
import { useManagement } from '../hooks/useApi';
import type { ManagementMember } from '../types';

const MemberImage = ({ image, name }: { image?: string | null; name: string }) => {
	const [imgError, setImgError] = useState(false);

	if (!image || imgError) {
		return (
			<div className='w-full h-full bg-slate-200 flex items-center justify-center text-slate-400'>
				<svg className='w-20 h-20 opacity-50' fill='currentColor' viewBox='0 0 24 24'>
					<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
				</svg>
			</div>
		);
	}

	return (
		<img
			src={image}
			alt={name}
			loading='lazy'
			decoding='async'
			className='w-full h-full object-cover'
			onError={() => setImgError(true)}
		/>
	);
};

export default function Management() {
	const { t } = useTranslation();
	const { data: members, isLoading, error } = useManagement();

	const renderMember = (member: ManagementMember) => (
		<div
			key={member.id}
			className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col'
		>
			<div className='aspect-[4/5] w-full relative bg-gray-100 flex items-center justify-center overflow-hidden'>
				<MemberImage image={member.image} name={member.full_name} />
				<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />
				<div className='absolute bottom-0 left-0 right-0 p-6 text-white drop-shadow-md'>
					<h3 className='text-xl font-bold mb-1 leading-tight'>{member.full_name}</h3>
					<p className='font-medium text-blue-200 text-sm leading-snug'>{member.position}</p>
				</div>
			</div>
			{member.description && (
				<div className='p-6 flex-grow'>
					<p className='text-gray-600 text-sm leading-relaxed whitespace-pre-line'>
						{member.description}
					</p>
				</div>
			)}
		</div>
	);

	const bosses = members?.filter((m) => m.is_management) || [];
	const employees = members?.filter((m) => !m.is_management) || [];

	return (
		<div className='bg-white min-h-screen'>
			<SEO
				title={`${t('Руководство')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Представители руководства и сотрудники Центра независимой сертификации и валидации при Министерстве просвещения Кыргызской Республики.'
				)}
			/>
			<PageHero title={t('Руководство')} />
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{isLoading ? (
					<Spinner />
				) : error ? (
					<ErrorMessage message={t('Ошибка загрузки данных.')} />
				) : members && members.length > 0 ? (
					<>
						{bosses.length > 0 && (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
								{bosses.map(renderMember)}
							</div>
						)}
					</>
				) : (
					<EmptyState message={t('Данных пока нет.')} />
				)}
			</div>

			{members && members.length > 0 && employees.length > 0 && (
				<>
					<div className='mt-8 mb-4'>
						<PageHero title={t('Сотрудники')} />
					</div>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
							{employees.map(renderMember)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
