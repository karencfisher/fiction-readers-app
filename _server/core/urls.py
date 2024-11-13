from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path('books/search/', view=views.search, name="search"),
]