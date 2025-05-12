const API_BASE = 'http://localhost:5000';
const userId = '123';

async function fetchFeed() {
  try {
    const res = await fetch(`${API_BASE}/feed/${userId}`);
    const data = await res.json();

    const container = document.getElementById('feed');
    container.innerHTML = '';

    data.results.forEach(activity => {
      const card = document.createElement('div');
      card.className = 'activity';
      card.innerHTML = `
        <strong>${activity.actor}</strong> ${activity.verb} ${activity.object}<br/>
        Genre: ${activity.genre} | Popularity: ${activity.popularity}<br/>
        <button onclick="alert('Like simulated')">Like</button>
        <hr/>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Failed to fetch feed:', error);
    document.getElementById('feed').innerText = 'Error loading feed.';
  }
}

document.addEventListener('DOMContentLoaded', fetchFeed);
