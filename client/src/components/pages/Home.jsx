import { useState, useEffect } from 'react'
import * as cookie from "cookie";
import { useNavigate } from 'react-router-dom';
import { BookShelf } from '../widgets/BookShelf';
import { LogoutButton } from '../widgets/LogoutButton';
import './style.css';

export function Home() {
	const [userName, setUserName] = useState("");
	const [userID, setUserID] = useState(0);
	const [booksRead, setBooksRead] = useState([]);
	const [booksReading, setBooksReading] = useState([]);
	const [booksToRead, setBooksToRead] = useState([]);
	const [updateTrigger, setUpdateTrigger] = useState(0);
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

	function getSelectedBook(e) {
		navigate("/book_page", {state: {book_id: e.target.id}})
	}

	async function changeShelf(user_id, book_id, shelf_id) {
		const result = await fetch('/reader_logs/update/', {
			method: "post",
			credentials: "same-origin",
			body: JSON.stringify({
				user: user_id,
				book: book_id,
				status: shelf_id
			}),
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": cookie.parse(document.cookie).csrftoken
			}
		});
		const response = await result.json();
		if (result.status !== 200) {
			setPopup({...popup, 
					  msg: response.error,
					  kind: "error",
					  hasCancelButton: false,
					  handler: popUpOkHandler,
					  open: true})
		}
	}

	function onSearchClick() {
		navigate("/Search");
	}

	async function handleDrop(book_id, shelf_id){
		// Logic to update the book's status or shelf based on the bookId
		await changeShelf(userID, book_id, shelf_id);
		setUpdateTrigger(prev => prev + 1);
		// You can update your state here to reflect the change
	};

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
				else if (book.status === "TOREAD") {
					toReadBooks.push(book);
				}
			}
			setBooksRead(readBooks);
			setBooksReading(readingBooks);
			setBooksToRead(toReadBooks);
		};
		fetchBooks();
	}, [userID, updateTrigger]);

	return (
		<div className="main-container">
			<header>
				<h1 className="page-title">Your Bookshelves</h1>
				<div>
					<button onClick={onSearchClick}>Search</button>&nbsp;
					<LogoutButton />
				</div>
			</header>
			<main>
				
				<BookShelf
					kind="clickable"
					title="Books I've read"
					books={booksRead}
					onBookClick = {getSelectedBook}
					onDrop={handleDrop}
					onSearchClick={onSearchClick}
					shelfId="READ"
				/>
				<BookShelf
					kind="clickable"
					title="Books I am reading"
					books={booksReading}
					onBookClick = {getSelectedBook}
					onDrop={handleDrop}
					onSearchClick={onSearchClick}
					shelfId="READING"
				/>
				<BookShelf
					kind="clickable"
					title="Books I plan to read"
					books={booksToRead}
					onBookClick = {getSelectedBook}
					onDrop={handleDrop}
					onSearchClick={onSearchClick}
					shelfId="TOREAD"
				/>
			</main>
		</div>
  	)
}

