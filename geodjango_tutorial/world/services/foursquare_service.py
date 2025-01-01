import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class FoursquareService:
    def __init__(self):
        self.api_key = settings.FOURSQUARE_API_KEY
        self.base_url = "https://api.foursquare.com/v3"
        self.headers = {
            "Accept": "application/json",
            "Authorization": self.api_key
        }

    def get_nearby_cafes(self, lat: float, lon: float, radius: int = 1000) -> list:
        """
        Search for cafes using Foursquare Places API
        """
        try:
            endpoint = f"{self.base_url}/places/search"
            
            params = {
                'll': f"{lat},{lon}",
                'radius': radius,
                'categories': '13032,13035,13065',  # Coffee Shop, Café, Coffee Roaster
                'limit': 50,
                'sort': 'DISTANCE',
                'fields': 'fsq_id,name,location,tel,website,hours,rating,distance'
            }

            logger.info(f"Calling Foursquare API with params: {params}")
            
            response = requests.get(
                endpoint,
                headers=self.headers,
                params=params,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Foursquare API error: {response.status_code} - {response.text}")
                return []

            data = response.json()

            # Log the full response for debugging purposes
            logger.info(f"Full Foursquare API response: {data}")
            
            cafes = []
            for venue in data.get('results', []):
                try:
                    location = venue.get('location', {})
                    lat = location.get('lat')
                    lon = location.get('lng')

                    # Log venues with missing coordinates for debugging
                    if lat is None or lon is None:
                        logger.warning(f"Skipping venue without coordinates: {venue.get('name')}")
                    else:
                        cafe = {
                            'id': venue.get('fsq_id'),
                            'name': venue.get('name', 'Unnamed Venue'),
                            'lat': lat,
                            'lon': lon,
                            'address': {
                                'formatted': location.get('formatted_address', 'N/A'),
                                'street': location.get('address', 'N/A'),
                                'city': location.get('locality', 'N/A'),
                                'postcode': location.get('postcode', 'N/A')
                            },
                            'distance': venue.get('distance'),
                            'rating': venue.get('rating', 'N/A'),
                            'website': venue.get('website', 'N/A'),
                            'phone': venue.get('tel', 'N/A'),
                            'hours': self._format_hours(venue.get('hours', {}))
                        }
                        cafes.append(cafe)

                except KeyError as e:
                    logger.error(f"Error processing venue data: {e}")
                    logger.error(f"Problematic venue data: {venue}")
                    continue

            logger.info(f"Successfully found {len(cafes)} cafes")
            return cafes

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return []

    def _format_hours(self, hours_data):
        if not hours_data:
            return 'N/A'
        return hours_data.get('display', 'N/A')
