from django.conf.urls import url, patterns
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
import queryserver.views as qv

urlpatterns = [ 
    url(r'^api/query/$', qv.query_list),
    url(r'^api/query/(?P<pk>[0-9]+)/$', qv.query_detail),

    url(r'^api/session/$', qv.session_list),
    url(r'^api/session/(?P<pk>[0-9]+)/$', qv.session_detail),
    url(r'^api/session/(?P<sessionId>[0-9]+)/object/$', qv.objects_with_sessionid),
    url(r'^api/session/(?P<sessionId>[0-9]+)/query/$', qv.queries_with_sessionid),
    url(r'^api/session/(?P<sessionId>[0-9]+)/object/(?P<objectId>[0-9]+)/video/(?P<videoId>[0-9]+)/box/(?P<boxId>[0-9]+)$', qv.box_update),
    url(r'^api/session/(?P<sessionId>[0-9]+)/object/(?P<objectId>[0-9]+)/video/(?P<videoId>[0-9]+)/box/$', qv.box_controller),

    url(r'^api/soc/$', qv.soc_list),
    url(r'^api/soc/(?P<pk>[0-9]+)/$', qv.soc_detail),
    url(r'^api/soc/(?P<socId>[0-9]+)/video/$', qv.videos_with_socid),

    url(r'^api/video/$', qv.video_list),
    url(r'^api/video/(?P<pk>[0-9]+)/$', qv.video_detail),

    url(r'^api/object/$', qv.object_list),
    url(r'^api/object/(?P<pk>[0-9]+)/$', qv.object_detail),

    url(r'^api/box/$', qv.box_list),
    url(r'^api/box/(?P<pk>[0-9]+)/$', qv.box_detail),

    url(r'^api/updatepredicates/(?P<queryId>[0-9]+)/$', qv.update_predicates_with_queryid),
    url(r'^api/updateanswer/(?P<queryId>[0-9]+)/$', qv.update_answer_with_queryid),
    url(r'^api/updatecomment/(?P<queryId>[0-9]+)/$', qv.update_comment_with_queryid),

    url(r'^index/$', qv.home),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
