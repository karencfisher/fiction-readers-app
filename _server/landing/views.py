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
    if req.method == "POST":
        user = User.objects.create_user(
            username=req.POST.get("username"),
            password=req.POST.get("password"),
            email=req.POST.get("email"),
            first_name=req.POST.get("first_name"),
            last_name=req.POST.get("last_name")
        )
        login(req, user)
        return redirect("/")
    else:
        return render(req, "landing/landing.html")

def sign_in(req: HttpRequest):
    if req.method == "POST":
        username = req.POST.get("username")
        password = req.POST.get("password")
        user = authenticate(req, username=username, password=password)
        if user is not None:
            login(req, user)
            return redirect("/")
        context = {'message': 'Invalid login', 'username': username, 
                   'password': password}
        return render(req, "landing/landing.html", context, status=401)
    else:
        return render(req, "landing/landing.html")
    
def whoami(req: HttpRequest):
    if not req.user.is_authenticated:
        return JsonResponse({'isAuthenticated': False})
    return JsonResponse({'isAuthenticated': True, 
                         'user_id': req.user.id, 
                         'username': req.user.username})

@login_required
def logout_view(req: HttpRequest):
    logout(req)
    return JsonResponse({"success": True })



