from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path('books/search/', view=views.books_search, name="books_search"),
    path('books/<int:id>/', view=views.book_id, name='book_id'),
    path('books/reader_logs', view=views.books_reader_logs, name="books_reader_logs"),
    path('books/update/', view=views.book_update, name='book_update'),
    path('reviews/<int:id>/', view=views.review_id, name='review_id'),
    path('reviews/update/', view=views.review_update, name='review_update'),
    path('reader_logs/<int:user_id>/', view=views.reader_log_id, name='reader_log_id'),
    path('reader_logs/update/', view=views.reader_log_update, name='reader_log_update')
]