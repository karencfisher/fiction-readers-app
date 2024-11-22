import traceback
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpRequest
from django.http import JsonResponse

# Create your views here.
def landing(req: HttpRequest):
    return render(req, 'landing/landing.html')
    
def sign_up(req: HttpRequest):
    try:
        user = User.objects.create_user(
            username=req.POST.get("username"),
            password=req.POST.get("password"),
            email=req.POST.get("email"),
            first_name=req.POST.get("first_name"),
            last_name=req.POST.get("last_name")
        )
        login(req, user)
        return JsonResponse({'success': 'logged in'})
    
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
        

def sign_in(req: HttpRequest):
    try:
        username = req.POST.get("username")
        password = req.POST.get("password")
        user = authenticate(req, username=username, password=password)
        if user is not None:
            login(req, user)
            return JsonResponse({'success': 'Logged in'})
        return JsonResponse({'error': 'Invalid Login'})
    
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    
def whoami(req: HttpRequest):
    try:
        if not req.user.is_authenticated:
            return JsonResponse({'isAuthenticated': False})
        return JsonResponse({'isAuthenticated': True, 
                            'user_id': req.user.id, 
                            'username': req.user.username})
        
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)

@login_required
def logout_view(req: HttpRequest):
    logout(req)
    return JsonResponse({"success": 'Logged out' })



