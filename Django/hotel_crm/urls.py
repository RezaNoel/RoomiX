from django.urls import path
from .views import CustomerListView,CreateReservationView



urlpatterns = [
    path('customers/', CustomerListView.as_view(), name='customers'),
    path('create-reservation/', CreateReservationView.as_view(), name='create_reservation'),

  ] 
 