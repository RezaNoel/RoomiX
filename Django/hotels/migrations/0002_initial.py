# Generated by Django 5.1.2 on 2024-11-05 17:43

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('hotels', '0001_initial'),
        ('user_management', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='hotel',
            name='manager',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='managed_hotels', to='user_management.userprofile'),
        ),
    ]
