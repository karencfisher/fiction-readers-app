import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createHashRouter,
  RouterProvider
} from 'react-router-dom';
import App from './App.jsx'
import {Home} from "./components/pages/Home.jsx"
import {Landing} from "./components/pages/Landing.jsx"
import './index.css'
import 'vite/modulepreload-polyfill'

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
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
