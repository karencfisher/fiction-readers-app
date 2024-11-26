import traceback
import json
import re
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpRequest
from django.http import JsonResponse

# Create your views here.
def sign_up(req: HttpRequest):
    try:
        body = json.loads(req.body)
        
        # validate inputs
        validate_user_info(body)
        
        User.objects.create_user(
            username=body['username'],
            password=body['password'],
            email=body['email'],
            first_name=body['first_name'],
            last_name=body['last_name']
        )
        return JsonResponse({'success': 'success'})
    
    except ValueError as err:
        return JsonResponse({'error': str(err)}, status=400)
    except IntegrityError:
        return JsonResponse({'error': f"Username \"{body['username']}\" is already used"}, status=400)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
        

def sign_in(req: HttpRequest):
    try:
        body = json.loads(req.body)
        user = authenticate( 
            username=body['username'],
            password=body['password']
        )
        if user is not None:
            login(req, user)
            return JsonResponse({'success': 'Logged in'})
        return JsonResponse({'error': 'Invalid username and/or password'}, status=401)
    
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

### helpers ###
def validate_user_info(body):
    if len(body['username']) < 5:
        raise ValueError('Username must be at least 5 characters')
    
    # Validate email address
    pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if len(body['email']) == 0 or not re.search(pattern, body['email']):
        raise ValueError('Invalid email address')
    
    # Validate password requirements
    if len(body['password']) < 8 or not any(char.isdigit() for char in body['password']):
        raise ValueError('Passwords must contain minimum 8 characters including one number')
    

