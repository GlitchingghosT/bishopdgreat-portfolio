import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminProjectsPage } from './components/AdminProjectsPage.tsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const RootComponent = normalizedPath === '/admin/projects' ? AdminProjectsPage : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
