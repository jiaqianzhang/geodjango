from rest_framework import serializers
from .models import Cafe, UserProfile

# serializer for cafe model to handle cafe-related data
class CafeSerializer(serializers.ModelSerializer):
    # field to calculate distance of the cafe from the user's location
    distance = serializers.SerializerMethodField()
    # field to determine if the cafe is marked as a favorite by the user
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Cafe
        # specifying fields to include in the serialized output
        fields = ['id', 'name', 'address', 'location', 'rating', 'distance', 'is_favorite']

    # method to calculate the distance between the cafe and the user's location
    def get_distance(self, obj):
        # retrieve the user's location from the context
        user_location = self.context.get('user_location')
        if user_location:
            # calculate and return the distance in meters
            return obj.location.distance(user_location) * 100  # convert to meters
        return None

    # method to check if the cafe is a favorite of the authenticated user
    def get_is_favorite(self, obj):
        # retrieve the user from the request context
        user = self.context.get('request').user
        if user.is_authenticated:
            # check if the cafe is in the user's list of favorites
            return obj.favorited_by.filter(user=user).exists()
        return False

# serializer for user profile model to handle user-specific data
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        # specifying fields to include in the serialized output
        fields = ['favorite_cafes', 'last_location']
