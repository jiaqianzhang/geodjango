from rest_framework import serializers
from .models import Cafe, UserProfile

class CafeSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Cafe
        fields = ['id', 'name', 'address', 'location', 'rating', 'distance', 'is_favorite']

    def get_distance(self, obj):
        user_location = self.context.get('user_location')
        if user_location:
            return obj.location.distance(user_location) * 100  # Convert to meters
        return None

    def get_is_favorite(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.favorited_by.filter(user=user).exists()
        return False

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['favorite_cafes', 'last_location']
