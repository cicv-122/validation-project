# Инструкции по запуску (Dev Mode)

Похоже, на вашем компьютере не установлены некоторые инструменты (Docker или Poetry). Вот как это исправить:

## Вариант А: Через Docker (Рекомендуется)
Это самый простой способ, так как он автоматически настроит базу данных и все зависимости.

1. **Скачайте и установите Docker Desktop для Mac:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. **Запустите Docker Desktop** и подождите, пока он загрузится (в строке меню вверху появится иконка кита).
3. **Откройте терминал** в папке проекта и выполните:
   ```bash
   docker compose up
   ```
   *(Примечание: в новых версиях пишется `docker compose` без дефиса)*

---

## Вариант Б: Без Docker (Сложнее)
Если вы не хотите устанавливать Docker, нужно настроить всё вручную:

1. **Установите зависимости:**
   ```bash
   python3 -m pip install django djangorestframework django-cors-headers django-modeltranslation django-ckeditor django-cleanup environs python-json-logger transliterate psycopg2-binary gunicorn django-cachalot django-imagekit django-debug-toolbar pillow
   ```
2. **Настройте базу данных:**
   Откройте файл `.env` и временно закомментируйте (поставьте `#` в начале) строку `DATABASE_ENGINE`, чтобы Django использовал простую базу данных SQLite в файле.
3. **Запустите сервер:**
   ```bash
   python3 manage.py runserver
   ```

---

## Как запустить Frontend (React)
Это нужно делать в отдельном окне терминала:
1. Перейдите в папку frontend: `cd frontend`
2. Запустите dev-сервер: `npm run dev`
3. Откройте в браузере: [http://localhost:5173](http://localhost:5173)

### Важные советы:
* **Не пишите `cd manage.py`**: `manage.py` — это файл для запуска команд, а не папка.
* Всегда используйте `python3` вместо `python`.
