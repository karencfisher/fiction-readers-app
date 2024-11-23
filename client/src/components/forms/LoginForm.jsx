import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './forms.css';

export function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [visibility, setVisibility] = useState("visibility_off")
    const [passwordType, setPasswordType] = useState("password")
    const navigate = useNavigate();

    async function login(e) {
        e.preventDefault();
        const result = await fetch('/registration/sign_in/', {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify({
                username: username, 
                password: password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const response = await result.json();

        if (Object.keys(response)[0] === "error") {
            console.log(response.error)
        }
        else {
            navigate('/home');
        }
    }

    function toggleVisibility(e) {
        if (visibility === "visibility_off") {
            setVisibility("visibility");
            setPasswordType("text");
        }
        else {
            setVisibility("visibility_off");
            setPasswordType("password");
        }
    }

    return (
        <form onSubmit={login} method="post">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
            <div className="field">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={username} 
                       onChange={(e => setUsername(e.target.value))}/>
            </div>
            <div className="field">
                <label htmlFor="password">Password</label>
                <input type={passwordType} id="password" name="password" value={password} 
                       onChange={e => setPassword(e.target.value)}/>
                <span className="material-icons-outlined eyes" onClick={toggleVisibility}>{visibility}</span>
            </div>
            <button>Sign In</button>
        </form>
    )
}