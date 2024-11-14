from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from .models import Customer,ReservationHistory
from reservation.models import Reservation,Room
from hotels.models import Hotel

class CustomerListView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        hotel_id = request.data.get('hotel_id')

        if not hotel_id:
            return Response({"error": "Hotel ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customers = Customer.objects.filter(hotel_id=hotel_id)
            today = timezone.now().date()

            customer_data = []

            for customer in customers:
                reservations = customer.reservation_history.all()
                reservation_data = []

                for reservation in reservations:
                    reservation_data.append({
                        "reservation_id": f"R{reservation.id:06}",
                        "check_in": reservation.check_in.strftime("%Y-%m-%d"),
                        "check_out": reservation.check_out.strftime("%Y-%m-%d"),
                        "room": reservation.room.number,
                        "payment_method": reservation.get_payment_method_display(),
                    })

                is_current_guest = any(
                    res.check_in <= today <= res.check_out for res in reservations
                )

                customer_data.append({
                    "full_name": customer.full_name,
                    "emergency_contact": customer.emergency_contact,
                    "nid": customer.nid,  # اضافه کردن کد ملی
                    "is_current_guest": is_current_guest,
                    "reservations": reservation_data,
                })

            return Response(customer_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateReservationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        try:
            # دریافت اطلاعات از درخواست
            full_name = data.get('full_name')
            nid = data.get('nid')
            emergency_contact = data.get('emergency_contact')
            email = data.get('email')
            hotel_id = data.get('hotel_id')
            room_name = data.get('room_name')
            check_in = data.get('check_in')
            check_out = data.get('check_out')
            total_price = data.get('total_price')
            payment_method = data.get('payment_method')

            # دریافت مدل‌های مرتبط
            hotel = Hotel.objects.get(id=hotel_id)
            room = Room.objects.get(name_fa=room_name, hotel=hotel)

            # ایجاد مشتری
            customer, created = Customer.objects.get_or_create(
                nid=nid,
                defaults={
                    'full_name': full_name,
                    'emergency_contact': emergency_contact,
                    'email': email,
                    'hotel': hotel,
                }
            )

            # ایجاد رزرو
            reservation = Reservation.objects.create(
                hotel=hotel,
                room=room,
                customer=customer,
                check_in=check_in,
                check_out=check_out,
                total_price=total_price,
                status='AWAITING_CHECKIN',
            )

            # ایجاد تاریخچه رزرو
            ReservationHistory.objects.create(
                customer=customer,
                reservation=reservation,
                payment_method=payment_method,
            )

            return Response({
                "message": "Reservation created successfully.",
                "reservation_id": reservation.id,
                "reservation_status": reservation.status,
            }, status=status.HTTP_201_CREATED)

        except Hotel.DoesNotExist:
            return Response({"error": "Hotel not found."}, status=status.HTTP_404_NOT_FOUND)
        except Room.DoesNotExist:
            return Response({"error": "Room not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
