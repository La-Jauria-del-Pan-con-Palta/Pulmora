from django.contrib import admin
from .models import Retos, UsuarioReto, Recompensa, UsuarioRecompensa

@admin.register(Retos)
class RetosAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'icono', 'activo')
    list_filter = ('tipo', 'activo')
    search_fields = ('titulo', 'descripcion')
    list_editable = ('activo',)

@admin.register(Recompensa)
class RecompensaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'icono', 'retos_requeridos', 'color')
    ordering = ('retos_requeridos',)

admin.site.register(UsuarioReto)
admin.site.register(UsuarioRecompensa)

#Admin data: username: Tatsu | Password: 89ha,121