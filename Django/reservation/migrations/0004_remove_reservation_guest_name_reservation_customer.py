# Generated by Django 5.1.2 on 2024-11-09 19:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hotel_crm', '0003_remove_reservationhistory_check_in_and_more'),
        ('reservation', '0003_reservation_hotel_room_hotel'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reservation',
            name='guest_name',
        ),
        migrations.AddField(
            model_name='reservation',
            name='customer',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='hotel_crm.customer'),
            preserve_default=False,
        ),
    ]
