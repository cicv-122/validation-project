"""
Модуль нормализации кыргызских ФИО и устранения типовых ошибок реестра ЦНСВ.

Правила:
1. Порядок слов: [Имя] [Имя отца] [кызы/уулу]
   Если в источнике порядок инвертирован ([Отец] [кызы/уулу] [Имя]),
   например 'Марис кызы Зуура' -> автоматически преобразуется в 'Зуура Марис кызы'.
2. Разворачивание сокращений:
   - 'к', 'к.', 'кыз' -> 'кызы'
   - 'у', 'у.', 'ул', 'улу' -> 'уулу'
   Пример: 'Абимислам к Жумарита' -> 'Жумарита Абимислам кызы'.
   Пример: 'Туратбек у Өмүрбек' -> 'Өмүрбек Туратбек уулу'.
3. Репрезентация маркеров:
   - 'кызы' и 'уулу' всегда пишутся со строчной (маленькой) буквы согласно кыргызской орфографии.
   - Имена и фамилии пишутся с заглавной буквы с сохранением специфических букв (Ң, Ө, Ү).
"""

import re

KYZY_MARKERS = {'кызы', 'к', 'к.', 'кыз'}
UULU_MARKERS = {'уулу', 'у', 'у.', 'ул', 'улу'}
ALL_MARKERS = KYZY_MARKERS | UULU_MARKERS


def _capitalize_name(word: str) -> str:
    """Капитализирует слово с учетом киргизских букв (ө, ү, ң) и дефисов."""
    if not word:
        return ''
    # Обработка двойных имен через дефис (например, Мухаммад-Али)
    if '-' in word:
        return '-'.join(_capitalize_name(part) for part in word.split('-'))
    return word[:1].upper() + word[1:].lower()


def normalize_kyrgyz_full_name(full_name: str) -> str:
    """
    Принимает строку ФИО любой формы и возвращает стандартизированную строку:
    [Имя] [Отец] [кызы/уулу] или [Фамилия] [Имя] [Отчество].
    """
    if not full_name:
        return ''

    # Очистка от лишних пробелов и точек вокруг слов
    raw_words = full_name.strip().split()
    if not raw_words:
        return ''

    if len(raw_words) == 1:
        return _capitalize_name(raw_words[0])

    cleaned_lower = [w.lower().rstrip('.') for w in raw_words]

    # Вариант 1: Ровно 3 слова, маркер стоит вторым словом:
    # [Отец] [маркер: к/кызы/у/уулу] [Имя] -> e.g. 'Марис кызы Зуура', 'Абимислам к Жумарита'
    if len(raw_words) == 3 and cleaned_lower[1] in [m.rstrip('.') for m in ALL_MARKERS]:
        father = _capitalize_name(raw_words[0])
        marker_word = cleaned_lower[1]
        name = _capitalize_name(raw_words[2])
        marker = 'кызы' if marker_word in [m.rstrip('.') for m in KYZY_MARKERS] else 'уулу'
        return f"{name} {father} {marker}"

    # Вариант 2: 4 слова, маркер стоит вторым словом:
    # [Отец] [маркер] [Имя1] [Имя2]
    if len(raw_words) == 4 and cleaned_lower[1] in [m.rstrip('.') for m in ALL_MARKERS]:
        father = _capitalize_name(raw_words[0])
        marker_word = cleaned_lower[1]
        name = f"{_capitalize_name(raw_words[2])} {_capitalize_name(raw_words[3])}"
        marker = 'кызы' if marker_word in [m.rstrip('.') for m in KYZY_MARKERS] else 'уулу'
        return f"{name} {father} {marker}"

    # Вариант 3: Маркер стоит последним словом:
    # [Имя] [Отец] [маркер: кызы/уулу/к/у]
    # e.g. 'Зуура Марис кызы', 'Жумарита Абимислам к', 'Муминжонова Нозима Ганижон кызы'
    if cleaned_lower[-1] in [m.rstrip('.') for m in ALL_MARKERS]:
        marker_word = cleaned_lower[-1]
        marker = 'кызы' if marker_word in [m.rstrip('.') for m in KYZY_MARKERS] else 'уулу'
        names = [_capitalize_name(w) for w in raw_words[:-1]]
        return f"{' '.join(names)} {marker}"

    # Вариант 4: Обычное славянское/интернациональное имя (Иванов Иван Иванович)
    return ' '.join(_capitalize_name(w) for w in raw_words)


def split_kyrgyz_fio(full_name: str) -> tuple:
    """
    Нормализует ФИО и разбивает его на (last_name, first_name, sur_name)
    для сохранения в модели CertifiedUser так, чтобы get_full_name()
    всегда возвращал идеальный нормализованный вид.
    """
    normalized = normalize_kyrgyz_full_name(full_name)
    words = normalized.split()

    if not words:
        return '', '', ''
    if len(words) == 1:
        return words[0], '', ''
    if len(words) == 2:
        return words[0], words[1], ''
    if len(words) == 3:
        # e.g. "Зуура Марис кызы" -> last_name="Зуура", first_name="Марис", sur_name="кызы"
        # e.g. "Иванов Иван Иванович" -> last_name="Иванов", first_name="Иван", sur_name="Иванович"
        return words[0], words[1], words[2]

    # Для 4 и более слов (e.g. "Муминжонова Нозима Ганижон кызы"):
    return words[0], words[1], ' '.join(words[2:])
