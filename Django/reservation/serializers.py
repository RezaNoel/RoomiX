from rest_framework import serializers
from .models import Room, Reservation, CancellationPolicy,RoomType

class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    room_type = RoomTypeSerializer()

    class Meta:
        model = Room
        fields = '__all__'
        
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'id', 'number', 'name_fa', 'room_type', 'base_price',
            'bed_count', 'floor', 'meal_plan', 'is_available', 'image', 'hotel'
        ]
        read_only_fields = ['hotel']  # فیلد هتل فقط خواندنی است

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'


class CancellationPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = CancellationPolicy
        fields = '__all__'
