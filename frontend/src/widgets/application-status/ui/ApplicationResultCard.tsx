import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatLocalizedDate } from '../../../shared/lib';
import { StatusData, STATUS_COLORS } from '../model/types';

export interface ApplicationResultCardProps {
	result: StatusData;
}

export const ApplicationResultCard: React.FC<ApplicationResultCardProps> = ({ result }) => {
	const { t, i18n } = useTranslation();

	return (
		<div className='bg-white rounded-2xl shadow-lg p-6'>
			<div className='flex items-start justify-between mb-5'>
				<div>
					<p className='font-bold text-gray-900 text-lg'>{result.full_name}</p>
					<p className='text-sm text-gray-500 mt-0.5'>
						{result.profession} · {result.type_display}
					</p>
				</div>
				<span
					className={`text-xs font-semibold px-3 py-1 rounded-full border ${
						STATUS_COLORS[result.status] || 'bg-gray-100 text-gray-600 border-gray-200'
					}`}
				>
					{result.status_display}
				</span>
			</div>
			<div className='space-y-3 text-sm'>
				<div className='flex justify-between'>
					<span className='text-gray-500'>{t('Дата подачи:')}</span>
					<span className='font-medium'>
						{formatLocalizedDate(result.created_at, i18n.language)}
					</span>
				</div>
				{result.scheduled_date && (
					<div className='flex justify-between'>
						<span className='text-gray-500'>{t('Дата проведения:')}</span>
						<span className='font-medium'>
							{formatLocalizedDate(result.scheduled_date, i18n.language)}
						</span>
					</div>
				)}
				{result.scheduled_location && (
					<div className='flex justify-between'>
						<span className='text-gray-500'>{t('Место проведения:')}</span>
						<span className='font-medium text-right max-w-48'>
							{result.scheduled_location}
						</span>
					</div>
				)}
			</div>
			{result.status === 'pending' && (
				<div className='mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800'>
					{t(
						'Ваша заявка рассматривается. Ожидайте уведомления на указанный email или телефон.'
					)}
				</div>
			)}
			{result.status === 'approved' && (
				<div className='mt-5 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800'>
					{t('Ваша заявка одобрена! Дата и место проведения будут сообщены дополнительно.')}
				</div>
			)}
			{result.status === 'scheduled' && (
				<div className='mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800'>
					{t(
						'Ваша процедура запланирована. Не опаздывайте — при опоздании вы не будете допущены к оценке.'
					)}
				</div>
			)}
			{result.status === 'rejected' && (
				<div className='mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800'>
					{t('К сожалению, ваша заявка отклонена. Свяжитесь с Центром для уточнения причин.')}
				</div>
			)}
		</div>
	);
};
