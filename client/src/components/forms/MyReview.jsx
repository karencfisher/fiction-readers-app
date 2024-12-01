import { useState, useEffect } from 'react';
import { PopUp } from '../widgets/PopUp';
import * as cookie from "cookie";
import './forms.css';
import './BookInfo.css';

export function MyReview(props) {
    const [popup, setPopup] = useState({open: false});
    const [review, setReview] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const {bookInfo, user_id} = props;
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getReview(user_id, book_id) {
        const result = await fetch(`/reviews/${user_id}/${book_id}`, {
            credentials: "same-origin"
        });
        const response = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: info.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true})
        }
        else {
            setReview(response.data);
        }
    }

    async function updateReview(e) {
        e.preventDefault();
        const result = await fetch('reviews/update/', {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify(
                {
                    user: user_id,
                    book: bookInfo.id,
                    rating: reviewRating,
                    review: reviewText
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
                handler: popUpOkHandler,
                hasCancelButton: false, 
                kind:"error",
                open: true
            })
        }
        else {
            setPopup({...popup, 
                msg: response.success,
                handler: popUpOkHandler,
                hasCancelButton: false, 
                kind:"info",
                open: true
            })
        }
    }

    useEffect(() => {
        if (bookInfo && user_id > 0) {
            getReview(user_id, bookInfo.id);
        }
    }, [bookInfo, user_id])

    useEffect(() => {
        setReviewRating(5);
        setReviewText("");
        if (review && review.length > 0) {
            setReviewRating(review[0].rating);
            setReviewText(review[0].review);
        }
    }, [review]);

    return (
        <div className="book-container">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" 
                    rel="stylesheet"/>
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
            <form onSubmit={updateReview} method="post">
                <fieldset>
                    <legend>Your review</legend>
                    <div className="field">
                        <label htmlFor="rating">Rating</label>
                        <input type="number" min="1" max="5" name="rating" id="rating" 
                            value={reviewRating || ""} 
                            onChange={(e) => setReviewRating(e.target.value)}/>
                    </div>
                    <div className="field">
                        <label htmlFor="text">Text</label>
                        <textarea id="text" name="text" rows="20" cols="10" value={reviewText || ""}
                            onChange={(e) => setReviewText(e.target.value)} />
                    </div>
                    <button>Submit review</button>
                </fieldset>
            </form>
            {popup.open && 
                (<PopUp  
                    kind={popup.kind}
                    message={popup.msg}
                    callback={popup.handler}
                    modal={true}
                    hasCancelButton={popup.hasCancelButton}
                />)
            }
        </div>
    );
}