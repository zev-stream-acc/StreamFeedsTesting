// Ranked Feed Full App using Stream.io (CommonJS Compatible)

// === SETUP ===
const Stream = require('getstream');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.STREAM_API_KEY || 'snheg68hp5r7';
const API_SECRET = process.env.STREAM_API_SECRET || 'x6s4a64s5wejjrr53xdzxaavcw39efe425uk6rfcxqak655jbf2t3hp9zvwwu3pa';
const APP_ID = process.env.STREAM_APP_ID || '123456';
const client = Stream.connect(API_KEY, API_SECRET, APP_ID);

const TEST_USER_ID = 'user:123';

// === GENERATE TOKEN ===
app.get('/token/:userId', (req, res) => {
  const userId = req.params.userId;
  const token = client.createUserToken(userId);
  res.send({ token });
});

// === SEED FEED WITH TEST ACTIVITIES FOR RANKING ===
app.post('/seed', async (req, res) => {
  const feed = client.feed('timeline', '123');
  const activities = [
    {
      actor: 'User:123', verb: 'post', object: 'Post:A', foreign_id: 'post:A',
      popularity: 10, genre: 'rock',
      time: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      actor: 'User:123', verb: 'post', object: 'Post:B', foreign_id: 'post:B',
      popularity: 90, genre: 'hip-hop',
      time: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
    },
    {
      actor: 'User:123', verb: 'post', object: 'Post:C', foreign_id: 'post:C',
      popularity: 50, genre: 'jazz',
      time: new Date().toISOString()
    },
    {
      actor: 'User:123', verb: 'post', object: 'Post:D', foreign_id: 'post:D',
      popularity: 100, genre: 'classical',
      time: new Date().toISOString()
    },
    {
      actor: 'User:123', verb: 'post', object: 'Post:E', foreign_id: 'post:E',
      popularity: 70, genre: 'rock',
      time: new Date().toISOString()
    }
  ];

  try {
    const result = await feed.addActivities(activities);
    res.send({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// === FETCH RANKED FEED ===
app.get('/feed/:userId', async (req, res) => {
  const userId = req.params.userId;
  const feed = client.feed('timeline', userId);

  try {
    const result = await feed.get({
      limit: 10,
      ranking: 'popularity',
    });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// === FRONTEND ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static frontend JS
app.get('/app.js', (req, res) => {
  res.type('application/javascript');
  fs.createReadStream(path.join(__dirname, 'app.js')).pipe(res);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
