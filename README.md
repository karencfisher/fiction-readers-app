# Fiction Readers' Place

This is the beginning or MVP of a fictional book club -- an opportunity fo users to find and share books they enjoy, read and write reviews of books, and so forth. Functionality *not* yet built includes more social aspects, such as profiles, ability to follow and be followed by other users, and messaging or forums. Currently all reviews are public (which is, all authenticated users).

The aim is to create a clean, intuitive user experience, allowing the reader to wander among books in an 
associative manner. For example, one can search for similar books using a KNN model, using embeddings of the titles and synopses of books created with a version of BERT provided by HuggingFace. 

## Database

The initial database contains nearly 500 books, and somewhat over than 100 reviews written mostly by 3 pseudnymous users, obtained from a much larger dataset found on Kaggle (which contains 212000 book descriptions and 3 million reviews from Goodreads). The Kaggle dataset may be found here:

https://www.kaggle.com/datasets/mohamedbakhet/amazon-books-reviews

From the Kaggle dataset the sample database was extracted and transformed to CSV files. This included:

1) Book description filtered to only fictional books and from those 500 book randomly sampled.
2) Categorized into genres using OpenAI gpt-4o-mini language model.
3) Transformed into normalized tables.
4) Merge book table with reviews to extract pertinent reviews, and
5) A subset of the reviews and three reviewers was extracted, and a JSON created with anonymizing users.

The ETL process can be found in the "etl" directory, mainly for documentation purposes, and the resultant CSS files in the "data" directory. The etl files consist of two .ipynb notebooks, which can be run end to end, first `fiction.ipynb` followed by `reviews.ipynb`, in that order. In the latter one may want to select different sample users/reviews, and update the `users.json` file (in the data directory) accordingly.

Note that the original CSV files from Kaggle are not included in this repository, due to their sizes (2.9 GB for the `books_rating.csv` file containing 3 million reviews!). If wanting to build a different sample data set to load into the DB, one can down load the two CSV files from there into the data directory.

## Secret keys

There are two private keys involved: one is the OpenAI API key used to categorized the fiction books into 13 genres. This is only needed if one were to re-run the ETL step, which would be created in a file names `key.py` file. There is an example in the etl directory (`example_key.py`). Information on obtaining an OpenAI API key is here: https://platform.openai.com/docs/quickstart. Notice there is cost for API useage, though minimal using the gpt-4o-mini model.

The other API key is for Google, which is necessary for the Google Books API searches to help users complete the form that allows them to add books to the database. This one may need to obtain a Google key following instructions found at: https://support.google.com/googleapi/answer/6158862?hl=en and https://developers.google.com/books/docs/v1/using. This API key as added to the `.env` file created from the example file.

## Initial Setup
1. In the root directory, install the python dependencies `poetry install`
2. In the `client` directory, install the javascript dependencies `npm install`
3. In the `_server` directory, create a new file called `.env`
4. Copy the contents of `_server/.env.example` into the newly created `.env` file. Include your Google API key.
5. Activate the poetry env `poetry shell`

A sample DB is included in the repository. However, to install it from scratch one would do the following additional steps.

6. In the `_server` directory, run the migrations `python manage.py migrate`
7. Run `python manage.py load_db` to populate the data with the sample data. (Not doing this would result in an empty database with limited functionality.)
8. Run `python manage.py index_books` to build the embedding table for similarity searches.

## Running the appliction
1. In the `client` directory run `npm run dev`
2. In the `_server` directory (with your poetry env activated) run `python manage.py runserver`
3. Visit your application at `http://localhost:8000`

**Note**: On a new installation, the first use of the form allowing the user to add a book
to the database will take significantly longer time, as the SentenceTransformer model used to create 
embeddings will need to be downloaded from HuggingFace. This should occur automatically.
