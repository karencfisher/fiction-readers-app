import { useNavigate } from "react-router-dom";

export function SearchButton() {
    const navigate = useNavigate();

    function onSearchClick() {
		navigate("/Search");
	}

    return (
        <button onClick={onSearchClick}>Search</button>
    )
}