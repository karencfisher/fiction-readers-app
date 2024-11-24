import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { BookShelf } from '../widgets/BookShelf';

export function Home() {
	const [userName, setUserName] = useState("");
	const [userID, setUserID] = useState(0);
	const [booksRead, setBooksRead] = useState([]);
	const [booksReading, setBooksReading] = useState([]);
	const [booksToRead, setBooksToRead] = useState([]);
	const navigate = useNavigate();

	async function getUserInfo() {
		const result = await fetch('/registration/whoami', {
			credentials: "same-origin"
		});
		const answer = await result.json();
		if (!answer.isAuthenticated) {
			navigate('/');
			return null;
		}
		setUserName(answer.username);
		setUserID(answer.user_id);
		return answer;
	}

	async function getBookShelves() {
		const result = await fetch(`/reader_logs/${userID}`, {
			credentials: "same-origin"
		});
		const books = await result.json();
		return books.data;
	}

	async function logout() {
		const res = await fetch("/registration/logout/", {
			credentials: "same-origin"
		});

		if (res.ok) {
			// navigate away from the single page app!
			navigate('/');
		}
	}

	function getSelectedBook(e) {
		console.log(e.target.id);
	}

	useEffect(() => {
		getUserInfo();
	}, []);

	useEffect(() => {
		if (userID === 0) return;
		const fetchBooks = async () => {
			const books = await getBookShelves();
			const readBooks = []
			const readingBooks = [];
			const toReadBooks =[];
			for (const book of books) {
				if (book.status === "READ") {
					readBooks.push(book);
				}
				else if (book.status === "READING") {
					readingBooks.push(book);
				}
				else {
					toReadBooks.push(book);
				}
			}
			setBooksRead(readBooks);
			setBooksReading(readingBooks);
			setBooksToRead(toReadBooks);
		};
		fetchBooks();
	}, [userID]);

  return (
	<div className="main-container">
		<header>
			<h1 className="page-title">{userName}'s Bookshelves</h1>
			<button onClick={logout}>Logout</button>
		</header>
		<main>
			<BookShelf
				kind="clickable"
				title="Books I've read"
				books={booksRead}
				onclick = {getSelectedBook}
			/>
			<BookShelf
				kind="clickable"
				title="Books I am reading"
				books={booksReading}
				onclick = {getSelectedBook}
			/>
			<BookShelf
				kind="clickable"
				title="Books I plan to read"
				books={booksToRead}
				onclick = {getSelectedBook}
			/>
		</main>
	</div>
  )
}

