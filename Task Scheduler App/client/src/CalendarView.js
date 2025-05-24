import React, { useEffect, useState } from 'react';

const CalendarView = () => {
  const [schedule, setSchedule] = useState([]);
  const [filter, setFilter] = useState('priority-desc');
  const [openTaskId, setOpenTaskId] = useState(null);

  const fetchSchedule = () => {
    fetch('http://localhost:5050/schedule', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSchedule(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5050/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setSchedule(schedule => schedule.filter(task => task._id !== id));
    setOpenTaskId(null);
  };

  let filtered = [...schedule];
  if (filter === 'priority-desc') {
    filtered = filtered.sort((a, b) => b.priority - a.priority);
  } else if (filter === 'priority-asc') {
    filtered = filtered.sort((a, b) => a.priority - b.priority);
  } else if (filter === 'deadline-asc') {
    filtered = filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (filter === 'deadline-desc') {
    filtered = filtered.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  }

  return (
    <div className="calendar-view">
      <div className="filter-bar">
        <span>Filter by: </span>
        <button className={filter === 'priority-desc' ? 'active' : ''} onClick={() => setFilter('priority-desc')}>Most Prior</button>
        <button className={filter === 'priority-asc' ? 'active' : ''} onClick={() => setFilter('priority-asc')}>Least Prior</button>
        <button className={filter === 'deadline-asc' ? 'active' : ''} onClick={() => setFilter('deadline-asc')}>Earliest Deadline</button>
        <button className={filter === 'deadline-desc' ? 'active' : ''} onClick={() => setFilter('deadline-desc')}>Latest Deadline</button>
      </div>
      <h2>All Tasks (Scheduled)</h2>
      <ul>
        {filtered.length === 0 && <li>No tasks found.</li>}
        {filtered.map(task => (
          <li key={task._id} 
              className={task.completed ? 'completed' : ''}
              onClick={() => setOpenTaskId(openTaskId === task._id ? null : task._id)} 
              style={{cursor:'pointer', position:'relative'}}>
            <strong>{task.title}</strong> (Priority: {task.priority})<br />
            Deadline: {new Date(task.deadline).toLocaleString()}
            {openTaskId === task._id && (
              <>
                {task.description && (
                  <div className="task-desc">{task.description}</div>
                )}
                <button
                  className="delete-task-btn"
                  style={{ marginTop: '0.7rem', alignSelf: 'flex-start' }}
                  onClick={e => { e.stopPropagation(); handleDelete(task._id); }}
                >
                  Delete Task
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarView;
