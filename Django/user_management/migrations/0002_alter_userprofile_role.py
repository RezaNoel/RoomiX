# Generated by Django 5.1.2 on 2024-11-09 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_management', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='role',
            field=models.CharField(choices=[('admin', 'ادمین'), ('manager', 'مدیر هتل'), ('reservation', 'رزرواسیون'), ('accounting', 'حسابدار'), ('housekeeping', 'خانه دار')], default='reservation', max_length=50),
        ),
    ]
