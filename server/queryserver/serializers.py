from rest_framework import serializers
from queryserver.models import Session, Soc, Video, Query, Object, Box

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
	model = Session
	fields = ('id', 'soc')

class SocSerializer(serializers.ModelSerializer):
    class Meta:
        model = Soc
        fields = ('id', 'url')

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'soc', 'name', 'url')

class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ('id', 'session', 'answer', 'comment', 'predicates')

class ObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Object
        fields = ('id', 'session', 'label', 'color')

class BoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Box
        fields = ('id', 'session','object', 'video','time', 'x','y','xlen','ylen')
