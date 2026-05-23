/**
 * Cities — primary card list with expandable story + photo section
 * and simplified location chips (replaces old secondary cards).
 *
 * Depends on: data.js, icons.js, ui.js
 */
(function () {
    'use strict';

    const esc = HsnUI.escapeHtml;
    const Icons = window.HsnIcons;

    let activeFilter = 'all';
    let searchQuery = '';
    let allExpanded = false;

    document.addEventListener('DOMContentLoaded', function () {
        bindToolbar();
        renderGrid();
        if (window.location.hash === '#add-subcard') {
            window.location.replace('add.html');
            return;
        }
        focusJourneyFromUrl();
    });

    // ------------------------------------------------------------------
    // Toolbar (search + filter chips + expand all)
    // ------------------------------------------------------------------

    function bindToolbar() {
        const searchIconHost = document.querySelector('.search-input__icon');
        if (searchIconHost) searchIconHost.innerHTML = Icons.svg('search', { size: 18 });

        const search = document.getElementById('city-search');
        if (search) {
            search.addEventListener('input', debounce(function (e) {
                searchQuery = (e.target.value || '').trim().toLowerCase();
                renderGrid();
            }, 180));
        }

        document.querySelectorAll('.cities-filters [data-filter]').forEach(function (chip) {
            chip.addEventListener('click', function () {
                document.querySelectorAll('.cities-filters [data-filter]').forEach(function (c) {
                    c.classList.toggle('is-active', c === chip);
                    c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
                });
                activeFilter = chip.dataset.filter;
                renderGrid();
            });
        });

        const expandBtn = document.getElementById('toggle-all-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', function () {
                if (allExpanded) {
                    collapseAll();
                    expandBtn.textContent = '展开全部';
                    allExpanded = false;
                } else {
                    expandAll();
                    expandBtn.textContent = '收起全部';
                    allExpanded = true;
                }
            });
        }

        const addBtn = document.getElementById('add-subcard-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function () {
                window.location.href = 'add.html';
            });
        }
    }

    function debounce(fn, wait) {
        let t;
        return function () {
            const args = arguments, ctx = this;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(ctx, args); }, wait);
        };
    }

    function passesFilter(j) {
        if (activeFilter === 'domestic' && j.country !== '中国') return false;
        if (activeFilter === 'international' && j.country === '中国') return false;
        if (searchQuery) {
            const haystack = [j.title, j.province, j.city, j.country]
                .concat(j.highlights || [])
                .filter(Boolean).join(' ').toLowerCase();
            if (haystack.indexOf(searchQuery) === -1) return false;
        }
        return true;
    }

    function getFilteredJourneys() {
        return (typeof journeys !== 'undefined' ? journeys : [])
            .filter(passesFilter)
            .sort(function (a, b) {
                return String(b.date || '').localeCompare(String(a.date || ''));
            });
    }

    // ------------------------------------------------------------------
    // Grid render
    // ------------------------------------------------------------------

    function renderGrid() {
        const grid = document.getElementById('city-grid');
        if (!grid) return;
        const list = getFilteredJourneys();
        grid.innerHTML = '';
        renderTimeline(list);

        if (!list.length) {
            const isEmptyState = (typeof journeys !== 'undefined' ? journeys : []).length === 0;
            grid.innerHTML = HsnUI.emptyState({
                icon: isEmptyState ? 'compass' : 'search',
                title: isEmptyState ? '还没有旅程记录' : '没有匹配结果',
                description: isEmptyState
                    ? '从「添加旅程」开始你的足迹清单'
                    : '试试其他关键词或更换筛选条件',
                actionText: isEmptyState ? '添加旅程' : '',
                actionHref: isEmptyState ? 'add.html' : '',
            });
            return;
        }

        list.forEach(function (j) { grid.appendChild(createPrimaryCard(j)); });
    }

    function focusJourneyFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('journey');
        if (!id) return;
        setTimeout(function () {
            const wrapper = document.querySelector('.primary-card-wrapper[data-id="' + CSS.escape(id) + '"]');
            if (!wrapper) return;
            const primary = wrapper.querySelector('.primary-card');
            const timelineItem = document.querySelector('.timeline-link[data-target="' + CSS.escape(id) + '"]');

            if (!wrapper.classList.contains('is-expanded')) {
                wrapper.classList.add('is-expanded');
                if (primary) primary.setAttribute('aria-expanded', 'true');
            }
            if (timelineItem) {
                document.querySelectorAll('.timeline-item').forEach(function (item) {
                    item.classList.toggle('is-active', item.contains(timelineItem));
                });
            }
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            wrapper.classList.add('is-highlighted');
            setTimeout(function () { wrapper.classList.remove('is-highlighted'); }, 1200);
        }, 120);
    }

    function renderTimeline(list) {
        const timeline = document.getElementById('journey-timeline');
        if (!timeline) return;
        if (!list.length) {
            timeline.innerHTML = '<li class="timeline-empty">暂无匹配旅程</li>';
            return;
        }

        timeline.innerHTML = list.map(function (j, index) {
            const year = j.date ? String(j.date).slice(0, 4) : '未知';
            const range = formatDateRange(j.date, j.endDate);
            const title = j.title || (j.province && j.province !== j.city ? j.province + ' · ' + j.city : (j.province || j.city || '未命名旅程'));
            return ''
                + '<li class="timeline-item' + (index === 0 ? ' is-active' : '') + '">'
                +   '<button type="button" class="timeline-link" data-target="' + j.id + '">'
                +     '<span class="timeline-dot" aria-hidden="true"></span>'
                +     '<span class="timeline-year">' + esc(year) + '</span>'
                +     '<span class="timeline-title">' + esc(title) + '</span>'
                +     '<span class="timeline-range">' + esc(range) + '</span>'
                +   '</button>'
                + '</li>';
        }).join('');

        timeline.querySelectorAll('.timeline-link').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const id = btn.dataset.target;
                const card = document.querySelector('.primary-card-wrapper[data-id="' + id + '"]');
                if (!card) return;
                timeline.querySelectorAll('.timeline-item').forEach(function (item) {
                    item.classList.toggle('is-active', item.contains(btn));
                });
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                card.classList.add('is-highlighted');
                setTimeout(function () { card.classList.remove('is-highlighted'); }, 900);
            });
        });
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    function getDays(start, end) {
        if (!start || !end) return 0;
        return Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
    }

    function formatDateRange(start, end) {
        if (!start && !end) return '未设置日期';
        if (!end || start === end) return start || end;
        return start + ' ~ ' + end;
    }

    function formatCost(num) {
        if (num === undefined || num === null || num === '') return '—';
        return Number(num).toLocaleString();
    }

    function metaHtml(cost, subCount) {
        cost = cost || {};
        return ''
            + '<span title="二级卡片">' + Icons.svg('mapPin', { size: 14 }) + ' ' + subCount + ' 段行程</span>'
            + '<span title="报团">' + Icons.svg('package', { size: 14 }) + ' ' + esc(formatCost(cost.package)) + '</span>'
            + '<span title="交通">' + Icons.svg('car', { size: 14 }) + ' ' + esc(formatCost(cost.transport)) + '</span>'
            + '<span title="住宿">' + Icons.svg('bed', { size: 14 }) + ' ' + esc(formatCost(cost.accommodation)) + '</span>'
            + '<span title="餐饮">' + Icons.svg('utensils', { size: 14 }) + ' ' + esc(formatCost(cost.food)) + '</span>'
            + '<span title="购物">' + Icons.svg('dollarSign', { size: 14 }) + ' ' + esc(formatCost(cost.shopping)) + '</span>'
            + '<span title="门票">' + Icons.svg('dollarSign', { size: 14 }) + ' ' + esc(formatCost(cost.ticket)) + '</span>';
    }

    function totalCost(cost) {
        if (!cost) return 0;
        return (Number(cost.package) || 0) + (Number(cost.transport) || 0)
            + (Number(cost.accommodation) || 0) + (Number(cost.food) || 0)
            + (Number(cost.shopping) || 0) + (Number(cost.ticket) || 0);
    }

    function unique(list) {
        const seen = {};
        return (list || []).filter(function (item) {
            const key = String(item || '').trim();
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    function numericCost(cost) {
        cost = cost || {};
        return {
            package: Number(cost.package) || 0,
            transport: Number(cost.transport) || 0,
            accommodation: Number(cost.accommodation) || 0,
            food: Number(cost.food) || 0,
            shopping: Number(cost.shopping) || 0,
            ticket: Number(cost.ticket) || 0,
        };
    }

    function subcardFromJourney(journey) {
        return {
            id: 'sub-' + journey.id + '-1',
            name: journey.title || journey.city || '未命名行程',
            province: journey.province || '',
            city: journey.city || '',
            country: journey.country || '',
            date: journey.date || '',
            endDate: journey.endDate || journey.date || '',
            emoji: journey.emoji || '📍',
            highlights: (journey.highlights || []).slice(),
            itineraryTable: null,
            cost: numericCost(journey.cost),
            story: journey.story || '',
            photo: journey.photo || '',
        };
    }

    function getSubcards(journey) {
        const source = journey.subCards && journey.subCards.length ? journey.subCards : [subcardFromJourney(journey)];
        return source.map(function (sub, index) {
            return {
                id: sub.id || ('sub-' + journey.id + '-' + (index + 1)),
                name: sub.name || sub.title || sub.city || journey.title || '未命名行程',
                province: sub.province || journey.province || '',
                city: sub.city || journey.city || '',
                country: sub.country || journey.country || '',
                date: sub.date || journey.date || '',
                endDate: sub.endDate || sub.date || journey.endDate || journey.date || '',
                emoji: sub.emoji || journey.emoji || '📍',
                highlights: (sub.highlights || []).slice(),
                itineraryTable: sub.itineraryTable ? normalizeItineraryTable(sub.itineraryTable) : null,
                cost: numericCost(sub.cost),
                story: sub.story || '',
                photo: sub.photo || '',
            };
        });
    }

    function sumCosts(subcards) {
        return subcards.reduce(function (sum, sub) {
            const cost = numericCost(sub.cost);
            sum.package += cost.package;
            sum.transport += cost.transport;
            sum.accommodation += cost.accommodation;
            sum.food += cost.food;
            sum.shopping += cost.shopping;
            sum.ticket += cost.ticket;
            return sum;
        }, { package: 0, transport: 0, accommodation: 0, food: 0, shopping: 0, ticket: 0 });
    }

    function syncPrimaryFromSubcards(journey, opts) {
        opts = opts || {};
        const subcards = getSubcards(journey);
        if (!subcards.length) return journey;

        if (subcards.length === 1) {
            const sub = subcards[0];
            Object.assign(journey, {
                province: sub.province,
                city: sub.city,
                country: sub.country || journey.country || '中国',
                date: sub.date,
                endDate: sub.endDate || sub.date,
                title: sub.name,
                emoji: sub.emoji,
                highlights: highlightsFromItinerary(sub),
                cost: numericCost(sub.cost),
                story: sub.story || journey.story || '',
                photo: sub.photo || journey.photo || '',
                subCards: subcards,
            });
            return journey;
        }

        const dates = subcards.map(function (s) { return s.date; }).filter(Boolean).sort();
        const endDates = subcards.map(function (s) { return s.endDate || s.date; }).filter(Boolean).sort();
        const names = unique(subcards.map(function (s) { return s.name || s.city; }));
        const cities = unique(subcards.map(function (s) { return s.city; }));
        const provinces = unique(subcards.map(function (s) { return s.province; }));
        const countries = unique(subcards.map(function (s) { return s.country; }));
        const highlights = unique([].concat.apply([], subcards.map(highlightsFromItinerary))).slice(0, 8);
        const allChina = countries.length === 0 || (countries.length === 1 && countries[0] === '中国');
        const generatedTitle = cities.length > 1
            ? cities.join('&') + '多段旅程'
            : (cities[0] ? cities[0] + '旅程' : '多段旅程');

        Object.assign(journey, {
            province: provinces.join('&') || journey.province,
            city: cities.join('&') || journey.city,
            country: allChina ? '中国' : countries.join('·'),
            date: dates[0] || journey.date,
            endDate: endDates[endDates.length - 1] || journey.endDate || journey.date,
            title: names.join(' · ') || (opts.forceTitle ? generatedTitle : (journey.title || generatedTitle)),
            highlights: highlights,
            cost: sumCosts(subcards),
            photo: subcards.map(function (s) { return s.photo; }).filter(Boolean)[0] || journey.photo || '',
            subCards: subcards,
        });
        return journey;
    }

    function defaultItineraryTable() {
        return {
            headers: ['日期', '上午', '下午', '备注'],
            rows: [
                ['', '', '', ''],
                ['', '', '', ''],
                ['', '', '', ''],
            ],
        };
    }

    function normalizeItineraryTable(table) {
        const fallback = defaultItineraryTable();
        if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return fallback;
        let sourceHeaders = table.headers.length ? table.headers.slice() : fallback.headers.slice();
        const removedIndexes = [];
        sourceHeaders = sourceHeaders.filter(function (header, index) {
            const keep = header !== '晚上';
            if (!keep) removedIndexes.push(index);
            return keep;
        });
        const headers = sourceHeaders.map(function (h, i) {
            return h || fallback.headers[i] || ('列' + (i + 1));
        });
        if (removedIndexes.length > 0) {
            fallback.headers.forEach(function (header) {
                if (!headers.includes(header)) headers.push(header);
            });
        }
        const rows = table.rows.length ? table.rows.map(function (row) {
            const next = Array.isArray(row) ? row.filter(function (_, index) {
                return !removedIndexes.includes(index);
            }) : [];
            while (next.length < headers.length) next.push('');
            return next.slice(0, headers.length);
        }) : fallback.rows.map(function (row) { return row.slice(); });
        while (rows.length < 3) rows.push(new Array(headers.length).fill(''));
        return { headers: headers, rows: rows };
    }

    function tableForSubcardForm(data) {
        const hasTable = data && data.itineraryTable;
        const table = normalizeItineraryTable(hasTable ? data.itineraryTable : defaultItineraryTable());
        const dateIndex = table.headers.indexOf('日期') >= 0 ? table.headers.indexOf('日期') : 0;
        if (!hasTable && data) {
            while (table.rows.length < 3) table.rows.push(new Array(table.headers.length).fill(''));
            if (data.date) table.rows[0][dateIndex] = data.date;
            if (data.endDate && data.endDate !== data.date) table.rows[table.rows.length - 1][dateIndex] = data.endDate;
        }
        return table;
    }

    function dateRangeFromItinerary(table) {
        table = normalizeItineraryTable(table);
        const dateIndex = table.headers.indexOf('日期') >= 0 ? table.headers.indexOf('日期') : 0;
        const firstRow = table.rows[0] || [];
        const lastRow = table.rows[table.rows.length - 1] || firstRow;
        const start = String(firstRow[dateIndex] || '').trim();
        const end = String(lastRow[dateIndex] || '').trim() || start;
        return { start: start, end: end };
    }

    function highlightsFromItinerary(subcard) {
        if (!subcard.itineraryTable) return (subcard.highlights || []).slice();
        const table = normalizeItineraryTable(subcard.itineraryTable);
        const indexes = table.headers.reduce(function (list, header, index) {
            if (header === '上午' || header === '下午') list.push(index);
            return list;
        }, []);
        if (!indexes.length) return (subcard.highlights || []).slice();
        return unique([].concat.apply([], table.rows.map(function (row) {
            return indexes.map(function (i) { return row[i]; });
        })).map(function (item) { return String(item || '').trim(); })).filter(Boolean);
    }

    // ------------------------------------------------------------------
    // Primary card
    // ------------------------------------------------------------------

    function createPrimaryCard(journey) {
        const wrapper = document.createElement('div');
        wrapper.className = 'primary-card-wrapper';
        wrapper.dataset.id = journey.id;

        const title = journey.title ? esc(journey.title) : (journey.province && journey.province !== journey.city
            ? esc(journey.province) + ' · ' + esc(journey.city)
            : esc(journey.province || journey.city));
        const subcards = getSubcards(journey);
        const spots = primarySpotsHtml(subcards);
        const emojiLabel = esc(journey.city || '') + '封面';

        wrapper.innerHTML = ''
            + '<div class="primary-card" tabindex="0" role="button" aria-expanded="false" aria-label="展示 ' + esc(title) + ' 的二级卡片">'
            +   '<div class="primary-emoji" role="img" aria-label="' + emojiLabel + '">' + esc(journey.emoji || '📍') + '</div>'
            +   '<div class="primary-info">'
            +     '<div class="primary-title">' + title + '</div>'
            +     '<div class="primary-meta">' + metaHtml(journey.cost, subcards.length) + '</div>'
            +     (spots ? '<div class="primary-spots"><div class="primary-spots__lines">' + spots + '</div></div>' : '')
            +   '</div>'
            +   '<div class="primary-actions">'
            +     '<button class="icon-btn icon-btn--sm add-subcard-inline-btn" type="button" aria-label="添加二级卡片">' + Icons.svg('plus', { size: 16 }) + '</button>'
            +     '<button class="icon-btn icon-btn--sm merge-subcards-inline-btn" type="button" aria-label="合并二级卡片">' + Icons.svg('sparkles', { size: 16 }) + '</button>'
            +   '</div>'
            +   '<div class="primary-arrow" aria-hidden="true">' + Icons.svg('chevronDown', { size: 18 }) + '</div>'
            + '</div>'
            + '<div class="primary-edit-form" hidden></div>'
            + '<div class="card-body"></div>';

        const primary = wrapper.querySelector('.primary-card');
        const cardBody = wrapper.querySelector('.card-body');
        const addSubcardBtn = wrapper.querySelector('.add-subcard-inline-btn');
        const mergeSubcardsBtn = wrapper.querySelector('.merge-subcards-inline-btn');
        renderCardBody(journey, cardBody);
        cardBody.dataset.loaded = 'true';

        function toggleBody() {
            const isOpen = wrapper.classList.toggle('is-expanded');
            primary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }

        primary.addEventListener('click', function (e) {
            if (e.target.closest('.primary-actions')) return;
            toggleBody();
        });
        primary.addEventListener('keydown', function (e) {
            if (e.target !== primary) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleBody();
            }
        });

        addSubcardBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            window.location.href = 'add.html?parent=' + encodeURIComponent(journey.id);
        });

        mergeSubcardsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            mergeSubcards(journey.id);
        });

        return wrapper;
    }

    function primarySpotsHtml(subcards) {
        return getSubcards({ subCards: subcards }).map(function (subcard, index) {
            const highlights = highlightsFromItinerary(subcard);
            if (!highlights.length) return '';
            const label = subcards.length > 1 ? (subcard.city || ('第' + (index + 1) + '段')) + '：' : '';
            return '<div class="primary-spots__line"><span class="primary-spots__line-icon" aria-hidden="true">✨</span><span>' + esc(label) + highlights.map(esc).join(' · ') + '</span></div>';
        }).filter(Boolean).join('');
    }

    // ------------------------------------------------------------------
    // Card body — secondary cards + summary tools
    // ------------------------------------------------------------------

    function renderCardBody(journey, container) {
        container.innerHTML = '';
        const subcards = getSubcards(journey);
        const list = document.createElement('div');
        list.className = 'secondary-card-list';
        subcards.forEach(function (subcard, index) {
            list.appendChild(createSecondaryCard(journey, subcard, index));
        });
        container.appendChild(list);
    }

    function createSecondaryCard(journey, subcard, index) {
        const card = document.createElement('article');
        card.className = 'secondary-card';
        card.dataset.index = index;
        card.tabIndex = 0;
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', '编辑 ' + (subcard.city || '二级行程'));
        const highlights = highlightsFromItinerary(subcard).slice(0, 5).map(function (h) {
            return '<span class="location-chip">' + esc(h) + '</span>';
        }).join('');
        const costTotal = totalCost(subcard.cost);

        card.innerHTML = ''
            + '<div class="secondary-card__date">'
            +   '<span class="secondary-card__month">' + esc(formatTimelineMonth(subcard.date)) + '</span>'
            +   '<span class="secondary-card__range">' + esc(formatDateRange(subcard.date, subcard.endDate)) + '</span>'
            + '</div>'
            + '<div class="secondary-card__body">'
            +   '<div class="secondary-card__title-row">'
            +     '<span class="secondary-card__emoji" role="img" aria-label="' + esc(subcard.city || '') + '">' + esc(subcard.emoji || '📍') + '</span>'
            +     '<div>'
            +       '<h4>' + esc(subcard.city || '未命名城市') + '</h4>'
            +       (subcard.province ? '<p>' + esc(subcard.province) + '</p>' : '')
            +     '</div>'
            +   '</div>'
            +   (highlights ? '<div class="secondary-card__chips">' + highlights + '</div>' : '')
            +   (subcard.story ? '<p class="secondary-card__story">' + esc(subcard.story) + '</p>' : '')
            +   '<div class="secondary-card__footer">'
            +     '<span>' + Icons.svg('dollarSign', { size: 14 }) + ' ¥' + esc(formatCost(costTotal)) + '</span>'
            +   '</div>'
            + '</div>';

        function openSubcardEdit() {
            window.location.href = 'detail.html?id=' + encodeURIComponent(journey.id)
                + '&sub=' + encodeURIComponent(index) + '&edit=1';
        }
        card.addEventListener('click', function (e) {
            openSubcardEdit();
        });
        card.addEventListener('keydown', function (e) {
            if (e.target !== card) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSubcardEdit();
            }
        });
        return card;
    }

    function formatTimelineMonth(date) {
        if (!date) return '待定';
        const parts = date.split('-');
        if (parts.length < 2) return date;
        return parts[1] + '/' + (parts[2] || '01');
    }

    function mergeSubcards(journeyId) {
        const journey = getJourneyById(journeyId);
        if (!journey) return;
        syncPrimaryFromSubcards(journey, { forceTitle: true });
        updateJourney(journeyId, journey);
        refreshCitiesView(journeyId);
        HsnUI.toast('已按二级卡片汇总一级卡片', 'success');
    }

    function deleteSubcard(journeyId, index) {
        const journey = getJourneyById(journeyId);
        if (!journey) return;
        const subcards = getSubcards(journey);
        if (subcards.length <= 1) {
            HsnUI.toast('至少保留一个二级卡片', 'error');
            return;
        }
        HsnUI.confirm({
            title: '删除二级卡片',
            message: '确定删除这段行程吗？',
            confirmText: '删除',
            danger: true,
        }).then(function (ok) {
            if (!ok) return;
            subcards.splice(index, 1);
            journey.subCards = subcards;
            syncPrimaryFromSubcards(journey);
            updateJourney(journeyId, journey);
            refreshCitiesView(journeyId);
            HsnUI.toast('二级卡片已删除', 'success');
        });
    }

    function refreshCitiesView(openJourneyId) {
        renderGrid();
        if (!openJourneyId) return;
        const wrapper = document.querySelector('.primary-card-wrapper[data-id="' + openJourneyId + '"]');
        if (!wrapper) return;
        const cardBody = wrapper.querySelector('.card-body');
        const journey = getJourneyById(openJourneyId);
        if (journey && cardBody) {
            renderCardBody(journey, cardBody);
            cardBody.dataset.loaded = 'true';
            wrapper.classList.add('is-expanded');
            wrapper.querySelector('.primary-card').setAttribute('aria-expanded', 'true');
        }
    }

    function showSubcardForm(opts) {
        opts = opts || {};
        const isEdit = opts.mode === 'edit';
        const journey = opts.journeyId ? getJourneyById(opts.journeyId) : null;
        const existing = isEdit && journey ? getSubcards(journey)[opts.index] : null;
        const data = existing || {
            province: journey ? journey.province : '',
            city: '',
            country: journey ? journey.country : '中国',
            date: journey ? journey.date : '',
            endDate: journey ? journey.endDate : '',
            emoji: journey ? journey.emoji : '📍',
            itineraryTable: defaultItineraryTable(),
            cost: {},
            story: '',
        };
        const titleId = 'subcard-form-title-' + Date.now();
        const itineraryTable = tableForSubcardForm(data);
        const regionType = data.country && data.country !== '中国' ? 'international' : 'domestic';
        const journeyOptions = (typeof journeys !== 'undefined' ? journeys : []).map(function (j) {
            const label = j.province && j.province !== j.city ? j.province + ' · ' + j.city : (j.province || j.city);
            return '<option value="' + j.id + '"' + (opts.journeyId === j.id ? ' selected' : '') + '>' + esc(label) + '</option>';
        }).join('');

        const root = document.createElement('div');
        root.innerHTML = ''
            + '<div class="modal__body subcard-form">'
            +   '<h2 class="modal__title" id="' + titleId + '">' + (isEdit ? '编辑二级卡片' : '添加二级卡片') + '</h2>'
            +   (!isEdit ? '<div class="form-group"><label for="sub-parent">归属一级卡片</label><select id="sub-parent"><option value="new">新建一级卡片</option>' + journeyOptions + '</select></div>' : '')
            +   '<div class="form-row dense">'
            +     '<div class="form-group"><label for="sub-emoji">图标</label><input id="sub-emoji" type="text" maxlength="4" value="' + esc(data.emoji || '📍') + '"></div>'
            +     '<div class="form-group"><label for="sub-city">城市 *</label><input id="sub-city" type="text" value="' + esc(data.city || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-province">省份/大区</label><input id="sub-province" type="text" value="' + esc(data.province || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-region-type">国内/国外</label><select id="sub-region-type"><option value="domestic"' + (regionType === 'domestic' ? ' selected' : '') + '>国内</option><option value="international"' + (regionType === 'international' ? ' selected' : '') + '>国外</option></select></div>'
            +   '</div>'
            +   '<div class="form-row cost-row">'
            +     '<div class="form-group"><label for="sub-cost-package">报团费</label><input id="sub-cost-package" type="number" min="0" value="' + esc(data.cost && data.cost.package || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-cost-transport">交通费</label><input id="sub-cost-transport" type="number" min="0" value="' + esc(data.cost && data.cost.transport || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-cost-accommodation">住宿费</label><input id="sub-cost-accommodation" type="number" min="0" value="' + esc(data.cost && data.cost.accommodation || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-cost-food">餐饮费</label><input id="sub-cost-food" type="number" min="0" value="' + esc(data.cost && data.cost.food || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-cost-shopping">购物费</label><input id="sub-cost-shopping" type="number" min="0" value="' + esc(data.cost && data.cost.shopping || '') + '"></div>'
            +     '<div class="form-group"><label for="sub-cost-ticket">门票费</label><input id="sub-cost-ticket" type="number" min="0" value="' + esc(data.cost && data.cost.ticket || '') + '"></div>'
            +   '</div>'
            +   renderItineraryEditorHtml(itineraryTable)
            +   '<div class="form-group"><label for="sub-story">这段行程的故事</label><textarea id="sub-story" rows="4">' + esc(data.story || '') + '</textarea></div>'
            + '</div>'
            + '<div class="modal__actions">'
            +   '<button type="button" class="btn btn-secondary" data-action="cancel">取消</button>'
            +   '<button type="button" class="btn btn-primary" data-action="save">' + (isEdit ? '保存' : '添加') + '</button>'
            + '</div>';

        const handle = HsnUI.modal.open(root, { size: 'lg', titleId: titleId });
        wireItineraryEditor(root);
        root.querySelector('[data-action="cancel"]').addEventListener('click', function () { handle.close(); });
        root.querySelector('[data-action="save"]').addEventListener('click', function () {
            const subcard = readSubcardForm(root);
            if (!subcard.city || !subcard.date) {
                HsnUI.toast('请填写城市和行程表第一行日期', 'error');
                return;
            }
            if (isEdit && existing && existing.id) {
                subcard.id = existing.id;
            }
            if (isEdit && journey) {
                const subcards = getSubcards(journey);
                subcards[opts.index] = subcard;
                journey.subCards = subcards;
                syncPrimaryFromSubcards(journey);
                updateJourney(journey.id, journey);
                refreshCitiesView(journey.id);
                HsnUI.toast('二级卡片已保存', 'success');
            } else {
                const parent = root.querySelector('#sub-parent').value;
                if (parent === 'new') {
                    const newJourney = syncPrimaryFromSubcards({
                        id: undefined,
                        title: subcard.city,
                        subCards: [subcard],
                    });
                    const newId = addJourney(newJourney);
                    refreshCitiesView(newId);
                    HsnUI.toast('已添加新旅程', 'success');
                } else {
                    const target = getJourneyById(parent);
                    const subcards = getSubcards(target);
                    subcards.push(subcard);
                    target.subCards = subcards;
                    syncPrimaryFromSubcards(target);
                    updateJourney(target.id, target);
                    refreshCitiesView(target.id);
                    HsnUI.toast('已添加二级卡片', 'success');
                }
            }
            handle.close();
        });

        setTimeout(function () {
            const first = root.querySelector('#sub-city');
            if (first) first.focus();
        }, 50);
    }

    function readSubcardForm(root) {
        const get = function (id) {
            const el = root.querySelector('#' + id);
            return el ? el.value.trim() : '';
        };
        const itineraryTable = readItineraryEditor(root);
        const dateRange = dateRangeFromItinerary(itineraryTable);
        const city = get('sub-city');
        const regionType = get('sub-region-type') || 'domestic';
        return {
            id: 'sub-' + Date.now(),
            name: city,
            province: get('sub-province'),
            city: city,
            country: regionType === 'international' ? '国外' : '中国',
            date: dateRange.start,
            endDate: dateRange.end || dateRange.start,
            emoji: get('sub-emoji') || '📍',
            itineraryTable: itineraryTable,
            highlights: highlightsFromItinerary({ itineraryTable: itineraryTable }),
            cost: {
                package: Number(get('sub-cost-package')) || 0,
                transport: Number(get('sub-cost-transport')) || 0,
                accommodation: Number(get('sub-cost-accommodation')) || 0,
                food: Number(get('sub-cost-food')) || 0,
                shopping: Number(get('sub-cost-shopping')) || 0,
                ticket: Number(get('sub-cost-ticket')) || 0,
            },
            story: get('sub-story'),
        };
    }

    function renderItineraryEditorHtml(table) {
        table = normalizeItineraryTable(table);
        const headers = table.headers.map(function (header, index) {
            return ''
                + '<th data-col="' + index + '">'
                +   '<div class="itinerary-cell-frame">'
                +     '<input type="text" class="itinerary-header-input" value="' + esc(header) + '">'
                +     '<span class="itinerary-col-actions">'
                +       '<button type="button" class="itinerary-action-btn" data-action="add-itinerary-col" aria-label="在右侧加列">' + Icons.svg('plus', { size: 12 }) + '</button>'
                +       '<button type="button" class="itinerary-action-btn itinerary-action-btn--danger" data-action="delete-itinerary-col" aria-label="删除该列">' + Icons.svg('trash2', { size: 12 }) + '</button>'
                +     '</span>'
                +   '</div>'
                + '</th>';
        }).join('');
        const rows = table.rows.map(function (row) {
            return renderItineraryRowHtml(row, table.headers.length);
        }).join('');
        return ''
            + '<div class="form-group sub-itinerary-field">'
            +   '<label>行程</label>'
            +   '<div class="sub-itinerary-table-wrap">'
            +     '<table class="sub-itinerary-table">'
            +       '<thead><tr>' + headers + '</tr></thead>'
            +       '<tbody>' + rows + '</tbody>'
            +     '</table>'
            +   '</div>'
            + '</div>';
    }

    function renderItineraryRowHtml(row, colCount) {
        const cells = [];
        for (let i = 0; i < colCount; i++) {
            const actions = i === 0
                ? '<span class="itinerary-row-actions">'
                    + '<button type="button" class="itinerary-action-btn" data-action="add-itinerary-row" aria-label="在下方加行">' + Icons.svg('plus', { size: 12 }) + '</button>'
                    + '<button type="button" class="itinerary-action-btn itinerary-action-btn--danger" data-action="delete-itinerary-row" aria-label="删除该行">' + Icons.svg('trash2', { size: 12 }) + '</button>'
                + '</span>'
                : '';
            cells.push('<td data-col="' + i + '"><div class="itinerary-cell-frame">' + actions + '<textarea class="itinerary-cell-input" rows="2">' + esc(row && row[i] || '') + '</textarea></div></td>');
        }
        return '<tr>' + cells.join('') + '</tr>';
    }

    function wireItineraryEditor(root) {
        const table = root.querySelector('.sub-itinerary-table');
        if (!table) return;
        table.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            if (!btn || !table.contains(btn)) return;
            e.preventDefault();
            const action = btn.dataset.action;
            if (action === 'add-itinerary-row') {
                const row = btn.closest('tr');
                const colCount = table.querySelectorAll('thead th').length;
                row.insertAdjacentHTML('afterend', renderItineraryRowHtml([], colCount));
            } else if (action === 'delete-itinerary-row') {
                const row = btn.closest('tr');
                if (table.querySelectorAll('tbody tr').length <= 1) return;
                row.remove();
            } else if (action === 'add-itinerary-col') {
                const th = btn.closest('th');
                const insertIndex = Array.from(th.parentNode.children).indexOf(th) + 1;
                insertItineraryColumn(table, insertIndex);
            } else if (action === 'delete-itinerary-col') {
                const th = btn.closest('th');
                const index = Array.from(th.parentNode.children).indexOf(th);
                if (table.querySelectorAll('thead th').length <= 1) return;
                deleteItineraryColumn(table, index);
            }
        });
    }

    function insertItineraryColumn(table, index) {
        const colCount = table.querySelectorAll('thead th').length + 1;
        const headerHtml = ''
            + '<th data-col="' + index + '"><div class="itinerary-cell-frame">'
            + '<input type="text" class="itinerary-header-input" value="列' + colCount + '">'
            + '<span class="itinerary-col-actions">'
            + '<button type="button" class="itinerary-action-btn" data-action="add-itinerary-col" aria-label="在右侧加列">' + Icons.svg('plus', { size: 12 }) + '</button>'
            + '<button type="button" class="itinerary-action-btn itinerary-action-btn--danger" data-action="delete-itinerary-col" aria-label="删除该列">' + Icons.svg('trash2', { size: 12 }) + '</button>'
            + '</span></div></th>';
        const headerRow = table.querySelector('thead tr');
                const beforeHeader = headerRow.children[index] || null;
        headerRow.insertBefore(htmlToElement(headerHtml), beforeHeader);
        table.querySelectorAll('tbody tr').forEach(function (row) {
            const beforeCell = row.children[index] || null;
            row.insertBefore(htmlToElement('<td data-col="' + index + '"><div class="itinerary-cell-frame"><textarea class="itinerary-cell-input" rows="2"></textarea></div></td>'), beforeCell);
        });
        refreshItineraryRowActions(table);
    }

    function deleteItineraryColumn(table, index) {
        table.querySelectorAll('tr').forEach(function (row) {
            if (row.children[index]) row.children[index].remove();
        });
        refreshItineraryRowActions(table);
    }

    function refreshItineraryRowActions(table) {
        table.querySelectorAll('.itinerary-row-actions').forEach(function (node) { node.remove(); });
        table.querySelectorAll('tbody tr').forEach(function (row) {
            const firstCellFrame = row.querySelector('td .itinerary-cell-frame');
            if (!firstCellFrame) return;
            firstCellFrame.insertAdjacentHTML('afterbegin',
                '<span class="itinerary-row-actions">'
                + '<button type="button" class="itinerary-action-btn" data-action="add-itinerary-row" aria-label="在下方加行">' + Icons.svg('plus', { size: 12 }) + '</button>'
                + '<button type="button" class="itinerary-action-btn itinerary-action-btn--danger" data-action="delete-itinerary-row" aria-label="删除该行">' + Icons.svg('trash2', { size: 12 }) + '</button>'
                + '</span>'
            );
        });
    }

    function htmlToElement(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    function readItineraryEditor(root) {
        const table = root.querySelector('.sub-itinerary-table');
        if (!table) return defaultItineraryTable();
        const headers = Array.from(table.querySelectorAll('.itinerary-header-input')).map(function (input, index) {
            return input.value.trim() || ('列' + (index + 1));
        });
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(function (row) {
            return Array.from(row.querySelectorAll('.itinerary-cell-input')).map(function (input) {
                return input.value.trim();
            });
        });
        return normalizeItineraryTable({ headers: headers, rows: rows });
    }

    // --- Photo ---

    function renderPhotoArea(journey, container) {
        const hasPhoto = !!(journey.photo);
        container.innerHTML = ''
            + '<div class="card-photo__inner' + (hasPhoto ? ' has-photo' : '') + '">'
            + (hasPhoto
                ? '<img src="' + esc(journey.photo) + '" alt="' + esc(journey.title || '') + '" class="card-photo__img" loading="lazy">'
                : '<div class="card-photo__placeholder">' + Icons.svg('image', { size: 40 }) + '<span>添加封面照片</span></div>')
            + '</div>'
            + '<button class="btn btn-sm btn-secondary card-photo__btn" type="button">'
            + Icons.svg('camera', { size: 14 }) + '<span>' + (hasPhoto ? '更换照片' : '添加照片') + '</span>'
            + '</button>';

        container.querySelector('.card-photo__btn').addEventListener('click', function (e) {
            e.stopPropagation();
            pickAndSavePhoto(journey, container);
        });

        container.querySelector('.card-photo__inner').addEventListener('click', function (e) {
            e.stopPropagation();
            pickAndSavePhoto(journey, container);
        });
    }

    function pickAndSavePhoto(journey, container) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', function () {
            const file = input.files && input.files[0];
            if (!file) return;
            HsnUI.compressImage(file, { maxW: 1600, maxH: 1600, quality: 0.8 }).then(function (dataUrl) {
                updateJourney(journey.id, { photo: dataUrl });
                journey.photo = dataUrl;
                renderPhotoArea(journey, container);
                HsnUI.toast('照片已保存', 'success');
            }).catch(function () {
                HsnUI.toast('图片处理失败', 'error');
            });
        });
        input.click();
    }

    // --- Story ---

    function renderStoryArea(journey, container) {
        const story = journey.story || '';
        const hasStory = story.length > 0;
        const previewLen = 150;
        const needsExpand = story.length > previewLen;
        const expanded = container.dataset.storyExpanded === 'true';

        const displayText = (!hasStory) ? ''
            : (needsExpand && !expanded) ? story.slice(0, previewLen) + '…' : story;

        container.innerHTML = ''
            + '<div class="card-story__header">'
            +   '<span class="card-story__icon">' + Icons.svg('edit', { size: 14 }) + '</span>'
            +   '<span class="card-story__title">' + (journey.title ? esc(journey.title) : '游记') + '</span>'
            + '</div>'
            + (hasStory
                ? '<p class="card-story__text">' + esc(displayText) + '</p>'
                : '<p class="card-story__text card-story__text--empty">还没有写游记，记录下旅途中的故事吧</p>')
            + '<div class="card-story__actions">'
            +   (needsExpand ? '<button class="btn btn-sm btn-secondary card-story__expand-btn" type="button">' + (expanded ? '收起' : '展开全文') + '</button>' : '')
            +   '<button class="btn btn-sm btn-secondary card-story__edit-btn" type="button">' + Icons.svg('edit', { size: 14 }) + '<span>编辑游记</span></button>'
            + '</div>';

        const expandBtn = container.querySelector('.card-story__expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                container.dataset.storyExpanded = expanded ? 'false' : 'true';
                renderStoryArea(journey, container);
            });
        }

        container.querySelector('.card-story__edit-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            showStoryEditor(journey, container);
        });
    }

    function showStoryEditor(journey, container) {
        const story = journey.story || '';
        container.innerHTML = ''
            + '<div class="card-story__header">'
            +   '<span class="card-story__icon">' + Icons.svg('edit', { size: 14 }) + '</span>'
            +   '<span class="card-story__title">编辑游记</span>'
            + '</div>'
            + '<textarea class="card-story__editor" rows="6" placeholder="记录旅途中的风景、故事与感动…">' + esc(story) + '</textarea>'
            + '<div class="card-story__actions">'
            +   '<button class="btn btn-sm btn-primary card-story__save-btn" type="button">' + Icons.svg('check', { size: 14 }) + '<span>保存</span></button>'
            +   '<button class="btn btn-sm btn-secondary card-story__cancel-btn" type="button">取消</button>'
            + '</div>';

        container.querySelector('.card-story__save-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            const newStory = container.querySelector('.card-story__editor').value.trim();
            updateJourney(journey.id, { story: newStory });
            journey.story = newStory;
            delete container.dataset.storyExpanded;
            renderStoryArea(journey, container);
            HsnUI.toast('游记已保存', 'success');
        });

        container.querySelector('.card-story__cancel-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            delete container.dataset.storyExpanded;
            renderStoryArea(journey, container);
        });

        container.querySelector('.card-story__editor').focus();
    }

    // ------------------------------------------------------------------
    // Edit primary (dates, costs, highlights, + photo & story)
    // ------------------------------------------------------------------

    function showEditPrimaryForm(journey, container) {
        const cost = journey.cost || {};
        const highlightsStr = (journey.highlights || []).join('、');
        const hasPhoto = !!(journey.photo);

        container.innerHTML = ''
            + '<div class="edit-form">'
            +   '<h3>编辑旅程信息</h3>'
            +   '<div class="form-row dense">'
            +     fieldHtml('省份', 'text', 'j-province', journey.province) + fieldHtml('城市', 'text', 'j-city', journey.city) + fieldHtml('Emoji', 'text', 'j-emoji', journey.emoji)
            +   '</div>'
            +   '<div class="form-row">'
            +     fieldHtml('开始日期', 'date', 'j-date', journey.date) + fieldHtml('结束日期', 'date', 'j-endDate', journey.endDate)
            +   '</div>'
            +   '<div class="form-group">'
            +     '<label>景点（用 、或 , 分隔）</label>'
            +     '<input type="text" class="j-highlights" value="' + esc(highlightsStr) + '">'
            +   '</div>'
            +   '<div class="form-row dense">'
            +     fieldHtml('报团费', 'number', 'j-cost-package', cost.package, '0')
            +     fieldHtml('交通费', 'number', 'j-cost-transport', cost.transport, '0')
            +     fieldHtml('住宿费', 'number', 'j-cost-accommodation', cost.accommodation, '0')
            +     fieldHtml('餐饮费', 'number', 'j-cost-food', cost.food, '0')
            +   '</div>'
            +   '<div class="form-group">'
            +     '<label>游记</label>'
            +     '<textarea class="j-story" rows="5" placeholder="记录旅途中的风景、故事与感动…">' + esc(journey.story || '') + '</textarea>'
            +   '</div>'
            +   '<div class="form-group">'
            +     '<label>封面照片</label>'
            +     '<div class="photo-input__drop j-photo-drop">'
            +       Icons.svg('image', { size: 32 })
            +       + '<span class="photo-input__text">点击上传照片</span>'
            +       + '<span class="photo-input__hint">JPG/PNG，自动压缩</span>'
            +     '</div>'
            +     '<div class="photo-preview' + (hasPhoto ? '' : ' is-hidden') + ' j-photo-preview">'
            +       (hasPhoto ? '<img src="' + esc(journey.photo) + '" alt="预览">' : '')
            +       + '<button class="icon-btn icon-btn--sm photo-preview__remove j-photo-remove" type="button" aria-label="移除照片">' + Icons.svg('x', { size: 16 }) + '</button>'
            +     '</div>'
            +     '<input type="hidden" class="j-photo-data" value="' + esc(journey.photo || '') + '">'
            +   '</div>'
            +   '<div class="btn-group">'
            +     '<button class="btn btn-primary" type="button" data-action="save-primary">保存</button>'
            +     '<button class="btn btn-secondary" type="button" data-action="cancel">取消</button>'
            +   '</div>'
            + '</div>';

        // Photo upload
        const dropZone = container.querySelector('.j-photo-drop');
        const preview = container.querySelector('.j-photo-preview');
        const previewImg = preview.querySelector('img');
        const removeBtn = container.querySelector('.j-photo-remove');
        const hiddenInput = container.querySelector('.j-photo-data');

        dropZone.addEventListener('click', function () {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', function () {
                const file = input.files && input.files[0];
                if (!file) return;
                HsnUI.compressImage(file, { maxW: 1600, maxH: 1600, quality: 0.8 }).then(function (dataUrl) {
                    hiddenInput.value = dataUrl;
                    if (previewImg) {
                        previewImg.src = dataUrl;
                    } else {
                        const img = document.createElement('img');
                        img.src = dataUrl;
                        img.alt = '预览';
                        preview.insertBefore(img, removeBtn);
                    }
                    preview.classList.remove('is-hidden');
                    dropZone.classList.add('is-hidden');
                }).catch(function () {
                    HsnUI.toast('图片处理失败', 'error');
                });
            });
            input.click();
        });

        removeBtn.addEventListener('click', function () {
            hiddenInput.value = '';
            if (previewImg) previewImg.remove();
            preview.classList.add('is-hidden');
            dropZone.classList.remove('is-hidden');
        });

        container.querySelector('[data-action="save-primary"]').addEventListener('click', function () {
            saveEditPrimary(journey.id, container);
        });
        container.querySelector('[data-action="cancel"]').addEventListener('click', function () {
            container.innerHTML = '';
            container.hidden = true;
        });
    }

    function fieldHtml(label, type, cls, value, placeholder) {
        const v = value == null ? '' : esc(String(value));
        return '<div class="form-group">'
            +   '<label>' + esc(label) + '</label>'
            +   '<input type="' + type + '" class="' + cls + '" value="' + v + '"'
            +     (placeholder ? ' placeholder="' + esc(placeholder) + '"' : '') + '>'
            + '</div>';
    }

    function saveEditPrimary(journeyId, container) {
        const province = container.querySelector('.j-province').value.trim();
        const city = container.querySelector('.j-city').value.trim();
        const emoji = container.querySelector('.j-emoji').value.trim();
        const date = container.querySelector('.j-date').value;
        const endDate = container.querySelector('.j-endDate').value || date;
        const highlightsStr = container.querySelector('.j-highlights').value.trim();
        const story = container.querySelector('.j-story').value.trim();
        const photo = container.querySelector('.j-photo-data').value;
        const cost = {
            package: container.querySelector('.j-cost-package').value,
            transport: container.querySelector('.j-cost-transport').value,
            accommodation: container.querySelector('.j-cost-accommodation').value,
            food: container.querySelector('.j-cost-food').value,
        };

        if (!city || !date) {
            HsnUI.toast('城市和开始日期为必填项', 'error');
            return;
        }

        const highlights = highlightsStr
            ? highlightsStr.split(/[、,]/).map(function (h) { return h.trim(); }).filter(Boolean)
            : [];
        const title = province && province !== city ? province + '·' + city : (province || city);

        updateJourney(journeyId, {
            province: province, city: city, emoji: emoji,
            date: date, endDate: endDate, title: title,
            highlights: highlights, cost: cost,
            story: story, photo: photo || undefined,
        });

        const journey = getJourneyById(journeyId);
        const wrapper = document.querySelector('.primary-card-wrapper[data-id="' + journeyId + '"]');
        if (wrapper && journey) {
            updatePrimaryCard(wrapper, journey);
            // Reload card body if expanded
            const cardBody = wrapper.querySelector('.card-body');
            if (cardBody && cardBody.dataset.loaded === 'true') {
                renderCardBody(journey, cardBody);
            }
        }

        container.innerHTML = '';
        container.hidden = true;
        HsnUI.toast('已保存', 'success');
    }

    function updatePrimaryCard(wrapper, journey) {
        const subcards = getSubcards(journey);
        const title = journey.title ? esc(journey.title) : (journey.province && journey.province !== journey.city
            ? esc(journey.province) + ' · ' + esc(journey.city)
            : esc(journey.province || journey.city));
        const spots = primarySpotsHtml(subcards);

        wrapper.querySelector('.primary-title').innerHTML = title;
        wrapper.querySelector('.primary-emoji').textContent = journey.emoji || '📍';
        wrapper.querySelector('.primary-emoji').setAttribute('aria-label', (journey.city || '') + '封面');
        wrapper.querySelector('.primary-meta').innerHTML = metaHtml(journey.cost, subcards.length);
        const spotsEl = wrapper.querySelector('.primary-spots');
        if (spotsEl) {
            spotsEl.innerHTML = '<div class="primary-spots__lines">' + spots + '</div>';
        }
    }

    // ------------------------------------------------------------------
    // Expand / collapse all
    // ------------------------------------------------------------------

    function expandAll() {
        document.querySelectorAll('.primary-card-wrapper').forEach(function (wrapper) {
            if (!wrapper.classList.contains('is-expanded')) {
                const cardBody = wrapper.querySelector('.card-body');
                if (cardBody && !cardBody.dataset.loaded) {
                    const journey = getJourneyById(wrapper.dataset.id);
                    if (journey) {
                        renderCardBody(journey, cardBody);
                        cardBody.dataset.loaded = 'true';
                    }
                }
                wrapper.classList.add('is-expanded');
                wrapper.querySelector('.primary-card').setAttribute('aria-expanded', 'true');
            }
        });
    }

    function collapseAll() {
        document.querySelectorAll('.primary-card-wrapper').forEach(function (wrapper) {
            wrapper.classList.remove('is-expanded');
            wrapper.querySelector('.primary-card').setAttribute('aria-expanded', 'false');
        });
    }
})();
