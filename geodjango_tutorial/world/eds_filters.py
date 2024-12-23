from django_filters import rest_framework as filters
from .models import ElectoralDistricts, Counties
from django.contrib.gis.db.models.functions import Distance


class ElectoralDistrictsFilter(filters.FilterSet):
    county = filters.CharFilter(method='filter_by_county')

    class Meta:
        model = ElectoralDistricts
        fields = ['county']  # Allow filtering by county name or ID

    def filter_by_county(self, queryset, name, value):
        try:
            county = Counties.objects.get(id=value)
            return queryset.filter(geom__within=county.geom)
        except Counties.DoesNotExist:
            return queryset.none()
