from django.contrib.gis import admin
from .models import WorldBorder, Profile, Hotel
from leaflet.admin import LeafletGeoAdmin
 
admin.site.register(WorldBorder, admin.ModelAdmin)
admin.site.register(Profile, admin.ModelAdmin)
 
@admin.register(Hotel)
class HotelAdmin(LeafletGeoAdmin):
    list_display = ("id", "name", "address", "location", "created_at", "updated_at")