import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookInfo.css';
import { BookGrid } from '../widgets/BookGrid';

export function MemberBooks() {
    const [countPages, setCountPages] = useState (0);
    const [currentPage, setCurrentPage] = useState(1);
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    async function getShelves() {
        const result = await fetch(`/books/reader_logs?page=${currentPage}`, {
            credentials: "same-origin"
        });
        const response = await result.json();
        setBooks(response.data);
        setCurrentPage(parseInt(response.page));
        setCountPages(parseInt(response.num_pages));
    }

    useEffect(() => {
        getShelves();
    }, [currentPage]);

    function getSelectedBook(e) {
		navigate("/book_page", {state: {book_id: e.target.id}})
	}

    return (
        <div className="book-container">
            <h2>Random members' books</h2>
            <hr />
            {books ? (
                <BookGrid
                    books={books}
                    getSelectedBook={getSelectedBook}
                    countPages={countPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            ) : (
                <div>No books from members yet!</div>
            )}
        </div>
    )
}