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

# Basic Views
@login_required(login_url='/login/')
def index_view(request):
    return render(request, 'map.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('map')
        
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            next_url = request.GET.get('next', 'map')
            return redirect(next_url)
    else:
        form = AuthenticationForm()
    
    return render(request, 'login.html', {'form': form})

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(reverse('map'))
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

@login_required(login_url='/login/')
def map_view(request):
    profile = getattr(request.user, 'userprofile', None)
    
    # Handle fetch request for cafes
    if request.headers.get('Accept') == 'application/json':
        # Log all request parameters
        logger.debug(f"Request GET parameters: {request.GET}")
        logger.debug(f"Request headers: {request.headers}")
        
        try:
            lat = request.GET.get('latitude')
            lon = request.GET.get('longitude')
            logger.debug(f"Extracted lat={lat}, lon={lon}")

            # Add type checking
            try:
                float_lat = float(lat)
                float_lon = float(lon)
                logger.debug(f"Converted lat={float_lat}, lon={float_lon}")
            except (TypeError, ValueError) as e:
                logger.error(f"Error converting coordinates: {e}")
                return JsonResponse({'error': 'Invalid coordinates'}, status=400)


            radius = request.GET.get('radius', 1000)

            if not all([lat, lon]):
                return JsonResponse({'error': 'Latitude and longitude are required'}, status=400)

            # Log before Google Places call
            logger.debug("About to call Google Places Service")
            
            service = GooglePlacesService()
            cafes = service.get_nearby_cafes(
                lat=float(lat),
                lon=float(lon),
                radius=int(radius)
            )
            
            # Log after successful Google Places call
            logger.debug(f"Successfully retrieved {len(cafes) if cafes else 0} cafes")

            # Cache the results
            cache_key = f'cafes_lat{lat}_lon{lon}_rad{radius}'
            cache.set(cache_key, cafes, timeout=3600)
            
            return JsonResponse({
                'cafes': cafes,
                'source': 'google_places'
            })

        except Exception as e:
            # Add full traceback logging
            import traceback
            logger.error(f"Error fetching cafes: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return JsonResponse({'error': str(e)}, status=500)
    
    # Regular page load
    context = {
        'user_location': profile.location if profile else None
    }
    return render(request, 'map.html', context)


@login_required
def favourite_cafes(request):
    """View for displaying favorite cafes page"""
    favorites = FavouriteCafe.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'favourites.html', {'favorites': favorites})

@login_required
def toggle_favourite(request):
    """API endpoint for toggling favorite status"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            cafe_id = data.get('cafe_id')
            cafe_data = data.get('cafe_data', {})
            
            if not cafe_id:
                return JsonResponse({'error': 'Cafe ID is required'}, status=400)
            
            # Try to get existing favorite
            favorite = FavouriteCafe.objects.filter(
                user=request.user, 
                cafe_id=cafe_id
            ).first()
            
            if favorite:
                # Remove from favorites
                favorite.delete()
                return JsonResponse({
                    'status': 'removed',
                    'message': 'Cafe removed from favorites',
                    'is_favorited': False
                })
            else:
                # Add to favorites
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
                        'message': 'Cafe added to favorites',
                        'is_favorited': True
                    })
                except Exception as e:
                    print("Error creating favorite:", str(e))
                    return JsonResponse({
                        'error': f'Error creating favorite: {str(e)}'
                    }, status=500)
                
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)