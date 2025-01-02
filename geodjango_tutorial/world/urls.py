from django.urls import path, include
from . import views
from django.contrib.staticfiles.views import serve
from django.views.generic import TemplateView
from django.shortcuts import redirect

def redirect_to_map(request):
    return redirect('map')

# url routes
urlpatterns = [
    # root url - redirects to the map view
    path('', redirect_to_map, name='root'),
    # main map view for displaying the application's map
    path('map/', views.map_view, name='map'),
    # authentication related urls
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    # progressive web app (pwa) related files
    path('serviceworker.js', serve, {'path': 'js/serviceworker.js'}),
    path('manifest.json', serve, {'path': 'manifest.json'}),
    path('offline/', TemplateView.as_view(template_name="offline.html"), name='offline'),
    # favourite functionality urls
    path('favourites/', views.favourite_cafes, name='favourite_cafes'),  # route to display favourites page
    path('favourite/', views.toggle_favourite, name='toggle_favourite'),  # route for AJAX toggle action
]