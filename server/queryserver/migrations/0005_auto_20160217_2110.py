# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-17 21:10
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('queryserver', '0004_auto_20160212_0229'),
    ]

    operations = [
        migrations.AlterField(
            model_name='box',
            name='time',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='box',
            name='x',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='box',
            name='xlen',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='box',
            name='y',
            field=models.FloatField(default=0),
        ),
        migrations.AlterField(
            model_name='box',
            name='ylen',
            field=models.FloatField(default=0),
        ),
    ]
