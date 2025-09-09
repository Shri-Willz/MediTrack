import React from "react";
import App from "./App";
import "./index.css";
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { Buffer } from 'buffer';




if (!window.Buffer) {
  window.Buffer = Buffer;
}

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

 


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
    </ClerkProvider>
   </React.StrictMode>,
)
