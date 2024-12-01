import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '../widgets/Tabs';
import { LogoutButton } from '../widgets/LogoutButton';
import { BookInfo } from '../forms/BookInfo';
import { BookReviews } from '../forms/BookReviews';
import { BookSimilar } from '../forms/BookSimilar';
import { PopUp } from '../widgets/PopUp';
import './style.css';
import { MyReview } from '../forms/MyReview';

export function BookPage({ route }) {
    const [userID, setUserID] = useState(0);
    const [bookInfo, setBookInfo] = useState({})
    const [popup, setPopup] = useState({open: false})
    const navigate = useNavigate();
    const location = useLocation()
    const params = location.state;
    const popUpOkHandler = () => setPopup({...popup, open: false});

    async function getUserInfo() {
		const result = await fetch('/registration/whoami', {
			credentials: "same-origin",
		});
		const answer = await result.json();
		if (!answer.isAuthenticated) {
			navigate('/');
			return null;
		}
		setUserID(answer.user_id);
		return answer;
	}

    async function getBookInfo(book_id) {
        const result = await fetch(`/books/${book_id}/`, {
            credentials: "same-origin"
        });
        const info = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, 
                      msg: info.error, 
                      kind: "error",
                      hasCancelButton: false,
                      handler: popUpOkHandler,
                      open: true})
        }
        else {
            setBookInfo(info);
        }
    }

    useEffect(() => {
        if (params && params.book_id) {
            getUserInfo();
            getBookInfo(params.book_id);
        }
    }, [params]);

    return (
        <div className="main-container">
            <header>
                <h1 className="page-title">Book Details</h1>
                <div>
                    <button onClick={() => navigate(-1)}>Back</button>
                    &nbsp;<LogoutButton />
                </div>
            </header>
            <main>
                <Tabs className="book-tabs"
                    tabLabels={["About", "Reviews", "My Review", "Similar"]}
                    tabContents={[
                                    <BookInfo 
                                        bookInfo={bookInfo}
                                        user_id={userID}
                                    />, 
                                    <BookReviews
                                        bookInfo={bookInfo}
                                        user_id={userID}
                                    />, 
                                    <MyReview
                                        bookInfo={bookInfo}
                                        user_id={userID}
                                    />,
                                    <BookSimilar
                                        bookInfo={bookInfo}
                                        user_id={userID}
                                    />
                                ]}
                />
            </main>
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