"""
Management command to run the Telegram notification bot for CNSV staff.
Runs long-polling on Telegram Bot API with comprehensive commands and interactive controls.
"""
import time
import json
import logging
import urllib.request
import urllib.parse
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from apps.certification.models import StaffProfile, CertificationApplication
from apps.document.models import CertifiedUser
from services.telegram import (
    get_bot_token,
    answer_callback_query,
    edit_message_text,
    send_telegram_message,
    set_bot_commands,
    get_staff_keyboard,
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Runs Telegram bot for CNSV staff notifications and actions'

    def handle(self, *args, **options):
        token = get_bot_token()
        if not token:
            self.stderr.write(self.style.ERROR('TELEGRAM_BOT_TOKEN is not configured in .env or settings.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Starting CNSV Telegram Bot polling with token: {token[:12]}...'))

        # Register official menu commands in Telegram
        set_bot_commands()

        offset = 0
        while True:
            try:
                url = f'https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=25'
                req = urllib.request.Request(url, headers={'User-Agent': 'CNSV-Bot/1.0'})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode('utf-8'))

                if not data.get('ok'):
                    time.sleep(2)
                    continue

                updates = data.get('result', [])
                for update in updates:
                    offset = max(offset, update['update_id'] + 1)
                    self.process_update(update)

            except Exception as e:
                time.sleep(2)

    def process_update(self, update: dict):
        if 'message' in update:
            self.handle_message(update['message'])
        elif 'callback_query' in update:
            self.handle_callback_query(update['callback_query'])

    def handle_message(self, message: dict):
        chat_id = str(message.get('chat', {}).get('id', ''))
        username = message.get('from', {}).get('username', '')
        text = (message.get('text') or '').strip()

        if not text:
            return

        lower_text = text.lower()

        # -------------------------------------------------------------
        # 1. /start [auth_code]
        # -------------------------------------------------------------
        if text.startswith('/start'):
            parts = text.split(maxsplit=1)
            auth_arg = parts[1].strip() if len(parts) > 1 else ''

            if auth_arg.startswith('auth_'):
                code = auth_arg.replace('auth_', '').strip()
                staff = StaffProfile.objects.filter(telegram_auth_code=code, is_active=True).first()
                if staff:
                    StaffProfile.objects.filter(telegram_chat_id=chat_id).exclude(id=staff.id).update(
                        telegram_chat_id=None,
                        telegram_username=None,
                    )
                    staff.telegram_chat_id = chat_id
                    if username:
                        staff.telegram_username = username
                    staff.save(update_fields=['telegram_chat_id', 'telegram_username'])

                    professions_count = staff.assigned_professions.count()
                    welcome_text = (
                        f"✅ <b>Здравствуйте, {staff.full_name}!</b>\n\n"
                        f"Ваш Telegram успешно привязан к рабочему кабинету ЦНСВ.\n\n"
                        f"💼 <b>Роль:</b> {staff.get_role_display()}\n"
                        f"📋 <b>Закреплённых профессий:</b> {professions_count}\n\n"
                        f"Используйте кнопки быстрого доступа внизу экрана или меню команд <b>[ ≡ Меню ]</b>."
                    )
                    send_telegram_message(welcome_text, chat_id=chat_id, reply_markup=get_staff_keyboard())
                    return
                else:
                    send_telegram_message(
                        "⚠️ <b>Код привязки не найден или устарел.</b>\n"
                        "Пожалуйста, откройте рабочий кабинет сотрудника на сайте и нажмите «Подключить Telegram», чтобы получить актуальную ссылку.",
                        chat_id=chat_id
                    )
                    return

            # Regular /start check
            existing_staff = StaffProfile.objects.filter(telegram_chat_id=chat_id, is_active=True).first()
            if existing_staff:
                welcome_text = (
                    f"👋 Здравствуйте, <b>{existing_staff.full_name}</b>!\n\n"
                    f"Рабочий бот ЦНСВ активен. Готов к обработке заявок и отправке уведомлений.\n\n"
                    f"Выберите действие с помощью кнопок внизу или команды <b>[ ≡ Меню ]</b>:"
                )
                send_telegram_message(welcome_text, chat_id=chat_id, reply_markup=get_staff_keyboard())
            else:
                send_telegram_message(
                    "👋 <b>Добро пожаловать в служебный бот ЦНСВ!</b>\n\n"
                    "Этот бот предназначен для сотрудников Центра независимой сертификации и валидации.\n"
                    "Для подключения уведомлений войдите в свой кабинет сотрудника на сайте и нажмите кнопку «Подключить Telegram».",
                    chat_id=chat_id
                )
            return

        # Check authorization for all operational commands
        staff = StaffProfile.objects.filter(telegram_chat_id=chat_id, is_active=True).first()
        if not staff:
            send_telegram_message(
                "🔒 <b>Доступ ограничен.</b>\n"
                "Ваш Telegram ещё не привязан к кабинету сотрудника.\n"
                "Войдите на сайте в кабинет сотрудника и нажмите «Подключить Telegram».",
                chat_id=chat_id
            )
            return

        # -------------------------------------------------------------
        # 2. /menu or Главное меню
        # -------------------------------------------------------------
        if lower_text in ['/menu', '📱 главное меню', 'главное меню', 'меню', 'menu']:
            menu_text = (
                f"📱 <b>Главное меню сотрудника ЦНСВ</b>\n"
                f"Сотрудник: <b>{staff.full_name}</b>\n\n"
                f"⚡ <b>/new</b> — Свежие нерассмотренные заявки\n"
                f"📋 <b>/my</b> — Ваши текущие дела в работе\n"
                f"📊 <b>/stats</b> — Статистика и показатели\n"
                f"🔍 <b>/find &lt;запрос&gt;</b> — Поиск кандидата по фамилии/номеру\n"
                f"📂 <b>/cabinet</b> — Перейти в веб-кабинет\n"
                f"ℹ️ <b>/help</b> — Инструкция и справка\n"
                f"🔄 <b>/clear</b> — Сбросить диалог и обновить кнопки"
            )
            send_telegram_message(menu_text, chat_id=chat_id, reply_markup=get_staff_keyboard())
            return

        # -------------------------------------------------------------
        # 3. /new or ⚡ Новые заявки
        # -------------------------------------------------------------
        if lower_text in ['/new', '/pending', '⚡ новые заявки', 'новые заявки', 'новые', 'new']:
            self.send_new_applications(staff, chat_id)
            return

        # -------------------------------------------------------------
        # 4. /my or 📋 Мои дела
        # -------------------------------------------------------------
        if lower_text in ['/my', '📋 мои дела', 'мои дела', 'дела', 'my']:
            self.send_my_applications(staff, chat_id)
            return

        # -------------------------------------------------------------
        # 5. /stats or 📊 Статистика
        # -------------------------------------------------------------
        if lower_text in ['/stats', '/status', '📊 статистика', 'статистика', 'статус', 'stats', 'status']:
            self.send_statistics(staff, chat_id)
            return

        # -------------------------------------------------------------
        # 6. /cabinet or 📂 Кабинет
        # -------------------------------------------------------------
        if lower_text in ['/cabinet', '/app', '📂 кабинет', 'кабинет', 'cabinet', 'app']:
            msg = (
                f"📂 <b>Рабочий кабинет сотрудника ЦНСВ</b>\n\n"
                f"Здесь вы можете оформлять протоколы, проверять документы и выпускать сертификаты:"
            )
            reply_markup = {
                'inline_keyboard': [
                    [{'text': '🌐 Открыть кабинет на validation.kg', 'url': 'https://validation.kg/staff/dashboard'}]
                ]
            }
            send_telegram_message(msg, chat_id=chat_id, reply_markup=reply_markup)
            return

        # -------------------------------------------------------------
        # 7. /find [query] or 🔍 Поиск
        # -------------------------------------------------------------
        if lower_text in ['/find', '🔍 поиск', 'поиск', 'find']:
            send_telegram_message(
                "🔍 <b>Поиск дела кандидата</b>\n\n"
                "Отправьте фамилию кандидата, номер телефона или номер дела, например:\n"
                "<code>/find Абдыкалыков</code>\n"
                "или просто напишите фамилию прямо в чат.",
                chat_id=chat_id,
                reply_markup=get_staff_keyboard()
            )
            return

        if text.startswith('/find '):
            query = text[6:].strip()
            self.search_candidate(query, chat_id)
            return

        # -------------------------------------------------------------
        # 8. /help or ℹ️ Справка
        # -------------------------------------------------------------
        if lower_text in ['/help', 'ℹ️ справка', 'справка', 'помощь', 'help', '?']:
            help_text = (
                f"ℹ️ <b>Справка по рабочему боту ЦНСВ:</b>\n\n"
                f"• <b>Мгновенные уведомления:</b> как только кандидат подает заявку на сайте, "
                f"вам сразу приходит карточка с кнопками прямого действия.\n\n"
                f"• <b>Кнопка «Взять в рассмотрение»:</b> закрепляет заявку за вами и фиксирует время ответа.\n\n"
                f"• <b>Кнопка «WhatsApp»:</b> открывает диалог с кандидатом в один клик без сохранения номера в контакты.\n\n"
                f"• <b>Быстрый поиск:</b> просто напишите фамилию или телефон кандидата в чат — бот найдет его дело.\n\n"
                f"• <b>Команды:</b>\n"
                f"/new — Свежие нерассмотренные заявки\n"
                f"/my — Ваши дела на рассмотрении\n"
                f"/stats — Общая статистика\n"
                f"/cabinet — Ссылка на веб-панель\n"
                f"/clear — Обновить экран и кнопки"
            )
            send_telegram_message(help_text, chat_id=chat_id, reply_markup=get_staff_keyboard())
            return

        # -------------------------------------------------------------
        # 9. /clear or 🔄 Сброс
        # -------------------------------------------------------------
        if lower_text in ['/clear', '/reset', '🔄 сброс', 'сброс', 'clear', 'reset']:
            send_telegram_message(
                "🔄 <b>Диалог обновлен.</b> Кнопки быстрого управления на экране готовы к работе.",
                chat_id=chat_id,
                reply_markup=get_staff_keyboard()
            )
            return

        # -------------------------------------------------------------
        # 10. Fallback: Умный поиск по произвольному тексту
        # -------------------------------------------------------------
        # Если сотрудник просто написал фамилию, телефон или рег. номер без команды
        if len(text) >= 2:
            self.search_candidate(text, chat_id)
        else:
            send_telegram_message(
                "Неизвестная команда. Нажмите /menu или воспользуйтесь кнопками внизу экрана.",
                chat_id=chat_id,
                reply_markup=get_staff_keyboard()
            )

    # -----------------------------------------------------------------
    # Helper Actions
    # -----------------------------------------------------------------
    def send_new_applications(self, staff, chat_id: str):
        apps = CertificationApplication.objects.filter(
            status='submitted',
            deleted_at__isnull=True
        ).exclude(origin='registry_archive').order_by('-created_at')[:5]

        if not apps.exists():
            send_telegram_message(
                "🎉 <b>Новых нерассмотренных заявок нет!</b>\nВсе входящие заявки уже приняты в работу.",
                chat_id=chat_id,
                reply_markup=get_staff_keyboard()
            )
            return

        send_telegram_message(
            f"⚡ <b>Свежие входящие заявки (всего {apps.count()} из последних):</b>",
            chat_id=chat_id,
            reply_markup=get_staff_keyboard()
        )

        for app in apps:
            reg_num = getattr(app, 'short_registration_number', f'#{app.id}')
            proc_type = "Сертификация" if app.application_type == 'certification' else "Валидация"
            level = f", разряд {app.qualification_level}" if app.qualification_level else ""
            clean_phone = ''.join(c for c in (app.whatsapp or app.phone or '') if c.isdigit())

            created_str = app.created_at.strftime('%d.%m.%Y в %H:%M') if app.created_at else ''

            text = (
                f"📥 <b>{proc_type}</b> • <code>{reg_num}</code>\n"
                f"👤 <b>{app.full_name}</b>\n"
                f"⚙️ {app.profession}{level}\n"
                f"📞 <code>{app.phone}</code>\n"
                f"🕐 Подана: {created_str}"
            )

            inline_keyboard = [
                [{'text': '🔍 Взять в рассмотрение', 'callback_data': f'take_app:{app.id}'}]
            ]
            row2 = []
            if clean_phone:
                row2.append({'text': '💬 WhatsApp', 'url': f'https://wa.me/{clean_phone}'})
            row2.append({'text': '📂 Кабинет', 'url': 'https://validation.kg/staff/dashboard'})
            inline_keyboard.append(row2)

            send_telegram_message(text, chat_id=chat_id, reply_markup={'inline_keyboard': inline_keyboard})

    def send_my_applications(self, staff, chat_id: str):
        apps = CertificationApplication.objects.filter(
            assigned_staff=staff,
            deleted_at__isnull=True
        ).exclude(status__in=['completed', 'rejected', 'cancelled']).order_by('-reviewed_at', '-created_at')[:8]

        if not apps.exists():
            send_telegram_message(
                "📋 <b>У вас пока нет активных дел в работе.</b>\n"
                "Нажмите кнопку <b>⚡ Новые заявки</b>, чтобы взять дела на рассмотрение.",
                chat_id=chat_id,
                reply_markup=get_staff_keyboard()
            )
            return

        text = f"📋 <b>Ваши активные дела в работе ({apps.count()}):</b>\n\n"
        for i, app in enumerate(apps, 1):
            reg_num = getattr(app, 'short_registration_number', f'#{app.id}')
            status_name = app.get_status_display()
            clean_phone = ''.join(c for c in (app.whatsapp or app.phone or '') if c.isdigit())
            wa_link = f" • <a href='https://wa.me/{clean_phone}'>WhatsApp</a>" if clean_phone else ""

            text += (
                f"{i}. <b>{app.full_name}</b> (<code>{reg_num}</code>)\n"
                f"   • Профессия: {app.profession}\n"
                f"   • Статус: <i>{status_name}</i>\n"
                f"   • Тел: <code>{app.phone}</code>{wa_link}\n\n"
            )

        reply_markup = {
            'inline_keyboard': [
                [{'text': '📂 Открыть все дела в веб-кабинете', 'url': 'https://validation.kg/staff/dashboard'}]
            ]
        }
        send_telegram_message(text, chat_id=chat_id, reply_markup=reply_markup)

    def send_statistics(self, staff, chat_id: str):
        base_apps = CertificationApplication.objects.filter(deleted_at__isnull=True).exclude(origin='registry_archive')
        total_new = base_apps.filter(status='submitted').count()
        total_review = base_apps.filter(status='under_review').count()
        total_eval = base_apps.filter(
            status__in=['assessment_scheduled', 'assessment_in_progress'],
        ).count()
        total_completed = base_apps.filter(status='completed').count()

        registry_total = CertifiedUser.objects.count()
        registry_with_pin = CertifiedUser.objects.exclude(pin='').exclude(pin__isnull=True).count()

        my_active = base_apps.filter(
            assigned_staff=staff,
        ).exclude(status__in=['completed', 'rejected', 'cancelled']).count()

        stats_text = (
            f"📊 <b>Сводка ЦНСВ на сегодня:</b>\n\n"
            f"👤 Сотрудник: <b>{staff.full_name}</b>\n"
            f"💼 Закрепленных профессий: <b>{staff.assigned_professions.count()}</b>\n\n"
            f"📌 <b>Электронные заявки:</b>\n"
            f"• 📥 Входящие (новые): <b>{total_new}</b>\n"
            f"• 🔍 На рассмотрении: <b>{total_review}</b>\n"
            f"• 📝 На этапе оценки: <b>{total_eval}</b>\n"
            f"• 🎓 Завершены: <b>{total_completed}</b>\n\n"
            f"🏛 <b>Государственный реестр сертификатов:</b>\n"
            f"• Всего в реестре: <b>{registry_total}</b>\n"
            f"• Оцифровано с ПИН / ИНН: <b>{registry_with_pin} из {registry_total}</b>\n\n"
            f"💼 <b>Ваши персональные показатели:</b>\n"
            f"• Дел на личном сопровождении: <b>{my_active}</b>"
        )
        reply_markup = {
            'inline_keyboard': [
                [{'text': '📂 Открыть рабочий кабинет', 'url': 'https://validation.kg/staff/dashboard'}]
            ]
        }
        send_telegram_message(stats_text, chat_id=chat_id, reply_markup=reply_markup)

    def search_candidate(self, query: str, chat_id: str):
        clean_query = query.strip()
        digits = ''.join(c for c in clean_query if c.isdigit())

        q_filter = (
            Q(full_name__icontains=clean_query) |
            Q(profession__icontains=clean_query) |
            Q(inn__icontains=clean_query) |
            Q(registration_number__icontains=clean_query)
        )
        if digits and len(digits) >= 4:
            q_filter |= Q(phone__icontains=digits) | Q(whatsapp__icontains=digits)

        apps = CertificationApplication.objects.filter(
            q_filter,
            deleted_at__isnull=True
        ).exclude(origin='registry_archive').order_by('-created_at')[:3]

        cert_filter = (
            Q(full_name__icontains=clean_query) |
            Q(qualification__icontains=clean_query) |
            Q(pin__icontains=clean_query) |
            Q(certificate_number__icontains=clean_query)
        )
        certs = CertifiedUser.objects.filter(cert_filter).order_by('-id')[:4]

        total_found = apps.count() + certs.count()
        if total_found == 0:
            send_telegram_message(
                f"🔍 По запросу «<b>{clean_query}</b>» кандидатов не найдено.\n"
                f"Попробуйте ввести часть фамилии, ПИН/ИНН, номер сертификата или телефон.",
                chat_id=chat_id,
                reply_markup=get_staff_keyboard()
            )
            return

        send_telegram_message(
            f"🔍 <b>Результаты поиска по запросу «{clean_query}» (показано {total_found}):</b>",
            chat_id=chat_id,
            reply_markup=get_staff_keyboard()
        )

        for app in apps:
            reg_num = getattr(app, 'short_registration_number', f'#{app.id}')
            assigned = f"• Ведет: {app.assigned_staff.full_name}\n" if app.assigned_staff else "• Ответственный: <i>не назначен</i>\n"
            clean_phone = ''.join(c for c in (app.whatsapp or app.phone or '') if c.isdigit())

            text = (
                f"📥 <b>Заявка • {app.full_name}</b>\n"
                f"⚙️ Профессия: {app.profession}\n"
                f"📋 Рег. номер: <code>{reg_num}</code>\n"
                f"📌 Статус: <b>{app.get_status_display()}</b>\n"
                f"📞 Телефон: <code>{app.phone}</code>\n"
                f"{assigned}"
            )

            inline_buttons = []
            row = []
            if clean_phone:
                row.append({'text': '💬 WhatsApp', 'url': f'https://wa.me/{clean_phone}'})
            row.append({'text': '📂 Кабинет', 'url': 'https://validation.kg/staff/dashboard'})
            inline_buttons.append(row)

            if app.status == 'submitted':
                inline_buttons.insert(0, [{'text': '🔍 Взять в рассмотрение', 'callback_data': f'take_app:{app.id}'}])

            send_telegram_message(text, chat_id=chat_id, reply_markup={'inline_keyboard': inline_buttons})

        for cert in certs:
            pin_display = f"<code>{cert.pin}</code>" if cert.pin else "<i>не заполнен</i>"
            issue_str = cert.issue_date.strftime('%d.%m.%Y') if cert.issue_date else '—'
            text = (
                f"🎓 <b>Реестр • {cert.full_name}</b>\n"
                f"⚙️ Квалификация: {cert.qualification}\n"
                f"📜 Сертификат: <code>ЦС № {cert.certificate_number}</code> (от {issue_str})\n"
                f"🪪 ПИН / ИНН: {pin_display}"
            )
            inline_buttons = [
                [{'text': '📂 Открыть личное дело', 'url': f'https://validation.kg/staff/candidates/{cert.id}'}]
            ]
            send_telegram_message(text, chat_id=chat_id, reply_markup={'inline_keyboard': inline_buttons})

    def handle_callback_query(self, callback_query: dict):
        query_id = callback_query.get('id')
        data = callback_query.get('data', '')
        from_user = callback_query.get('from', {})
        chat_id = str(from_user.get('id', ''))
        message = callback_query.get('message', {})
        message_id = message.get('message_id')
        current_text = message.get('text', '')

        # Button: take_app:<id>
        if data.startswith('take_app:'):
            app_id = data.replace('take_app:', '').strip()
            staff = StaffProfile.objects.filter(telegram_chat_id=chat_id, is_active=True).first()

            if not staff:
                answer_callback_query(query_id, text="Ошибка: ваш Telegram не привязан к профилю сотрудника!", show_alert=True)
                return

            try:
                app = CertificationApplication.objects.get(id=int(app_id), deleted_at__isnull=True)
            except (CertificationApplication.DoesNotExist, ValueError):
                answer_callback_query(query_id, text="Заявка не найдена или была удалена.", show_alert=True)
                return

            if app.status != 'submitted':
                answer_callback_query(query_id, text=f"Заявка уже в статусе «{app.get_status_display()}».", show_alert=True)
                return

            # Update status to under_review
            app.status = 'under_review'
            app.reviewed_at = timezone.now()
            if not app.assigned_staff:
                app.assigned_staff = staff
            app.save(update_fields=['status', 'reviewed_at', 'assigned_staff'])

            answer_callback_query(query_id, text="✓ Заявка успешно взята в работу!")

            clean_phone = ''.join(c for c in (app.whatsapp or app.phone or '') if c.isdigit())
            updated_text = (
                f"{current_text}\n\n"
                f"✅ <b>Взято на рассмотрение:</b> {staff.full_name} в {timezone.now().strftime('%H:%M %d.%m.%Y')}"
            )

            new_buttons = [
                [
                    {'text': '✅ На рассмотрении', 'callback_data': 'already_taken'}
                ]
            ]
            row2 = []
            if clean_phone:
                row2.append({'text': '💬 WhatsApp', 'url': f'https://wa.me/{clean_phone}'})
            row2.append({'text': '📂 Открыть дело', 'url': 'https://validation.kg/staff/dashboard'})
            new_buttons.append(row2)

            edit_message_text(chat_id, message_id, updated_text, reply_markup={'inline_keyboard': new_buttons})

        elif data == 'already_taken':
            answer_callback_query(query_id, text="Заявка уже находится на рассмотрении.")
