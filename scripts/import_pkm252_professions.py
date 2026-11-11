import os
import re
import zipfile
import xml.etree.ElementTree as ET
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.certification.models import Profession, Specialization

SPECIALIZATIONS_MAP = {
    'Повар': [
        ('Европейская кухня', 'Европа ашканасы'),
        ('Азиатская кухня', 'Азия ашканасы'),
        ('Среднеазиатская кухня', 'Орто Азия ашканасы'),
        ('Японская / Суши', 'Япон / Суши'),
        ('Диетическое питание', 'Мүнөздүү тамактандыруу'),
        ('Быстрое питание (Fast Food)', 'Тез тамактануу'),
    ],
    'Кондитер': [
        ('Торты и пирожные', 'Торттор жана таттуулар'),
        ('Шоколад и конфеты', 'Шоколад жана момпосуйлар'),
        ('Хлебобулочные изделия', 'Нан-токоч азыктары'),
        ('Диетическая выпечка', 'Мүнөздүү бышырыктар'),
    ],
    'Официант': [
        ('Ресторанный сервис', 'Ресторандык тейлөө'),
        ('Банкетное обслуживание', 'Банкеттик тейлөө'),
        ('Кофейня / Кафе', 'Кофейня / Кафе'),
    ],
    'Бармен': [
        ('Коктейли', 'Коктейлдер'),
        ('Кофе-бар (Бариста)', 'Кофе-бар (Бариста)'),
        ('Безалкогольные напитки', 'Алкоголсуз суусундуктар'),
    ],
    'Электросварщик ручной сварки': [
        ('Чёрные металлы', 'Кара металлдар'),
        ('Нержавеющая сталь', 'Дат баспаган болот'),
        ('Трубная сварка', 'Түтүк ширетүү'),
        ('Монтажная сварка', 'Монтаждоо ширетүүсү'),
    ],
    'Электрогазосварщик': [
        ('Трубопроводы высокого давления', 'Жогорку басымдагы куурлар'),
        ('Строительные металлоконструкции', 'Курулуш металл конструкциялары'),
        ('Ремонтная сварка', 'Оңдоо ширетүүсү'),
    ],
    'Мастер отделочных строительных работ': [
        ('Штукатурные работы', 'Шыбак иштери'),
        ('Малярные работы', 'Сырдоо иштери'),
        ('Облицовка плиткой', 'Плитка чаптоо'),
        ('Гипсокартонные конструкции', 'Гипсокартон конструкциялары'),
    ],
    'Мастер отделочных работ': [
        ('Штукатурные работы', 'Шыбак иштери'),
        ('Малярные работы', 'Сырдоо иштери'),
        ('Облицовка плиткой', 'Плитка чаптоо'),
        ('Гипсокартонные конструкции', 'Гипсокартон конструкциялары'),
    ],
    'Швея': [
        ('Женская одежда', 'Аялдардын кийими'),
        ('Мужская одежда', 'Эркектердин кийими'),
        ('Детская одежда', 'Балдардын кийими'),
        ('Спецодежда и униформа', 'Атайын кийим жана униформа'),
        ('Трикотажные изделия', 'Трикотаж буюмдары'),
    ],
    'Портной с умением кроить': [
        ('Верхняя одежда', 'Сырткы кийим'),
        ('Лёгкое платье', 'Жеңил көйнөк'),
        ('Индивидуальный пошив', 'Жеке тигүү'),
    ],
    'Водитель автомобиля': [
        ('Легковые автомобили (кат. B)', 'Жеңил автоунаалар (В категориясы)'),
        ('Грузовые автомобили (кат. C)', 'Жүк ташуучу автоунаалар (С категориясы)'),
        ('Пассажирский транспорт / Автобус (кат. D)', 'Жүргүнчү ташуу / Автобус (D категориясы)'),
        ('Такси и городская логистика', 'Такси жана шаардык логистика'),
    ],
    'Тракторист-машинист сельскохозяйственного производства': [
        ('Полеводство и обработка почвы', 'Талаачылык жана жер иштетүү'),
        ('Уборочные комбайны', 'Түшүм жыйноочу комбайндар'),
        ('Мелиоративные и дорожные работы', 'Мелиоративдик жана жол иштери'),
    ],
    'Оператор ЭВМ': [
        ('Офисные программы и делопроизводство', 'Офистик программалар жана иш кагаздары'),
        ('1С: Бухгалтерия и учетное ПО', '1С: Бухгалтерия жана эсеп программалары'),
        ('Компьютерная графика и вёрстка', 'Компьютердик графика жана верстка'),
        ('Техническая поддержка ПК', 'Компьютерлерди техникалык колдоо'),
    ],
    'Слесарь по ремонту автомобилей': [
        ('Двигатели внутреннего сгорания', 'Ичинен күйүүчү кыймылдаткычтар'),
        ('Ходовая часть и трансмиссия', 'Жүрүүчү бөлүк жана трансмиссия'),
        ('Автоэлектрика и электронные системы', 'Автоэлектрика жана электрондук системалар'),
    ],
    'Парикмахер': [
        ('Женский мастер', 'Аялдардын чач устасы'),
        ('Мужской мастер (Барбер)', 'Эркектердин чач устасы (Барбер)'),
        ('Колористика и сложное окрашивание', 'Колористика жана боёо'),
    ],
}


def parse_docx_table(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    tbl = tree.findall('.//w:tbl', namespaces)[3]
    rows = tbl.findall('.//w:tr', namespaces)

    items = []
    current_section = ''
    current_num = ''
    current_prof_name = ''

    for r in rows:
        cells = [' '.join([t.text for t in c.findall('.//w:t', namespaces) if t.text]).strip() for c in r.findall('.//w:tc', namespaces)]
        if not cells:
            continue
        text_full = ' '.join(cells)
        if len(cells) == 1 or text_full.startswith('Раздел') or text_full.startswith('Бөлүм') or 'Раздел' in cells[0] or 'бөлүм' in cells[0].lower():
            current_section = cells[0].strip()
            continue
        if 'Коды по ОКЗ' in text_full or 'ОКЗ' in text_full:
            continue

        if cells[0].isdigit():
            current_num = cells[0]
            current_prof_name = cells[2] if len(cells) > 2 else ''
        elif len(cells) > 3 and cells[1].isdigit():
            okz = cells[1].strip()
            qual_name = cells[3].strip()
            level_str = cells[4].strip() if len(cells) > 4 else ''
            
            # extract min and max levels
            q_min, q_max = 2, 4
            digits = re.findall(r'\d+', level_str)
            if len(digits) == 1:
                q_min = q_max = int(digits[0])
            elif len(digits) >= 2:
                q_min = int(digits[0])
                q_max = int(digits[1])

            items.append({
                'num': current_num,
                'section': current_section,
                'prof_name': current_prof_name or qual_name,
                'okz': okz,
                'qual_name': qual_name,
                'level_str': level_str,
                'qual_min': q_min,
                'qual_max': q_max,
            })
    return items


def main():
    ru_path = 'raw_documents/ПКМ 252 Перечень рус.docx'
    kg_path = 'raw_documents/Перечень профессий 252 кырг.docx'

    ru_items = parse_docx_table(ru_path)
    kg_items = parse_docx_table(kg_path)
    print(f'Parsed RU: {len(ru_items)}, KG: {len(kg_items)}')

    # Build KG map by (okz, num) or by index
    kg_map = {}
    for idx, item in enumerate(kg_items):
        key = (item['okz'], item['num'])
        if key not in kg_map:
            kg_map[key] = item
        kg_map[idx] = item

    created_count = 0
    updated_count = 0

    for idx, ru in enumerate(ru_items):
        key = (ru['okz'], ru['num'])
        kg = kg_map.get(key) or kg_map.get(idx, {})

        name_ru = ru['qual_name'] or ru['prof_name']
        name_ky = kg.get('qual_name') or kg.get('prof_name') or ''
        section_ru = ru['section']
        okz = ru['okz']
        code = f"{okz}-{ru['num']}"

        prof, created = Profession.objects.update_or_create(
            okz_code=okz,
            name_ru=name_ru,
            defaults={
                'name_ky': name_ky,
                'section': section_ru,
                'qual_level_min': ru['qual_min'],
                'qual_level_max': ru['qual_max'],
                'code': code,
                'is_active': True,
            }
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

        # Check specializations
        for base_name, specs in SPECIALIZATIONS_MAP.items():
            if base_name.lower() in name_ru.lower() or name_ru.lower() in base_name.lower():
                for order, (s_ru, s_ky) in enumerate(specs, start=1):
                    Specialization.objects.update_or_create(
                        profession=prof,
                        title_ru=s_ru,
                        defaults={
                            'title_ky': s_ky,
                            'order': order,
                            'is_active': True,
                        }
                    )

    print(f'Done! Created: {created_count}, Updated: {updated_count}')
    print(f'Total Professions in DB: {Profession.objects.count()}')
    print(f'Total Specializations in DB: {Specialization.objects.count()}')


if __name__ == '__main__':
    main()
