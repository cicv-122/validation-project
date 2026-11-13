// frontend/src/widgets/experts-registry/model/types.ts

export interface RegionMeta {
	code: string;
	key: string;
	ru: string;
	kg: string;
	en: string;
}

export const REGION_ORDER: RegionMeta[] = [
	{ code: '01', key: 'г. Бишкек', ru: 'г. Бишкек', kg: 'Бишкек ш.', en: 'Bishkek' },
	{ code: '02', key: 'г. Ош', ru: 'г. Ош', kg: 'Ош ш.', en: 'Osh' },
	{ code: '03', key: 'Чуйская область', ru: 'Чуйская область', kg: 'Чүй облусу', en: 'Chuy Region' },
	{ code: '04', key: 'Ошская область', ru: 'Ошская область', kg: 'Ош облусу', en: 'Osh Region' },
	{ code: '05', key: 'Нарынская область', ru: 'Нарынская область', kg: 'Нарын облусу', en: 'Naryn Region' },
	{
		code: '06',
		key: 'Джалал-Абадская область (г. Манас)',
		ru: 'Джалал-Абадская область (г. Манас)',
		kg: 'Жалал-Абад облусу (Манас ш.)',
		en: 'Jalal-Abad Region (Manas city)',
	},
	{ code: '07', key: 'Таласская область', ru: 'Таласская область', kg: 'Талас облусу', en: 'Talas Region' },
	{ code: '08', key: 'Баткенская область', ru: 'Баткенская область', kg: 'Баткен облусу', en: 'Batken Region' },
	{ code: '09', key: 'Иссык-Кульская область', ru: 'Иссык-Кульская область', kg: 'Ысык-Көл облусу', en: 'Issyk-Kul Region' },
];

export interface ExpertItem {
	id: number | string;
	code: string;
	name: string;
	name_en?: string;
	role_ru: string;
	role_kg?: string;
	profession_ru: string;
	profession_kg?: string;
	organization?: string;
	organization_kg?: string;
	organization_en?: string;
	assessment_center_id?: number | null;
	partner_id?: number | null;
	phone?: string;
}
