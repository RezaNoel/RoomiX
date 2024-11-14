# user_management/models.py
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'ادمین'),  # مدیر کل که به تمام هتل‌ها دسترسی دارد
        ('manager', 'مدیر هتل'),  # مدیر هتل که تنها به هتل خودش دسترسی دارد
        ('reservation', 'رزرواسیون'),  
        ('accounting', 'حسابدار'),  
        ('housekeeping', 'خانه دار'), 
        ('travelagency', 'آژانس هواپیمایی'),  

    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    hotel = models.ForeignKey('hotels.Hotel', on_delete=models.SET_NULL, null=True, related_name='staff', blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='reservation')  # نقش کاربر

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()} - {self.hotel}"

    # برای بررسی دسترسی کاربران
    def has_access_to_all_hotels(self):
        return self.role == 'admin'

    def has_access_to_own_hotel(self):
        return self.role == 'manager' or self.role == 'reservation'
    def get_role_display(self):
        return dict(self.ROLE_CHOICES).get(self.role, "نامشخص")

class UserCredit(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='credit')  # کلید خارجی به مدل UserProfile
    credit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # مقدار اعتبار

    def __str__(self):
        return f"{self.user_profile.user.username} - اعتبار: {self.credit} واحد"

    def add_credit(self, amount):
        """افزایش اعتبار کاربر"""
        self.credit += amount
        self.save()

    def deduct_credit(self, amount):
        """کاهش اعتبار کاربر (در صورت کافی بودن)"""
        if self.credit >= amount:
            self.credit -= amount
            self.save()
            return True
        return False

    def has_sufficient_credit(self, amount):
        """بررسی اینکه کاربر اعتبار کافی دارد یا خیر"""
        return self.credit >= amount
