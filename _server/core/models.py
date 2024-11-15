from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User


# Create your models here.
class Book(models.Model):
    id = models.BigAutoField(primary_key=True)
    year_published = models.IntegerField()
    title = models.CharField(max_length=100)
    synopsis = models.TextField()
    info_link = models.CharField(max_length=100)
    average_rating = models.IntegerField(default=0)
    cover_link= models.CharField(max_length=100)
    author = models.ForeignKey('Author', on_delete=models.CASCADE, null=True)
    publisher = models.ForeignKey('Publisher', on_delete=models.CASCADE, null=True)
    genre = models.ForeignKey('Genre', on_delete=models.CASCADE, null=True)
    
    def reviews(self):
        return Review.objects.filter(book=self)
    
class Author(models.Model):
    id = models.BigAutoField(primary_key=True)
    author_name= models.TextField()
    

class Publisher(models.Model):
    id = models.BigAutoField(primary_key=True)
    publisher_name = models.TextField()
    
    
class Genre(models.Model):
    id = models.BigAutoField(primary_key=True)
    genre = models.TextField()
    
    
class Review(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey('Book', on_delete=models.CASCADE, related_name='review', null=True)
    review = models.TextField()
    rating = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    
class ReaderLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    STATUS_CHOICES = [
        ('TOREAD', 'To Read'),
        ('READING', 'Reading'),
        ('DNF', 'Did Not Finish'),
        ('SKIMMED', 'Skimmed'),
        ('COVER2COVER', 'Cover to Cover'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, null=True)
    book = models.ForeignKey('Book', on_delete=models.CASCADE, related_name='reader_log', null=True)
    
    
