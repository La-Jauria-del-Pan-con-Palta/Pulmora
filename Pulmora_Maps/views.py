from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm 
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login

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
        ]
    }
    return render(request, 'pulmora/community.html', context)


def data(request):
    context = {
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