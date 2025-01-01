from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()

class FavouriteCafe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cafe_id = models.CharField(max_length=255)  # Google Places ID
    name = models.CharField(max_length=255)
    address = models.TextField()
    lat = models.FloatField()
    lon = models.FloatField()
    rating = models.FloatField(null=True, blank=True)
    user_ratings_total = models.IntegerField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'cafe_id')

    def __str__(self):
        return f"{self.user.username} - {self.name}"
    

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.PointField(null=True, blank=True)
    favorite_cafes = models.ManyToManyField(FavouriteCafe, related_name='favourited_by')
    last_location = models.PointField(null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    @classmethod
    def set_user_location(cls, user_id, latitude, longitude):
        user = User.objects.get(id=user_id)
        location = Point(longitude, latitude)  # Point takes (longitude, latitude)
        
        # Create or update the user's profile
        profile, created = cls.objects.get_or_create(user=user)
        profile.location = location
        profile.last_location = location  # Update both location fields
        profile.save()
        
        return profile

# Signal handlers
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create a Profile instance when a new User is created"""
    if created:
        UserProfile.objects.create(
            user=instance,
            location=Point(0, 0),  # Default location at (0,0)
            last_location=Point(0, 0)
        )

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the Profile instance whenever the User is saved"""
    try:
        instance.userprofile.save()
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        UserProfile.objects.create(
            user=instance,
            location=Point(0, 0),
            last_location=Point(0, 0)
        )
