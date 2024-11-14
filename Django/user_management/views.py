from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import UserProfile,UserCredit
from django.http import JsonResponse
from rest_framework import status
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User
from hotels.models import Hotel

@ensure_csrf_cookie
def csrf_token_view(request):
    """
    View برای ارسال CSRF Token به کلاینت
    """
    return JsonResponse({'message': 'CSRF cookie set!'}, status=200)


class UserCreateUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        ایجاد یا به‌روزرسانی کاربر
        """
        data = request.data
        username = data.get('username')
        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = data.get('first_name')
        last_name = data.get('last_name')
        password = data.get('password')
        hotel_id = data.get('hotel_id')
        role = data.get('role')
        credit = data.get('credit', None)

        # اطمینان از اینکه نقش admin و manager نمی‌تواند تخصیص داده شود
        if role in ['admin', 'manager']:
            return Response({'error': 'You are not allowed to assign admin or manager roles.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            # ایجاد یا گرفتن کاربر موجود
            user, created = User.objects.get_or_create(username=username)
            if not created:
                # به‌روزرسانی نام و نام خانوادگی در صورت ارسال
                if first_name is not None:
                    user.first_name = first_name
                if last_name is not None:
                    user.last_name = last_name
            if password:
                user.set_password(password)
            user.save()

            # به‌روزرسانی یا ایجاد پروفایل کاربر
            user_profile, _ = UserProfile.objects.get_or_create(user=user)
            if hotel_id is not None:
                user_profile.hotel_id = hotel_id
            if role is not None:
                user_profile.role = role
            user_profile.save()

            # افزودن یا به‌روزرسانی اعتبار فقط اگر مقدار ارسال شده باشد
            if credit is not None:
                user_credit, _ = UserCredit.objects.get_or_create(user_profile=user_profile)
                user_credit.credit = credit
                user_credit.save()

            return Response({'message': 'User created or updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class HotelUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, hotel_id):
        """
        دریافت تمام کاربران مرتبط با یک هتل بر اساس شناسه هتل
        """
        try:
            # بررسی وجود هتل
            hotel = Hotel.objects.get(id=hotel_id)

            # فیلتر کردن کاربران مرتبط با هتل
            users = UserProfile.objects.filter(hotel=hotel).select_related('user')
            data = [
                {
                    'name': f"{profile.user.first_name} {profile.user.last_name}" if profile.user.first_name and profile.user.last_name else "N/A",
                    'username': profile.user.username,
                    'role': profile.get_role_display(),
                    'credit': UserCredit.objects.filter(user_profile=profile).first().credit if UserCredit.objects.filter(user_profile=profile).exists() else 0.0,
                    'last_login': profile.user.last_login,
                }
                for profile in users
            ]

            return Response(data, status=status.HTTP_200_OK)

        except Hotel.DoesNotExist:
            return Response({'error': 'Hotel not found'}, status=status.HTTP_404_NOT_FOUND)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
            data = {
                "username": user.username,
                "role": profile.get_role_display(),
                "hotel": {
                    "name": profile.hotel.name if profile.hotel else "No hotel assigned",
                    "id": profile.hotel.id if profile.hotel else None,
                    "type": profile.hotel.hotel_type if profile.hotel else None,  # اضافه کردن نوع هتل
                    "address": profile.hotel.location if profile.hotel else None
                },
            }
            return Response(data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "UserProfile not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the exception for debugging
            print(f"Unexpected error: {e}")
            return Response({"error": "Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeductCreditView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            user_profile = UserProfile.objects.get(user=user)
            user_credit = UserCredit.objects.get(user_profile=user_profile)

            # دریافت مبلغ از درخواست
            amount = request.data.get("amount")
            if amount is None:
                return Response({"error": "مبلغ ارسال نشده است."}, status=status.HTTP_400_BAD_REQUEST)

            # بررسی اعتبار کافی
            if not user_credit.has_sufficient_credit(amount):
                return Response({"error": "اعتبار کافی نیست."}, status=status.HTTP_400_BAD_REQUEST)

            # کسر اعتبار
            user_credit.deduct_credit(amount)
            return Response({"message": "مبلغ با موفقیت کسر شد."}, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({"error": "پروفایل کاربری یافت نشد."}, status=status.HTTP_404_NOT_FOUND)
        except UserCredit.DoesNotExist:
            return Response({"error": "برای حساب شما اعتباری ثبت نشده، با رزرواسیون در ارتباط باشید."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
