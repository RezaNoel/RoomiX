from rest_framework import serializers
from .models import Customer, ReservationHistory

class ReservationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationHistory
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    reservation_history = ReservationHistorySerializer(many=True, read_only=True)
    is_current_guest = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['full_name', 'emergency_contact', 'email', 'reservation_history', 'is_current_guest']

    def get_is_current_guest(self, obj):
        today = timezone.now().date()
        return any(
            history.check_in <= today <= history.check_out
            for history in obj.reservation_history.all()
        )
