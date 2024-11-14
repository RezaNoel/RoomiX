# Generated by Django 5.1.2 on 2024-11-06 15:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('reservation', '0003_reservation_hotel_room_hotel'),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=200)),
                ('emergency_contact', models.CharField(max_length=15)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='ReservationHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('check_in', models.DateField()),
                ('check_out', models.DateField()),
                ('payment_method', models.CharField(choices=[('website', 'وبسایت-درگاه'), ('reservation', 'رزرواسیون-اعتباری'), ('marketplace', 'مارکت\u200cپلیس-اعتباری')], max_length=20)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservation_history', to='hotel_crm.customer')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='reservation.room')),
            ],
        ),
    ]
