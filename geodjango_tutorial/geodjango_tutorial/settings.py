"""
Django settings for geodjango_tutorial project.

Generated by 'django-admin startproject' using Django 5.1.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

# import os
# GDAL_LIBRARY_PATH = os.getenv('GDAL_LIBRARY_PATH', '/opt/anaconda3/envs/awm_env')
GDAL_LIBRARY_PATH = "/usr/lib/x86_64-linux-gnu/libgdal.so"

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-m+zooajhj*smjym)sw21(+!758@i67fna!d)4cu@!#7gv08rj3"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['18.206.144.181', 'localhost', 'jiaqianzhang.site']

# FOURSQUARE_API_KEY ="fsq3Oz3zEGlf7x3LtPkVzYWV6YqQRMBU9Cq4jHMua6+lCGc="

FOURSQUARE_API_KEY = "fsq3jlriRFaP9gim9jJqOpWWdOPjftnVeL1OIOi5ok6JyJU="

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / "static"]  # Adjust BASE_DIR as needed
STATIC_ROOT = BASE_DIR / "staticfiles"



# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.gis",
    "world",
    "rest_framework",
    "pwa",
    "leaflet",
    "corsheaders",
    "django_filters",
    "rest_framework_gis"
    # "crispy_forms",
    # "leaflet",
]

MIDDLEWARE = [
    # Other middleware...
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8001",  # Replace with the appropriate origin for your frontend
]

# Configure PWA settings
PWA_APP_NAME = 'WebMap'
PWA_APP_DESCRIPTION = "A Progressive Web Application for WebMap"
PWA_APP_THEME_COLOR = '#000000'
PWA_APP_BACKGROUND_COLOR = '#ffffff'
PWA_APP_DISPLAY = 'standalone'
PWA_APP_SCOPE = '/'
PWA_APP_START_URL = '/'
PWA_APP_ICONS = [
    {
        'src': '/static/images/icons/icon-72x72.png',
        'sizes': '72x72',
    },
    {
        'src': '/static/images/icons/icon-96x96.png',
        'sizes': '96x96',
    },
    {
        'src': '/static/images/icons/icon-128x128.png',
        'sizes': '128x128',
    },
    {
        'src': '/static/images/icons/icon-144x144.png',
        'sizes': '144x144',
    },
    {
        'src': '/static/images/icons/icon-152x152.png',
        'sizes': '152x152',
    },
    {
        'src': '/static/images/icons/icon-192x192.png',
        'sizes': '192x192',
    },
    {
        'src': '/static/images/icons/icon-384x384.png',
        'sizes': '384x384',
    },
    {
        'src': '/static/images/icons/icon-512x512.png',
        'sizes': '512x512',
    },
]
PWA_APP_ICONS_APPLE = [
    {
        'src': '/static/images/icons/icon-152x152.png',
        'sizes': '152x152',
    },
]
PWA_APP_SPLASH_SCREEN = [
    {
        'src': '/static/images/icons/splash-640x1136.png',
        'media': '(device-width: 320px) and (device-height: 568px)',
    },
    {
        'src': '/static/images/icons/splash-750x1334.png',
        'media': '(device-width: 375px) and (device-height: 667px)',
    },
    {
        'src': '/static/images/icons/splash-828x1792.png',
        'media': '(device-width: 414px) and (device-height: 896px)',
    },
    {
        'src': '/static/images/icons/splash-1125x2436.png',
        'media': '(device-width: 375px) and (device-height: 812px)',
    },
    {
        'src': '/static/images/icons/splash-1242x2208.png',
        'media': '(device-width: 414px) and (device-height: 736px)',
    },
    {
        'src': '/static/images/icons/splash-1242x2688.png',
        'media': '(device-width: 414px) and (device-height: 896px)',
    },
    {
        'src': '/static/images/icons/splash-1536x2048.png',
        'media': '(device-width: 768px) and (device-height: 1024px)',
    },
    {
        'src': '/static/images/icons/splash-1668x2224.png',
        'media': '(device-width: 834px) and (device-height: 1112px)',
    },
    {
        'src': '/static/images/icons/splash-1668x2388.png',
        'media': '(device-width: 834px) and (device-height: 1194px)',
    },
    {
        'src': '/static/images/icons/splash-2048x2732.png',
        'media': '(device-width: 1024px) and (device-height: 1366px)',
    },
]
PWA_APP_DIR = 'ltr'
PWA_APP_LANG = 'en-US'


CRISPY_TEMPLATE_PACK = 'bootstrap4'

CRISPY_FAIL_SILENTLY = not DEBUG

LEAFLET_CONFIG = {
    'DEFAULT_CENTER': (53.0, -8.0),
    'DEFAULT_ZOOM': 6,
    'MIN_ZOOM': 3,
    'MAX_ZOOM': 18,
    'RESET_VIEW': False,
    'SCALE': None,
    'OPACITY': 0.5,
    }

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "geodjango_tutorial.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "geodjango_tutorial.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'postgis',
        'USER': 'docker',
        'PASSWORD': 'docker',
        'HOST': 'postgis',  # This should match the service name in docker-compose
        'PORT': '5432',
    }
}



# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/


# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# SECURE_SSL_REDIRECT = True  # Redirect all HTTP to HTTPS
SECURE_HSTS_SECONDS = 3600  # Enable HTTP Strict Transport Security
SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Include subdomains in HSTS
SECURE_HSTS_PRELOAD = True  # Preload HSTS in browser

# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True

SECURE_SSL_REDIRECT = False  # Only enable this in production
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
