# services/google_places_service.py
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class GooglePlacesService:
    def __init__(self):
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api/place"

    def get_nearby_cafes(self, lat: float, lon: float, radius: int = 1000) -> list:
        """
        Search for cafes using Google Places API
        """
        try:
            endpoint = f"{self.base_url}/nearbysearch/json"
            
            params = {
                'location': f"{lat},{lon}",
                'radius': radius,
                'type': 'cafe',
                'keyword': 'coffee',
                'key': self.api_key
            }

            logger.info(f"Calling Google Places API with params: {params}")
            
            response = requests.get(
                endpoint,
                params=params,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Google Places API error: {response.status_code} - {response.text}")
                return []

            data = response.json()
            
            if data.get('status') != 'OK':
                logger.error(f"Google Places API returned status: {data.get('status')}")
                return []

            cafes = []
            for place in data.get('results', []):
                try:
                    location = place.get('geometry', {}).get('location', {})
                    cafe = {
                        'id': place.get('place_id'),
                        'name': place.get('name', 'Unnamed Venue'),
                        'lat': location.get('lat'),
                        'lon': location.get('lng'),
                        'address': {
                            'formatted': place.get('vicinity', ''),
                            'street': '',  # Would need additional API call for detailed address
                            'city': '',
                            'postcode': ''
                        },
                        'rating': place.get('rating', 0),
                        'user_ratings_total': place.get('user_ratings_total', 0),
                        'open_now': place.get('opening_hours', {}).get('open_now'),
                        'photos': self._get_photo_urls(place.get('photos', []), self.api_key),
                        'price_level': place.get('price_level', 0)
                    }
                    
                    # Get additional details for each place
                    details = self._get_place_details(place.get('place_id'))
                    if details:
                        cafe.update({
                            'phone': details.get('formatted_phone_number', ''),
                            'website': details.get('website', ''),
                            'hours': details.get('opening_hours', {}).get('weekday_text', [])
                        })
                    
                    cafes.append(cafe)
                        
                except KeyError as e:
                    logger.error(f"Error processing place data: {e}")
                    logger.error(f"Problematic place data: {place}")
                    continue

            logger.info(f"Successfully found {len(cafes)} cafes")
            return cafes

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return []

    def _get_place_details(self, place_id: str) -> dict:
        """
        Get additional place details using Place Details API
        """
        try:
            endpoint = f"{self.base_url}/details/json"
            params = {
                'place_id': place_id,
                'fields': 'formatted_phone_number,website,opening_hours',
                'key': self.api_key
            }

            response = requests.get(endpoint, params=params, timeout=10)
            data = response.json()

            if data.get('status') == 'OK':
                return data.get('result', {})
            return {}

        except Exception as e:
            logger.error(f"Error getting place details: {e}")
            return {}

    def _get_photo_urls(self, photos: list, api_key: str) -> list:
        """
        Convert photo references to URLs
        """
        urls = []
        for photo in photos[:3]:  # Limit to 3 photos
            if photo.get('photo_reference'):
                url = (f"{self.base_url}/photo"
                      f"?maxwidth=400"
                      f"&photo_reference={photo['photo_reference']}"
                      f"&key={api_key}")
                urls.append(url)
        return urls
