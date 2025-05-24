import React, { useState } from 'react';

const TaskForm = ({ onTaskAdded, showHeading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');

  const today = new Date();
  const minDate = today.toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !priority || !deadline) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5050/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, priority, deadline }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to add task');
      }
      setTitle(''); setDescription(''); setPriority(''); setDeadline('');
      setError('');
      if (onTaskAdded) onTaskAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {showHeading && <h2 className="task-form-heading">Add Task</h2>}
      {error && <div className="error">{error}</div>}
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="number" min="1" max="5" placeholder="Priority (1-5)" value={priority} onChange={e => setPriority(e.target.value)} required />
      <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} min={minDate} required />
      <button type="submit">Add Task</button>
    </form>
  );
};

export default TaskForm;
