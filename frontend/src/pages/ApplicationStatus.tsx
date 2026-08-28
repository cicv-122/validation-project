import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { SEO } from '../components/ui';

interface StatusData {
	registration_number: string;
	short_registration_number: string;
	full_name: string;
	profession: string;
	type_display: string;
	status: string;
	status_display: string;
	scheduled_date: string | null;
	scheduled_location: string;
	created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
	approved: 'bg-green-100 text-green-800 border-green-300',
	rejected: 'bg-red-100 text-red-800 border-red-300',
	scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
	completed: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function ApplicationStatus() {
	const { t } = useTranslation();
	const { lang = 'ru' } = useParams<{ lang: string }>();

	const params = new URLSearchParams(window.location.search);
	const initialReg = params.get('reg') || '';

	const [regNumber, setRegNumber] = useState(initialReg);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<StatusData | null>(null);
	const [error, setError] = useState('');

	const [showRecovery, setShowRecovery] = useState(false);
	const [recInn, setRecInn] = useState('');
	const [recEmail, setRecEmail] = useState('');
	const [recLoading, setRecLoading] = useState(false);
	const [recMessage, setRecMessage] = useState({ text: '', isError: false });

	const handleCheck = async (num?: string) => {
		const value = (num ?? regNumber).trim();
		if (!value) return;
		setLoading(true);
		setError('');
		setResult(null);
		try {
			const { data } = await apiClient.get(`/certification/status/${value}/`);
			setResult(data);
		} catch (e: any) {
			setError(e?.response?.data?.detail || t('Заявка не найдена'));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (initialReg) {
			handleCheck(initialReg);
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleRecover = async () => {
		if (recInn.trim().length !== 14 || !/^\d+$/.test(recInn.trim())) {
			setRecMessage({ text: t('Персональный номер должен состоять из 14 цифр'), isError: true });
			return;
		}
		if (!recEmail.trim()) {
			setRecMessage({ text: t('Заполните оба поля'), isError: true });
			return;
		}
		setRecLoading(true);
		setRecMessage({ text: '', isError: false });
		try {
			const { data } = await apiClient.post('/certification/recover/', {
				inn: recInn.trim(),
				email: recEmail.trim(),
			});
			setRecMessage({ text: data.detail, isError: false });
			setRecInn('');
			setRecEmail('');
		} catch (e: any) {
			setRecMessage({
				text: e?.response?.data?.detail || t('Ошибка восстановления'),
				isError: true,
			});
		} finally {
			setRecLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-4'>
			<SEO
				title={`${t('Статус заявки')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Проверьте статус вашей заявки на сертификацию или валидацию по регистрационному номеру.'
				)}
			/>
			<div className='max-w-xl mx-auto'>
				<div className='text-center mb-10'>
					<h1 className='text-3xl font-extrabold text-gray-900'>{t('Статус заявки')}</h1>
					<p className='mt-2 text-gray-500 text-sm'>
						{t('Введите регистрационный номер вашей заявки')}
					</p>
				</div>

				{showRecovery ? (
					<div className='bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-blue-500'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-lg font-bold text-gray-900'>{t('Восстановление номера')}</h2>
							<button
								onClick={() => setShowRecovery(false)}
								className='text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors'
							>
								{t('Назад')}
							</button>
						</div>
						<p className='text-sm text-gray-500 mb-5 leading-relaxed'>
							{t(
								'Введите данные, указанные при подаче заявки. Мы найдем вашу заявку и отправим регистрационный номер на вашу почту.'
							)}
						</p>
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									{t('Персональный номер')} <span className='text-red-500'>*</span>
								</label>
								<input
									type='text'
									value={recInn}
									onChange={(e) => setRecInn(e.target.value.replace(/\D/g, '').slice(0, 14))}
									placeholder='00000000000000'
									className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									{t('E-mail')}
								</label>
								<input
									type='email'
									value={recEmail}
									onChange={(e) => setRecEmail(e.target.value)}
									className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm'
								/>
							</div>
							<button
								onClick={handleRecover}
								disabled={recLoading}
								className='w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2'
							>
								{recLoading ? '...' : t('Отправить на почту')}
							</button>
						</div>
						{recMessage.text && (
							<div
								className={`mt-5 p-4 rounded-xl text-sm ${
									recMessage.isError
										? 'bg-red-50 text-red-700 border border-red-200'
										: 'bg-green-50 text-green-700 border border-green-200'
								}`}
							>
								{recMessage.text}
							</div>
						)}
					</div>
				) : (
					<div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
						<label className='block text-sm font-medium text-gray-700 mb-2'>
							{t('Регистрационный номер')}
						</label>
						<div className='flex flex-col sm:flex-row gap-3'>
							<input
								type='text'
								value={regNumber}
								onChange={(e) => setRegNumber(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
								placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
								className='flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono'
							/>
							<button
								onClick={() => handleCheck()}
								disabled={loading || !regNumber.trim()}
								className='px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors w-full sm:w-auto flex items-center justify-center'
							>
								{loading ? '...' : t('Проверить')}
							</button>
						</div>
						<div className='mt-3 flex items-center justify-between'>
							{error ? <p className='text-sm text-red-600'>{error}</p> : <span></span>}
							<button
								onClick={() => {
									setShowRecovery(true);
									setResult(null);
									setError('');
								}}
								className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'
							>
								{t('Забыли номер?')}
							</button>
						</div>
					</div>
				)}

				{result && (
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
									{new Date(result.created_at).toLocaleDateString('ru-RU')}
								</span>
							</div>
							{result.scheduled_date && (
								<div className='flex justify-between'>
									<span className='text-gray-500'>{t('Дата проведения:')}</span>
									<span className='font-medium'>
										{new Date(result.scheduled_date).toLocaleDateString('ru-RU')}
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
				)}

				<div className='mt-8 text-center'>
					<a href={'/' + lang + '/apply'} className='text-blue-600 text-sm hover:underline'>
						← {t('Подать заявку')}
					</a>
				</div>
			</div>
		</div>
	);
}
