import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '../widgets/Tabs';
import { LogoutButton } from '../widgets/LogoutButton';
import { BookInfo } from '../forms/BookInfo';
import { BookReviews } from '../forms/BookReviews';
import { BookSimilar } from '../forms/BookSimilar';
import { PopUp } from '../widgets/PopUp';
import { MyReview } from '../forms/MyReview';
import homeImg from '../images/home.png';
import './style.css';

export function BookPage({ route }) {
    const [userID, setUserID] = useState(0);
    const [bookInfo, setBookInfo] = useState({})
    const [popup, setPopup] = useState({open: false})
    const [breadCrumbs, setBreadCrumbs] = useState([
        {title: 'Home', cover_link: homeImg}
    ])
    const [backCount, setBackCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation()
    const prevLocation = useRef(location);
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

    function goBack(e) {
        const increment = e.target.id - breadCrumbs.length;
        setBackCount(Math.abs(increment));
        navigate(increment);
    }

    useEffect(() => {
        if (params && params.book_id) {
            getUserInfo();
            getBookInfo(params.book_id);
        }
    }, [params]);

    useEffect(() => {
        if (location !== prevLocation.current) {
            if (backCount > 0) {
                setBreadCrumbs((prev) => prev.slice(0, prev.length - backCount));
            }
            else {
                const newCrumb = {
                    title: bookInfo.title,
                    cover_link: bookInfo.cover_link
                };
                setBreadCrumbs([...breadCrumbs, newCrumb]);
            }
            prevLocation.current = location;
        }
    }, [location, backCount])

    return (
        <div className="main-container">
            <header>
                <h1 className="page-title">Book Details</h1>
                <div>
                    &nbsp;<LogoutButton />
                </div>
            </header>
            <main>
                <fieldset className="crumb">
                    <legend>Previous pages</legend>
                    <nav>
                        {breadCrumbs.map((crumb, i) => (
                            <span key={i}>
                                {i > 0 && " "}
                                <img src={crumb.cover_link} alt={crumb.title} id={i} 
                                    onClick={goBack}/>
                            </span>
                        ))}
                    </nav>
                </fieldset>
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
                            setBackCount={setBackCount}
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