from django.urls import path, include
from . import views
from django.contrib.staticfiles.views import serve
from django.views.generic import TemplateView
from django.shortcuts import redirect

def redirect_to_map(request):
    return redirect('map')


urlpatterns = [
    path('', redirect_to_map, name='root'),
    path('map/', views.map_view, name='map'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('serviceworker.js', serve, {'path': 'js/serviceworker.js'}),
    path('manifest.json', serve, {'path': 'manifest.json'}),
    path('offline/', TemplateView.as_view(template_name="offline.html"), name='offline'),
    path('favourites/', views.favourite_cafes, name='favourite_cafes'),  # Route to display favorites page
    path('favourite/', views.toggle_favourite, name='toggle_favourite'),  # Route for AJAX toggle action
]