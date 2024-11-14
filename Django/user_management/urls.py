from django.urls import path
from .import views

urlpatterns = [
    path('user-profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('deduct-credit/', views.DeductCreditView.as_view(), name='deduct_credit'),
    path('user/', views.UserCreateUpdateView.as_view(), name='user-create-update'),  # ایجاد یا به‌روزرسانی کاربر
    path('hotel-users/<int:hotel_id>/', views.HotelUserListView.as_view(), name='hotel-user-list'),  # لیست کاربران یک هتل

]
