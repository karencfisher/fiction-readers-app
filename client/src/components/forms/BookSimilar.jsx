import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { PopUp } from "../widgets/PopUp";
import { BookGrid } from "../widgets/BookGrid";
import { BookHeading } from "../widgets/BookHeading";
import '../forms/BookInfo.css'; 
import star from '../images/star1.png';


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
            `/books/search/?method=similarity&query=${bookInfo.id}&genre=${bookInfo.genre_name}&page=${currentPage}`, {
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
            <BookHeading bookInfo={bookInfo} />
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