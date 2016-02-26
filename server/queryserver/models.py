from __future__ import unicode_literals

from django.db import models
from jsonfield import JSONField

# Create your models here.

class Soc(models.Model):
    url = models.CharField(max_length=256, default="")

class Session(models.Model):
    soc = models.ForeignKey(Soc)

class Video(models.Model):
    soc = models.ForeignKey(Soc)
    name = models.CharField(max_length=256)
    url = models.CharField(max_length=256)

class Query(models.Model):
    answer = models.BooleanField(default=False)
    comment = models.TextField()
    session = models.ForeignKey(Session)
    predicates = JSONField()

class Object(models.Model):
    label = models.CharField(max_length=256)
    session = models.ForeignKey(Session)
    color = models.CharField(max_length=10, default="#FF0000")

class Box(models.Model):
    object = models.ForeignKey(Object)
    session = models.ForeignKey(Session, default="")
    video = models.ForeignKey(Video)
    time = models.FloatField(default=0)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    xlen = models.FloatField(default=0)
    ylen = models.FloatField(default=0)
