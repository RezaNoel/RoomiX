# reservation/models.py
from datetime import timedelta
from hotels.models import Hotel
from django.db import models

class RoomType(models.Model):
    type_name_fa = models.CharField(max_length=100)  # نام فارسی نوع اتاق
    type_name_en = models.CharField(max_length=100)  # نام انگلیسی نوع اتاق، در صورت نیاز

    def __str__(self):
        return self.type_name_fa

class Room(models.Model):
    MEAL_CHOICES = [
        ('breakfast', 'صبحانه'),
        ('half_board', 'هافبرد'),
        ('full_board', 'فولبرد'),
        ('all_inclusive', 'همه‌چیز شامل'),
    ]

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms', null=True)  # ارتباط با هتل
    number = models.CharField(max_length=10, unique=True)
    name_fa = models.CharField(max_length=100)
    room_type = models.ForeignKey(RoomType, on_delete=models.SET_NULL, null=True, related_name='rooms')
    base_price = models.DecimalField(max_digits=10, decimal_places=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=0, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    calculated_price = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True, editable=False)
    image = models.ImageField(upload_to='room_images/', blank=True, null=True)
    meal_plan = models.CharField(max_length=20, choices=MEAL_CHOICES, default='breakfast')
    bed_count = models.PositiveIntegerField(default=1)
    floor = models.PositiveIntegerField(default=1)
    is_available = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.discount_percentage and not self.discount_amount:
            self.discount_amount = (self.base_price * self.discount_percentage) / 100
        elif self.discount_amount and not self.discount_percentage:
            self.discount_percentage = (self.discount_amount / self.base_price) * 100

        self.calculated_price = self.base_price - self.discount_amount if self.discount_amount else self.base_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name_fa} - {self.room_type.type_name_fa} - Room {self.number} - {self.hotel}"

class RoomPricing(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='pricing')
    date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('room', 'date')

    def __str__(self):
        return f"Price for Room {self.room.number} on {self.date}: {self.price}"

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('PENDING_PAYMENT', 'منتظر پرداخت'),
        ('AWAITING_CHECKIN', 'منتظر ورود'),
        ('CURRENT_GUEST', 'مهمان فعلی'),
        ('CHECKED_OUT', 'خروج کرده'),
        ('CANCELLED', 'کنسل شده'),
    ]

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='reservations', null=True)  # ارتباط با هتل
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reservations')
    customer = models.ForeignKey('hotel_crm.Customer', on_delete=models.CASCADE, related_name='reservations')  # استفاده از نام مدل به عنوان رشته
    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_PAYMENT')  # فیلد وضعیت
    created_at = models.DateTimeField(auto_now_add=True)  # تاریخ ایجاد رکورد

    def calculate_total_price(self):
        total = 0
        current_date = self.check_in

        while current_date < self.check_out:
            room_pricing = RoomPricing.objects.filter(room=self.room, date=current_date).first()
            if room_pricing:
                total += room_pricing.price
            else:
                total += self.room.base_price
            current_date += timedelta(days=1)

        return total

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.calculate_total_price()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Reservation for {self.customer.full_name} in Room {self.room.number} in {self.hotel} - Status: {self.get_status_display()}"

class CancellationPolicy(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='policy', null=True)  # ارتباط با هتل
    policy = models.TextField()


    def __str__(self):
        return f"قوانین - {self.hotel}"
