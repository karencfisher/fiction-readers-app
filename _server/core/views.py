import json
import os
import traceback
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.shortcuts import render
from django.conf  import settings
from django.contrib.auth.decorators import login_required
from .models import Books, Authors, Genres, Publishers

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
            collection = Authors.objects.get(author_name=query)
        elif method == 'genre':
            collection = Genres.objects.get(genre=query)
        elif method == 'publisher':
            collection = Publishers.objects.get(publisher_name=query)
        elif method == 'title':
            pass
        elif method == 'synopsis':
            pass
        else:
            raise KeyError(f'No such query method: {query}')
        return JsonResponse(model_to_dict(collection.books()))
    except (Genres.DoesNotExist, 
            Authors.DoesNotExist, 
            Publishers.DoesNotExist):
        return JsonResponse({'error': f"{method} '{query}' is not found"}, status=404)
    except Exception as err:
        traceback.print_tb(err.__traceback__)
        print(err)
        return JsonResponse({'error': 'Invalid request'}, status=400)
