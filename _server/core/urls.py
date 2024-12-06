from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path('genres/', view=views.genres, name="genres"),
    path('completions/', view=views.completions, name="completions"),
    
    path('books/search/', view=views.books_search, name="books_search"),
    path('books/<int:id>/', view=views.book_id, name='book_id'),
    path('books/reader_logs', view=views.books_reader_logs, name="books_reader_logs"),
    path('books/genres', view=views.books_genre_samples, name='books_genre_samples'),
    path('books/new/', view=views.book_new, name='book_new'),
    path('books/google/', view=views.get_google_book_info, name='get_google_book_info'),
    
    path('reviews/<int:user_id>/<int:book_id>', view=views.review_id, name='review_id'),
    path('reviews/update/', view=views.review_update, name='review_update'),
    
    path('reader_logs/<int:user_id>/', view=views.reader_log_id, name='reader_log_id'),
    path('reader_logs/<int:user_id>/<int:book_id>/', view=views.reader_log_id_book_id, 
          name='reader_log_id_book_id'),
    path('reader_logs/update/', view=views.reader_log_update, name='reader_log_update')
]