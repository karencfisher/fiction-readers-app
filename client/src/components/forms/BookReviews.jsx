import { useState, useEffect, useRef } from 'react';
import { PopUp } from '../widgets/PopUp';
import * as cookie from "cookie";
import './BookInfo.css';

export function BookReviews(props) {
    const [popup, setPopup] = useState({open: false});
    const [reviewIndex, setReviewIndex] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const {bookInfo, user_id} = props;
    const popUpOkHandler = () => setPopup({...popup, open: false});

    function reviewNavigate(e) {
        if (e.target.id === "back" && reviewIndex > 0) 
            setReviewIndex(reviewIndex - 1);
        else if (e.target.id === "forward" && reviewIndex < reviewCount) 
            setReviewIndex(reviewIndex + 1);
        console.log(reviewIndex, reviewCount);
    }

    useEffect(() => {
        if (bookInfo && bookInfo.reviews) {
            setReviewCount(bookInfo.reviews.length);
        }
    }, [bookInfo])

    return(
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
            <div>
                <div className="review-nav">
                    <div><h2>Member review {reviewIndex + 1} 
                        &nbsp;(of {reviewCount} {reviewCount > 1? 'reviews': 'review'})</h2></div>
                    <div>
                        {reviewIndex > 0?
                            <span 
                                className="material-icons-outlined"
                                id="back"
                                onClick={reviewNavigate}
                            >arrow_back_ios</span> : <></>
                        }
                        {reviewIndex < reviewCount - 1?
                            <span 
                                className="material-icons-outlined"
                                id="forward"
                                onClick={reviewNavigate}
                            >arrow_forward_ios</span> : <></>
                        }
                    </div>
                </div>
                {bookInfo.reviews?
                    <div className="review-container">
                        <div className="review-rating">
                            Rating: {bookInfo.reviews[reviewIndex].rating}
                        </div>
                        <div className="review-user">
                            <i>Review submitted by {bookInfo.reviews[reviewIndex].user__username}</i>
                        </div>
                        <div className="review-text">
                            {bookInfo.reviews[reviewIndex].review}
                        </div> 
                    </div>: <div>Loading... </div>
                }
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