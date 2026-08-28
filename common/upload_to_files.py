import uuid

from common.utils import get_english_translit as get_slug


def slider_main_img(instance, filename):
    list_file = filename.split('.')
    return f'sliders/{uuid.uuid4().hex}.{list_file[-1]}'


def news_main_img(instance, filename):
    list_file = filename.split('.')
    title = instance.slug[0:35]
    return f'news/{title}/{title}.{list_file[-1]}'


def news_news_img(instance, filename):
    list_file = filename.split('.')
    return f'news/{instance.news.slug[0:35]}/{instance.news.slug[0:35]}.{list_file[-1]}'


def document_files(instance, filename):
    list_file = filename.split('.')
    title = get_slug(instance.title)
    return f'documents/{instance._meta.model_name}/{title}.{list_file[-1]}'

def certified_user_img(instance, filename):
    list_file = filename.split('.')
    title = get_slug(instance.get_full_name())
    return f'documents/{instance._meta.model_name}/{title}.{list_file[-1]}'

def image_gallery(instance, filename):
    list_file = filename.split('.')
    return f'galleries/images/{uuid.uuid4().hex}.{list_file[-1]}'

def management_member_img(instance, filename):
    list_file = filename.split('.')
    return f'management/{uuid.uuid4().hex}.{list_file[-1]}'

def development_partner_img(instance, filename):
    list_file = filename.split('.')
    return f'partners/{uuid.uuid4().hex}.{list_file[-1]}'
