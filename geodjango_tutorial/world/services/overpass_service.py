# services/overpass_service.py
import requests
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class OverpassService:
    def __init__(self):
        self.endpoint = "https://overpass-api.de/api/interpreter"

    def get_nearby_cafes(self, lat: float, lon: float, radius: int = 1000) -> List[Dict]:
        """
        Query Overpass API for cafes within radius (in meters) of coordinates
        """
        # More specific query for cafes and restaurants
        query = """
        [out:json][timeout:25];
        (
          node["amenity"="cafe"](around:{radius},{lat},{lon});
          node["amenity"="restaurant"](around:{radius},{lat},{lon});
          node["shop"="coffee"](around:{radius},{lat},{lon});
        );
        out body;
        """.format(radius=radius, lat=lat, lon=lon)

        try:
            headers = {
                'User-Agent': 'CafeFinderApp/1.0',
                'Accept': 'application/json'
            }
            
            response = requests.post(
                self.endpoint,
                data=query,
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"Overpass API error: {response.status_code} - {response.text}")
                return []

            data = response.json()
            
            cafes = []
            for element in data.get('elements', []):
                tags = element.get('tags', {})
                if 'lat' in element and 'lon' in element:
                    cafe = {
                        'id': element['id'],
                        'name': tags.get('name', 'Unnamed Venue'),
                        'lat': element['lat'],
                        'lon': element['lon'],
                        'amenity_type': tags.get('amenity', 'cafe'),
                        'address': {
                            'street': tags.get('addr:street', ''),
                            'housenumber': tags.get('addr:housenumber', ''),
                            'city': tags.get('addr:city', ''),
                            'postcode': tags.get('addr:postcode', '')
                        },
                        'opening_hours': tags.get('opening_hours', ''),
                        'website': tags.get('website', ''),
                        'phone': tags.get('phone', ''),
                        'cuisine': tags.get('cuisine', ''),
                        'outdoor_seating': tags.get('outdoor_seating', 'no'),
                        'takeaway': tags.get('takeaway', 'no')
                    }
                    cafes.append(cafe)
            
            logger.info(f"Found {len(cafes)} venues near {lat}, {lon}")
            return cafes

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return []

    def test_connection(self) -> bool:
        """
        Test the connection to the Overpass API
        """
        try:
            test_query = """
            [out:json][timeout:25];
            node(1);
            out body;
            """
            
            response = requests.post(
                self.endpoint,
                data=test_query,
                headers={'User-Agent': 'CafeFinderApp/1.0'},
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
