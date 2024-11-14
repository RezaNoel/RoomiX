import uuid
from django.db import models

class Hotel(models.Model):
    HOTEL_TYPES = [
        ('apartment_hotel', 'هتل آپارتمان'),
        ('one_star', 'هتل 1 ستاره'),
        ('two_star', 'هتل 2 ستاره'),
        ('three_star', 'هتل 3 ستاره'),
        ('four_star', 'هتل 4 ستاره'),
        ('five_star', 'هتل 5 ستاره'),
        ('eco_lodge', 'بومگردی'),
        ('boutique_hotel', 'هتل بوتیک'),
        ('resort', 'مجتمع تفریحی'),
        ('motel', 'متل'),
        ('hostel', 'هاستل'),
    ]
    
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    manager = models.ForeignKey(
        'user_management.UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_hotels'
    )
    phone_number = models.CharField(max_length=20)
    hotel_type = models.CharField(max_length=20, choices=HOTEL_TYPES, default='one_star')
    unique_identifier = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # شناسه یکتا

    def __str__(self):
        return f"{self.get_hotel_type_display()} {self.name}"
    
    def get_hotel_type_persian(self):
        """بازگرداندن مقدار فارسی نوع هتل"""
        hotel_type_dict = dict(self.HOTEL_TYPES)
        return hotel_type_dict.get(self.hotel_type, "نامشخص")  # مقدار پیش‌فرض در صورت عدم تطابق

