// src/main.tsx
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
import AuthCallback from '@/pages/AuthCallback'
import AuthDebug from '@/pages/AuthDebug'

import './i18n'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'game', element: <Game /> },
      { path: 'stats', element: <Stats /> },
      { path: 'how-to-play', element: <HowToPlay /> },
      { path: 'settings', element: <Settings /> },
      { path: 'login', element: <Login /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      { path: 'auth/debug', element: <AuthDebug /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
