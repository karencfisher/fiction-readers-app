import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '../widgets/Tabs';
import { LogoutButton } from '../widgets/LogoutButton';
import { BookInfo } from '../forms/BookInfo';

import './style.css';

export function BookPage({ route }) {
    const [userID, setUserID] = useState(0);
    const navigate = useNavigate();
    const location = useLocation()
    const params = location.state;

    console.log(`Book id ${params.book_id}`);

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

    useEffect(() => {
        getUserInfo();
    }, []);

    return (
        <div className="main-container">
            <header>
                <h1 className="page-title">Book</h1>
                <LogoutButton />
            </header>
            <main>
                <Tabs
                    tabLabels={["About", "Review", "Similar"]}
                    tabContents={[<BookInfo book_id={params.book_id}/>, 
                                  "soon", 
                                  "later"]}
                />
            </main>
        </div>
    )
}