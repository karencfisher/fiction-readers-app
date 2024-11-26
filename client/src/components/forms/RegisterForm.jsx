import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PopUp } from '../widgets/PopUp';
import * as cookie from "cookie";
import './forms.css';

export function RegisterForm() {
    const [visibility, setVisibility] = useState("visibility_off")
    const [passwordType, setPasswordType] = useState("password")
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [popup, setPopup] = useState({open: false});

    const navigate = useNavigate();
    const popUpHandler = () => setPopup({...popup, open: false})

    async function register(e) {
        e.preventDefault();
        const result = await fetch('/registration/sign_up/', {
            method: "post",
            credentials: "same-origin",
            body: JSON.stringify({
                username: username, 
                password: password,
                email: email,
                first_name: firstName,
                last_name: lastName
            }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.parse(document.cookie).csrftoken
            }
        });
        const response = await result.json();

        if (result.status !== 200) {
            setPopup({...popup, 
                msg: response.error, 
                kind: "error",
                open: true
            });
        }
        else {
            setPopup({...popup, 
                msg: "Joined successfully! You may login now.", 
                kind: "info",
                open: true
            });
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
        <form onSubmit={register} method="post">
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
            {popup.open && 
                (<PopUp  
                    kind={popup.kind}
                    message={popup.msg}
                    callback={popUpHandler}
                    modal={true}
                    hasCancelButton={false}
                />)}
        </form>
    )
}

