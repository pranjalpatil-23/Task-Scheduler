import React from 'react';
import './HomePage.css';

const HomePage = ({ user }) => (
  <div className="home-page">
    <div className="home-welcome">
      <h1>Welcome to <span className="brand">Task Scheduler</span>{user?.username ? `, ${user.username}` : ''}!</h1>
      <p className="home-sub">Organize your day, prioritize your work, and never miss a deadline.</p>
    </div>
    <div className="home-features">
      <h2>Features</h2>
      <ul>
        <li><span role="img" aria-label="add">📝</span> Add tasks with title, description, priority, and deadline</li>
        <li><span role="img" aria-label="up next">⏰</span> See your most urgent tasks in the <b>Upcoming Tasks</b> list</li>
        <li><span role="img" aria-label="calendar">📅</span> Visualize your schedule in the <b>All Tasks</b> calendar view</li>
        <li><span role="img" aria-label="secure">🔒</span> All your data is private and secure</li>
        <li><span role="img" aria-label="smart">🤖</span> Smart scheduling with priority queue and deadline optimization</li>
      </ul>
    </div>
  </div>
);

export default HomePage;
