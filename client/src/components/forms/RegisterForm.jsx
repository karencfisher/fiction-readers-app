import { useState } from 'react';
import './forms.css';

export function RegisterForm() {
    const [visibility, setVisibility] = useState("visibility_off")
    const [passwordType, setPasswordType] = useState("password")
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    async function register(e) {
    
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
        <form action="/landing/sign_up/" method="post">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
            <div className="field">
                <label htmlFor="first_name">First Name</label>
                <input type="text" id="first_name" name="first_name" value={firstName} 
                       onChange={(e => setFirstName(e.target.value))}/>
            </div>
            <div className="field">
                <label htmlFor="last_name">Last Name</label>
                <input type="text" id="last_name" name="last_name" value={lastName}
                       onChange={(e => setLastName(e.target.value))} />
            </div>
            <div className="field">
                <label htmlFor="user_name">Username</label>
                <input type="text" id="user_name" name="user_name" value={username}
                       onChange={(e => setUsername(e.target.value))} />
            </div>
            <div className="field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={email}
                       onChange={(e => setEmail(e.target.value))} />
            </div>
            <div className="field">
                <label htmlFor="password">Password</label>
                <input type={passwordType} id="pass_word" name="pass_word" value={password}
                       onChange={(e => setPassword(e.target.value))} />
                <span className="material-icons-outlined eyes" onClick={toggleVisibility}>{visibility}</span>
            </div>
            <button>Create Account</button>
        </form>
    )
}

