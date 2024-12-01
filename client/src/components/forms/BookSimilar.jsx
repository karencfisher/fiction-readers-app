import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { PopUp } from "../widgets/PopUp";
import './BookInfo.css'; 


export function BookSimilar(props) {
    const [books, setBooks] = useState([]);
    const [popup, setPopup] = useState({open: false});
    const {bookInfo, user_id} = props;
    const navigate = useNavigate();
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getSimilar() {
        const result = await fetch(`/books/search?method=similarity&query=${bookInfo.id}`, {
            credentials: "same-origin"
        });
        const info = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: info.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true})
        }
        else {
            setBooks(info.data);
        }
    }

    function getSelectedBook(e) {
        console.log(`Navigate to book ${e.target.id}`)
		navigate("/book_page", {state: {book_id: e.target.id}})
	} 

    useEffect(() => {
        if (bookInfo.id) {
            getSimilar();
        }
    }, [bookInfo])

    return (
        <div className="book-container">
            <div className="book-columns">
                <div className="book-cover">
                    <img src={bookInfo.cover_link} alt={bookInfo.title}></img>
                </div>
                <div className="book-info">
                    <h1 className="book-title">{bookInfo.title}</h1>
                    <h2 className="book-author">{bookInfo.author_name}</h2>
                    <i>{bookInfo.year_published}<br />
                    {bookInfo.publisher_name}</i>
                </div>
            </div>
            <hr />
            <div className="book-grid">
            {books.length === 0? (
                    <div className="placeholder">
                        No books found
                    </div>
                ) : (
                    books.map((book, i) => (
                        <img className="book-cover" key={i} src={book.cover_link} alt={book.title} 
                            id={book.id} onClick={getSelectedBook} />
                    ))
                )}
            </div>
            {popup.open && (
                <PopUp
                    message={popup.msg}
                    callback={popup.handler}
                    kind={popup.kind}
                    modal={true}
                    hasCancelButton={popup.hasCancelButton}
                />
            )}
        </div>
    )
}