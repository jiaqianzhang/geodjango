from django.urls import path, include
from . import views
from .views import HotelUpdateRetreiveView, ListCreateGenericViews, PWAView
from rest_framework import routers
from . import views as api_views  # assuming the views for your API are imported here

# Create the router instance
router = routers.DefaultRouter()
router.register(r'ElectoralDistricts', api_views.ElectoralDistrictsViewSet)
router.register(r'Counties', api_views.CountiesViewSet)

urlpatterns = [
    # Regular views
    path('map/', views.map_view, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('update_location/', views.update_location, name='update_location'),
    path('nearby/', views.nearby_cafes, name='nearby_cafes'),

    # Hotel-related views (generic class-based views)
    path("hotels", ListCreateGenericViews.as_view()),
    path("hotels/<str:pk>", HotelUpdateRetreiveView.as_view()),

    # PWA view
    path('pwa/', PWAView.as_view(), name='pwa'),

    # API URLs (prefixed with /api/v1/)
    path('api/v1/', include(router.urls)),  # API views for ElectoralDistricts and Counties

    # Do not include api-auth here if already included in the project-level urls.py
    # path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),  # REMOVE this line
]
