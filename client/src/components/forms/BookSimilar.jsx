import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { PopUp } from "../widgets/PopUp";
import { BookGrid } from "../widgets/BookGrid";
import '../forms/BookInfo.css'; 


export function BookSimilar(props) {
    const [countPages, setCountPages] = useState (0);
    const [currentPage, setCurrentPage] = useState(1);
    const [books, setBooks] = useState([]);
    const [popup, setPopup] = useState({open: false});
    const {bookInfo, user_id, setBackCount} = props;
    const navigate = useNavigate();
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getSimilar() {
        const result = await fetch(
            `/books/search?method=similarity&query=${bookInfo.id}&genre=${bookInfo.genre_name}&page=${currentPage}`, {
            credentials: "same-origin"
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
        else {
            console.log()
            setBooks(response.data);
            setCurrentPage(parseInt(response.page));
            setCountPages(parseInt(response.num_pages));
        }
    }

    function getSelectedBook(e) {
        setBackCount(0);
		navigate("/book_page", {state: {book_id: e.target.id}})
	} 

    useEffect(() => {
        if (bookInfo.id) {
            getSimilar();
        }
    }, [bookInfo])

    useEffect(() => {
        if (countPages > 0) {
            getSimilar();
        }
    }, [currentPage])

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
            <BookGrid 
                books={books}
                getSelectedBook={getSelectedBook}
                countPages={countPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
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