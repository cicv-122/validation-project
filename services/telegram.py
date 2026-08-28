"""
Telegram notification service.
Sends a message to a Telegram chat/group when a new CallbackRequest is created.

Required .env variables:
  TELEGRAM_BOT_TOKEN  — your bot token from @BotFather
  TELEGRAM_CHAT_ID    — chat/group ID where notifications will be sent
                        (e.g. "-1001234567890" for a group)
"""
import logging
import os
import urllib.request
import urllib.parse
import json

logger = logging.getLogger(__name__)

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
CHAT_ID   = os.environ.get('TELEGRAM_CHAT_ID', '')


def send_telegram_message(text: str) -> bool:
    """
    Send a plain text message via Telegram Bot API.
    Returns True on success, False on failure (never raises).
    """
    if not BOT_TOKEN or not CHAT_ID:
        logger.warning(
            'Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.'
        )
        return False

    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    payload = json.dumps({
        'chat_id':    CHAT_ID,
        'text':       text,
        'parse_mode': 'HTML',
    }).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception as exc:
        logger.error('Telegram send failed: %s', exc)
        return False


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
        f'Зайдите в <a href="https://validation.kg/admin/certification/callbackrequest/">админку</a> для обработки.'
    )
    send_telegram_message(text)
