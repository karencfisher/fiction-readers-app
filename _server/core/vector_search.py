import json
from sklearn.neighbors import NearestNeighbors
from .models import Book, BookIndex


class VectorSearch:
    def __init__(self, n_results):
        self.knn = NearestNeighbors(n_neighbors=n_results, metric='cosine')
        
        book_index = list(BookIndex.objects.all().values('book_id', 'embedding'))
        embeddings = [book['embedding'] for book in book_index]
        self.knn.fit(embeddings)
        
    def search_similar(self, book_id):
        book = BookIndex.objects.filter(book_id=book_id).values('embedding')[0]
        embedding = book['embedding']
        distances, indices = self.knn.kneighbors([embedding])
        
        similar_books = []
        for index in indices[0]:
            similar_book = Book.objects.filter(id=index).values('id', 'title', 'cover_link')[0]
            similar_books.append(similar_book)
        return similar_books
        