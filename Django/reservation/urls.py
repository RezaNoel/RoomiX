# reservation/urls.py

from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet)
router.register(r'reservations', views.ReservationViewSet)
router.register(r'cancellation_policies', views.CancellationPolicyViewSet)

urlpatterns = [
    path('available-rooms/', views.AvailableRoomsView.as_view(), name='available_rooms'),
    path('room-list/', views.RoomListView.as_view(), name='room_list'),
    path('room-rack/', views.RoomRackView.as_view(), name='room_rack'),
    path('login/', views.LoginView.as_view(), name='login'), 
    path('reservations_list/', views.ReservationListView.as_view(), name='reservation_list'),
    path('reservations/<int:pk>/cancel/', views.CancelReservationView.as_view(), name='cancel_reservation'),
    path('reservation-detail/<int:reservation_id>/', views.ReservationDetailView.as_view(), name='reservation_detail'),
    path('hotel-policy/<str:hotel>/', views.HotelPolicyView.as_view(), name='hotel-policy'),
    path('rooms/', views.RoomManagementView.as_view(), name='room-management'),
    path('room-types/', views.RoomTypeListView.as_view(), name='room-types'),




  ] + router.urls
