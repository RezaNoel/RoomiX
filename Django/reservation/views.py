from datetime import timedelta, datetime, date, timezone
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.middleware.csrf import get_token
from khayyam import JalaliDate
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Room, Reservation, RoomPricing, CancellationPolicy,RoomType
from .serializers import RoomSerializer, ReservationSerializer, CancellationPolicySerializer,RoomTypeSerializer,CreateRoomSerializer
from user_management.models import UserProfile  # اضافه کردن UserProfile به import
from rest_framework.permissions import AllowAny
from hotels.models import Hotel
from hotel_crm.models import ReservationHistory
from django.contrib.auth.models import update_last_login

class RoomManagementView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        """
        Get all rooms for the user's hotel.
        """
        try:
            user_profile = request.user.userprofile
            hotel = user_profile.hotel

            if not hotel:
                return Response({'error': 'هتلی برای این کاربر وجود ندارد.'}, status=status.HTTP_404_NOT_FOUND)

            rooms = Room.objects.filter(hotel=hotel)
            data = [
                {
                    'id': room.id,
                    'number': room.number,
                    'name': room.name_fa,
                    'room_type': room.room_type.type_name_fa if room.room_type else "نامشخص",
                    'base_price': room.base_price,
                    'calculated_price': room.calculated_price,
                    'bed_count': room.bed_count,
                    'is_available': room.is_available,
                    'floor': room.floor,
                    'meal_plan': room.get_meal_plan_display(),
                    'image': room.image.url if room.image else None,
                }
                for room in rooms
            ]
            return Response(data, status=status.HTTP_200_OK)

        except UserProfile.DoesNotExist:
            return Response({'error': 'کاربر پروفایل ندارد.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """
        Create or update a room.
        """
        try:
            user_profile = request.user.userprofile
            hotel = user_profile.hotel

            if not hotel:
                return Response({'error': 'هتلی برای این کاربر وجود ندارد.'}, status=status.HTTP_404_NOT_FOUND)

            if user_profile.role not in ['manager', 'admin']:
                return Response({'error': 'شما مجاز به مدیریت اطلاعات اتاق‌ها نیستید.'}, status=status.HTTP_403_FORBIDDEN)

            data = request.data.copy()

            # Ensure hotel is a Hotel instance
            data['hotel'] = hotel  # Assign the hotel instance directly

            # Check if room exists by number
            room_number = data.get('number')
            if not room_number:
                return Response({'error': 'شماره اتاق ضروری است.'}, status=status.HTTP_400_BAD_REQUEST)

            room = Room.objects.filter(number=room_number, hotel=hotel).first()

            if room:
                # Partial update: only update provided fields
                for key, value in data.items():
                    if hasattr(room, key) and value:
                        setattr(room, key, value)
                if 'room_type' in data and data['room_type']:
                    room.room_type_id = data['room_type']
                if 'image' in request.FILES:
                    room.image = request.FILES['image']

                room.save()
                return Response({'message': 'اطلاعات اتاق با موفقیت به‌روزرسانی شد.'}, status=status.HTTP_200_OK)
            else:
                serializer = CreateRoomSerializer(data=data)
                if serializer.is_valid():
                    serializer.save(hotel=hotel)  # Assign hotel instance directly
                    return Response({'message': 'اطلاعات اتاق با موفقیت ثبت شد.'}, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class HotelPolicyView(APIView):
    def get(self, request, hotel, *args, **kwargs):
        print(hotel)

        try:
            policy = CancellationPolicy.objects.get(hotel__name=hotel)

            return Response({"policy": policy.policy}, status=status.HTTP_200_OK)
        except CancellationPolicy.DoesNotExist:
            return Response({"error": "Policy not found"}, status=status.HTTP_404_NOT_FOUND)

class ReservationDetailView(APIView):
    def get(self, request, reservation_id):
        try:
            # دریافت اطلاعات رزرو
            reservation = Reservation.objects.get(id=reservation_id)
            serializer = ReservationSerializer(reservation)
            
            # تبدیل تاریخ میلادی به جلالی
            created_at_jalali = JalaliDate(reservation.created_at).strftime('%Y/%m/%d')

            return Response({
                "reservation_id": f"R{reservation.id:06}",
                "hotel_name": reservation.hotel.name,
                "hotel_type": reservation.hotel.get_hotel_type_display(),  # نوع هتل به صورت متن فارسی
                "hotel_address": reservation.hotel.location,
                "room_name": reservation.room.name_fa,
                "reservation_date": created_at_jalali,  # تاریخ ثبت رزرو به جلالی
                "price": reservation.total_price
            }, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({"error": "رزرو یافت نشد."}, status=status.HTTP_404_NOT_FOUND)

class ReservationListView(APIView):
    def get(self, request):
        reservations = Reservation.objects.all()
        data = []
        for reservation in reservations:
            try:
                reservation_history = ReservationHistory.objects.get(reservation=reservation)
                payment_method = reservation_history.payment_method
            except ReservationHistory.DoesNotExist:
                payment_method = "N/A"

            data.append({
                "id": reservation.id,
                "checkIn": reservation.check_in,
                "checkOut": reservation.check_out,
                "guestName": reservation.customer.full_name,
                "roomNumber": reservation.room.number,
                "bookingDate": reservation.created_at.date(),
                "bookingNumber": f"R{reservation.id:06}",
                "paymentMethod": payment_method,
                "status": reservation.status
            })
        return Response(data, status=status.HTTP_200_OK)

class CancelReservationView(APIView):
    def post(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk)
        reservation.status = "CANCELLED"
        reservation.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            # حذف توکن قدیمی در صورت وجود و ایجاد توکن جدید
            Token.objects.filter(user=user).delete()
            token, created = Token.objects.get_or_create(user=user)

            # به‌روزرسانی آخرین ورود کاربر
            update_last_login(None, token.user)  

            # دریافت اطلاعات پروفایل کاربر از user_management
            try:
                user_profile = UserProfile.objects.get(user=user)
                hotel_info = user_profile.hotel
                
                hotel_data = None
                if hotel_info:
                    hotel_data = {
                        'name': hotel_info.name,
                        'address': hotel_info.location,
                        'hotel_type': hotel_info.hotel_type,
                        'unique_identifier': hotel_info.unique_identifier,
                    }
                
                profile_data = {
                    'role': user_profile.get_role_display(),
                    'hotel': hotel_data
                }
            except UserProfile.DoesNotExist:
                profile_data = None

            # ارسال توکن و اطلاعات پروفایل جدید
            return Response({
                'message': 'Login successful',
                'token': token.key,
                'profile_info': profile_data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
class RoomRackView(APIView):
    def post(self, request, *args, **kwargs):
        hotel_identifier = request.data.get('hotelId')  # دریافت آیدی هتل از درخواست
        selected_date = request.data.get('selectedDate')
        number_of_nights = int(request.data.get('numberOfNights', 1))
        selected_beds = request.data.get('selectedBeds', [])  # تعداد تخت‌های انتخاب‌شده

        # بررسی اینکه آیا آیدی هتل وجود دارد
        if not hotel_identifier:
            return Response({"error": "Hotel identifier is missing."}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی ورودی‌های دیگر
        if not selected_date:
            return Response({"error": "Invalid input."}, status=status.HTTP_400_BAD_REQUEST)

        # بررسی موجودیت هتل
        try:
            hotel = Hotel.objects.get(id=hotel_identifier)
        except Hotel.DoesNotExist:
            return Response({"error": "Invalid hotel identifier."}, status=status.HTTP_400_BAD_REQUEST)

        # تبدیل تاریخ جلالی به میلادی
        try:
            year, month, day = map(int, selected_date.split('/'))
            selected_date_gregorian = JalaliDate(year, month, day).todate()
        except ValueError:
            return Response({"error": "Invalid Jalali date format."}, status=status.HTTP_400_BAD_REQUEST)

        check_out_date = selected_date_gregorian + timedelta(days=number_of_nights)

        # فیلتر اتاق‌ها بر اساس تعداد تخت و هتل
        if selected_beds:
            rooms = Room.objects.filter(hotel=hotel, bed_count__in=selected_beds)
        else:
            rooms = Room.objects.filter(hotel=hotel)

        # گروه‌بندی اتاق‌ها بر اساس طبقات
        floors = {}

        for room in rooms:
            floor_number = room.floor  # فرض بر اینکه `room.floor` شماره طبقه را برمی‌گرداند

            if floor_number not in floors:
                floors[floor_number] = {
                    "floorNumber": floor_number,
                    "rooms": []
                }

            room_info = {
                "id": room.id,
                "number": room.number,
                "beds": room.bed_count,
                "isOccupied": False,
                "reservedDates": [],
                "dailyPrices": []
            }

            reservations = Reservation.objects.filter(
                room=room,
                check_in__lt=check_out_date,
                check_out__gt=selected_date_gregorian
            )

            # بررسی پر بودن اتاق در تاریخ‌های مختلف
            current_date = selected_date_gregorian
            for i in range(number_of_nights):
                is_reserved = False

                for reservation in reservations:
                    # بررسی اینکه آیا اتاق در این تاریخ خاص رزرو شده است یا خیر
                    if reservation.check_in <= current_date < reservation.check_out:
                        room_info["isOccupied"] = True
                        room_info["reservedDates"].append({
                            "date": current_date.strftime("%Y/%m/%d"),
                            # گرفتن قیمت از RoomPricing یا قیمت پایه اتاق
                            "price": RoomPricing.objects.filter(room=room, date=current_date).first().price if RoomPricing.objects.filter(room=room, date=current_date).exists() else room.calculated_price
                        })
                        is_reserved = True
                        break

                if not is_reserved:
                    # اگر رزرو نبود، قیمت روزانه را از RoomPricing یا calculated_price دریافت کن
                    room_info["dailyPrices"].append({
                        "date": current_date.strftime("%Y/%m/%d"),
                        "price": RoomPricing.objects.filter(room=room, date=current_date).first().price if RoomPricing.objects.filter(room=room, date=current_date).exists() else room.calculated_price
                    })

                current_date += timedelta(days=1)

            floors[floor_number]["rooms"].append(room_info)

        # تبدیل به لیست برای بازگرداندن به صورت JSON
        floor_list = list(floors.values())

        return Response({"floorsData": floor_list}, status=status.HTTP_200_OK)

class RoomListView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # دریافت ورودی‌ها
        hotel_identifier = request.data.get('unique_identifier')
        selected_date = request.data.get('selectedDate')
        number_of_nights = int(request.data.get('numberOfNights', 1))
        selected_beds = request.data.get('selectedBeds', [])
        year, month, day = map(int, selected_date.split('/'))

        # بررسی موجودیت هتل
        try:
            hotel = Hotel.objects.get(id=hotel_identifier)
        except Hotel.DoesNotExist:
            return Response({"error": "Invalid hotel identifier."}, status=status.HTTP_400_BAD_REQUEST)

        # تبدیل تاریخ جلالی به میلادی
        try:
            gregorian_check_in = JalaliDate(year, month, day).todate()
        except ValueError:
            return Response({"error": "Invalid Jalali date format."}, status=status.HTTP_400_BAD_REQUEST)

        check_out_date = gregorian_check_in + timedelta(days=number_of_nights)

        # فیلتر اتاق‌ها بر اساس تعداد تخت و هتل
        rooms = Room.objects.filter(hotel=hotel, bed_count__in=selected_beds)

        floors_data = []
        for floor in set(room.floor for room in rooms):  # گروه‌بندی اتاق‌ها بر اساس طبقه
            floor_rooms = rooms.filter(floor=floor)
            room_data = []
            # برای هر اتاق، وضعیت رزرو و قیمت‌ها را محاسبه کنیم
            for room in floor_rooms:
                reserved_dates = []
                daily_prices = []
                current_date = gregorian_check_in
                is_occupied = False

                while current_date < check_out_date:
                    # بررسی قیمت در RoomPricing یا استفاده از calculated_price
                    room_pricing = RoomPricing.objects.filter(room=room, date=current_date).first()
                    price = room_pricing.price if room_pricing else room.calculated_price

                    # بررسی رزرو اتاق
                    reservation = Reservation.objects.filter(
                        room=room,
                        check_in__lt=current_date + timedelta(days=1),
                        check_out__gt=current_date
                    ).first()

                    if reservation:
                        # اضافه کردن تمامی روزهای داخل بازه رزرو به reserved_dates
                        reservation_start = reservation.check_in
                        reservation_end = reservation.check_out

                        while reservation_start < reservation_end:
                            reserved_dates.append({
                                "date": reservation_start.strftime('%Y/%m/%d'),
                                # استفاده از قیمت در RoomPricing یا calculated_price
                                "price": RoomPricing.objects.filter(room=room, date=reservation_start).first().price if RoomPricing.objects.filter(room=room, date=reservation_start).exists() else room.calculated_price
                            })
                            reservation_start += timedelta(days=1)
                        is_occupied = True
                    else:
                        daily_prices.append({
                            "date": current_date.strftime('%Y/%m/%d'),
                            # استفاده از قیمت در RoomPricing یا calculated_price
                            "price": price
                        })

                    current_date += timedelta(days=1)

                # اضافه کردن داده‌های اتاق به room_data
                if is_occupied:
                    room_data.append({
                        "id": room.id,
                        "number": room.number,
                        "beds": room.bed_count,
                        "isOccupied": True,
                        "reservedDates": reserved_dates
                    })
                else:
                    room_data.append({
                        "id": room.id,
                        "number": room.number,
                        "beds": room.bed_count,
                        "isOccupied": False,
                        "dailyPrices": daily_prices
                    })

            floors_data.append({
                "floorNumber": floor,
                "rooms": room_data
            })

        response_data = {
            "floorsData": floors_data,
        }

        return Response(response_data, status=status.HTTP_200_OK)
class AvailableRoomsView(APIView):
    def get(self, request, *args, **kwargs):
        check_in = request.query_params.get('check_in')
        number_of_nights = int(request.query_params.get('number_of_nights', 1))
        hotel_id = request.query_params.get('hotel_id')

        if not check_in or not number_of_nights or not hotel_id:
            return Response({"error": "Please provide check_in, number_of_nights, and hotel_id."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            check_in_date = date.fromisoformat(check_in)
        except ValueError:
            return Response({"error": "Invalid check_in date format."}, status=status.HTTP_400_BAD_REQUEST)

        check_out_date = check_in_date + timedelta(days=number_of_nights)

        # جستجوی اتاق‌های رزرو شده برای بازه زمانی مشخص
        reserved_rooms = Reservation.objects.filter(
            check_in__lt=check_out_date,
            check_out__gt=check_in_date
        ).values_list('room_id', flat=True)

        # فیلتر کردن اتاق‌ها بر اساس آیدی هتل
        available_rooms = Room.objects.filter(hotel_id=hotel_id).exclude(id__in=reserved_rooms)

        response_data = []

        for room in available_rooms:
            daily_prices = []
            total_price = 0
            current_date = check_in_date

            while current_date < check_out_date:
                room_pricing = RoomPricing.objects.filter(room=room, date=current_date).first()

                if room_pricing:
                    price = room_pricing.price
                else:
                    price = room.calculated_price  # استفاده از قیمت پایه اگر قیمت روزانه موجود نباشد

                daily_prices.append({"date": current_date, "price": price})
                total_price += price
                current_date += timedelta(days=1)

            response_data.append({
                "room": RoomSerializer(room).data,
                "total_price": total_price,
                "daily_prices": daily_prices
            })

        return Response(response_data, status=status.HTTP_200_OK)

class RoomTypeListView(APIView):
    """
    API View برای دریافت لیست انواع اتاق‌ها
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            room_types = RoomType.objects.all()
            serializer = RoomTypeSerializer(room_types, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

class CancellationPolicyViewSet(viewsets.ModelViewSet):
    queryset = CancellationPolicy.objects.all()
    serializer_class = CancellationPolicySerializer
