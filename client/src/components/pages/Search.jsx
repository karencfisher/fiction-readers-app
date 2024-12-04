import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '../widgets/Tabs';
import { LogoutButton } from '../widgets/LogoutButton';
import { SearchForm } from '../forms/SearchForm';
import './style.css';

export function Search(props) {
    const [userID, setUserID] = useState(0);
    const [whichTab, setWhichTab] = useState('genre');
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
                    <button onClick={() => navigate(-1)}>Home</button>&nbsp;
                    <LogoutButton />
                </div>
            </header>
            <main>
            <Tabs className="book-tabs"
            setWhichTab={setWhichTab}
                tabLabels={["Genre", "Author", "Title"]}
                tabContents={[
                    <SearchForm
                        searchType={'genre'}
                        whichTab={whichTab}
                    />, 
                    <SearchForm
                        searchType={'author'}
                        whichTab={whichTab}
                    />, 
                    <SearchForm
                        searchType={'title'}
                        whichTab={whichTab}
                    />
                ]}
            />
            </main>
        </div>
    )
}