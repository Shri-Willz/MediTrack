import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import "./index.css";
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your Publishable Key
const PUBLISHABLE_KEY = "pk_test_ZmFpci1yYWNjb29uLTM5LmNsZXJrLmFjY291bnRzLmRldiQ"

if (!PUBLISHABLE_KEY) {
throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
    </ClerkProvider>
  ` </React.StrictMode>,
)
