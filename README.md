This repo provides a working proof of concept for integrating Stream Activity Feeds with custom ranking and personalized content delivery using user engagement signals and OpenAI GPT scoring.

The goal of this POC is to demonstrate two common feed experiences:

Ranked Feed: Ordered by popularity using a Stream ranking function.

Personalized Feed: Tailored to individual users based on their actual interactions with content (likes), scored by a lightweight recommendation layer.

This approach does not depend on Stream's deprecated personalization logic. Instead, it uses supported APIs and external logic to achieve dynamic, user-specific content delivery.

Features
Global feed seeded with posts tagged by genre and popularity

Ranked feed using Stream's ranking formulas (e.g. by reaction counts)

Personalized feed per user (personalized:userId) based on engagement

Local engagement tracking with per-user preference modeling

GPT-based relevance scoring using OpenAI to select content per user

Two standalone apps (Ranked and Personalized) for isolated testing

Setup
Clone the repository

Install dependencies

bash
Copy
Edit
npm install
Create a .env file in each project folder (RankedFeed/ and PersonalizedFeed/) with the following:

env
Copy
Edit
STREAM_API_KEY=
STREAM_API_SECRET=
STREAM_APP_ID=
STREAM_ANALYTICS_TOKEN=
OPENAI_API_KEY=
Note: The app will not run without valid API keys.

Start the server

bash
Copy
Edit
node server.js
Access the feed viewer

Ranked Feed: http://localhost:5000

Personalized Feed: http://localhost:5001

Personalized Feed Workflow
Seed the global feed with genre-tagged posts

Engage with content (like buttons) to simulate user interest

Rebuild the personalized feed based on updated preferences

View the personalized feed with relevance-ranked content

No analytics SDK or external ML infrastructure is required. All scoring and logic runs via API-based enrichment and OpenAI prompt engineering.

Notes
Data is stored locally in engagements.json for simplicity

This is intended as a validation layer and architecture reference

Ideal for teams exploring feed personalization without complex ML pipelines

