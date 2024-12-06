import json
import os
import random
import json
import traceback
import requests
from math import ceil
from dotenv import load_dotenv
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.db.utils import IntegrityError
from django.db.models import F
from django.contrib.auth.decorators import login_required
from .vector_search import VectorSearch, add_book
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
        page = req.GET.get('page')
        results = Book.objects.filter(reader_log__isnull=False)\
            .distinct().values('id', 'title', 'cover_link')
        random_books = random.sample(list(results), 20)
        if page is not None:
            num_pages = ceil(len(random_books) / 12)
            paginator = Paginator(random_books, 12)
            page_obj = paginator.get_page(page)
            return JsonResponse({'data': list(page_obj), 
                                 'page': page,
                                 'num_pages': num_pages})
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
def genres(req):
    try:
        result = Genre.objects.all().values('genre')
        genres = [item['genre'] for item in result]
        return JsonResponse({'data': genres})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    
@login_required
def completions(req):
    try:
        field = req.GET['field']
        query = req.GET['query']
        if field == 'title':
            suggestions = Book.objects.filter(title__istartswith=query)\
                .annotate(suggestion = F('title'))\
                .values('suggestion')[:5]
        elif field == 'author':
            suggestions = Author.objects.filter(author_name__istartswith=query)\
                .annotate(suggestion = F('author_name'))\
                .values('suggestion')[:5]
        return JsonResponse({'data': list(suggestions)})
    
    except KeyError:
        return JsonResponse({'error': 'Invalid request'}, status=400)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
   
@login_required
def books_search(req):
    ''' Search books by criteria '''
    try:
        method = req.GET['method']
        query = req.GET['query']
        if method == 'author':
            collection = Book.objects.filter(author__author_name__istartswith=query)\
                .values('id', 'title', 'cover_link')
        elif method == 'genre':
            collection = Book.objects.filter(genre__genre=query)\
                .values('id', 'title', 'cover_link')
        elif method == 'title':
            collection = Book.objects.filter(title__istartswith=query)\
                .values('id', 'title', 'cover_link')
        elif method == 'similarity':
            genre = req.GET.get('genre')
            countBooks = Book.objects.filter(genre__genre=genre).count()
            if countBooks < 37:
                genre=None
            vector_search = VectorSearch(n_results=37, genre_name=genre)
            collection = vector_search.search_similar(int(query))
        else:
            raise KeyError(f'No such query method: {query}')
        
        num_pages = ceil(len(collection) / 12)
        paginator = Paginator(collection, 12)
        page_number = req.GET.get('page')
        page_obj = paginator.get_page(page_number)
        return JsonResponse({'data': list(page_obj), 
                             'page': page_number, 
                             'num_pages': num_pages})
    
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
        book_info = json.loads(req.body)
        
        # Genre should be in existing list, but new author and publisher can be added
        genre = book_info['genre']
        book_info['genre'] = Genre.objects.get(genre=genre)
        book_info['author'], _ = Author.objects.get_or_create(author_name=book_info['author'])
        book_info['publisher'], _ = Publisher.objects.get_or_create(publisher_name=book_info['publisher'])
        new_book = Book.objects.create(**book_info)
        new_book.save()
        
        add_book(new_book.id, book_info['title'], book_info['synopsis'], genre)
        return JsonResponse({'success': 'Book added'})
    
    except IntegrityError:
        return JsonResponse({'error': f"This edition of '{book_info['title']}' already exists"}, status=400)
    except Genre.DoesNotExist:
        return JsonResponse({'error': f"Invalid genre '{book_info['genre']}'"})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)

@login_required
def review_id(req, user_id, book_id):
    ''' Get review by id, including user name, author, and title '''
    try:
        review = Review.objects.filter(book=book_id, user=user_id).select_related('book__author', 'user')\
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
            )
        return JsonResponse({'data': list(review)})
    
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
        review_info = json.loads(req.body)
        if (review_info['user'] != req.user.id):
            return JsonResponse({'error': 'Denied'}, status=403)
        review_info['user'] = User.objects.get(id=review_info['user'])
        review_info['book'] = Book.objects.get(id=review_info['book'])
        review_info['rating'] = int(review_info['rating'])
        new_review, created = Review.objects.update_or_create(
             user=review_info['user'],
             book=review_info['book'],
             defaults=review_info                                                 
        )
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
        status = ReaderLog.objects.filter(user=user_id, book_id=book_id).values('status')
        return JsonResponse({'data': list(status)})
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)    

@login_required
def reader_log_update(req):
    ''' Update or create reader log entry '''
    try:
        log_info = json.loads(req.body)
        if (log_info['user'] != req.user.id):
            return JsonResponse({'error': 'Denied'}, status=403)
        log_info['user'] = User.objects.get(id=log_info['user'])
        log_info['book'] = Book.objects.get(id=log_info['book'])
        new_log, created = ReaderLog.objects.update_or_create(
             user=log_info['user'],
             book=log_info['book'],
             defaults=log_info                                                 
        )
        new_log.save()
        action = 'Log entry created' if created else 'Log entry updated'
        return JsonResponse({'sucess': action})
        
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book is not in database'})    
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)

@login_required
def get_google_book_info(req):
    try:
        title = req.GET['title']
        author = req.GET['author']
        publisher = req.GET['publisher']
        url = 'https://www.googleapis.com/books/v1/volumes?'
        load_dotenv()
        key = os.getenv('GOOGLE_API_KEY')
        query = {'q': f'intitle:"{title}"inauthor:{author}"inpublisher:"{publisher}"', 'key': key}
        results = requests.get(url, params=query)
        books = results.json()
        if books['totalItems'] == 0:
            return JsonResponse({'error': 'edition is not found'}, status=404)
        return JsonResponse(books['items'][0]['volumeInfo'])
    
    except KeyError:
        return JsonResponse({'error': 'missing parameter'}, status=400)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Server error'}, status=500)
    