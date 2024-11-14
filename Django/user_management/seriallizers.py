from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user', 'hotel', 'role']
        depth = 1  # نمایش اطلاعات مرتبط مثل نام کاربر و نام هتل
