from django.shortcuts import get_object_or_404
from .models import Retos, UsuarioReto, Recompensa, UsuarioRecompensa


class ChallengeService:
    
    @staticmethod
    def get_active(user=None, country=None):
        queryset = Retos.objects.filter(activo=True)
        
        if country:
            queryset = queryset.filter(pais__in=[country, None])
        
        return queryset.order_by('-fecha_inicio')
    
    @staticmethod
    def user_challenges(user):
        return UsuarioReto.objects.filter(
            usuario=user
        ).select_related('reto')
    
    @staticmethod
    def active_for_user(user):
        return UsuarioReto.objects.filter(
            usuario=user,
            completado=False
        ).select_related('reto')
    
    @staticmethod
    def completed_for_user(user):
        return UsuarioReto.objects.filter(
            usuario=user,
            completado=True
        ).select_related('reto')
    
    @staticmethod
    def count_completed(user):
        return UsuarioReto.objects.filter(
            usuario=user,
            completado=True
        ).count()
    
    @staticmethod
    def join(user, challenge_id, goal=10):
        challenge = get_object_or_404(Retos, id=challenge_id, activo=True)
        
        user_challenge, created = UsuarioReto.objects.get_or_create(
            usuario=user,
            reto=challenge,
            defaults={'objetivo_total': goal}
        )
        
        return user_challenge, created
    
    @staticmethod
    def update_progress(user_challenge_id, user):
        user_challenge = get_object_or_404(
            UsuarioReto, 
            id=user_challenge_id, 
            usuario=user
        )

        user_challenge.incrementar_progreso()
        
        return {
            'success': True,
            'progress': user_challenge.progreso_actual,
            'goal': user_challenge.objetivo_total,
            'percentage': user_challenge.porcentaje_progreso(),
            'completed': user_challenge.completado,
            'completed_date': user_challenge.fecha_completado
        }
    
    @staticmethod
    def abandon(user_challenge_id, user):
        user_challenge = get_object_or_404(
            UsuarioReto,
            id=user_challenge_id,
            usuario=user
        )
        user_challenge.delete()
        return True
    
    @staticmethod
    def is_user_in_challenge(user, challenge_id):
        return UsuarioReto.objects.filter(
            usuario=user,
            reto_id=challenge_id
        ).exists()

class RewardService:
    
    @staticmethod
    def get_all():
        return Recompensa.objects.all().order_by('retos_requeridos')
    
    @staticmethod
    def user_rewards(user):
        return UsuarioRecompensa.objects.filter(
            usuario=user
        ).select_related('recompensa').order_by('-fecha_obtenida')
    
    @staticmethod
    def check_and_grant(user, completed_count):
        available_rewards = Recompensa.objects.filter(
            retos_requeridos__lte=completed_count
        )
        
        earned_ids = UsuarioRecompensa.objects.filter(
            usuario=user
        ).values_list('recompensa_id', flat=True)
        
        new_rewards = []
        for reward in available_rewards:
            if reward.id not in earned_ids:
                UsuarioRecompensa.objects.create(
                    usuario=user,
                    recompensa=reward
                )
                new_rewards.append(reward)
        
        return new_rewards
    
    @staticmethod
    def next_reward_progress(user, completed_count):
        next_reward = Recompensa.objects.filter(
            retos_requeridos__gt=completed_count
        ).order_by('retos_requeridos').first()
        
        if not next_reward:
            return None
        
        return {
            'reward': next_reward,
            'current_progress': completed_count,
            'required_progress': next_reward.retos_requeridos,
            'remaining': next_reward.retos_requeridos - completed_count,
            'percentage': (completed_count / next_reward.retos_requeridos) * 100
        }
    
    @staticmethod
    def count_user_rewards(user):
        return UsuarioRecompensa.objects.filter(usuario=user).count()

def calculate_user_stats(user):
    completed_challenges = UsuarioReto.objects.filter(
        usuario=user,
        completado=True
    )
    
    return {
        'total_completed': completed_challenges.count(),
        'total_active': UsuarioReto.objects.filter(
            usuario=user,
            completado=False
        ).count(),
    }

def format_date_spanish(date):
    months = {
        1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
        5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto',
        9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
    }
    return f"{date.day} de {months[date.month]} de {date.year}"