from django.urls import path
from . import views

urlpatterns = [
    path('', view=views.index, name="index"),
    path('books/search/', view=views.books_search, name="books_search"),
    path('books/<int:id>/', view=views.book_id, name='book_id'),
    path('books/reader_logs', view=views.books_reader_logs, name="books_reader_logs"),
    path('reviews/<int:id>/', view=views.review_id, name='review_id'),
]