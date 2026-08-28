import os
import environs

from pathlib import Path

from common.utils import format_phone_number, get_generate_link_whatsapp
from config.loginng_formatters import CustomJsonFormatter

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environs.Env()
env.read_env('.env')

SECRET_KEY = os.environ.get('SECRET_KEY')

DEBUG = eval(os.environ.get('DEBUG'))

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS').split(' ')

SITE_ID = 1

CURRENT_SITE_URL = os.environ.get('CURRENT_SITE_URL')

_env_csrf = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
CSRF_TRUSTED_ORIGINS = list(set([
    'https://validation.kg',
    'https://www.validation.kg',
    'http://validation.kg',
    'http://www.validation.kg',
    'http://195.38.165.127',
    'https://195.38.165.127',
] + [o for o in _env_csrf.split(' ') if o]))

# Application definition

INSTALLED_APPS = [
    'modeltranslation',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.sitemaps',
    'django_cleanup',
    'cachalot',
    'imagekit',
    'ckeditor',
    'ckeditor_uploader',

    # My Apps
    'apps.core.apps.CoreConfig',
    'apps.news.apps.NewsConfig',
    'apps.document.apps.DocumentConfig',
    'apps.certification.apps.CertificationConfig',

    # API
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True # For development, allow React frontend on any port

if DEBUG:
    INSTALLED_APPS.append('debug_toolbar')
    MIDDLEWARE.append('debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ALLOWED_HOSTS

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'frontend' / 'dist',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'common.context_processors.getting_info',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": os.environ.get("DATABASE_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("DATABASE_NAME", os.path.join(BASE_DIR / 'db.sqlite3')),
        "USER": os.environ.get("DATABASE_USER", "user"),
        "PASSWORD": os.environ.get("DATABASE_PASSWORD", "password"),
        "HOST": os.environ.get("DATABASE_HOST", "postgres"),
        "PORT": os.environ.get("DATABASE_PORT", "5432"),
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

gettext = lambda s: s

LANGUAGES = (
    ('ru', gettext('Russia')),
    ('en', gettext('English')),
    ('ky', gettext('Kyrgyz')),
)

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
)

LANGUAGE_CODE = 'ru'

TIME_ZONE = 'Asia/Bishkek'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# for version static files
STYLE_CORE_VERSION = os.environ.get("STYLE_CORE_VERSION", "v1.0")
STYLE_RESPONSIVE_VERSION = os.environ.get("STYLE_RESPONSIVE_VERSION", "v1.0")

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_DIR = BASE_DIR / 'static'
STATICFILES_DIRS = [
    STATIC_DIR,
    BASE_DIR / 'frontend' / 'dist',
]

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_DIR = MEDIA_ROOT
MEDIA_DIRS = [MEDIA_DIR]

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Security settings for HTTPS proxy
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG

# Send Mail
EMAIL_USE_TLS = True
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = os.environ.get('EMAIL_PORT')
EMAIL_TITLE_FROM = "ICVC.KG"
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
SERVER_EMAIL = EMAIL_HOST_USER
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

CONTACTS = {
    "phone": {
        "link": os.environ.get("CONTACTS_PHONE", "+996000000000"),
        "value": format_phone_number(os.environ.get("CONTACTS_PHONE", "+996000000000"))
    },
    "whatsapp": {
        "link": get_generate_link_whatsapp(
            os.environ.get("CONTACTS_WHATSAPP", "+996000000000"),
            os.environ.get(
                "CONTACTS_WHATSAPP_TEXT",
                f"Здравствуйте!\n\nПишу из вашего сайта www.{os.environ.get('CONTACTS_SITE_OFFICIAL', 'icvc.kg')}\n")
        ),
        "value": format_phone_number(os.environ.get("CONTACTS_WHATSAPP", "+996000000000"))
    },
    "email": os.environ.get("CONTACTS_EMAIL", "icvccentre@gmail.com"),
    "sites": {
        "official": os.environ.get("CONTACTS_SITE_OFFICIAL", "icvc.kg"),
    },
    "socials": {
        "instagram": os.environ.get("CONTACTS_SOCIAL_INSTAGRAM", "https://www.instagram.com/"),
        "facebook": os.environ.get("CONTACTS_SOCIAL_FACEBOOK", "https://www.facebook.com/"),
        "youtube": os.environ.get("CONTACTS_SOCIAL_YOUTUBE", "https://www.youtube.com/"),
    }
}


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'formatters': {
        'verbose': {
            'format': '{levelname} - {asctime} - {module} - {filename} - {message}',
            'style': '{',
        },
        'json_formatter': {
            '()': CustomJsonFormatter
        },
    },

    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
        'file_handler_warning': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'formatter': 'json_formatter',
            'filename': 'config/logging/warnings.json',
        },
        'file_handler_error': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'formatter': 'json_formatter',
            'filename': 'config/logging/errors.json',
        },
    },

    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'django': {
            'handlers': ['file_handler_warning', 'file_handler_error'],
            'propagate': True,
        },
    }
}

CKEDITOR_UPLOAD_PATH = "uploads/"


CKEDITOR_CONFIGS = {
    'default': {
        'skin': 'moono',
        # 'skin': 'office2013',
        'toolbar_Basic': [
            ['Source', '-', 'Bold', 'Italic']
        ],
        'toolbar_YourCustomToolbarConfig': [
            {'name': 'document', 'items': ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates']},
            {'name': 'clipboard', 'items': ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
            {'name': 'editing', 'items': ['Find', 'Replace', '-', 'SelectAll']},
            {'name': 'forms',
             'items': ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
                       'HiddenField']},
            '/',
            {'name': 'basicstyles',
             'items': ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat']},
            {'name': 'paragraph',
             'items': ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-',
                       'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl',
                       'Language']},
            {'name': 'links', 'items': ['Link', 'Unlink', 'Anchor']},
            {'name': 'insert',
             'items': ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']},
            '/',
            {'name': 'styles', 'items': ['Styles', 'Format', 'Font', 'FontSize']},
            {'name': 'colors', 'items': ['TextColor', 'BGColor']},
            {'name': 'tools', 'items': ['Maximize', 'ShowBlocks']},
            {'name': 'about', 'items': ['About']},
            '/',  # put this to force next toolbar on new line
            {'name': 'yourcustomtools', 'items': [
                # put the name of your editor.ui.addButton here
                'Preview',
                'Maximize',
                'Youtube'
            ]},
        ],
        'toolbar': 'YourCustomToolbarConfig',  # put selected toolbar config here
        # 'toolbarGroups': [{ 'name': 'document', 'groups': [ 'mode', 'document', 'doctools' ] }],
        # 'height': 291,
        # 'width': '100%',
        # 'filebrowserWindowHeight': 725,
        # 'filebrowserWindowWidth': 940,
        # 'toolbarCanCollapse': True,
        # 'mathJaxLib': '//cdn.mathjax.org/mathjax/2.2-latest/MathJax.js?config=TeX-AMS_HTML',
        'tabSpaces': 4,
        'extraPlugins': ','.join([
            'uploadimage',  # the upload image feature
            # your extra plugins here
            'div',
            'autolink',
            'autoembed',
            'embedsemantic',
            'autogrow',
            # 'devtools',
            'widget',
            'lineutils',
            'clipboard',
            'dialog',
            'dialogui',
            'elementspath',
            'youtube'
        ]),
    }
}
