import { useState, useEffect, useRef } from 'react';
import { PopUp } from '../widgets/PopUp';
import * as cookie from "cookie";
import './BookInfo.css';


export function BookInfo(props) {
    const [popup, setPopup] = useState({open: false});
    const [status, setStatus] = useState("NONE")
    const isChangingShelf = useRef(false);
    const {bookInfo, user_id} = props;
    const shelves = {
        READ: "Books I've read",
        READING: "Books I am reading",
        TOREAD: "Books I plan to read",
        NONE: "Not on my shelves yet!"
    }
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getStatus(user_id, book_id) {
        const result = await fetch(`reader_logs/${user_id}/${book_id}/`, {
            credentials: "same-origin"
        });
        const info = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                kind: "error",
                hasCancelButton: false,
                handler: popUpOkHandler,
                msg: info.error, open: true})
        }
        else {
            setStatus(info.data[0].status);
        }
    }

    function shelfChange(e) {
        if (e.target.value === "NONE") {
            const goAhead = new Promise((resolve) => {
                const OkCancelHandler = (e) => {
                    const confirmed = e.target.innerText === "OK";
                    setPopup({...popup, open: false});
                    resolve(confirmed); // Resolve the promise with the user's choice
                };
                setPopup({
                    ...popup,
                    hasCancelButton: true,
                    handler: OkCancelHandler,
                    kind: "info",
                    msg: `Are you sure you want to remove <b>${bookInfo.title}</b> from your shelves?`,
                    open: true
                });
            });
    
            goAhead.then((confirmed) => {
                if (!confirmed) {
                    return; // Exit if not confirmed
                }
                setStatus(e.target.value); // Only set status if confirmed
                isChangingShelf.current = true;
            });
        } else {
            setStatus(e.target.value);
            isChangingShelf.current = true;
        }
    }

    useEffect(() => {
        const changeStatus = async () => {
            // update reader log
            const result = await fetch('/reader_logs/update/', {
                method: "post",
                credentials: "same-origin",
                body: JSON.stringify({
                    user: user_id,
                    book: bookInfo.id,
                    status: status
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
            else {
                setPopup({...popup, 
                          msg: `<b>${bookInfo.title}</b> has been moved to <b>${shelves[status]}</b>`,
                          kind: "info",
                          hasCancelButton: false,
                          handler: popUpOkHandler,
                          open: true})
            }
        }
        if (isChangingShelf.current) {
            changeStatus();
            isChangingShelf.current = false;
        }
    }, [status])

    useEffect(() => {
        if (bookInfo && user_id) {
            getStatus(user_id, bookInfo.id);
        }
    }, [bookInfo, user_id]);

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
            <p className="book-synopsis">{bookInfo.synopsis}</p>
            <hr />
            <div className="book-shelf">
                <fieldset>
                    <legend><b>{bookInfo.title}</b> is shelved as</legend>
                    <div className="book-option"> 
                        <input type="radio" 
                            id="NONE" 
                            name="shelves" 
                            value="NONE"
                            checked={status === 'NONE'}
                            onChange={shelfChange}
                        />
                        <label htmlFor="NONE">{shelves["NONE"]}</label>
                    </div>
                    <div className="book-option"> 
                        <input type="radio" 
                            id="READ" 
                            name="shelves" 
                            value="READ"
                            checked={status === 'READ'}
                            onChange={shelfChange}
                        />
                        <label htmlFor="READ">{shelves["READ"]}</label>
                    </div>
                    <div className="book-option">
                        <input type="radio" 
                            id="READING" 
                            name="shelves" 
                            value="READING"
                            checked={status === 'READING'}
                            onChange={shelfChange}
                        />
                        <label htmlFor="READING">{shelves["READING"]}</label>
                    </div>
                    <div className="book-option">
                        <input type="radio" 
                            id="TOREAD" 
                            name="shelves" 
                            value="TOREAD"
                            checked={status === 'TOREAD'}
                            onChange={shelfChange}
                        />
                        <label htmlFor="READ">{shelves["TOREAD"]}</label>
                    </div>
                </fieldset>
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
    );
}
