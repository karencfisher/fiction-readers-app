import star from '../images/star1.png';
import '../forms/BookInfo.css';

export function BookHeading(props) {
    const {bookInfo} = props;

    return(
        <div className="book-columns">
            <div className="book-cover">
                <img src={bookInfo.cover_link} alt={bookInfo.title}></img>
            </div>
            <div className="book-info">
                <h1 className="book-title">{bookInfo.title}</h1>
                <h2 className="book-author">{bookInfo.author_name}</h2>
                <i>{bookInfo.year_published}<br />
                {bookInfo.publisher_name}</i>
                <div className="book-rating">
                    {bookInfo.average_rating > 0 ?(
                        <div>
                            {Array.from(
                                {length: parseInt(bookInfo.average_rating)},
                                (_, i) => <img key={i} src={star} alt="star" />
                            )}
                        </div>
                    ) : (
                        'Not yet reviewed'
                    )}
                </div>
            </div>
        </div>
    )
}