# We create a class named CountyElectoralFilter that inherits from GeoFilterSet. 
# Since there is no inbuilt Django function to filter data by sub-county boundaries, 
# we create our own method get_electorals_by_county to do the query.
 
#Sample code
from rest_framework_gis.filterset import GeoFilterSet
from rest_framework_gis.filters import GeometryFilter
from django_filters import filters
from .models import ElectoralDistricts, Counties
 
 
class CountyElectoralFilter(GeoFilterSet):
    constituency = filters.CharFilter(method='get_electorals_by_county')
 
    class Meta:
        model = Counties
        exclude = ['geom']
 
    def get_electorals_by_county(self, queryset, name, value):
        query_ = ElectoralDistricts.objects.filter(pk=value)
        if query_:
            obj = query_.first()
            return queryset.filter(geom__within=obj.geom)
        return queryset