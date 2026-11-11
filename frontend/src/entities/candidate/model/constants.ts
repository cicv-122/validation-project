// frontend/src/entities/candidate/model/constants.ts
import type { OfficialActSlot } from './types';

export function formatProfessionTitle(prof: string | null | undefined): string {
	if (!prof) return '—';
	const trimmed = prof.trim();
	if (trimmed === trimmed.toUpperCase() && /[А-ЯЁA-Z]/.test(trimmed)) {
		return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
	}
	return trimmed;
}

export const OFFICIAL_EXAM_SLOTS: OfficialActSlot[] = [
	{
		type: 'exam_protocol',
		title: 'Протокол квалификационной комиссии',
		subtitle: 'Итоговый официальный протокол заседания с решением о признании квалификации',
		descriptionPlaceholder: 'Протокол заседания отраслевой квалификационной комиссии',
		required: true,
	},
	{
		type: 'evaluation_sheet',
		title: 'Оценочный лист квалификационного экзамена',
		subtitle: 'Ведомость баллов по теории, технике безопасности и практике',
		descriptionPlaceholder: 'Официальный оценочный лист с подписями экспертов комиссии',
		required: true,
	},
	{
		type: 'exam_task',
		title: 'Экзаменационный билет и практические задания',
		subtitle: 'Билеты, тестовые задания и технические задания с ответами',
		descriptionPlaceholder: 'Экзаменационные билеты и бланки выполнения заданий',
		required: false,
	},
	{
		type: 'photo',
		title: 'Фотофиксация квалификационного экзамена',
		subtitle: 'Фотографии с места аттестации: подтверждение выполнения практических заданий',
		descriptionPlaceholder: 'Фото процесса прохождения практического экзамена',
		required: false,
	},
];

export const PERSONAL_DOC_SLOTS: OfficialActSlot[] = [
	{
		type: 'passport',
		title: 'Копия паспорта заявителя (ПИН / ID)',
		subtitle: 'Удостоверение личности гражданина с персональным идентификационным номером',
		descriptionPlaceholder: 'Копия паспорта заявителя',
		required: true,
	},
	{
		type: 'application_form',
		title: 'Заявление кандидата на сертификацию',
		subtitle: 'Официальное подписанное заявление установленного образца',
		descriptionPlaceholder: 'Скан заявления кандидата',
		required: true,
	},
	{
		type: 'diploma',
		title: 'Документ об образовании / Диплом',
		subtitle: 'Диплом, свидетельство или аттестат о профессиональном образовании',
		descriptionPlaceholder: 'Копия диплома или свидетельства об образовании',
		required: false,
	},
];
