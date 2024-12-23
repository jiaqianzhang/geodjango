from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Include your app's URLs (this is where all your app's URLs are handled)
    path('', include('world.urls')),  # Your app's URLs

    # API URLs for your models (ElectoralDistricts and Counties) under the /api/v1/ prefix
    path("api/v1/", include('world.urls')),  # API URLs prefixed with /api/v1/

    # Optionally, if you want to include the DRF auth URLs for session-based authentication
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # Add any other necessary URLs (like for PWA or other apps)
    # path('cafes/', include('cafes.urls')),
    # path('', include('posts.urls')),
    # path('', include('pwa.urls')),
]
