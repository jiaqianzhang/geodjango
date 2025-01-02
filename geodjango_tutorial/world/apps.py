from django.apps import AppConfig

class WorldConfig(AppConfig):
    # specify the default auto field type for primary keys in models
    default_auto_field = 'django.db.models.BigAutoField'
    # specify the name of the django application
    name = 'world'
