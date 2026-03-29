import React, { useState, useEffect } from 'react';
import LoginView from './pages/LoginView';
import DashboardView from './pages/DashboardView';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const cursor = document.querySelector('.custom-cursor');
    const dot = document.querySelector('.custom-cursor-dot');
    
    const moveCursor = (e) => {
      if(dot) {
         dot.style.left = e.clientX + 'px';
         dot.style.top = e.clientY + 'px';
      }
      setTimeout(() => {
         if(cursor) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
         }
      }, 50);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <div>
      <div className="custom-cursor-dot"></div>
      <div className="custom-cursor"></div>
      <div className="mesh-bg"></div>
      <div className="container">
        {!token ? (
          <LoginView setToken={setToken} />
        ) : (
          <DashboardView token={token} onLogout={() => setToken(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
