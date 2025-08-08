import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@/styles/index.css'
import App from './App'
import Home from '@/pages/Home'
import Game from '@/pages/Game'
import Stats from '@/pages/Stats'
import HowToPlay from '@/pages/HowToPlay'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'game', element: <Game /> },
      { path: 'stats', element: <Stats /> },
      { path: 'how-to-play', element: <HowToPlay /> },
      { path: 'settings', element: <Settings /> },
      { path: 'login', element: <Login /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
