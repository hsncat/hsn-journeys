/**
 * Add page — create a secondary journey card using the same page form as edit.
 *
 * Depends on: data.js, icons.js, ui.js
 */
(function () {
    'use strict';

    const Icons = window.HsnIcons;
    const esc = HsnUI.escapeHtml;

    document.addEventListener('DOMContentLoaded', function () {
        renderParentOptions();
        renderItineraryEditor(defaultTable());
        wireForm();
        wireAutoResizeTextareas();
    });

    function defaultTable() {
        return {
            headers: ['日期', '上午', '下午', '备注'],
            rows: [
                ['', '', '', ''],
                ['', '', '', ''],
                ['', '', '', ''],
            ],
        };
    }

    function normalizeTable(table) {
        const fallback = defaultTable();
        if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return fallback;
        const headers = (table.headers.length ? table.headers : fallback.headers).map(function (h, i) {
            return h || fallback.headers[i] || ('列' + (i + 1));
        });
        const rows = table.rows.length ? table.rows.map(function (row) {
            const next = Array.isArray(row) ? row.slice(0, headers.length) : [];
            while (next.length < headers.length) next.push('');
            return next;
        }) : fallback.rows.map(function (row) { return row.slice(); });
        while (rows.length < 3) rows.push(new Array(headers.length).fill(''));
        return { headers: headers, rows: rows };
    }

    function renderParentOptions() {
        const select = document.getElementById('add-parent');
        if (!select) return;
        const requestedParent = new URLSearchParams(window.location.search).get('parent');
        const options = (typeof journeys !== 'undefined' ? journeys : []).map(function (j) {
            const label = j.province && j.province !== j.city ? j.province + ' · ' + j.city : (j.province || j.city || j.title || '未命名');
            return '<option value="' + j.id + '"' + (String(j.id) === String(requestedParent) ? ' selected' : '') + '>' + esc(label) + '</option>';
        }).join('');
        select.innerHTML = '<option value="new"' + (!requestedParent ? ' selected' : '') + '>新建一级卡片</option>' + options;
    }

    function renderItineraryEditor(table) {
        table = normalizeTable(table);
        const headers = table.headers.map(function (header, index) {
            return '<th data-col="' + index + '">'
                + '<div class="sub-itinerary-frame">'
                +   '<input type="text" class="sub-itinerary-header" value="' + esc(header) + '">'
                +   '<span class="sub-itinerary-col-actions">'
                +     '<button type="button" class="itinerary-action-btn" data-action="add-col" aria-label="在右侧加列">' + Icons.svg('plus', { size: 12 }) + '</button>'
                +     '<button type="button" class="itinerary-action-btn itinerary-action-btn--danger" data-action="delete-col" aria-label="删除该列">' + Icons.svg('trash2', { size: 12 }) + '</button>'
                +   '</span>'
                + '</div>'
                + '</th>';
        }).join('');
        const rows = table.rows.map(function (row) {
            return buildRow(row, table.headers.length);
        }).join('');
        document.getElementById('add-itinerary-editor').innerHTML = ''
            + '<div class="sub-itinerary-table-wrap">'
            +   '<table class="sub-itinerary-table subcard-page-table">'
            +     '<thead><tr>' + headers + '</tr></thead>'
            +     '<tbody id="add-itinerary-rows">' + rows + '</tbody>'
            +   '</table>'
            + '</div>';
    }

    function buildRow(row, columnCount) {
        const cells = [];
        for (let i = 0; i < columnCount; i += 1) {
            const actions = i === 0
                ? '<span class="sub-itinerary-row-actions">'
                    + '<button type="button" class="itinerary-action-btn" data-action="add-row" aria-label="在下方加行">' + Icons.svg('plus', { size: 12 }) + '</button>'
                    + '<button type="button" class="itinerary-action-btn itinerary-action-btn--danger" data-action="delete-row" aria-label="删除该行">' + Icons.svg('trash2', { size: 12 }) + '</button>'
                + '</span>'
                : '';
            cells.push('<td><div class="sub-itinerary-frame"><textarea class="sub-itinerary-cell" rows="2">' + esc(row && row[i] || '') + '</textarea>' + actions + '</div></td>');
        }
        return '<tr>' + cells.join('') + '</tr>';
    }

    function readTable() {
        const headers = Array.prototype.map.call(document.querySelectorAll('.sub-itinerary-header'), function (input, index) {
            return input.value.trim() || ['日期', '上午', '下午', '备注'][index] || ('列' + (index + 1));
        });
        const rows = Array.prototype.map.call(document.querySelectorAll('#add-itinerary-rows tr'), function (row) {
            return Array.prototype.map.call(row.querySelectorAll('.sub-itinerary-cell'), function (cell) {
                return cell.value.trim();
            });
        });
        return normalizeTable({ headers: headers, rows: rows });
    }

    function dateRangeFromTable(table) {
        table = normalizeTable(table);
        const dateIndex = table.headers.indexOf('日期') >= 0 ? table.headers.indexOf('日期') : 0;
        const firstRow = table.rows[0] || [];
        const lastRow = table.rows[table.rows.length - 1] || firstRow;
        const start = String(firstRow[dateIndex] || '').trim();
        const end = String(lastRow[dateIndex] || '').trim() || start;
        return { start: start, end: end };
    }

    function highlightsFromTable(table) {
        table = normalizeTable(table);
        const indexes = table.headers.reduce(function (list, header, index) {
            if (header === '上午' || header === '下午') list.push(index);
            return list;
        }, []);
        const seen = {};
        return [].concat.apply([], table.rows.map(function (row) {
            return indexes.map(function (i) { return row[i]; });
        })).map(function (item) { return String(item || '').trim(); }).filter(function (item) {
            if (!item || seen[item]) return false;
            seen[item] = true;
            return true;
        });
    }

    function numeric(id) {
        const n = parseFloat(document.getElementById(id).value);
        return isNaN(n) ? 0 : n;
    }

    function getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function syncPrimaryFromSubcards(journey) {
        const sub = journey.subCards[0];
        journey.province = sub.province;
        journey.city = sub.city;
        journey.country = sub.country;
        journey.date = sub.date;
        journey.endDate = sub.endDate || sub.date;
        journey.title = sub.city;
        journey.emoji = sub.emoji;
        journey.highlights = sub.highlights;
        journey.cost = sub.cost;
        journey.story = sub.story;
        return journey;
    }

    function wireForm() {
        document.getElementById('add-action-save').addEventListener('click', function () {
            const form = document.getElementById('add-form');
            if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
            else handleSave();
        });

        document.getElementById('add-itinerary-editor').addEventListener('click', function (e) {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const table = readTable();
            const action = btn.dataset.action;
            if (action === 'add-row') {
                const row = btn.closest('tr');
                const index = Array.prototype.indexOf.call(document.querySelectorAll('#add-itinerary-rows tr'), row);
                table.rows.splice(index + 1, 0, new Array(table.headers.length).fill(''));
            } else if (action === 'delete-row') {
                if (table.rows.length <= 1) return HsnUI.toast('至少保留一行行程', 'error');
                const row = btn.closest('tr');
                const index = Array.prototype.indexOf.call(document.querySelectorAll('#add-itinerary-rows tr'), row);
                table.rows.splice(index, 1);
            } else if (action === 'add-col') {
                const col = Number(btn.closest('th').dataset.col);
                table.headers.splice(col + 1, 0, '备注');
                table.rows.forEach(function (row) { row.splice(col + 1, 0, ''); });
            } else if (action === 'delete-col') {
                if (table.headers.length <= 1) return HsnUI.toast('至少保留一列行程', 'error');
                const col = Number(btn.closest('th').dataset.col);
                table.headers.splice(col, 1);
                table.rows.forEach(function (row) { row.splice(col, 1); });
            }
            renderItineraryEditor(table);
        });

        document.getElementById('add-form').addEventListener('submit', function (e) {
            e.preventDefault();
            handleSave();
        });
    }

    function wireAutoResizeTextareas() {
        document.querySelectorAll('.journey-story-textarea').forEach(function (textarea) {
            function resize() {
                textarea.style.height = 'auto';
                textarea.style.height = Math.max(textarea.scrollHeight, textarea.offsetHeight) + 'px';
            }
            textarea.addEventListener('input', resize);
            setTimeout(resize, 0);
        });
    }

    function handleSave() {
        const table = readTable();
        const range = dateRangeFromTable(table);
        const city = getValue('add-city');
        if (!city || !range.start) {
            HsnUI.toast('请填写城市和行程表第一行日期', 'error');
            const focus = !city ? document.getElementById('add-city') : null;
            if (focus) focus.focus();
            return;
        }

        const subCard = {
            id: 'sub-' + Date.now(),
            name: city,
            province: getValue('add-province'),
            city: city,
            country: getValue('add-region-type') === 'international' ? '国外' : '中国',
            date: range.start,
            endDate: range.end || range.start,
            emoji: getValue('add-emoji') || '📍',
            itineraryTable: table,
            highlights: highlightsFromTable(table),
            cost: {
                package: numeric('add-cost-package'),
                transport: numeric('add-cost-transport'),
                accommodation: numeric('add-cost-accommodation'),
                food: numeric('add-cost-food'),
                shopping: numeric('add-cost-shopping'),
                ticket: numeric('add-cost-ticket'),
            },
            story: getValue('add-story'),
        };

        const parent = getValue('add-parent') || 'new';
        let targetId;
        let subIndex = 0;
        if (parent === 'new') {
            targetId = addJourney(syncPrimaryFromSubcards({
                title: city,
                subCards: [subCard],
            }));
        } else {
            const target = getJourneyById(parent);
            if (!target) return HsnUI.toast('未找到归属一级卡片', 'error');
            const subcards = target.subCards && target.subCards.length ? target.subCards.slice() : [{
                id: 'sub-' + target.id + '-1',
                name: target.title || target.city,
                province: target.province,
                city: target.city,
                country: target.country,
                date: target.date,
                endDate: target.endDate || target.date,
                emoji: target.emoji || '📍',
                highlights: target.highlights || [],
                cost: target.cost || {},
                story: target.story || '',
            }];
            subcards.push(subCard);
            target.subCards = subcards;
            updateJourney(target.id, target);
            targetId = target.id;
            subIndex = subcards.length - 1;
        }

        HsnUI.toast('已添加旅程', 'success');
        window.location.href = 'detail.html?id=' + encodeURIComponent(targetId) + '&sub=' + encodeURIComponent(subIndex) + '&edit=1';
    }
})();
