# Stream Feeds Demo: Ranked and Personalized

This repository provides a working proof of concept for building **ranked** and **personalized** activity feeds using the [Stream Activity Feeds API](https://getstream.io) and OpenAI.

The project showcases two common use cases:

- **Ranked Feeds**: Sorted using Stream’s native ranking methods (e.g., by popularity or reaction count).
- **Personalized Feeds**: Customized per user based on engagement behavior (e.g., likes), using OpenAI GPT for lightweight relevance scoring.

This architecture avoids deprecated personalization features and instead relies on Stream’s supported APIs, OpenAI, and minimal backend logic.

## Features

- Global feed with posts tagged by `genre` and `popularity`
- Ranked timeline feed using Stream’s ranking algorithm
- Personalized feed generated per user via OpenAI GPT scoring
- Click-to-like UI tracking, stored locally
- Dynamic user preference profiles inferred from engagement
- Separated frontend and backend logic for clarity
- Two isolated projects: one for ranked, one for personalized feeds

## Project Structure
FeedTest/
│
├── RankedFeed/
│ ├── server.js
│ ├── app.js
│ └── index.html
│
├── PersonalizedFeed/
│ ├── server.js
│ ├── app.js
│ ├── index.html
│ └── engagements.json

## Setup

1. Clone this repository:

```bash
git clone https://github.com/YOUR_USERNAME/personalized-feed-demo.git
cd personalized-feed-demo
Install dependencies (in each folder):

bash
npm install
Create a .env file in both RankedFeed/ and PersonalizedFeed/:

env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
STREAM_APP_ID=your_stream_app_id
STREAM_ANALYTICS_TOKEN=your_analytics_token
OPENAI_API_KEY=your_openai_key

Start the server:
bash
node server.js

## Open the Feed Viewer in Your Browser

- **Ranked Feed**: [http://localhost:5000](http://localhost:5000)  
- **Personalized Feed**: [http://localhost:5001](http://localhost:5001)

## Personalized Feed Workflow

- Use `/seed-global` to populate the global feed  
- Click "Like" on any post (tracked via `foreign_id`)  
- Local storage (`engagements.json`) records per-user genre preferences  
- Run `/rebuild-personalized/:userId` to regenerate content based on current preferences  
- OpenAI returns a relevance score (0–1) per post based on the user’s inferred interests  
- The feed filters and shows only the most relevant posts  

## Notes

- Engagements are stored in JSON to avoid DB setup  
- OpenAI is used purely for prompt-based inference (no training required)  
- This is ideal for validation, experimentation, or architecture prototyping  

For more about Stream Activity Feeds, visit [getstream.io](https://getstream.io)
