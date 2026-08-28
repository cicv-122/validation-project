import re
from random import randint
from urllib.parse import quote

import transliterate

from django.db.models import Max
from django.utils.text import slugify


def get_english_translit(text: str, slug: bool = True):
    letters = {'ң': 'н', 'ү': 'y', 'ө': 'о'}
    for key, value in letters.items():
        text = text.replace(key, value)
    try:
        translit = transliterate.translit(text, reversed=True)
    except transliterate.exceptions.LanguageDetectionError:
        translit = text
    return slugify(translit) if slug else translit


def get_random_model(model):
    max_id = model.objects.all().aggregate(max_id=Max("id"))['max_id']
    while True:
        pk = randint(1, max_id)
        item = model.objects.filter(pk=pk).first()
        if item:
            return item


def format_phone_number(phone_number):
    numbers = re.findall(r'\d', phone_number)
    if len(numbers) != 12:
        return "Неправильный формат номера телефона"
    return '+{} ({}) {}-{}-{}'.format(
        ''.join(numbers[0:3]),
        ''.join(numbers[3:6]),
        ''.join(numbers[6:8]),
        ''.join(numbers[8:10]),
        ''.join(numbers[10:]),
    )


def get_generate_link_whatsapp(phone, message):
    url = 'https://api.whatsapp.com/send/'
    parameter_end = "&type=phone_number&app_absent=0"
    # URL-кодирование строки
    encoded_string = quote(message, safe='')
    return url + f"?phone={phone}&text={encoded_string}" + parameter_end