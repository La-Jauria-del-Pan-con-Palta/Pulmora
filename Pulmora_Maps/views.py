from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import login
from django.db.models import Count
from django.http import JsonResponse
from .forms import CustomUserCreationForm 
from .models import Post, Comment
from . import apis, history
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

@csrf_exempt
@require_http_methods(["POST"])
def chatbox(request):
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()

        if not user_message:
            return JsonResponse({
                'error': 'El Mensaje debe tener contenido'
            }, status=400)

        user_session_id = history.session_id(request)
        conversation_history = history.create_history(user_session_id)
        full_prompt = history.history_prompt(conversation_history, user_message)
        response = apis.chatbox(full_prompt)

        if response is None:
            return JsonResponse({
                'error': 'Error al conectar con el servidor de Google'
            }, status=500)
        
        history.add_history(user_session_id, user_message, response)

        json_response = JsonResponse({
            'success': True,
            'response': response
        })

        if not request.user.is_authenticated:
            session_id_value = user_session_id.replace('anon_', '')
            json_response.set_cookie(
                'pulmorin_session_id',
                session_id_value,
                max_age=60*60*2,
                httponly=True,
                samesite='Lax'
            )
        
        return json_response

    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Formato JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'error': f'Error interno: {str(e)}'
        }, status=500)

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
    air_quality_data = apis.air_quality_cache()
    
    co2_data = apis.co2_emissions()

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