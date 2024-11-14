from django.db import models
from reservation.models import Reservation, Room
from hotels.models import Hotel

class Customer(models.Model):
    full_name = models.CharField(max_length=200)
    nid = models.CharField(max_length=10,unique=True)
    emergency_contact = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='customers',default=None)  # کلید خارجی هتل

    def __str__(self):
        return self.full_name

class ReservationHistory(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('website', 'وبسایت-درگاه'),
        ('reservation', 'رزرواسیون-اعتباری'),
        ('marketplace', 'مارکت‌پلیس-اعتباری'),
        ('travelagency', 'آژانس-اعتباری'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reservation_history')
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='reservation_histories')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)

    @property
    def room(self):
        return self.reservation.room

    @property
    def check_in(self):
        return self.reservation.check_in

    @property
    def check_out(self):
        return self.reservation.check_out

    def save(self, *args, **kwargs):
        # اعتبارسنجی: مطمئن شوید که رزرو متعلق به همان مشتری است
        if self.reservation.customer != self.customer:
            raise ValueError("The reservation does not belong to this customer.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.customer.full_name} - Room {self.reservation.room.number} - {self.reservation.hotel.name}"
