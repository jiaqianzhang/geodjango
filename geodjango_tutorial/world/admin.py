from django.contrib import admin

# register your models here.
from .models import UserProfile

admin.site.register(UserProfile, admin.ModelAdmin)