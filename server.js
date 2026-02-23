require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 初始化数据库表
async function initDB() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS leaderboard (
          id SERIAL PRIMARY KEY,
          player_name VARCHAR(50) NOT NULL,
          score INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_score ON leaderboard(score DESC)
      `);
      console.log('Database initialized successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    console.error('Server will continue but database features may not work');
  }
}

// 获取排行榜
app.get('/api/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT player_name, score, created_at FROM leaderboard ORDER BY score DESC LIMIT 10'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 提交分数
app.post('/api/score', async (req, res) => {
  const { playerName, score } = req.body;

  if (!playerName || !score) {
    return res.status(400).json({ error: 'Player name and score are required' });
  }

  try {
    await pool.query(
      'INSERT INTO leaderboard (player_name, score) VALUES ($1, $2)',
      [playerName, score]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error submitting score:', err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Start server first, then initialize database
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  initDB();
});
