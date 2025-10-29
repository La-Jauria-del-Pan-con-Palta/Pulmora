from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm 
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from . import apis
from .models import Post
from django.db.models import Count

# Principal function, only render the main page
def index(request):
    return render(request, "pulmora/index.html")

# Create a new page, where the user can be create an account and save their data
def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('account')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'pulmora/register.html', {'form': form})


# Render the user account, only if their have an account in the db
@login_required
def account(request):
    return render(request, 'pulmora/account.html')

# Render the difference pages useful with a bredcrumb in all of there
def community(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            title = request.POST.get('post-title')
            content = request.POST.get('post-content')
        
        if title and content:
            Post.objects.create(author=request.user, title=title, content=content)
            return redirect('community')
        
    success_stories = Post.objects.all().order_by('-created_at')[:3]
    popular_stories = Post.objects.annotate(num_likes=Count('likes')).order_by('-num_likes', '-created_at')

    context = {
        'breadcrumb': [
            {
                'name': 'inicio', 
                'url': 'index'
             },
            {
                'name': 'comunidad',
                'url': None
            }
        ],

        'success_stories': success_stories,
        'popular_stories': popular_stories
    }
    return render(request, 'pulmora/community.html', context)


def data(request):
    countries= [
        #template of all countries {'name': '', 'code': '', 'lat': '', 'lon': ''}
        {'name': 'Chile', 'code': 'CL', 'lat': '-35.675147', 'lon': '-71.542969'}
    ]
    
    data = []
    for country in countries:
        aqi = apis.air_quality(country['lat'], country['lon'])
        co2 = apis.co2_emmissions(country['code'])

        data.append({
            'name': country['name'],
            'lat': country['lat'],
            'lon': country['lon'],
            'aqi': aqi,
            'co2': co2
        })

    context = {
        'data_maps': data,

        'breadcrumb': [
            {
                'name': 'inicio', 
                'url': 'index'
             },
            {
                'name': 'datos',
                'url': None
            }
        ]
    }
    return render(request, 'pulmora/data.html', context)

def education(request):
    context = {
        'breadcrumb': [
            {
                'name': 'inicio', 
                'url': 'index'
             },
            {
                'name': 'educación',
                'url': None
            }
        ]
    }
    return render(request, 'pulmora/education.html', context)