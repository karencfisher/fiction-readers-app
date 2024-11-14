from django.core.management.base import BaseCommand, CommandError
from core.models import *
import os

class Command(BaseCommand):
    help = "Load database with sample data"
    base_path = '../data'
    
    def handle(self, *args, **options):
        # Genres
        self.__load_table(Genres, 'genres.csv')
        
    def __load_table(self, model, path):
        fields = model._meta.get_fields()
        for field in fields:
            print(field.name, type(field))    

