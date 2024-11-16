import json
import os
import traceback
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render
from django.conf  import settings
from django.contrib.auth.decorators import login_required
from .models import *

# Load manifest when server launches
MANIFEST = {}
if not settings.DEBUG:
    f = open(f"{settings.BASE_DIR}/core/static/manifest.json")
    MANIFEST = json.load(f)

# Create your views here.
@login_required
def index(req):
    context = {
        "asset_url": os.environ.get("ASSET_URL", ""),
        "debug": settings.DEBUG,
        "manifest": MANIFEST,
        "js_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["file"],
        "css_file": "" if settings.DEBUG else MANIFEST["src/main.ts"]["css"][0]
    }
    return render(req, "core/index.html", context)

def books_reader_logs(req):
    ''' Search books for reader_logs (can be public) '''
    try:
        results = Book.objects.filter(reader_log__isnull=False)\
            .distinct().values('id', 'title', 'cover_link')
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    return JsonResponse({'data': list(results)})

@login_required
def books_search(req):
    ''' Search books by criteria '''
    try:
        method = req.GET['method']
        query = req.GET['query']
        if method == 'author':
            collection = Book.objects.filter(author__author_name=query)\
                .values('id', 'title', 'cover_link')
        elif method == 'genre':
            collection = Book.objects.filter(genre__genre=query)\
                .values('id', 'title', 'cover_link')
        elif method == 'publisher':
            collection = Book.objects.filter(publisher__publisher_name=query)\
                .values('id', 'title', 'cover_link')
        elif method == 'title':
            pass
        elif method == 'synopsis':
            pass
        else:
            raise KeyError(f'No such query method: {query}')
        if not collection:
            return JsonResponse({'error': f"No data found for '{method}: {query}'"}, status=404)
        return JsonResponse({'data': list(collection)})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def book_id(req, id):
    ''' Get complete book, including reviews '''
    try:
        book_obj = Book.objects.get(id=id)
        book = Book.objects.filter(id=id).values(
            'id',
            'year_published',
            'title',
            'synopsis',
            'info_link',
            'average_rating',
            'cover_link',
            'author__author_name',
            'publisher__publisher_name',
            'genre__genre'
        )[0]
        book['reviews'] = [review for review in list(book_obj.reviews())]
        return JsonResponse(book)
    except Book.DoesNotExist:
        return JsonResponse({'error': f"Book with id '{id}' not found"}, status=404)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    
@login_required
def book_update(req):
    ''' Add a book by user '''
    pass

@login_required
def review_id(req, id):
    ''' Get review by id, including user name, author, and title '''
    try:
        review = Review.objects.filter(id=id).select_related('book__author', 'user').values(
            'id', 
            'user__username', 
            'book__author__author_name', 
            'book__title', 
            'review', 
            'rating'
        )[0]
        return JsonResponse(review)
    except IndexError:
        return JsonResponse({'error': f"Review with id '{id}' not found"}, status=404)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    
@login_required
def review_update(req):
    ''' Update a new or edited review '''
    pass

@login_required
def reader_log_id(req, user_id):
    ''' Get reader log by user id, including book '''
    try:
        shelf = ReaderLog.objects.filter(user=user_id).select_related('book__title').values(
            'user_id',
            'book_id',
            'status',
            'book__title',
            'book__author__author_name',
            'book__review',
            'book__cover_link'
        )
        if not shelf:
            return JsonResponse({'error': f"ReaderLog with id '{user_id}' not found"}, status=404)
        return JsonResponse({'data': list(shelf)})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)

@login_required
def reader_log_update(req):
    ''' Update or create reader log entry '''
    pass
    