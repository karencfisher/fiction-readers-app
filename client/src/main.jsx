import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider
} from 'react-router-dom';
import App from './App.jsx'
import {Home} from "./components/pages/Home.jsx"
import {Landing} from "./components/pages/Landing.jsx"

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider 
    future={{
      v7_startTransition: true,
    }}
    router={router} />
)
