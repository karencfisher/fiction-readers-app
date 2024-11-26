import json
import os
import random
import traceback
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.db.utils import IntegrityError
from django.db.models import F
from django.contrib.auth.decorators import login_required
from .models import *

# Load manifest when server launches
MANIFEST = {}
if not settings.DEBUG:
    f = open(f"{settings.BASE_DIR}/core/static/manifest.json")
    MANIFEST = json.load(f)
    

### Routes not requiring authentication (for landing page) ###
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
    ''' Get random sample of books for reader_logs (for landing page) '''
    try:
        results = Book.objects.filter(reader_log__isnull=False)\
            .distinct().annotate(book_id = F('id')).values('book_id', 'title', 'cover_link')
        random_books = random.sample(list(results), 20)
        return JsonResponse({'data': random_books})
            
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    
def books_genre_samples(req):
    ''' Get books from two selected genres (for landing page) '''
    try:
        genres = Genre.objects.all().values('genre')
        selected_genres = random.sample(list(genres), 2)
        shelves = []
        for genre in selected_genres:
            collection = Book.objects.filter(genre__genre=genre['genre'])\
                    .annotate(book_id = F('id')).values('book_id', 'title', 'cover_link')[:20]
            shelves.append({'genre': genre['genre'], 'books': list(collection)})
        return JsonResponse({'data': shelves})
    
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)


### Routes requiring authentication ###    
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
        book = Book.objects.filter(id=id).annotate(
                author_name = F('author__author_name'),
                publisher_name = F('publisher__publisher_name'),
                genre_name = F('genre__genre')
            ).values(
                'id',
                'year_published',
                'title',
                'synopsis',
                'info_link',
                'average_rating',
                'cover_link',
                'author_name',
                'publisher_name',
                'genre_name'
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
def book_new(req):
    ''' Add a book by user '''
    try:
        book_info = req.POST.dict()
        
        # Genre should be in existing list, but new author and publisher can be added
        book_info['genre'] = Genre.objects.get(genre=book_info['genre'])
        book_info['author'], _ = Author.objects.get_or_create(author_name=book_info['author'])
        book_info['publisher'], _ = Publisher.objects.get_or_create(publisher_name=book_info['publisher'])
        new_book = Book.objects.create(**book_info)
        new_book.save()
        return JsonResponse({'success': 'Book added'}, status=201)
    
    except IntegrityError:
        return JsonResponse({'error': f"This edition of '{book_info['title']}' already exists"}, status=400)
    except Genre.DoesNotExist:
        return JsonResponse({'error': f"Invalid genre '{book_info['genre']}'"})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)

@login_required
def review_id(req, id):
    ''' Get review by id, including user name, author, and title '''
    try:
        review = Review.objects.filter(id=id).select_related('book__author', 'user')\
            .annotate(username=F('user__username'), 
                author = F('book__author__author_name'),
                title = F('book__title')
            ).values(
                'id',
                'username',
                'author',
                'title',
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
    ''' Create or update a review '''
    try:
        review_info = req.POST.dict()
        if (review_info['user_id'] != req.user.id):
            return JsonResponse({'error': 'Denied'}, status=403)
        review_info['user'] = User.objects.get(id=review_info['user_id'])
        review_info['book'] = Book.objects.get(id=review_info['book'])
        new_review, created = Review.objects.update_or_create(**review_info)
        new_review.save()
        action = 'Review created' if created else 'Review updated'
        return JsonResponse({'success': action})
    
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book is not in database'})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)

@login_required
def reader_log_id(req, user_id):
    ''' Get reader log by user id, including book '''
    # Only get user's log
    if (req.user.id != user_id):
        return JsonResponse({'Error': 'Denied'}, status=403)
    try:
        shelf = ReaderLog.objects.filter(user=user_id).select_related('book__title')\
            .annotate(
                title = F('book__title'),
                author = F('book__author__author_name'),
                cover_link = F('book__cover_link')
            ).values(
                'user_id',
                'book_id',
                'status',
                'title',
                'author',
                'cover_link'
            )
        if not shelf:
            return JsonResponse({'error': f"ReaderLog with id '{user_id}' not found"}, status=404)
        return JsonResponse({'data': list(shelf)})
    
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    
@login_required
def reader_log_id_book_id(req, user_id, book_id):
    if (req.user.id != user_id):
        return JsonResponse({'Error': 'Denied'}, status=403)
    try:
        status = ReaderLog.objects.filter(user=user_id, book_id=book_id).values('status')[0]
        return JsonResponse(status)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)    

@login_required
def reader_log_update(req):
    ''' Update or create reader log entry '''
    try:
        log_info = req.POST.dict()
        if (log_info['uesr_id'] != req.user.id):
            return JsonResponse({'error': 'Denied'}, status=403)
        log_info['user'] = User.objects.get(id=log_info['user_id'])
        log_info['book'] = Book.objects.get(id=log_info['book'])
        new_log, created = ReaderLog.objects.update_or_create(**log_info)
        new_log.save()
        action = 'Log entry created' if created else 'Log entry updated'
        return JsonResponse({'sucess': action})
        
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book is not in database'})    
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
