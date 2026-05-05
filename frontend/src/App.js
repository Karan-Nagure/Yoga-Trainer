import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TrainerPage from './pages/TrainerPage';
import DashboardPage from './pages/DashboardPage';
import FlowsPage from './pages/FlowsPage';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">🧘</span>
            <span className="brand-name">YogaAI</span>
            <span className="brand-sub">Smart Trainer</span>
          </div>
          <div className="navbar-links">
            <NavLink to="/" end className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
            <NavLink to="/trainer" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Train</NavLink>
            <NavLink to="/flows" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Flows</NavLink>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
          </div>
          <div className="navbar-status">
            <span className={`status-dot ${backendStatus}`}></span>
            <span className="status-text">{backendStatus === 'online' ? 'AI Ready' : backendStatus === 'offline' ? 'Backend Offline' : 'Connecting...'}</span>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/flows" element={<FlowsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
