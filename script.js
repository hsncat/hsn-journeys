document.addEventListener('DOMContentLoaded', () => {
    const cityList = getCityList();
    const cityCount = cityList.length;
    const journeyCount = journeys.length;
    const photoCount = journeys.reduce((sum, j) => sum + (j.highlights ? j.highlights.length : 0), 0) * 3;

    document.getElementById('city-count').textContent = cityCount;
    document.getElementById('journey-count').textContent = journeyCount;
    document.getElementById('photo-count').textContent = photoCount;

    const recentContainer = document.getElementById('recent-journeys');
    const recentJourneys = journeys.slice(0, 3);

    recentJourneys.forEach(j => {
        const card = createJourneyCard(j);
        recentContainer.appendChild(card);
    });
});

function createJourneyCard(journey) {
    const card = document.createElement('a');
    card.className = 'journey-card';
    card.href = `detail.html?id=${journey.id}`;

    const title = journey.province && journey.province !== journey.city
        ? `${journey.province} · ${journey.city}`
        : (journey.province || journey.city);

    const cityLine = journey.city;
    const spotsLine = (journey.highlights || []).slice(0, 4).join(' · ');

    card.innerHTML = `
        <div class="card-image">${journey.emoji}</div>
        <div class="card-content">
            <div class="card-title">${title}</div>
            <div class="card-meta">
                <span>${journey.country}</span>
                <span>${journey.date}</span>
            </div>
            <div class="card-highlights">
                <div class="highlight-line city-line">📍 ${cityLine}</div>
                <div class="highlight-line spots-line">⭐ ${spotsLine}</div>
            </div>
        </div>
    `;

    return card;
}
