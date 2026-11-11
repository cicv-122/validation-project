# apps/document/kyrgyz_pin_validator.py
import datetime
import re
from typing import Optional, Tuple


def detect_gender_from_fio(full_name: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Определяет ожидаемый пол ('1' - женский, '2' - мужской) по ФИО.
    Возвращает кортеж (expected_digit, marker_description) или (None, None),
    если однозначно определить пол по ФИО нельзя.
    """
    if not full_name or not full_name.strip():
        return None, None

    words = [
        w.lower()
        for w in re.findall(r'[а-яёңүөА-ЯЁҢҮӨa-zA-Z]+', full_name.strip())
        if len(w) >= 2
    ]
    if not words:
        return None, None

    # 1. Однозначные маркеры: кызы / уулу
    if 'кызы' in words or 'кыз' in words:
        return '1', 'женский пол'
    if 'уулу' in words or 'уул' in words:
        return '2', 'мужской пол'

    # 2. Отчества на -овна/-евна/-ична vs -ович/-евич
    for w in words:
        if len(w) > 5:
            if w.endswith(('овна', 'евна', 'ична', 'инична')):
                return '1', 'женский пол'
            if w.endswith(('ович', 'евич')):
                return '2', 'мужской пол'

    # 3. Классические окончания фамилии (-ова/-ева/-ская vs -ов/-ев/-ский)
    if len(words) >= 2:
        for candidate_word in (words[0], words[-1]):
            if len(candidate_word) > 4:
                if candidate_word.endswith(('ова', 'ева', 'ская')):
                    return '1', 'женский пол'
                if candidate_word.endswith(('ов', 'ев', 'ский')):
                    return '2', 'мужской пол'

    return None, None


def validate_kyrgyz_pin(
    inn: str,
    full_name: str = '',
    is_foreign: bool = False,
    citizenship: str = '',
) -> Tuple[bool, str, Optional[dict]]:
    """
    Проверяет ПИН / ИНН в зависимости от выбранного гражданства (citizenship):
      - 'KG' (Кыргызская Республика): 14 цифр (1/2 пол + ДДММГГГГ + сверка пола с ФИО)
      - 'KZ' (Казахстан, ИИН): 12 цифр (ГГММДД + 7-я цифра 3/4/5/6 пол/век + сверка пола)
      - 'UZ' (Узбекистан, ПИНФЛ): 14 цифр (1-я цифра 3/4/5/6 пол/век + ДДММГГ + сверка пола)
      - 'RU' (Россия, ИНН): 12 цифр
      - 'OTHER' (Другое государство): 8..14 цифр
    Возвращает: (is_valid, clean_inn_or_error_message, parsed_info_dict)
    """
    if inn is None:
        return True, '', None

    raw = str(inn).strip()
    if not raw:
        return True, '', None

    clean = ''.join(filter(str.isdigit, raw))
    country = (citizenship or '').strip().upper()
    if not country:
        country = 'OTHER' if is_foreign else 'KG'

    ERROR_MSG = 'Неправильный ПИН / ИНН'

    if len(set(clean)) == 1 or clean in ('12345678901234', '21234567890123', '123456789012'):
        return False, ERROR_MSG, None

    expected_gender, _ = detect_gender_from_fio(full_name) if full_name else (None, None)

    # 1. Другое государство (8–14 цифр)
    if country == 'OTHER':
        if len(clean) < 8 or len(clean) > 14:
            return False, ERROR_MSG, None
        return True, clean, {'citizenship': 'OTHER', 'is_foreign': True}

    # 2. Российская Федерация (ИНН физлица — 12 цифр)
    if country == 'RU':
        if len(clean) != 12 or clean.startswith('00'):
            return False, ERROR_MSG, None
        return True, clean, {'citizenship': 'RU', 'is_foreign': True}

    # 3. Республика Казахстан (ИИН — 12 цифр: ГГММДД + пол/век 3,4,5,6 + 5 цифр)
    if country == 'KZ':
        if len(clean) != 12:
            return False, ERROR_MSG, None
        yy = int(clean[0:2])
        mm = int(clean[2:4])
        dd = int(clean[4:6])
        century_gender = clean[6]
        if century_gender not in ('3', '4', '5', '6'):
            return False, ERROR_MSG, None
        year = (1900 + yy) if century_gender in ('3', '4') else (2000 + yy)
        try:
            datetime.date(year, mm, dd)
        except ValueError:
            return False, ERROR_MSG, None
        current_year = datetime.date.today().year
        if year < 1935 or year > current_year - 14:
            return False, ERROR_MSG, None
        pin_gender = '2' if century_gender in ('3', '5') else '1'
        if expected_gender and expected_gender != pin_gender:
            return False, ERROR_MSG, None
        return True, clean, {'citizenship': 'KZ', 'is_foreign': True, 'birth_year': year}

    # 4. Республика Узбекистан (ПИНФЛ — 14 цифр: 1-я цифра 3,4,5,6 + ДДММГГ + 7 цифр)
    if country == 'UZ':
        if len(clean) != 14:
            return False, ERROR_MSG, None
        century_gender = clean[0]
        if century_gender not in ('3', '4', '5', '6'):
            return False, ERROR_MSG, None
        dd = int(clean[1:3])
        mm = int(clean[3:5])
        yy = int(clean[5:7])
        year = (1900 + yy) if century_gender in ('3', '4') else (2000 + yy)
        try:
            datetime.date(year, mm, dd)
        except ValueError:
            return False, ERROR_MSG, None
        current_year = datetime.date.today().year
        if year < 1935 or year > current_year - 14:
            return False, ERROR_MSG, None
        pin_gender = '2' if century_gender in ('3', '5') else '1'
        if expected_gender and expected_gender != pin_gender:
            return False, ERROR_MSG, None
        return True, clean, {'citizenship': 'UZ', 'is_foreign': True, 'birth_year': year}

    # 5. Кыргызская Республика (ПИН — 14 цифр: 1/2 + ДДММГГГГ + 5 цифр)
    if len(clean) != 14:
        return False, ERROR_MSG, None

    gender_digit = clean[0]
    if gender_digit not in ('1', '2'):
        return False, ERROR_MSG, None

    day = int(clean[1:3])
    month = int(clean[3:5])
    year = int(clean[5:9])
    serial_str = clean[9:14]

    try:
        birth_date = datetime.date(year, month, day)
    except ValueError:
        return False, ERROR_MSG, None

    current_year = datetime.date.today().year
    if year < 1935 or year > current_year - 14:
        return False, ERROR_MSG, None

    if serial_str == '00000':
        return False, ERROR_MSG, None

    if expected_gender and expected_gender != gender_digit:
        return False, ERROR_MSG, None

    today = datetime.date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    return (
        True,
        clean,
        {
            'citizenship': 'KG',
            'is_foreign': False,
            'gender': 'female' if gender_digit == '1' else 'male',
            'birth_year': year,
            'age': age,
        },
    )
