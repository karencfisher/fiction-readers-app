import { useState, useEffect } from "react";
import { PopUp } from "../widgets/PopUp";
import * as cookie from "cookie";
import './forms.css';

export function BookAdd(props) {
    const [genres, setGenres] = useState([]);
    const [genre, setGenre] = useState("");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [infoLink, setInfoLink] = useState("");
    const [coverLink, setCoverLink] = useState("");
    const [yearPublished, setYearPublished] = useState("");
    const [publisher, setPublisher] = useState("");
    const [popup, setPopup] = useState({open: false});
    const {callback} = props;
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getGenres() {
        const result = await fetch("/genres/", {
            credentials: "same-origin"
        });
        const response = await result.json();
        setGenres(response.data);
        setGenre(response.data[0]);
    }

    useEffect(() => {
        getGenres();
    }, [])

    async function getBoookInfo() {
        const url = `/books/google?title=${title}&author=${author}&publisher=${publisher}`
        const result = await fetch(url, {
            credentials: "same-origin"
        });
        const response = await result.json()
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: response.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true});
        }
        else {
            console.log(response)
            const year = response.publishedDate.split("-")[0]
            setYearPublished(year)
            setSynopsis(response.description);
            setInfoLink(response.infoLink);
            setCoverLink(response.imageLinks.thumbnail);
        }
    }

    function completeForm(e) {
        e.preventDefault();
        getBoookInfo();
    }

    async function addBook() {
        const result = await fetch('/books/new/', {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify({
                genre: genre,
                title: title,
                author: author,
                publisher: publisher,
                synopsis: synopsis,
                info_link: infoLink,
                cover_link: coverLink,
                year_published: yearPublished
            }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.parse(document.cookie).csrftoken
            }
        });
        const response = await result.json()

        if (result.status !== 200) {
            setPopup({...popup, 
                kind: "error",
                hasCancelButton: false,
                handler: popUpOkHandler,
                msg: response.error, 
                open: true
            });
        }
        else {
            setPopup({...popup, 
                kind: "info",
                hasCancelButton: false,
                handler: popUpOkHandler,
                msg: `${title} has been added to the database`, 
                open: true
            });
        }
    }

    function submitForm(e) {
        e.preventDefault();
        addBook();
    }

    return (
        <div className="book-container">
            <p>
                On this form you can add a book of your own to the club database. You will need
                to enter at minimum the "Basic Info" for the edition you have, 
                and then you can complete the form using 
                Google Books. Otherwise you can complete the information manually, including links to
                a cover image and where others can purchase the book.
            </p>
            <form>
                <fieldset>
                    <legend>Basic Info</legend>
                    <div className="field">
                                <label htmlFor="genres">Genre</label>
                                <select name="genres" id="genres"
                                        onChange={(e) => setGenre(e.target.value)}>
                                    {genres.map((genre, i) => (
                                        <option key={i} value={genre}>{genre}</option>
                                    ))}
                                </select>
                            </div>
                    <div className="field">
                        <label htmlFor="title">Title</label>
                        <input type="text" name="title" id="title" required value={title}
                            onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="field">
                        <label htmlFor="author">Author</label>
                        <input type="text" name="author" id="author" required value={author}
                            onChange={(e) => setAuthor(e.target.value)} />
                    </div>
                    <div className="field">
                        <label htmlFor="publisher">Publisher</label>
                        <input type="text" name="Publisher" id="Publisher" required value={publisher}
                            onChange={(e) => setPublisher(e.target.value)} />
                    </div>
                        <button id="complete" onClick={completeForm}>Complete form using Google Books</button>
                </fieldset>
                <fieldset>
                    <legend>Additional Info</legend>
                    <div className="field">
                        <label htmlFor="year_published">Year published</label>
                        <input type="text" name="year_published" id="year_published" value={yearPublished}
                            rows="10" onChange={(e) => setYearPublished(e.target.value)} />
                    </div>
                    <div className="field">
                        <label htmlFor="synopsis">Synopsis</label>
                        <textarea name="synopsis" id="synopsis" value={synopsis}
                            rows="10" onChange={(e) => setSynopsis(e.target.value)} />
                    </div>
                    <div className="field">
                        <label htmlFor="info_link">Info Link</label>
                        <input type="text" name="info_link" id="info_link" value={infoLink}
                            onChange={(e) => setInfoLink(e.target.value)} />
                    </div>
                    <div className="field">
                        <label htmlFor="cover_link">Cover Link</label>
                        <input type="text" name="cover_link" id="cover_link" value={coverLink}
                            onChange={(e) => setCoverLink(e.target.value)} />
                    </div>
                </fieldset>
                <button onClick={submitForm}>Submit</button>
                {popup.open && (
                    <PopUp
                        message={popup.msg}
                        callback={popup.handler}
                        kind={popup.kind}
                        modal={true}
                        hasCancelButton={popup.hasCancelButton}
                    />
                )}
            </form>
        </div>
    )
}