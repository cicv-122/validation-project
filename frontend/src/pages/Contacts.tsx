import { useTranslation } from 'react-i18next';
import { PageHero, SEO } from '../components/ui';
import { ContactInfoCards, ContactMapSection } from '../widgets/contacts-view';

export default function Contacts() {
	const { t, i18n } = useTranslation();
	const yandexLang = i18n.language === 'en' ? 'en_US' : 'ru_RU';

	return (
		<div className='bg-gray-50 min-h-screen'>
			<SEO
				title={`${t('Контакты')} — ${t('ЦНСВ при МП КР')}`}
				description={t(
					'Контактная информация Центра независимой сертификации и валидации при МП КР: адрес, телефоны, график работы, схема проезда.'
				)}
			/>

			{/* Фирменный верхний баннер портала */}
			<PageHero title={t('Контакты')} />

			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
				{/* 1. Контактная информация — 4 карточки в едином стиле портала */}
				<ContactInfoCards />

				{/* 2. Блок интерактивной карты с быстрыми кнопками навигатора */}
				<ContactMapSection yandexLang={yandexLang} />
			</div>
		</div>
	);
}
