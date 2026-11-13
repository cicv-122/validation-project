import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SEO } from '../components/ui';
import {
	ApplicationStatusForm,
	ApplicationRecoveryForm,
	ApplicationResultCard,
	StatusData,
	checkApplicationStatus,
	recoverApplicationNumber,
} from '../widgets/application-status';

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
			const data = await checkApplicationStatus(value);
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
			const data = await recoverApplicationNumber(recInn, recEmail);
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
					<ApplicationRecoveryForm
						onBack={() => setShowRecovery(false)}
						recInn={recInn}
						setRecInn={setRecInn}
						recEmail={recEmail}
						setRecEmail={setRecEmail}
						recLoading={recLoading}
						recMessage={recMessage}
						onRecover={handleRecover}
					/>
				) : (
					<ApplicationStatusForm
						regNumber={regNumber}
						setRegNumber={setRegNumber}
						loading={loading}
						error={error}
						onCheck={() => handleCheck()}
						onShowRecovery={() => {
							setShowRecovery(true);
							setResult(null);
							setError('');
						}}
					/>
				)}

				{result && <ApplicationResultCard result={result} />}

				<div className='mt-8 text-center'>
					<a href={'/' + lang + '/apply'} className='text-blue-600 text-sm hover:underline'>
						← {t('Подать заявку')}
					</a>
				</div>
			</div>
		</div>
	);
}
