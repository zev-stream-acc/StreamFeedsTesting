const API_BASE = 'http://localhost:5001';
const userId = '123';

function initApp() {
  async function fetchPersonalizedFeed() {
    try {
      const res = await fetch(`${API_BASE}/feed/personalized/${userId}`);
      const data = await res.json();

      const container = document.getElementById('feed');
      container.innerHTML = '';

      if (!data.results || !data.results.length) {
        container.innerHTML = '<p>No personalized posts found.</p>';
        return;
      }

      data.results.forEach((activity, index) => {
        const card = document.createElement('div');
        card.className = 'activity';

        const relevanceText = activity.relevance !== undefined
          ? `<em>Relevance Score: ${activity.relevance.toFixed(2)}</em><br/>`
          : '';

        card.innerHTML = `
          <strong>${activity.actor}</strong> ${activity.verb} ${activity.object}<br/>
          Genre: ${activity.genre} | Popularity: ${activity.popularity}<br/>
          ${relevanceText}
          <button id="like-btn-${index}">Like</button>
          <hr/>
        `;

        container.appendChild(card);

        document.getElementById(`like-btn-${index}`).addEventListener('click', async () => {
          alert(`You liked ${activity.object}`);

          try {
            const response = await fetch(`${API_BASE}/engage/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ foreign_id: activity.foreign_id })
            });

            if (!response.ok) throw new Error('Engagement failed');
            console.log(`Engagement recorded for ${activity.foreign_id}`);
          } catch (err) {
            console.error('Failed to track engagement:', err);
          }
        });
      });

    } catch (error) {
      console.error('Failed to load personalized feed:', error);
      document.getElementById('feed').innerText = 'Error loading feed.';
    }
  }

  fetchPersonalizedFeed();
}

document.addEventListener('DOMContentLoaded', initApp);
