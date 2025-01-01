from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point
from world.models import Profile

class Command(BaseCommand):
    help = 'Create missing user profiles'

    def handle(self, *args, **kwargs):
        users_without_profile = User.objects.filter(profile__isnull=True)
        created_count = 0
        
        for user in users_without_profile:
            Profile.objects.create(
                user=user,
                location=Point(0, 0)  # Default location
            )
            created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} missing profiles'
            )
        )
