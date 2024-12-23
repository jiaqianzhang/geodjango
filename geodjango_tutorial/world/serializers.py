from .models import Hotel,ElectoralDistricts,Counties
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point

 
class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ("id", "name", "address", "location")
        extra_kwargs = {"location": {"read_only": True}}
 
class ElectoralDistrictsSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = ElectoralDistricts
        fields = '__all__'
        geo_field = 'geom'
 
 
class CountiesSerializer(GeoFeatureModelSerializer):
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Counties
        fields = '__all__'
        geo_field = 'geom'

    def get_distance(self, obj):
        # Retrieve the user's location from the request, if available
        x_coords = self.context.get('x_coords')
        y_coords = self.context.get('y_coords')

        if x_coords and y_coords:
            user_location = Point(float(x_coords), float(y_coords), srid=4326)
            # Calculate distance between the user's location and the county's geometry
            return obj.geom.distance(user_location)
        return None