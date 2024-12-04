import { useState, useEffect, useRef } from 'react';
import { PopUp } from '../widgets/PopUp';
import { useNavigate } from 'react-router-dom';
import './forms.css';
import './BookInfo.css';

export function SearchForm(props) {
    const [countPages, setCountPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const [genres, setGenres] = useState([]);
    const [books, setBooks] = useState([]);
    const [popup, setPopup] = useState({open: false});
    const [hints, setHints] = useState([]);
    const {searchType} = props;
    const navigate = useNavigate();
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getData() {
        if (!query) return;
        const url = `/books/search?method=${searchType}&query=${query}&page=${currentPage}`;
        const result = await fetch(url, {
            credentials: "same-origin"
        });
        const response = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: response.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true});
        }
        else {
            setBooks(response.data);
            setCurrentPage(parseInt(response.page));
            setCountPages(parseInt(response.num_pages));
        }
    }

    async function getGenres() {
        const result = await fetch("/genres/", {
            credentials: "same-origin"
        });
        const response = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: response.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true});
        }
        else {
            setGenres(response.data);
            setQuery(response.data[0]);
        }
    }

    async function getHints() {
        const result = await fetch(`/completions?field=${searchType}&query=${query}`, {
            credentials: "same-origin"
        });
        const response = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: response.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true});
        }
        else {
            setHints(response.data);
        }
    }

    function doSearch(e) {
        e.preventDefault();
        getData();
    }

    function getSelectedBook(e) {
		navigate("/book_page", {state: {book_id: e.target.id}})
	} 

    function pageNavigate(e) {
        if (e.target.id === "back" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
        else if (e.target.id === "forward" && currentPage < countPages) {
            setCurrentPage(currentPage + 1);
        }
    }

    useEffect(() => {
        if (searchType !== "genre") {
            getHints();
        }
    }, [query])

    useEffect(() => {
        if (searchType === "genre") {
            getGenres();
        }
    }, [searchType])

    useEffect(() => {
        getData();
    }, [currentPage])

    return (
        <div className="book-container">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
            <form onSubmit={doSearch} method="get">
                <fieldset>
                    <legend>Search {searchType}</legend>
                    {searchType === "genre"? (
                            <div className="field">
                                <label htmlFor="genres">Genre</label>
                                <select name="genres" id="genres"
                                        onChange={(e) => setQuery(e.target.value)}>
                                    {genres.map((genre, i) => (
                                        <option key={i} value={genre}>{genre}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <input type="text" id="query" name="query" value={query}
                                    className="book-input" onChange={(e) => setQuery(e.target.value)}/>
                                <div className="book-hint">
                                    {hints.map((hint, j) => (
                                        <div key={j} onClick={(e) => setQuery(e.target.innerText)}>
                                            {hint.suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                    <button>Search</button>
                </fieldset>
            </form>
            {countPages > 0 ? (
                <nav className="page-nav">
                    <span 
                        className="material-icons-outlined"
                        id="back"
                        onClick={pageNavigate}
                    >arrow_back_ios</span>
                    Page {currentPage} of {countPages}
                    <span 
                        className="material-icons-outlined"
                        id="forward"
                        onClick={pageNavigate}
                    >arrow_forward_ios</span>
                </nav>
            ) : (
                <></>
            )}
            <div className="book-grid">
                {books.map((book, i) => (
                    <img className="book-cover" key={i} src={book.cover_link} alt={book.title} 
                        id={book.id} onClick={getSelectedBook} />
                ))}
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