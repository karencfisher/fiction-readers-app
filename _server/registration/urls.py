from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.get_csrf),
    path('sign_in/', views.sign_in),
    path('sign_up/', views.sign_up),
    path('logout/', views.logout_view),
    path('whoami/', views.whoami),
    path('denied/', views.denied)
]