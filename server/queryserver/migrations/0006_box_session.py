# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-19 07:36
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('queryserver', '0005_auto_20160217_2110'),
    ]

    operations = [
        migrations.AddField(
            model_name='box',
            name='session',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='queryserver.Session'),
        ),
    ]
