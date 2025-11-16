from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    class Meta:
        db_table = "publicaciones"
        ordering = ['-created_at']

    def __str__(self):
        return self.title
    
    @property
    def total_likes(self):
        return self.likes.count()
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='users_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)


    class Meta:
        db_table = "comentarios"
        ordering = ['-created_at']

    def __str__(self):
        return f'comentario por {self.author} en {self.post.title}'
    
    @property
    def total_likes(self):
        return self.likes.count()
    
class Retos(models.Model):
    TIPO_CHOICES = [
        ('permanente', 'Permanente'),
        ('temporal', 'Temporal'),
    ]

    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=200, choices=TIPO_CHOICES, default='permanente')
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    icono = models.CharField(max_length=50, default="🌱")
    activo = models.BooleanField(default=True)
    objetivo_sugerido = models.IntegerField(default=10)  # ← NUEVO CAMPO

    def __str__(self):
        return self.titulo
    
    class Meta:
        verbose_name_plural = "Retos"

class UsuarioReto(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    reto = models.ForeignKey(Retos, on_delete=models.CASCADE)
    progreso_actual = models.IntegerField(default=0)
    objetivo_total = models.IntegerField(default=1)
    fecha_inicio = models.DateTimeField(default=timezone.now)
    fecha_completado = models.DateTimeField(null=True, blank=True)
    completado = models.BooleanField(default=False)
    
    def porcentaje_progreso(self):
        if self.objetivo_total == 0:
            return 0
        return min(100, (self.progreso_actual / self.objetivo_total) * 100)
    
    def incrementar_progreso(self):
        self.progreso_actual += 1
        if self.progreso_actual >= self.objetivo_total:
            self.completado = True
            self.fecha_completado = timezone.now()
        self.save()
    
    class Meta:
        unique_together = ('usuario', 'reto')
        verbose_name_plural = "Retos de usuarios"

class Recompensa(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    icono = models.CharField(max_length=50, default="🏆")
    retos_requeridos = models.IntegerField()
    color = models.CharField(max_length=7, default="#4caf50")
    
    def __str__(self):
        return f"{self.icono} {self.nombre} ({self.retos_requeridos} retos)"
    
    class Meta:
        verbose_name_plural = "Recompensas"
        ordering = ['retos_requeridos']

class UsuarioRecompensa(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    recompensa = models.ForeignKey(Recompensa, on_delete=models.CASCADE)
    fecha_obtenida = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('usuario', 'recompensa')
        verbose_name_plural = "Recompensas de usuarios"