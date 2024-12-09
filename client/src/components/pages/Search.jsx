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
    const [currentTab, setCurrentTab] = useState(0);
    const {prevState, setPrevState} = props;
    const navigate = useNavigate();
    const location = useLocation()
    const params = location.state;

    async function getUserInfo() {
		const result = await fetch('/registration/whoami/', {
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
                    <button onClick={() => navigate(-1)}>Back</button>&nbsp;
                    <LogoutButton />
                </div>
            </header>
            <main>
                <Tabs className="book-tabs"
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    tabLabels={["Members", "Genre", "Author", "Title", "New"]}
                    tabContents={[
                        <MemberBooks />, 
                        <SearchForm
                            searchType={'genre'}
                            prevState={prevState}
                            setPrevState={setPrevState}
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                        />, 
                        <SearchForm
                            searchType={'author'}
                            prevState={prevState}
                            setPrevState={setPrevState}
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                        />, 
                        <SearchForm
                            searchType={'title'}
                            prevState={prevState}
                            setPrevState={setPrevState}
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                        />,
                        <BookAdd />
                    ]}
                />
            </main>
        </div>
    )
}