from django.conf import settings
from django.shortcuts import render, redirect
from .models import WorldBorder, Profile as user, Hotel, Counties, ElectoralDistricts
from rest_framework import generics, viewsets
from rest_framework.response import Response
from .eds_filters import ElectoralDistrictsFilter
from .serializers import HotelSerializer, ElectoralDistrictsSerializer, CountiesSerializer

from django.contrib.gis.geos import Point
from geopy.geocoders import Nominatim

# authentication
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .forms import SignUpForm

from django.contrib.gis.db.models.functions import Distance
from django_filters import rest_framework as filters
from django.http import JsonResponse
import requests  # Add this import for the API request
from django.views.generic import TemplateView
from rest_framework.decorators import action


# Create your views here.

# View that reads the locations from world borders and passes on to maps
def map_view(request):
    # expand the code by setting the authentication here
    if request.user.is_authenticated:
        user_profile = user.objects.get(user=request.user)
        location = user_profile.location
        return render(request, 'map.html', {'user': request.user, 'location': location})
    else:
        return render(request, 'login.html')
    

#login & logout views
def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('index')

    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')

#Signup view
def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            login(request, user)
            return redirect('index')  # Redirect to the home page after successful signup
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})


def update_location(request):
    if request.method == 'POST':
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        user = request.profile
        user.location = Point(float(longitude), float(latitude))
        user.save()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False})

def nearby_cafes(request):
    # Get user's location from query parameters
    user_lat = request.GET.get('lat')
    user_lon = request.GET.get('lon')
    
    # Foursquare API endpoint
    endpoint = "https://api.foursquare.com/v3/places/nearby"
    
    # Define headers with authorization
    headers = {
        "Authorization": settings.FOURSQUARE_API_KEY  # Accessing settings here
    }
    
    # Parameters for the API request
    params = {
        "ll": f"{user_lat},{user_lon}",  # Latitude and Longitude
        "radius": 5000,                  # Radius in meters (5 km)
        # "categories": "13032",           # Foursquare category ID for cafes
        "limit": 10                      # Limit to 10 results
    }

    # Send GET request to Foursquare API
    response = requests.get(endpoint, headers=headers, params=params)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Log the raw response for debugging
        print(response.json())  # This will print the entire response data

        # Parse the JSON response
        cafes_data = response.json().get("results", [])
        
        # Structure the data for each cafe
        cafes = [
            {
                "name": cafe["name"],
                "address": cafe["location"]["formatted_address"],
                "latitude": cafe["geocodes"]["main"]["latitude"],
                "longitude": cafe["geocodes"]["main"]["longitude"]
            }
            for cafe in cafes_data if "cafe" in cafe["name"].lower()
        ]

        return JsonResponse({"cafes": cafes})
    else:
        return JsonResponse({"error": "Failed to fetch data from Foursquare Places API"}, status=500)

 
geolocator = Nominatim(user_agent="location")
 
 
class ListCreateGenericViews(generics.ListCreateAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
 
    def perform_create(self, serializer):
        address = serializer.initial_data["address"]
        g = geolocator.geocode(address)
        lat = g.latitude
        lng = g.longitude
        pnt = Point(lng, lat)
        print(pnt)
        serializer.save(location=pnt)
 
 
class HotelUpdateRetreiveView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
 
    def perform_update(self, serializer):
        address = serializer.initial_data["address"]
        g = geolocator.geocode(address)
        lat = g.latitude
        lng = g.longitude
        pnt = Point(lng, lat)
        print(pnt)
        serializer.save(location=pnt)

class PWAView(TemplateView):
    template_name = 'pwa.html'

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        response['Service-Worker-Allowed'] = '/'
        response['Cache-Control'] = 'no-cache'
        return response
 
class CountiesViewSet(viewsets.ModelViewSet):
    serializer_class = CountiesSerializer
    queryset = Counties.objects.all()
 
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance

class ElectoralDistrictsViewSet(viewsets.ModelViewSet):
    serializer_class = ElectoralDistrictsSerializer
    queryset = ElectoralDistricts.objects.all()
    filterset_class = ElectoralDistrictsFilter
    filter_backends = [filters.DjangoFilterBackend]

    @action(detail=False, methods=['get'])
    def get_nearest_facilities(self, request):
        x_coords = request.GET.get('x', None)
        y_coords = request.GET.get('y', None)
        
        if x_coords and y_coords:
            user_location = Point(float(x_coords), float(y_coords), srid=4326)
            nearest_facilities = ElectoralDistricts.objects.annotate(
                distance=Distance('geom', user_location)
            ).order_by('distance')[:5]  # Fetch the nearest 5 facilities
            
            # Ensure to pass the proper context (user location) into the serializer
            serializer = self.get_serializer(nearest_facilities, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({'detail': 'Invalid or missing coordinates.'}, status=status.HTTP_400_BAD_REQUEST)


