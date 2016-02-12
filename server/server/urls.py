"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^api/$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^api/$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^api/blog/', include('blog.urls'))
"""
from django.conf.urls import url, patterns
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

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
    url(r'^api/querieswithsessionid/(?P<sessionId>[0-9]+)/$', 'queries_with_sessionid'),
    url(r'^api/videoswithsocid/(?P<socId>[0-9]+)/$', 'videos_with_socid'),
    url(r'^api/objectswithsessionid/(?P<sessionId>[0-9]+)/$', 'objects_with_sessionid'),
    url(r'^api/boxeswithsessionid/(?P<sessionId>[0-9]+)/$', 'boxes_with_sessionid'),   
    url(r'^api/updatepredicates/(?P<queryId>[0-9]+)/$', 'update_predicates_with_queryid'),
    url(r'^api/updateanswer/(?P<queryId>[0-9]+)/$', 'update_answer_with_queryid'),
    url(r'^api/updatecomment/(?P<queryId>[0-9]+)/$', 'update_comment_with_queryid'),
    url(r'^index/$', 'home'),
) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
