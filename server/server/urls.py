"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, patterns
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
import os

urlpatterns = patterns('queryserver.views',
    url(r'^api/query/$', 'query_list'),
    url(r'^api/session/$', 'session_list'),
    url(r'^api/soc/$', 'soc_list'),
    url(r'^api/video/$', 'video_list'),
    url(r'^api/object/$', 'object_list'),
    url(r'^api/box/$', 'box_list'),
    url(r'^api/session/(?P<pk>[0-9]+)/$', 'session_detail'),
    url(r'^api/soc/(?P<pk>[0-9]+)/$', 'soc_detail'),
    url(r'^api/video/(?P<pk>[0-9]+)/$', 'video_detail'),
    url(r'^api/query/(?P<pk>[0-9]+)/$', 'query_detail'),
    url(r'^api/object/(?P<pk>[0-9]+)/$', 'object_detail'),
    url(r'^api/box/(?P<pk>[0-9]+)/$', 'box_detail'),
    url(r'^api/querieswithsessionid/(?P<sessionid>[0-9]+)/$', 'queries_with_sessionid'),
    url(r'^api/videoswithsocid/(?P<socid>[0-9]+)/$', 'videos_with_socid'),
    url(r'^api/updatepredicates/(?P<queryid>[0-9]+)/$', 'update_predicates_with_queryid'),
    url(r'^api/updateanswer/(?P<queryid>[0-9]+)/$', 'update_answer_with_queryid'),
    url(r'^api/updatecomment/(?P<queryid>[0-9]+)/$', 'update_comment_with_queryid'),
    url(r'^api/updateboxinfo/(?P<boxid>[0-9]+)/$', 'update_boxinfo_with_boxid'),
    url(r'^index/$', 'home'),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

