from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns(
    'ironcat.views',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'index'),
    url(r'^create_function/', 'create_function'),
    url(r'^get_function/', 'get_function'),
    url(r'^delete_function/', 'delete_function'),
    url(r'^create_node/', 'create_node'),
    url(r'^delete_node/', 'delete_node'),
    url(r'^create_wire/', 'create_wire'),
    url(r'^delete_wire/', 'delete_wire'),
    url(r'^evaluate/', 'evaluate'),
    url(r'^contribute/', 'contribute'),
    url(r'^search/', 'search'),
)
