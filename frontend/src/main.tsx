import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Find the root div in index.html and mount the React app inside it
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode helps catch bugs during development by running extra checks
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
