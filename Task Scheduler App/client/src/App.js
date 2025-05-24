import logo from './logo.svg';
import './App.css';
import TaskForm from './TaskForm';
import UpNextList from './UpNextList';
import CalendarView from './CalendarView';
import HomePage from './HomePage';
import React, { useState } from 'react';
import { UserProvider } from './UserContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showTaskBar, setShowTaskBar] = useState(false);

  React.useEffect(() => {
    fetch('http://localhost:5050/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data && data.username ? data : null));
  }, [refresh]);

  const handleTaskAdded = () => {
    setRefresh(r => !r);
    setShowTaskBar(false);
    setActiveTab('all');
  };
  const handleLogin = () => { setRefresh(r => !r); setShowLogin(false); };
  const handleRegister = () => { setShowRegister(false); setShowLogin(true); };
  const handleLogout = async () => {
    await fetch('http://localhost:5050/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setShowLogin(true);
  };

  if (!user) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Task Scheduler</h1>
          {showLogin && <LoginPage onLogin={handleLogin} />}
          {!showLogin && showRegister && <RegisterPage onRegister={handleRegister} />}
          <div style={{ marginTop: '1rem' }}>
            {showLogin ? (
              <span>Don't have an account? <button onClick={() => { setShowLogin(false); setShowRegister(true); }}>Register</button></span>
            ) : (
              <span>Already have an account? <button onClick={() => { setShowLogin(true); setShowRegister(false); }}>Login</button></span>
            )}
          </div>
        </header>
      </div>
    );
  }

  return (
    <UserProvider>
      <div className="App">
        <div className="main-header" onClick={() => { setActiveTab('home'); setShowTaskBar(false); }}>
          Task Scheduler
        </div>
        <header className="App-header">
          <div style={{ alignSelf: 'flex-end', marginBottom: '1rem' }}>
            <span>Welcome, {user.username}! </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="tab-bar">
            <button className={activeTab === 'add' ? 'active' : ''} onClick={() => { setShowTaskBar(true); setActiveTab('add'); }}>Add Task</button>
            <button className={activeTab === 'upnext' ? 'active' : ''} onClick={() => { setShowTaskBar(false); setActiveTab('upnext'); }}>Upcoming Tasks</button>
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => { setShowTaskBar(false); setActiveTab('all'); }}>All Tasks</button>
          </div>
          {showTaskBar && activeTab === 'add' && (
            <div className="task-bar">
              <TaskForm onTaskAdded={handleTaskAdded} showHeading />
            </div>
          )}
          {activeTab === 'home' && <HomePage user={user} />}
          {activeTab === 'upnext' && <UpNextList key={refresh} nextWeekOnly />}
          {activeTab === 'all' && <CalendarView key={refresh} />}
        </header>
      </div>
    </UserProvider>
  );
}

export default App;
