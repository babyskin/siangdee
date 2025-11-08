# Import 'path' and 'view' for define and access to the URL
from django.urls import path
from . import views

urlpatterns = [
        path('transcribe/', views.transcribe_and_translate, name='transcribe'),
        ]
