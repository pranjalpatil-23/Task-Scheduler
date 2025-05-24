import React, { useEffect, useState } from 'react';

const UpNextList = ({ nextWeekOnly }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('priority-desc');
  const [openTaskId, setOpenTaskId] = useState(null);

  const fetchTasks = () => {
    fetch('http://localhost:5050/tasks', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5050/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setTasks(tasks => tasks.filter(task => task._id !== id));
    setOpenTaskId(null);
  };

  let filtered = tasks;
  if (nextWeekOnly) {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    filtered = tasks.filter(task => {
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= nextWeek;
    });
  }

  if (filter === 'priority-desc') {
    filtered = [...filtered].sort((a, b) => b.priority - a.priority);
  } else if (filter === 'priority-asc') {
    filtered = [...filtered].sort((a, b) => a.priority - b.priority);
  } else if (filter === 'deadline-asc') {
    filtered = [...filtered].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (filter === 'deadline-desc') {
    filtered = [...filtered].sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  }

  return (
    <div className="up-next-list">
      <div className="filter-bar">
        <span>Filter by: </span>
        <button className={filter === 'priority-desc' ? 'active' : ''} onClick={() => setFilter('priority-desc')}>Most Prior</button>
        <button className={filter === 'priority-asc' ? 'active' : ''} onClick={() => setFilter('priority-asc')}>Least Prior</button>
        <button className={filter === 'deadline-asc' ? 'active' : ''} onClick={() => setFilter('deadline-asc')}>Earliest Deadline</button>
        <button className={filter === 'deadline-desc' ? 'active' : ''} onClick={() => setFilter('deadline-desc')}>Latest Deadline</button>
      </div>
      <h2>Up Next</h2>
      <ul>
        {filtered.length === 0 && <li>No upcoming tasks for next week.</li>}
        {filtered.slice(0, 10).map(task => (
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

export default UpNextList;
