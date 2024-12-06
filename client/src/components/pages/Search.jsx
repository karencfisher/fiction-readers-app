import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '../widgets/Tabs';
import { LogoutButton } from '../widgets/LogoutButton';
import { SearchForm } from '../forms/SearchForm';
import { BookAdd } from '../forms/BookAdd';
import { MemberBooks } from '../forms/MemberBooks';
import './style.css';

export function Search(props) {
    const [userID, setUserID] = useState(0);
    const navigate = useNavigate();

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
    }, [])

    return(
        <div className="main-container">
            <header>
                <h1 className="page-title">Book Search</h1>
                <div>
                    <button onClick={() => navigate('/home')}>Home</button>&nbsp;
                    <LogoutButton />
                </div>
            </header>
            <main>
            <Tabs className="book-tabs"
                tabLabels={["Members", "Genre", "Author", "Title", "New"]}
                tabContents={[
                    <MemberBooks />
                    , 
                    <SearchForm
                        searchType={'genre'}
                    />, 
                    <SearchForm
                        searchType={'author'}
                    />, 
                    <SearchForm
                        searchType={'title'}
                    />,
                    <BookAdd />
                ]}
            />
            </main>
        </div>
    )
}