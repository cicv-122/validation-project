"""
Telegram notification and bot service for CNSV.
Sends direct notifications to staff members with interactive inline buttons.
"""
import logging
import os
import urllib.request
import urllib.parse
import json
from django.conf import settings

logger = logging.getLogger(__name__)

def get_bot_token():
    return os.environ.get('TELEGRAM_BOT_TOKEN') or getattr(settings, 'TELEGRAM_BOT_TOKEN', '')

def get_default_chat_id():
    return os.environ.get('TELEGRAM_CHAT_ID') or getattr(settings, 'TELEGRAM_CHAT_ID', '')

def set_bot_commands() -> bool:
    """
    Register official bot commands with Telegram Bot API so they appear in the [≡ Меню] button.
    """
    token = get_bot_token()
    if not token:
        return False

    url = f'https://api.telegram.org/bot{token}/setMyCommands'
    commands = [
        {'command': 'menu', 'description': '📱 Главное меню и кнопки'},
        {'command': 'new', 'description': '⚡ Свежие входящие заявки'},
        {'command': 'my', 'description': '📋 Мои дела в работе'},
        {'command': 'stats', 'description': '📊 Статистика и показатели'},
        {'command': 'find', 'description': '🔍 Поиск кандидата (/find Фамилия)'},
        {'command': 'cabinet', 'description': '📂 Рабочий кабинет на сайте'},
        {'command': 'help', 'description': 'ℹ️ Справка и подсказки'},
        {'command': 'clear', 'description': '🔄 Сброс и возврат в меню'},
    ]

    try:
        data = json.dumps({'commands': commands}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            return resp.status == 200
    except Exception as exc:
        logger.error('Failed to set Telegram bot commands: %s', exc)
        return False

def get_staff_keyboard():
    """
    Returns the standard persistent ReplyKeyboardMarkup for staff.
    """
    return {
        'keyboard': [
            [{'text': '⚡ Новые заявки'}, {'text': '📋 Мои дела'}],
            [{'text': '📊 Статистика'}, {'text': '📂 Кабинет'}],
            [{'text': '🔍 Поиск'}, {'text': 'ℹ️ Справка'}],
        ],
        'resize_keyboard': True,
        'is_persistent': True,
    }

def send_telegram_message(text: str, chat_id: str = None, reply_markup: dict = None) -> bool:
    """
    Send an HTML formatted message via Telegram Bot API with optional reply_markup.
    """
    token = get_bot_token()
    target_chat_id = chat_id or get_default_chat_id()

    if not token or not target_chat_id:
        logger.warning('Telegram send skipped: token or chat_id missing.')
        return False

    url = f'https://api.telegram.org/bot{token}/sendMessage'
    body = {
        'chat_id': str(target_chat_id),
        'text': text,
        'parse_mode': 'HTML',
        'disable_web_page_preview': True,
    }
    if reply_markup:
        body['reply_markup'] = reply_markup

    try:
        data = json.dumps(body).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            return resp.status == 200
    except Exception as exc:
        logger.error('Telegram send failed to %s: %s', target_chat_id, exc)
        return False

def answer_callback_query(callback_query_id: str, text: str = None, show_alert: bool = False) -> bool:
    """
    Answer an incoming inline button callback query.
    """
    token = get_bot_token()
    if not token:
        return False

    url = f'https://api.telegram.org/bot{token}/answerCallbackQuery'
    body = {
        'callback_query_id': callback_query_id,
        'show_alert': show_alert,
    }
    if text:
        body['text'] = text

    try:
        data = json.dumps(body).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception as exc:
        logger.error('Telegram answerCallbackQuery failed: %s', exc)
        return False

def edit_message_text(chat_id: str, message_id: int, text: str, reply_markup: dict = None) -> bool:
    """
    Edit existing message text and buttons in Telegram.
    """
    token = get_bot_token()
    if not token:
        return False

    url = f'https://api.telegram.org/bot{token}/editMessageText'
    body = {
        'chat_id': str(chat_id),
        'message_id': message_id,
        'text': text,
        'parse_mode': 'HTML',
        'disable_web_page_preview': True,
    }
    if reply_markup is not None:
        body['reply_markup'] = reply_markup

    try:
        data = json.dumps(body).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception as exc:
        logger.error('Telegram editMessageText failed: %s', exc)
        return False

def notify_staff_new_application(application, staff_profile) -> bool:
    """
    Send personal notification to a staff member about a new application.
    Includes interactive inline buttons:
    - [🔍 Взять в работу]
    - [💬 Написать в WhatsApp]
    - [📂 Открыть в кабинете]
    """
    if not staff_profile or not staff_profile.telegram_chat_id:
        return False

    app_id = application.id
    reg_num = getattr(application, 'short_registration_number', f'#{app_id}')
    full_name = application.full_name or 'Не указано'
    profession = application.profession or 'Не указана'
    level = f", разряд {application.qualification_level}" if application.qualification_level else ""
    proc_type = "Сертификация" if application.application_type == 'certification' else "Валидация"
    phone = application.phone or ''
    clean_phone = ''.join(c for c in (application.whatsapp or phone) if c.isdigit())

    text = (
        f"📥 <b>Новая заявка на {proc_type.lower()}!</b>\n"
        f"<b>Рег. номер:</b> <code>{reg_num}</code>\n\n"
        f"👤 <b>Кандидат:</b> {full_name}\n"
        f"⚙️ <b>Профессия:</b> {profession}{level}\n"
        f"📞 <b>Телефон:</b> {phone}\n"
        f"📍 <b>Адрес:</b> {application.address or 'Не указан'}\n\n"
        f"⚡ <i>Заявка автоматически направлена вам по закрепленной профессии.</i>"
    )

    inline_keyboard = [
        [
            {
                'text': '🔍 Взять в рассмотрение',
                'callback_data': f'take_app:{app_id}',
            }
        ]
    ]

    second_row = []
    if clean_phone:
        second_row.append({
            'text': '💬 WhatsApp',
            'url': f'https://wa.me/{clean_phone}',
        })

    dashboard_url = 'https://validation.kg/staff/dashboard'
    second_row.append({
        'text': '📂 Кабинет',
        'url': dashboard_url,
    })

    inline_keyboard.append(second_row)

    reply_markup = {'inline_keyboard': inline_keyboard}
    return send_telegram_message(text, chat_id=staff_profile.telegram_chat_id, reply_markup=reply_markup)

def notify_staff_pending_reminder(staff_profile, pending_applications) -> bool:
    """
    Send a reminder to staff about applications awaiting review for > 24 hours.
    """
    if not staff_profile or not staff_profile.telegram_chat_id or not pending_applications:
        return False

    count = len(pending_applications)
    text = (
        f"⏰ <b>Напоминание ЦНСВ: необработанные заявки ({count})</b>\n\n"
        f"Здравствуйте, {staff_profile.full_name}!\n"
        f"У вас есть заявки, ожидающие рассмотрения более 24 часов:\n\n"
    )

    for i, app in enumerate(pending_applications[:5], 1):
        text += f"{i}. <b>{app.full_name}</b> — {app.profession} (<code>{app.short_registration_number}</code>)\n"

    if count > 5:
        text += f"\n<i>...и еще {count - 5} заявок</i>\n"

    text += "\nПожалуйста, переведите их в работу в кабинете сотрудника."

    reply_markup = {
        'inline_keyboard': [
            [{'text': '👉 Открыть рабочий кабинет', 'url': 'https://validation.kg/staff/dashboard'}]
        ]
    }
    return send_telegram_message(text, chat_id=staff_profile.telegram_chat_id, reply_markup=reply_markup)

def notify_new_callback(callback_request) -> None:
    """Build and send a new CallbackRequest notification."""
    profession = callback_request.profession or 'не указана'
    utms = []
    if callback_request.utm_source:
        utms.append(f'source={callback_request.utm_source}')
    if callback_request.utm_medium:
        utms.append(f'medium={callback_request.utm_medium}')
    if callback_request.utm_campaign:
        utms.append(f'campaign={callback_request.utm_campaign}')
    utm_line = f'\n<b>UTM:</b> {", ".join(utms)}' if utms else ''

    text = (
        f'<b>Новая заявка на консультацию!</b>\n\n'
        f'<b>Имя:</b> {callback_request.name}\n'
        f'<b>Телефон:</b> {callback_request.phone}\n'
        f'<b>Профессия:</b> {profession}'
        f'{utm_line}\n\n'
        f'<b>Время:</b> {callback_request.created_at.strftime("%d.%m.%Y %H:%M")}\n'
        f'Зайдите в админку для обработки.'
    )
    send_telegram_message(text)
