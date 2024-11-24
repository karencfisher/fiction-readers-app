# Generated by Django 5.0.3 on 2024-11-16 19:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_alter_readerlog_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='author',
            name='author_name',
            field=models.TextField(unique=True),
        ),
        migrations.AlterField(
            model_name='book',
            name='title',
            field=models.CharField(max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='genre',
            name='genre',
            field=models.TextField(unique=True),
        ),
        migrations.AlterField(
            model_name='publisher',
            name='publisher_name',
            field=models.TextField(unique=True),
        ),
    ]