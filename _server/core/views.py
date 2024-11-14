import json
import os
import traceback
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render
from django.conf  import settings
from django.contrib.auth.decorators import login_required
from .models import Book, Author, Genre, Publisher

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

# @login_required
def search(req):
    try:
        method = req.GET['method']
        query = req.GET['query']
        if method == 'author':
            collection = Author.objects.get(author_name=query)
        elif method == 'genre':
            collection = Genre.objects.get(genre=query)
        elif method == 'publisher':
            collection = Publisher.objects.get(publisher_name=query)
        elif method == 'title':
            pass
        elif method == 'synopsis':
            pass
        else:
            raise KeyError(f'No such query method: {query}')
        
        # Organize results, get books and reviews
        shelf = []
        for item in collection.books():
            book = model_to_dict(item)
            book['reviews'] = [model_to_dict(review) for review in item.reviews()]
            shelf.append(book)
        return JsonResponse({'data': shelf})
    
    except (Genre.DoesNotExist, 
            Author.DoesNotExist, 
            Publisher.DoesNotExist):
        return JsonResponse({'error': f"{method} '{query}' is not found"}, status=404)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Invalid request'}, status=400)
