document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('wishlist-grid');

    wishlist.forEach(item => {
        const highlightsHtml = item.highlights
            .map(h => `<span style="display:inline-block;padding:0.25rem 0.5rem;background:#fef3c7;color:#92400e;border-radius:9999px;font-size:0.75rem;margin:0 0.25rem 0.25rem 0;"}>${h}</span>`)
            .join('');

        const card = document.createElement('div');
        card.className = 'wishlist-card';
        card.innerHTML = `
            <div class="wishlist-emoji">${item.emoji}</div>
            <div class="wishlist-content">
                <div class="wishlist-title">${item.title}</div>
                <div class="wishlist-meta">
                    <span>📍 ${item.city}</span>
                    <span>📅 ${item.season}</span>
                    <span>⏱️ ${item.duration}</span>
                </div>
                <div class="wishlist-description">${item.description}</div>
                <div class="wishlist-highlights">${highlightsHtml}</div>
            </div>
        `;
        grid.appendChild(card);
    });
});
