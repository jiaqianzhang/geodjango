from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.urls import reverse
from django.core.cache import cache
from django.contrib.gis.geos import Point
import json

from .models import UserProfile, FavouriteCafe
from .forms import SignUpForm
from .services.google_places_service import GooglePlacesService

import logging
logger = logging.getLogger(__name__)

# handles the home page that shows the map, requires the user to be logged in
@login_required(login_url='/login/')
def index_view(request):
    return render(request, 'map.html')

# handles user login functionality
def login_view(request):
    # if user is already authenticated, redirect to the map
    if request.user.is_authenticated:
        return redirect('map')
    
    # process login form on post request
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get('next', 'map')
            return redirect(next_url)
    else:
        form = AuthenticationForm()
    
    # render login page with form
    return render(request, 'login.html', {'form': form})

# handles user signup functionality
def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(reverse('map'))
    else:
        form = SignUpForm()
    # render signup page with form
    return render(request, 'signup.html', {'form': form})

# handles user logout functionality
def logout_view(request):
    logout(request)
    return redirect('login')

# main map view, includes logic for loading cafes via ajax
@login_required(login_url='/login/')
def map_view(request):
    # get the user's profile and location
    profile = getattr(request.user, 'userprofile', None)
    
    # handle fetch request for cafes
    if request.headers.get('Accept') == 'application/json':
        try:
            lat = request.GET.get('latitude')
            lon = request.GET.get('longitude')
            radius = request.GET.get('radius', 1000)

            logger.debug(f"Received request with lat={lat}, lon={lon}")

            # check if latitude and longitude are provided
            if not all([lat, lon]):
                return JsonResponse({'error': 'Latitude and longitude are required'}, status=400)

            # use the google places service to fetch cafes
            service = GooglePlacesService()
            cafes = service.get_nearby_cafes(
                lat=float(lat),
                lon=float(lon),
                radius=int(radius)
            )
            
            return JsonResponse({
                'cafes': cafes,
                'source': 'google_places'
            })

        except Exception as e:
            logger.error(f"Error fetching cafes: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    
    # handle regular page load
    context = {
        'user_location': profile.location if profile else None
    }
    return render(request, 'map.html', context)

# handles the user's favourite cafes page and api endpoint
@login_required
def favourite_cafes(request):
    """View for displaying favourite cafes page and API endpoint for fetching favorites"""
    # fetch the user's favourite cafes
    favorites = FavouriteCafe.objects.filter(user=request.user).order_by('-created_at')
    
    # handle json requests for favourite cafes
    if request.headers.get('Accept') == 'application/json':
        favorites_data = [{
            'place_id': fav.cafe_id,
            'name': fav.name,
            'address': fav.address,
            'lat': fav.lat,
            'lon': fav.lon,
            'rating': fav.rating,
            'user_ratings_total': fav.user_ratings_total,
            'phone': fav.phone,
            'website': fav.website
        } for fav in favorites]
        
        return JsonResponse({
            'favorites': favorites_data
        })
    
    # render the favourites page
    return render(request, 'favourites.html', {'favorites': favorites})

# api endpoint for adding or removing a cafe from favorites
@login_required
def toggle_favourite(request):
    """API endpoint for toggling favorite status"""
    if request.method == 'POST':
        try:
            # parse json data from the request
            data = json.loads(request.body.decode('utf-8'))
            cafe_id = data.get('cafe_id')
            cafe_data = data.get('cafe_data', {})
            
            if not cafe_id:
                return JsonResponse({'error': 'Cafe ID is required'}, status=400)
            
            # check if the cafe is already in favourites
            favourite = FavouriteCafe.objects.filter(
                user=request.user, 
                cafe_id=cafe_id
            ).first()
            
            if favourite:
                # remove from favourites if exists
                favourite.delete()
                return JsonResponse({
                    'status': 'removed',
                    'message': 'Cafe removed from favorites',
                    'is_favorited': False
                })
            else:
                # add to favourites if it doesn't exist
                try:
                    FavouriteCafe.objects.create(
                        user=request.user,
                        cafe_id=cafe_id,
                        name=cafe_data.get('name', ''),
                        address=cafe_data.get('address'),
                        lat=cafe_data.get('lat', 0.0),
                        lon=cafe_data.get('lon', 0.0),
                        rating=cafe_data.get('rating'),
                        user_ratings_total=cafe_data.get('user_ratings_total'),
                        phone=cafe_data.get('phone', ''),
                        website=cafe_data.get('website', '')
                    )
                    return JsonResponse({
                        'status': 'added',
                        'message': 'Cafe added to favourites',
                        'is_favorited': True
                    })
                except Exception as e:
                    print("Error creating favourite:", str(e))
                    return JsonResponse({
                        'error': f'Error creating favourite: {str(e)}'
                    }, status=500)
                
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)