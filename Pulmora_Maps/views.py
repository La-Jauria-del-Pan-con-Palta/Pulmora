from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login

#principal function, only render the main page
def index(request):
    return render(request, "pulmora/index.html")

#Create a new page, where the user can be create an account and save their data
def register(request):
    if request.method == "POST":

        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()

            return redirect('index')
    else:
        form = UserCreationForm()
    
    return render(request, 'pulmora/register.html', {'form': form})


#Render the user account, only if their have an account in the db
@login_required
def account(request):
    return(request, 'pulmora/account.html')

#Render the communiry page
def community(request):
    return(request, 'pulmora/community.html')