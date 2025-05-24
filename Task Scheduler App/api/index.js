require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./models/Task');
const User = require('./models/User');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskSchedulerDB';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected:', mongoUri))
  .catch(err => console.error('MongoDB connection error:', err));

const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET || 'tasksecret';

// ─── AUTH ROUTES ───────────────────────────────────────────────
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(201).json(userDoc);
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      res.status(400).json({ message: e.message });
    }
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) return res.status(400).json({ message: 'User not found' });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token, { httpOnly: true }).json({ id: userDoc._id, username });
      });
    } else {
      res.status(400).json({ message: 'Wrong credentials' });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(401).json('Invalid token');
    res.json(info);
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

// POST /tasks - Add a new task (auth required)
app.post('/tasks', async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json('Not authenticated');
  let userInfo;
  try {
    userInfo = jwt.verify(token, secret);
  } catch (e) {
    return res.status(401).json('Invalid token');
  }
  try {
    const { title, description, priority, deadline } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      deadline,
      completed: false,
      user: userInfo.id
    });
    res.status(201).json(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/tasks', async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json('Not authenticated');
  let userInfo;
  try {
    userInfo = jwt.verify(token, secret);
  } catch (e) {
    return res.status(401).json('Invalid token');
  }
  try {
    const tasks = await Task.find({ user: userInfo.id });
    tasks.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /schedule - Greedy interval scheduling for logged-in user
app.get('/schedule', async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json('Not authenticated');
  let userInfo;
  try {
    userInfo = jwt.verify(token, secret);
  } catch (e) {
    return res.status(401).json('Invalid token');
  }
  try {
    const tasks = await Task.find({ completed: false, user: userInfo.id });
    const sorted = tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const schedule = [];
    let lastEnd = null;
    for (const task of sorted) {
      const start = lastEnd ? new Date(lastEnd) : new Date();
      const end = new Date(task.deadline);
      if (!lastEnd || end <= new Date(task.deadline)) {
        schedule.push({ ...task.toObject(), scheduledStart: start, scheduledEnd: end });
        lastEnd = end;
      }
    }
    res.json(schedule);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /tasks/:id - Delete a task for the logged-in user
app.delete('/tasks/:id', async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json('Not authenticated');
  let userInfo;
  try {
    userInfo = jwt.verify(token, secret);
  } catch (e) {
    return res.status(401).json('Invalid token');
  }
  try {
    const result = await Task.deleteOne({ _id: req.params.id, user: userInfo.id });
    if (result.deletedCount === 0) return res.status(404).json('Task not found');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log('Server running on port', PORT));
