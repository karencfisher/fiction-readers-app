import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookShelf } from '../widgets/BookShelf';
import { Tabs } from '../widgets/Tabs';
import { LoginForm } from '../forms/LoginForm';
import { RegisterForm } from '../forms/RegisterForm';
import './style.css';

export function Landing(props) {
    const [readersBooks, setReadersBooks] = useState([]);
    const [genreBooks, setGenreBooks] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const navigate = useNavigate();

    async function isAuthenticated() {
        const result = await fetch('/registration/whoami/', {
			credentials: "same-origin"
		});
        const answer = await result.json();
        if (answer.isAuthenticated) navigate('/home');
    }

    async function getBooks(section) {
        const result = await fetch(`/books/${section}`, {
            credentials: "same-origin"
        });
        const books = await result.json();
        return books.data;
    }

    useEffect(() => {
        isAuthenticated();
        const fetchBooks = async () => {
            const logBooks = await getBooks("reader_logs/");
            setReadersBooks(logBooks);

            const genreBooks = await getBooks("genres/");
            setGenreBooks(genreBooks);
        };
        fetchBooks()
    }, []);

    return (
        <div className="main-container">
            <header>
                <h1 className="page-title">Fiction Reader's Place</h1>
            </header>
            <main>
                <BookShelf
                    title="Books read by members"
                    books={readersBooks}
                />
                <div className="columns">
                    <div className="blurb">
                        <p>
                            <b>Welcome</b> to our cozy corner of the internet, where stories come to life! 
                            Dive into a world of imagination and adventure, and discover the joy of 
                            reading. Whether you're a seasoned bookworm or just starting your literary 
                            journey, this is the perfect place to get excited about the stories that 
                            await you. Join us and let your next great read begin here!
                        </p>
                        <p>
                            Explore our extensive library to discover new books that pique your interest. 
                            Keep track of what you've read, what you're currently diving into, and what's 
                            next on your reading list. Plus, read reviews and recommendations from fellow 
                            members to help you find your next favorite story. Join us in celebrating the 
                            love of reading and sharing our literary adventures together!
                        </p>
                    </div>
                    <div className="registration">
                        <Tabs
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                            tabLabels={["Login", "Join"]}
                            tabContents={[<LoginForm/>, <RegisterForm/>]}
                        />
                    </div>
                </div>
                {genreBooks.map((bookSet, i) => (
                    <BookShelf 
                        key={i}
                        kind="optional"
                        title={bookSet.genre} 
                        books={bookSet.books}
                    />
                ))}
            </main>
        </div>
    )
}