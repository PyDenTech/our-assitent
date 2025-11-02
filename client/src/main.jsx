import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import './index.css'

const queryClient = new QueryClient()
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (import.meta.env.DEV && !googleClientId) {
  console.warn("VITE_GOOGLE_CLIENT_ID não encontrado. Defina em .env.local.")
}

// Render com Provider apenas se houver clientId.
// Sem clientId, a app continua funcional e evita erro em runtime.
const AppTree = (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {googleClientId
      ? <GoogleOAuthProvider clientId={googleClientId}>{AppTree}</GoogleOAuthProvider>
      : AppTree}
  </React.StrictMode>
)
