from django.shortcuts import render, redirect, get_object_or_404
from .forms import CustomUserCreationForm 
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from . import apis
from .models import Post, Comment
from django.db.models import Count
from django.http import JsonResponse
import json

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
            return redirect('index')
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
        
    success_stories = Post.objects.annotate(num_likes=Count('likes')).order_by('-created_at')
    popular_stories = Post.objects.annotate(num_likes=Count('likes')).order_by('-num_likes', '-created_at')

    VISIBLE_STORIES_LIMIT = 3

    show_carousel = popular_stories.count() > VISIBLE_STORIES_LIMIT
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
        'popular_stories': popular_stories,
        'show_carousel': show_carousel
    }
    return render(request, 'pulmora/community.html', context)

def post_details(request, post_id):
    post = get_object_or_404(Post,pk=post_id)

    if request.method == 'POST':
        if request.user.is_authenticated:
            content = request.POST.get('comment-content')
            if content:
                Comment.objects.create(post=post, author=request.user, content=content)
                return redirect('post_detail', post_id=post.id)
            
    comments = post.comments.all()

    context = {
        'post': post,
        'comments': comments,
        'breadcrumb': [
            {'name': 'comunidad', 'url': 'community'},
            {'name': post.title, 'url': None}
        ]
    }
    return render(request, 'pulmora/post_detail.html', context)

@login_required
def like_post_view(request, post_id ):
    if request.method == 'POST':
        try:
            post = Post.objects.get(pk=post_id)
            user = request.user
            
            if user in post.likes.all():
                post.likes.remove(user)
                liked = False
            else:
                post.likes.add(user)
                liked = True
            
            return JsonResponse({'liked': liked, 'total_likes': post.total_likes})

        except Post.DoesNotExist:
            return JsonResponse({'error': 'El post no existe.'}, status=404)
    
    return JsonResponse({'error': 'Método no permitido.'}, status=405)

@login_required
def like_comment_view(request, comment_id):
    if request.method == 'POST':
        try:
            comment = Comment.objects.get(pk=comment_id)
            user = request.user
            
            if user in comment.likes.all():
                comment.likes.remove(user)
                liked = False
            else:
                comment.likes.add(user)
                liked = True
            
            return JsonResponse({'liked': liked, 'total_likes': comment.total_likes})

        except Comment.DoesNotExist:
            return JsonResponse({'error': 'El comentario no existe.'}, status=404)
    
    return JsonResponse({'error': 'Método no permitido.'}, status=405)

def data(request):
    countries = [
        # América del Sur
        {'name': 'Chile', 'code': 'CL', 'lat': '-35.675147', 'lon': '-71.542969'},
        {'name': 'Argentina', 'code': 'AR', 'lat': '-38.416097', 'lon': '-63.616672'},
        {'name': 'Brasil', 'code': 'BR', 'lat': '-14.235004', 'lon': '-51.925280'},
        {'name': 'Perú', 'code': 'PE', 'lat': '-9.189967', 'lon': '-75.015152'},
        {'name': 'Colombia', 'code': 'CO', 'lat': '4.570868', 'lon': '-74.297333'},
        {'name': 'Uruguay', 'code': 'UY', 'lat': '-32.522779', 'lon': '-55.765835'},
        
        # América del Norte
        {'name': 'Estados Unidos', 'code': 'US', 'lat': '37.09024', 'lon': '-95.712891'},
        {'name': 'México', 'code': 'MX', 'lat': '23.634501', 'lon': '-102.552784'},
        {'name': 'Canadá', 'code': 'CA', 'lat': '56.130366', 'lon': '-106.346771'},
        
        # Europa
        {'name': 'España', 'code': 'ES', 'lat': '40.463667', 'lon': '-3.74922'},
        {'name': 'Francia', 'code': 'FR', 'lat': '46.227638', 'lon': '2.213749'},
        {'name': 'Alemania', 'code': 'DE', 'lat': '51.165691', 'lon': '10.451526'},
        {'name': 'Reino Unido', 'code': 'GB', 'lat': '55.378051', 'lon': '-3.435973'},
        {'name': 'Italia', 'code': 'IT', 'lat': '41.871940', 'lon': '12.56738'},
        {'name': 'Países Bajos', 'code': 'NL', 'lat': '52.132633', 'lon': '5.291266'},
        {'name': 'Suecia', 'code': 'SE', 'lat': '60.128161', 'lon': '18.643501'},
        {'name': 'Noruega', 'code': 'NO', 'lat': '60.472024', 'lon': '8.468946'},
        
        # Asia
        {'name': 'China', 'code': 'CN', 'lat': '35.86166', 'lon': '104.195397'},
        {'name': 'India', 'code': 'IN', 'lat': '20.593684', 'lon': '78.96288'},
        {'name': 'Japón', 'code': 'JP', 'lat': '36.204824', 'lon': '138.252924'},
        {'name': 'Corea del Sur', 'code': 'KR', 'lat': '35.907757', 'lon': '127.766922'},
        {'name': 'Tailandia', 'code': 'TH', 'lat': '15.870032', 'lon': '100.992541'},
        {'name': 'Vietnam', 'code': 'VN', 'lat': '14.058324', 'lon': '108.277199'},
        
        # Oceanía
        {'name': 'Australia', 'code': 'AU', 'lat': '-25.274398', 'lon': '133.775136'},
        {'name': 'Nueva Zelanda', 'code': 'NZ', 'lat': '-40.900557', 'lon': '174.885971'},
        
        # África
        {'name': 'Sudáfrica', 'code': 'ZA', 'lat': '-30.559482', 'lon': '22.937506'},
        {'name': 'Egipto', 'code': 'EG', 'lat': '26.820553', 'lon': '30.802498'},
        {'name': 'Nigeria', 'code': 'NG', 'lat': '9.081999', 'lon': '8.675277'},
        {'name': 'Kenia', 'code': 'KE', 'lat': '-0.023559', 'lon': '37.906193'},
    ]
    
    air_quality_data = []
    for country in countries:
        aqi_data = apis.air_quality(country['lat'], country['lon'])
        air_quality_data.append({
            'name': country['name'],
            'code': country['code'],
            'lat': float(country['lat']),
            'lon': float(country['lon']),
            'aqi': aqi_data['aqi'] if aqi_data else None,
            'components': aqi_data['components'] if aqi_data else None
        })
    
    co2_data = apis.get_co2_emissions(countries)
    
    context = {
        'air_quality_data': json.dumps(air_quality_data),
        'co2_data': json.dumps(co2_data),
        'breadcrumb': [
            {'name': 'inicio', 'url': 'index'},
            {'name': 'datos', 'url': None}
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