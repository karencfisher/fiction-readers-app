import json
from sklearn.neighbors import NearestNeighbors
from sentence_transformers import SentenceTransformer
from .models import Book, BookIndex, Genre


class VectorSearch:
    def __init__(self, n_results, genre_name=None):
        self.knn = NearestNeighbors(n_neighbors=n_results, metric='cosine')
        if genre_name is None:
            self.book_index = list(BookIndex.objects.all().values('book_id', 'embedding'))
        else:
            genre = Genre.objects.get(genre=genre_name)
            self.book_index = list(BookIndex.objects.filter(genre=genre).values('book_id', 'embedding'))
        embeddings = [book['embedding'] for book in self.book_index]
        self.knn.fit(embeddings)
        
    def search_similar(self, book_id):
        book = BookIndex.objects.filter(book_id=book_id).values('embedding')[0]
        embedding = book['embedding']
        _, indices = self.knn.kneighbors([embedding])
        
        similar_books = []
        for index in indices[0]:
            similar_book = Book.objects.filter(id=self.book_index[index]['book_id'])\
                .values('id', 'title', 'cover_link')[0]
            similar_books.append(similar_book)
        return similar_books[1:]
    
def add_book(book_id, title, synopsis, genre):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embedding = model.encode(f"{title} {synopsis}")
    book = BookIndex(
        book_id=book_id, 
        embedding=embedding.tolist(), 
        genre=Genre.objects.get(genre=genre)
    )
    book.save()
