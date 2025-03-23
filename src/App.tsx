import { useState } from 'react'
import { useEffect } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import ChatBot from "./components/ChatBot";
import './App.css'

function App() {
  useEffect(() => {
    // Set the title dynamically
    document.title = "Zeal AI";
  }, []);
  return (
    // <div className="flex justify-center items-center h-screen bg-gray-200">
      <ChatBot />
    // {/* </div> */}
  );
}

export default App
