import { useState, useEffect } from 'react';
import { PopUp } from '../widgets/PopUp';
import './BookInfo.css';


export function BookInfo(props) {
    const [bookInfo, setBookInfo] = useState({});
    const [popup, setPopup] = useState({open: false});
    const {book_id} = props;
    const popUpHandler = () => setPopup({...popup, open: false})

    async function getBookInfo(book_id) {
        const result = await fetch(`/books/${book_id}`, {
            credentials: "same-origin"
        });
        const info = await result.json();
        if (result.status !== 200) {
            setPopup({...popup, msg: info.error})
        }
        else {
            setBookInfo(info);
        }
    }

    useEffect(() => {
        if (book_id) getBookInfo(book_id);
    }, []);

    return (
        <>
            <div>
                {bookInfo.title}
            </div>
            {popup.open && (
                <PopUp
                    kind="error"
                    message={popup.msg}
                    callback={popUpHandler}
                    modal={true}
                    hasCancelButton={false}
                />
            )}
        </>
    );
}