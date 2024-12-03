from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from core.models import Book, BookIndex, Genre
from tqdm import tqdm
from sentence_transformers import SentenceTransformer


class Command(BaseCommand):
    help = "Create embeddings of book infomration for vector search"
    
    def handle(self, *args, **options):
        self.stdout.write("This command will index books for vector search")
        accept = input("Do you want to proceed? [Yes/No] ")
        if not accept.lower() in ['yes', 'y']:
            return
        
        # fetch all the books
        books = list(Book.objects.all().values('id', 'title', 'synopsis', 'genre'))
        
        # embed titles and synopsis and store in BookIndex
        model = SentenceTransformer('all-MiniLM-L6-v2')
        BookIndex.objects.all().delete()
        print("Embedding book information...")
        for book_data in tqdm(books):
            embedding = model.encode(f"{book_data['title']} {book_data['synopsis']}")
            book = BookIndex(
                book_id=book_data['id'], 
                embedding=embedding.tolist(), 
                genre=Genre.objects.get(id=int(book_data['genre']))
            )
            book.save()
        print("Done!")
            
        