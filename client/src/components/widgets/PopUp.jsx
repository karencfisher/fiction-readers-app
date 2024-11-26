import './PopUp.css';

export function PopUp(props) {
    const {message, kind, callback, hasCancelButton, modal} = props;

    return (
        <div className={modal ? "mask": "unmask"}>
            <div className="container">
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" 
                    rel="stylesheet"/>
                <div className="content">
                    <div className={kind}>
                        <span className="material-icons-outlined" style={{ fontSize: '48px' }}>
                            {kind === "error"? "error_outline": "info"}</span>
                    </div>
                    <div className="message" dangerouslySetInnerHTML={{ __html: message }}></div>
                </div>
                <div className="buttons">
                    <button onClick={callback}>OK</button>
                    {hasCancelButton ? <button onClick={callback}>Cancel</button> : <></>}
                </div>
            </div>
        </div>
    )
}
