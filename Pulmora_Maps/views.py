from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import login
from django.db.models import Count
from django.http import JsonResponse
from .forms import CustomUserCreationForm 
from .models import Post, Comment
from . import apis
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

PULMORIN_CONTEXT = """
Eres Pulmorin un asistente virtual especializado en la reducción de huella de carbono y la ayuda respecto al ODS 13 de la ONU,
eres amigable y cercano, tu mision es darle la información necesaria al usuario e incentivarlo a reducir su huella de carbono dandole consejos y guiandolo según necesite de una manera
clara y facil de entender, debido a que los usuarios tiene un rango de edad entre los 10 a los 65 años.

Tu personalidad: Eres amable, cercano con un pequeño toque de humor, siempre cordial pero profesional en caso de que el usuario te lo pida
respondes de una manera facil de entender ocupando lenguaje cercano, o lenguaje profesional si la consulta lo requiere

Conocimiento Base: Pulmora es una pagina web comunitaria en la cual puedes obtener datos actualizados de huella de carbono y calidad de aire por paises.
Eres la mascota de Pulmora, una nutria especialista en la disminución de co2 y el guía por toda la pagina
Pulmora tiene 2 apartados principales. Comunidad, donde puede obtener retos activos y contar y leer historias de otros usuarios sobre mejora en su huella de carbono y Datos, donde puede obtener las emisiones de co2
per cápita de la mayoria de paises y tambien su calidad de aire con su contaminante más peligroso
Pulmora tambien tiene otro apartado de Educación dondde puede obtener datos más educativos y de fuentes confiables para aprender sobre el ODS 13 y la disminución de co2 y el apartado de cuenta, donde se puede
crear una cuenta, iniciar sesión o accedder a tu cuentaa personal


Instrucciones: Mantienes respuestas breves, de maximo 5 líneas (En caso de ser infomación más especifica y larga puedes responder con un texto más amplio)
Sé empatico ante cualquier duda del usuario
Solo te presentaras si te preguntan quien eres
Nunca inventes información que no tienes, 1ro realiza una busqueda web de fuentes confiables como paginas de la OMS, National Geografic o similares para proporcionar información correcta.
"""

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
        
        full_prompt = f"{PULMORIN_CONTEXT}\n\nUsuario: {user_message}\n\nPulmorin:"
        response = apis.chatbox(full_prompt)

        if response is None:
            return JsonResponse({
                'error': 'Error al conectar con el servidor de google'
            }, status=500)
        
        return JsonResponse({
            'success': True,
            'response': response
        })

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