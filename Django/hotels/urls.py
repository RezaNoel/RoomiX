from django.urls import path
from .views import HotelManagementView

urlpatterns = [
    path('hotel-management/', HotelManagementView.as_view(), name='hotel-management'),
]
