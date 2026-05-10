require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'reality_check_super_secret_key';

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Create tables if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    estimated_time INTEGER NOT NULL,
    actual_time INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_running BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(console.error);

// Attempt to add columns in case table already exists
pool.query(`
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'medium';
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time TIMESTAMP;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_running BOOLEAN DEFAULT false;
`).catch(err => {
  // Ignore error if it already exists
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    res.json({ message: 'User created successfully', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', authenticateToken, async (req, res) => {
  const { title, estimated_time, priority = 'medium' } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, estimated_time, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, estimated_time, priority]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, estimated_time, actual_time, status, priority } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           estimated_time = COALESCE($2, estimated_time), 
           actual_time = COALESCE($3, actual_time), 
           status = COALESCE($4, status),
           priority = COALESCE($5, priority)
       WHERE id = $6 AND (user_id = $7 OR user_id IS NULL) RETURNING *`,
      [title, estimated_time, actual_time, status, priority, id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *', [id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks/:id/start', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE tasks SET start_time = NOW(), is_running = true WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *`,
      [id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks/:id/stop', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET end_time = NOW(),
           is_running = false,
           status = 'completed',
           actual_time = COALESCE(actual_time, 0) + GREATEST(ROUND(EXTRACT(EPOCH FROM (NOW() - start_time)) / 60), 0)
       WHERE id = $1 AND (user_id = $2 OR user_id IS NULL) RETURNING *`,
      [id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/user/update', authenticateToken, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email',
      [name, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/user/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    if (!validPassword) return res.status(400).json({ error: 'Incorrect current password' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, req.user.id]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1 OR user_id IS NULL", [req.user.id]);
    const tasks = result.rows;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;

    const completionScore = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    let totalEstimated = 0;
    let totalActual = 0;

    tasks.forEach((t) => {
      totalEstimated += t.estimated_time || 0;
      totalActual += t.actual_time || 0;
    });

    let accuracyScore = 0;
    if (totalEstimated > 0) {
      const diff = Math.abs(totalEstimated - totalActual);
      accuracyScore = Math.max(0, 100 - (diff / totalEstimated) * 100);
    }

    const realityScore = totalTasks === 0 ? 0 : (completionScore + accuracyScore) / 2;

    let insight = "Good consistency 👍";
    if (totalTasks === 0) {
      insight = "Start adding tasks to see your reality score.";
    } else if (completionScore < 50) {
      insight = "You planned too much but executed less 💀";
    } else if (accuracyScore < 60) {
      insight = "Your time estimation is way off ⏱️";
    } else if (realityScore > 80) {
      insight = "You are actually disciplined today 🔥";
    }

    res.json({
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_score: completionScore.toFixed(2),
      accuracy_score: accuracyScore.toFixed(2),
      reality_score: realityScore.toFixed(2),
      insight,
    });
  } catch (err) {
    res.status(500).send("Error calculating analytics");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});