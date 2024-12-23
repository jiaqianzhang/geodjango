from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from .models import WorldBorder, ElectoralDistricts, Counties

# using LayerMapping in python script
# each key in world_mapping corresponds to a field in WorldBorder model
# the value is the name of the shapefile field that data will be loaded from
# the path to the shapefile is not absolute so if you move the world application with data subdir to a different location the script will still work
world_mapping = {
    'fips' : 'FIPS',
    'iso2' : 'ISO2',
    'iso3' : 'ISO3',
    'un' : 'UN',
    'name' : 'NAME',
    'area' : 'AREA',
    'pop2005' : 'POP2005',
    'region' : 'REGION',
    'subregion' : 'SUBREGION',
    'lon' : 'LON',
    'lat' : 'LAT',
    'mpoly' : 'MULTIPOLYGON', # the key mpoly, the geometry type GeoDjango will import the field as, even simple polygons in the shapefile will automatically be converted in collections prior to the insertion into the db
}

# Auto-generated `LayerMapping` dictionary for eds model
ElectoralDistricts_mapping = {
    'osm_id': 'OSM_ID',
    'name_tag': 'NAME_TAG',
    'name_ga': 'NAME_GA',
    'name_en': 'NAME_EN',
    'alt_name': 'ALT_NAME',
    'alt_name_g': 'ALT_NAME_G',
    'osm_user': 'OSM_USER',
    'osm_timest': 'OSM_TIMEST',
    'attributio': 'ATTRIBUTIO',
    'logainm_re': 'LOGAINM_RE',
    'co_name': 'CO_NAME',
    'co_osm_id': 'CO_OSM_ID',
    't_ie_url': 'T_IE_URL',
    'area': 'AREA',
    'latitude': 'LATITUDE',
    'longitude': 'LONGITUDE',
    'epoch_tstm': 'EPOCH_TSTM',
    'geom': 'POINT',
}
 
# Auto-generated `LayerMapping` dictionary for counties model
counties_mapping = {
    'osm_id': 'OSM_ID',  # Correct the data type mapping
    'name_tag': 'NAME_TAG',
    'name_ga': 'NAME_GA',
    'name_en': 'NAME_EN',
    'alt_name': 'ALT_NAME',
    'alt_name_g': 'ALT_NAME_G',
    'logainm_re': 'LOGAINM_RE',
    'osm_user': 'OSM_USER',
    'osm_timest': 'OSM_TIMEST',  # Ensure it is mapped as a string, as it is in the shapefile
    'attributio': 'ATTRIBUTIO',
    't_ie_url': 'T_IE_URL',
    'area': 'AREA',
    'latitude': 'LATITUDE',
    'longitude': 'LONGITUDE',
    'epoch_tstm': 'EPOCH_TSTM',
    'geom': 'MULTIPOLYGON',  # Match the geometry type in the shapefile
}



world_shp = Path(__file__).resolve().parent / 'data' /'TM_WORLD_BORDERS-0.3.shp'
eds_shp = Path(__file__).resolve().parent / 'data' / 'eds' / 'eds.shp'
counties_shp = Path(__file__).resolve().parent / 'data' / 'counties' / 'counties.shp'

# the transform keyword is set to false because the data in the shapefile doesn't need to be converted (WGS84)

def run(verbose=True):
    lm = LayerMapping(WorldBorder, world_shp, world_mapping, transform=False)
    lm = LayerMapping(ElectoralDistricts, eds_shp, ElectoralDistricts_mapping, transform=False)
    lm1 = LayerMapping(Counties, counties_shp, counties_mapping, transform=False)
    lm.save(strict=True, verbose=verbose)
    lm.save(strict=True, verbose=verbose)
    lm1.save(strict=True, verbose=verbose)