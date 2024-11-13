from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User


# Create your models here.
class Books(models.Model):
    id = models.BigAutoField(primary_key=True)
    year_published = models.IntegerField()
    title = models.CharField(max_length=100)
    synopsis = models.TextField()
    info_link = models.CharField(max_length=100)
    average_rating = models.IntegerField(default=0)
    cover_link= models.CharField(max_length=100)
    author = models.ForeignKey('Authors', on_delete=models.CASCADE, null=True)
    publisher = models.ForeignKey('Publishers', on_delete=models.CASCADE, null=True)
    genre = models.ForeignKey('Genres', on_delete=models.CASCADE, null=True)
    reviews = models.ManyToManyField('Reviews', related_name='books')
    
    
class Authors(models.Model):
    id = models.BigAutoField(primary_key=True)
    author_name= models.TextField()
    
    def books(self):
        return Books.objects.filter(author=self)
    

class Publishers(models.Model):
    id = models.BigAutoField(primary_key=True)
    publisher_name = models.TextField()
    
    def books(self):
        return Books.objects.filter(publisher=self)
    
    
class Genres(models.Model):
    id = models.BigAutoField(primary_key=True)
    genre = models.TextField()
    
    def books(self):
        return Books.objects.filter(genre=self)
    
    
class Reviews(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    review = models.TextField()
    rating = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    
class ReaderLogs(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.TextChoices('status', 'TOREAD READING DNF SKIMMED COVER2COVER')
    book = models.ManyToManyField('Books', related_name='reader_logs')
    
    
