import { useState, useEffect } from 'react';
import { PopUp } from '../widgets/PopUp';
import { BookHeading } from '../widgets/BookHeading';
import './BookInfo.css';
import star from '../images/star1.png';

export function BookReviews(props) {
    const [reviewIndex, setReviewIndex] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const {bookInfo, user_id} = props;

    function reviewNavigate(e) {
        if (e.target.id === "back" && reviewIndex > 0) 
            setReviewIndex(reviewIndex - 1);
        else if (e.target.id === "forward" && reviewIndex < reviewCount) 
            setReviewIndex(reviewIndex + 1);
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
            <BookHeading bookInfo={bookInfo} />
            <hr />
            <div>
                <div className="review-nav">
                    <div><h2>Member review {reviewIndex + 1}&nbsp;(of {reviewCount})</h2></div>
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
                    {bookInfo.reviews && bookInfo.reviews.length > 0 ?
                        <div className="review-container">
                            <div className="book-rating">
                                {Array.from(
                                    {length: parseInt(bookInfo.reviews[reviewIndex].rating)},
                                    (_, i) => <img key={i} src={star} alt="star" />
                                )}
                            </div>
                            <div className="review-user">
                                <i>Review submitted by {bookInfo.reviews[reviewIndex].user__username}</i>
                            </div>
                            <div className="review-text">
                                {bookInfo.reviews[reviewIndex].review}
                            </div> 
                        </div>: <div>No reviews yet!</div>
                    }
            </div>
        </div>
    )
}