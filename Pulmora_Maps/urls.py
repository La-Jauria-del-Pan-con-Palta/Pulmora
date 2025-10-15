from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

#differents urls where the user can be redirected
urlpatterns = [
    path('', views.index, name="index"),
    path("register/", views.register, name="register"),
    path("login/", auth_views.LoginView.as_view(template_name='pulmora/login.html'), name='login'),
    path("account/", views.account, name="account"),
    path('logout/', auth_views.LogoutView.as_view(next_page='index'), name='logout'),

    #News urls, to make the breadcrumb and move more easily between pages
    path('community/', views.community, name="community"),
    path('data/', views.data, name="data"),
    path('education/', views.education, name="education")
]