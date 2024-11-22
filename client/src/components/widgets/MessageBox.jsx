import './MessageBox.css';

export function MessageBox(props) {
    const {message, kind} = props;

    return (
        <div className="container">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" 
                  rel="stylesheet"/>
            <div className="content">
                <div className='kind'>
                    <span className="material-icons-outlined eyes">{kind}</span>
                </div>
                <div className='message'></div>
            </div>
        </div>
    )
}