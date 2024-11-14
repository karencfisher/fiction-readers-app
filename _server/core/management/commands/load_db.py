from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.apps import apps
from django.db import connection
from core.models import *
from tqdm import tqdm
import json
import csv


class Command(BaseCommand):
    help = "Load database with sample data"
    
    def handle(self, *args, **options):
        self.stdout.write("This command will reinitialize the database to the sample data.")
        self.stdout.write("Any other data will be lost!")
        accept = input("Do you want to proceed? [Yes/No] ")
        if not accept.lower() in ['yes', 'y']:
            return
        
        # Create users
        self.stdout.write("Loading sample users...")
        with open('../data/users.json') as FILE:
            users = json.load(FILE)
            
        # Reinitialize User table
        User.objects.all().delete()
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='auth_user';")
            
        for user in tqdm(users):
            User.objects.create_user(**user)
        
        # Load tables
        model_list = apps.get_models()
        model_dict = {model.__name__: model for model in model_list}
        
        # Have to be in specific order to handle table dependencies
        model_names = ['Author', 'Genre', 'Publisher', 'Book', 'Review', 'ReaderLog']
        for model_name in model_names:
            self.stdout.write(f'Loading {model_name} table...')
            model = model_dict[model_name]
            
            # Reinitialize the table
            model.objects.all().delete()
            with connection.cursor() as cursor:
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='core_{model_name.lower()}';")
                
            # Fetch data
            rows = []
            with open(f'../data/{model_name}.csv') as FILE:
                csv_reader = csv.DictReader(FILE)
                for row in csv_reader:
                    rows.append(row)
                    
            # Populate table
            for row in tqdm(rows):   
                data = {}
                
                # Differentiate between foreign keys and regular values
                for key, value in row.items():
                    if "_" in key:
                        name, suffix = key.split('_')
                        if suffix == 'id':
                            data[name] = model_dict[name.capitalize()].objects.get(id=int(value))
                        else:
                            data[key] = value
                    else:
                        data[key] = value        
                
                # Add to model
                model.objects.create(**data)
        self.stdout.write('Complete!')    

              
            

