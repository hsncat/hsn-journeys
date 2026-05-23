/**
 * Home page — stats summary + most recent journeys
 *
 * Depends on data.js, icons.js, ui.js loading first.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        renderStats();
        renderRecentJourneys();
    });

    function renderStats() {
        const cityList = (typeof getCityList === 'function') ? getCityList() : [];
        const journeyList = (typeof journeys !== 'undefined') ? journeys : [];

        setText('city-count', cityList.length);
        setText('journey-count', journeyList.length);

        // Photo count is an approximation: each highlight ~ 3 photos.
        const photoCount = journeyList.reduce(function (sum, j) {
            return sum + (j.highlights ? j.highlights.length : 0);
        }, 0) * 3;
        setText('photo-count', photoCount);
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = String(value);
    }

    function renderRecentJourneys() {
        const container = document.getElementById('recent-journeys');
        if (!container) return;

        const list = (typeof journeys !== 'undefined') ? journeys : [];

        if (!list.length) {
            container.innerHTML = HsnUI.emptyState({
                icon: 'compass',
                title: '还没有旅程记录',
                description: '开始记录你的第一次旅行吧',
                actionText: '添加旅程',
                actionHref: 'add.html',
            });
            return;
        }

        const recent = list.slice(0, 3);
        container.innerHTML = recent.map(createJourneyCard).join('');
    }

    function createJourneyCard(j) {
        const esc = HsnUI.escapeHtml;
        const title = j.province && j.province !== j.city
            ? esc(j.province) + ' · ' + esc(j.city)
            : esc(j.province || j.city);

        const spots = (j.highlights || []).slice(0, 4).map(esc).join(' · ');
        const pin = HsnIcons.svg('mapPin', { size: 16 });
        const star = HsnIcons.svg('sparkles', { size: 16 });
        const emojiLabel = esc(j.city || '') + '封面';

        return ''
            + '<a class="journey-card" href="cities.html?journey=' + encodeURIComponent(j.id) + '">'
            +   '<div class="card-image" role="img" aria-label="' + emojiLabel + '">' + esc(j.emoji || '📍') + '</div>'
            +   '<div class="card-content">'
            +     '<div class="card-title">' + title + '</div>'
            +     '<div class="card-meta">'
            +       '<span>' + esc(j.country || '') + '</span>'
            +       '<span>' + esc(j.date || '') + '</span>'
            +     '</div>'
            +     '<div class="card-highlights">'
            +       '<div class="highlight-line city-line">' + pin + '<span>' + esc(j.city || '') + '</span></div>'
            +       (spots ? '<div class="highlight-line spots-line">' + star + '<span>' + spots + '</span></div>' : '')
            +     '</div>'
            +   '</div>'
            + '</a>';
    }
})();
