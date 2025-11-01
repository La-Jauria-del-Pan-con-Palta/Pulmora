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
    path('post/<int:post_id>/', views.post_details, name='post_detail'),
    path('data/', views.data, name="data"),
    path('education/', views.education, name="education"),

    #This urls are not for render a specific pages, are neccesary for the comment an likes funtion
    path('like-post/<int:post_id>/', views.like_post_view, name='like_post'),
    path('like-comment/<int:comment_id>/', views.like_comment_view, name='like_comment'),
]