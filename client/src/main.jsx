import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider
} from 'react-router-dom';
import App from './App.jsx'
import { Home } from "./components/pages/Home.jsx"
import { Landing } from "./components/pages/Landing.jsx"
import { BookPage } from './components/pages/BookPage.jsx';
import { Search } from './components/pages/Search.jsx';

const AppWrapper = () => {
	const [prevState, setPrevState] = React.useState({});
	
	const router = createHashRouter([
		{
			path: "/",
			element: <App />,
			children: [
				{
					path: "/",
					element: <Landing />
				},
				{
					path: "/home",
					element: <Home />
				},
				{
					path: "/book_page",
					element: <BookPage />
				},
				{
					path: "/search",
					element: <Search 
								prevState={prevState}
								setPrevState={setPrevState}
							/>
				}
			]
		},
	],
		{
			future: {
			v7_fetcherPersist: true,
			v7_normalizeFormMethod: true,
			v7_partialHydration: true,
			v7_relativeSplatPath: true,
			v7_skipActionErrorRevalidation: true,
			v7_startTransition: true,
			}
		}
	)
	return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
	<AppWrapper />
);

