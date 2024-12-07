import { useState, useEffect, useRef } from 'react';
import { PopUp } from '../widgets/PopUp';
import { useNavigate } from 'react-router-dom';
import { BookGrid } from '../widgets/BookGrid';
import './forms.css';
import '../forms/BookInfo.css';

export function SearchForm(props) {
    const [countPages, setCountPages] = useState (0);
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const [selectGenre, setSelectGenre] = useState("");
    const [genres, setGenres] = useState([]);
    const [books, setBooks] = useState([]);
    const [popup, setPopup] = useState({open: false});
    const [hints, setHints] = useState([]);
    const restore = useRef(false);
    const prevPage = useRef(currentPage);
    const {searchType, prevState, setPrevState, currentTab, setCurrentTab} = props;
    const prevTab = useRef(currentTab);
    const navigate = useNavigate();
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getData() {
        const q = searchType === "genre" ? selectGenre: query;
        const url = `/books/search/?method=${searchType}&query=${q}&page=${currentPage}&restore=${restore.current}`;
        const result = await fetch(url, {
            credentials: "same-origin"
        });
        const response = await result.json();
        if (result.status !== 200) {
            setPopup({
                ...popup, 
                msg: response.error, 
                kind: "error",
                hasCancelButton: false,
                handler: popUpOkHandler,
                open: true
            });
        }
        else {
            setBooks(response.data);
            setCurrentPage(parseInt(response.page));
            setCountPages(parseInt(response.num_pages));
            restore.current = false;
        }
    }

    async function getGenres() {
        const result = await fetch("/genres/", {
            credentials: "same-origin"
        });
        const response = await result.json();
        setGenres(response.data);
        setSelectGenre(response.data[0]);
    }

    async function getHints() {
        const result = await fetch(`/completions/?field=${searchType}&query=${query}`, {
            credentials: "same-origin"
        });
        const response = await result.json();
        setHints(response.data);
    }

    function getSelectedBook(e) {
        setPrevState(
            {
                query: query,
                genre: selectGenre,
                page: currentPage,
                tab: currentTab
            }
        )
		navigate("/book_page", {state: {book_id: e.target.id}});
	}

    useEffect(() => {
        const restoreState = async () => {
            if (searchType === "genre") {
                await getGenres();
            }

            if ("page" in prevState) {
                console.log(`Restoring ${JSON.stringify(prevState)}`)
                setCurrentPage(prevState.page);
                setQuery(prevState.query);
                setSelectGenre(prevState.genre);
                setCurrentTab(prevState.tab);
                restore.current = true;
                setPrevState({});
            }
        };
        restoreState();
    }, []);

    useEffect(() => {
        if (currentPage != prevPage.current) {
            restore.current = true;
            prevPage.current = currentPage;
        }
        if (searchType !== "genre") {
            getHints();
        }
        getData();
    }, [query, selectGenre, currentPage])

    return (
        <div className="book-container">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
            <form>
            <fieldset style={searchType !== "genre" ? { height: '100px' } : {}}>
                    <legend>Search {searchType}</legend>
                    {searchType === "genre"? (
                            <div className="field">
                                <label htmlFor="genres">Genre</label>
                                <select name="genres" id="genres" value={selectGenre}
                                        onChange={(e) => setSelectGenre(e.target.value)}>
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
                </fieldset>
            </form>
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