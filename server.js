// Personalized Feed App with Local Engagement Tracking and GPT Scoring

const Stream = require('getstream');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.STREAM_API_KEY;
const API_SECRET = process.env.STREAM_API_SECRET;
const APP_ID = process.env.STREAM_APP_ID;
const ANALYTICS_TOKEN = process.env.STREAM_ANALYTICS_TOKEN;
const client = Stream.connect(API_KEY, API_SECRET, APP_ID);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const engagementPath = path.join(__dirname, 'engagements.json');

function loadEngagements() {
  try {
    const raw = fs.readFileSync(engagementPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}

function saveEngagements(data) {
  fs.writeFileSync(engagementPath, JSON.stringify(data, null, 2));
}

// === Generate token ===
app.get('/token/:userId', (req, res) => {
  const userId = req.params.userId;
  const token = client.createUserToken(userId);
  res.send({ token });
});

// === Seed a global feed with genre-tagged posts ===
app.post('/seed-global', async (req, res) => {
  const feed = client.feed('global', 'main');
  const posts = [
    { object: 'Post:X', genre: 'rock', popularity: 95 },
    { object: 'Post:Y', genre: 'jazz', popularity: 80 },
    { object: 'Post:Z', genre: 'hip-hop', popularity: 60 },
    { object: 'Post:W', genre: 'classical', popularity: 30 },
    { object: 'Post:V', genre: 'rock', popularity: 85 },
  ];

  const activities = posts.map((p, i) => ({
    actor: 'User:seed',
    verb: 'post',
    object: p.object,
    foreign_id: `post:${p.object}`,
    genre: p.genre,
    popularity: p.popularity,
    time: new Date(Date.now() - i * 3600000).toISOString()
  }));

  try {
    const result = await feed.addActivities(activities);
    res.send({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// === Track like as engagement event ===
app.post('/engage/:userId', async (req, res) => {
  const { foreign_id } = req.body;
  const userId = req.params.userId;

  const globalFeed = client.feed('global', 'main');
  const engagements = loadEngagements();
  engagements[userId] = engagements[userId] || { liked_genres: {} };

  try {
    const globalContent = await globalFeed.get({ limit: 100 });
    const post = globalContent.results.find(a => a.foreign_id === foreign_id);
    if (!post || !post.genre) throw new Error('Genre not found');

    const genre = post.genre;
    engagements[userId].liked_genres[genre] = (engagements[userId].liked_genres[genre] || 0) + 1;
    saveEngagements(engagements);

    console.log(`Recorded like by ${userId} on genre ${genre}`);
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// === Rebuild personalized feed using OpenAI GPT scoring ===
app.post('/rebuild-personalized/:userId', async (req, res) => {
  const userId = req.params.userId;
  const globalFeed = client.feed('global', 'main');
  const personalizedFeed = client.feed('personalized', userId);
  const engagements = loadEngagements();
  const profile = engagements[userId]?.liked_genres || {};

  const preferenceText = Object.entries(profile)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => `- ${genre} (${count} likes)`).join('\n') || 'No strong preferences.';

  try {
    const globalContent = await globalFeed.get({ limit: 100 });

    const scored = await Promise.all(
      globalContent.results.map(async activity => {
        const prompt = `\nPost metadata:\n- Genre: ${activity.genre}\n- Popularity score: ${activity.popularity}\n\nUser preference:\n${preferenceText}\n\nOn a scale from 0 to 1, how likely is it that this user would find this post highly relevant and engaging? Reply with just a decimal number.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });

        const relevance = parseFloat(completion.choices[0].message.content);
        return { ...activity, relevance: isNaN(relevance) ? 0 : relevance };
      })
    );

    // Clear old personalized feed items
    const oldItems = await personalizedFeed.get({ limit: 100 });
    for (const activity of oldItems.results) {
      await personalizedFeed.removeActivity({ foreignId: activity.foreign_id });
    }

    const topPosts = scored.filter(a => a.relevance > 0.7).map(a => ({
      actor: a.actor,
      verb: a.verb,
      object: a.object,
      foreign_id: a.foreign_id + `:p-${userId}`,
      genre: a.genre,
      popularity: a.popularity,
      relevance: a.relevance,
      to: [`personalized:${userId}`],
      time: a.time
    }));

    const result = await globalFeed.addActivities(topPosts);
    res.send({ success: true, added: result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// === Fetch a user's personalized feed ===
app.get('/feed/personalized/:userId', async (req, res) => {
  const userId = req.params.userId;
  const feed = client.feed('personalized', userId);

  try {
    const result = await feed.get({ limit: 10 });
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

// === Serve frontend ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/app.js', (req, res) => {
  res.type('application/javascript');
  fs.createReadStream(path.join(__dirname, 'app.js')).pipe(res);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Personalized feed server running on port ${PORT}`);
});
