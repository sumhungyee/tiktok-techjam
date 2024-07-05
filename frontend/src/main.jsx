import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import "./styles/index.css";
import "./styles/output.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="size-full mt-16">
      <App />
    </div>
  </React.StrictMode>,
)
