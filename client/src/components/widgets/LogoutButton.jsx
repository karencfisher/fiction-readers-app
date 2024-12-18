import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
    const navigate = useNavigate();

    async function logout() {
		const res = await fetch("/registration/logout/", {
			credentials: "same-origin"
		});

		if (res.ok) {
			navigate('/');
		}
	}

    return (
        <button onClick={logout}>Logout</button>
    )
}