from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Hotel
from user_management.models import UserProfile


class HotelManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get hotel information based on the user's profile.
        """
        try:
            user_profile = request.user.userprofile
            hotel = user_profile.hotel

            if not hotel:
                return Response({'error': 'هتلی برای این کاربر وجود ندارد.'}, status=status.HTTP_404_NOT_FOUND)

            hotel_data = {
                'name': hotel.name,
                'location': hotel.location,
                'phone_number': hotel.phone_number,
                'hotel_type': hotel.get_hotel_type_persian(),
            }
            return Response(hotel_data, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({'error': 'کاربر پروفایل ندارد.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        """
        Update hotel information based on the user's role.
        """
        try:
            user_profile = request.user.userprofile
            hotel = user_profile.hotel

            if not hotel:
                return Response({'error': 'هتلی برای این کاربر وجود ندارد.'}, status=status.HTTP_404_NOT_FOUND)

            if user_profile.role == 'manager':
                # Managers can only update the phone number
                hotel.phone_number = request.data.get('phone_number', hotel.phone_number)
            elif user_profile.role == 'admin':
                # Admins can update all fields
                hotel.name = request.data.get('name', hotel.name)
                hotel.location = request.data.get('location', hotel.location)
                hotel.phone_number = request.data.get('phone_number', hotel.phone_number)
                hotel.hotel_type = request.data.get('hotel_type', hotel.hotel_type)
            else:
                return Response({'error': 'شما مجاز به تغییر اطلاعات هتل نیستید.'}, status=status.HTTP_403_FORBIDDEN)

            hotel.save()
            return Response({'message': 'اطلاعات هتل با موفقیت به‌روزرسانی شد.'}, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({'error': 'کاربر پروفایل ندارد.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
