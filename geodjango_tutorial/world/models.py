from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point # create/update a user's profile to include a location
from django.db import models
from django.contrib.gis.db import models

class WorldBorder(models.Model):
    # Regular Django fields corresponding to the attributes in the
    # world borders shapefile.
    name = models.CharField(max_length=50)
    area = models.IntegerField()
    pop2005 = models.IntegerField('Population 2005')
    fips = models.CharField('FIPS Code', max_length=2, null=True)
    iso2 = models.CharField('2 Digit ISO', max_length=2)
    iso3 = models.CharField('3 Digit ISO', max_length=3)
    un = models.IntegerField('United Nations Code')
    region = models.IntegerField('Region Code')
    subregion = models.IntegerField('Sub-Region Code')
    lon = models.FloatField()
    lat = models.FloatField()
 
    # GeoDjango-specific: a geometry field (MultiPolygonField)
    mpoly = models.MultiPolygonField()
 
    # Returns the string representation of the model.
    def __str__(self):
        return self.name
    
# storing a point location on a user's profile
# create profile table 
# make it a 1 to 1 relationship with the user model

# create a field location
# use get user model() for this
User = get_user_model()

# define the profile model by creating a 1 to 1 relationship with the user model
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.PointField(null=True, blank=True)
 
    def __str__(self):
        return self.user.username
    
    # function to set user location with user id, latitude and longitude
    def set_user_location(user_id, latitude, longitude):
        user = User.objects.get(id=user_id)
        location = Point(longitude, latitude)  # Point takes (longitude, latitude)
    
        # Create or update the user's profile
        profile, created = Profile.objects.get_or_create(user=user)
        profile.location = location
        profile.save()
    
        return profile
 
 
class Hotel(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    location = models.PointField(null=True) # Spatial Field Types
 
    def __str__(self) -> str:
        return self.name
    
class ElectoralDistricts(models.Model):
    osm_id = models.BigIntegerField()
    name_tag = models.CharField(max_length=255)
    name_ga = models.CharField(max_length=255, blank=True, null=True)
    name_en = models.CharField(max_length=255, blank=True, null=True)
    alt_name = models.CharField(max_length=255, blank=True, null=True)
    alt_name_g = models.CharField(max_length=255, blank=True, null=True)
    osm_user = models.CharField(max_length=255, blank=True, null=True)
    osm_timest = models.CharField(max_length=255, blank=True, null=True)  # Change to CharField
    attributio = models.CharField(max_length=255, blank=True, null=True)
    logainm_re = models.CharField(max_length=255, blank=True, null=True)
    co_name = models.CharField(max_length=255, blank=True, null=True)
    co_osm_id = models.FloatField(blank=True, null=True)  # Change to FloatField
    t_ie_url = models.URLField(max_length=255, blank=True, null=True)
    area = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    epoch_tstm = models.FloatField(blank=True, null=True)  # Change to FloatField
    geom = models.PointField(srid=4326)

    def __str__(self):
        return self.name_en or "Unknown"


class Counties(models.Model):
    osm_id = models.FloatField()  # Change from CharField to FloatField
    name_tag = models.CharField(max_length=255)
    name_ga = models.CharField(max_length=255, blank=True, null=True)
    name_en = models.CharField(max_length=255, blank=True, null=True)
    alt_name = models.CharField(max_length=255, blank=True, null=True)
    alt_name_g = models.CharField(max_length=255, blank=True, null=True)
    logainm_re = models.CharField(max_length=255, blank=True, null=True)
    osm_user = models.CharField(max_length=255, blank=True, null=True)
    osm_timest = models.CharField(max_length=255, blank=True, null=True)  # Keep as CharField for now
    attributio = models.CharField(max_length=255, blank=True, null=True)
    t_ie_url = models.URLField(max_length=255, blank=True, null=True)
    area = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    epoch_tstm = models.FloatField(blank=True, null=True)  # Keep as FloatField, matching the shapefile
    geom = models.MultiPolygonField(srid=4326)  # Changed to MultiPolygonField


    def __str__(self):
        return self.name_en if self.name_en else "Unknown"