/**
 * Wishlist — planned future trips, persisted in localStorage.
 *
 * Depends on: data.js, icons.js, ui.js
 */
(function () {
    'use strict';

    const esc = HsnUI.escapeHtml;
    const Icons = window.HsnIcons;

    document.addEventListener('DOMContentLoaded', function () {
        wireToolbar();
        renderGrid();
    });

    function wireToolbar() {
        const addBtn = document.getElementById('wishlist-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', function () { showAddForm(); });
        }
    }

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------

    function renderGrid() {
        const grid = document.getElementById('wishlist-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!wishlist.length) {
            grid.innerHTML = HsnUI.emptyState({
                icon: 'heart',
                title: '心愿单空空如也',
                description: '把下一段旅程先收藏起来吧',
                actionText: '添加心愿',
                actionHref: '#',
            });
            const action = grid.querySelector('.empty-state__action a');
            if (action) {
                action.addEventListener('click', function (e) {
                    e.preventDefault();
                    showAddForm();
                });
            }
            return;
        }

        wishlist.forEach(function (item) { grid.appendChild(createCard(item)); });
    }

    function createCard(item) {
        const card = document.createElement('article');
        card.className = 'wishlist-card';
        card.dataset.id = item.id;

        const highlightsHtml = (item.highlights || [])
            .map(function (h) { return '<span class="chip chip--warning">' + esc(h) + '</span>'; })
            .join('');

        const pin = Icons.svg('mapPin', { size: 14 });
        const cal = Icons.svg('calendar', { size: 14 });
        const clock = Icons.svg('compass', { size: 14 });

        card.innerHTML = ''
            + '<div class="wishlist-emoji" role="img" aria-label="' + esc(item.city || '') + '">' + esc(item.emoji || '✈️') + '</div>'
            + '<div class="wishlist-content">'
            +   '<div class="wishlist-header">'
            +     '<h3 class="wishlist-title">' + esc(item.title || '') + '</h3>'
            +     '<div class="wishlist-actions">'
            +       '<button class="icon-btn icon-btn--sm" type="button" data-action="edit" aria-label="编辑">' + Icons.svg('edit', { size: 16 }) + '</button>'
            +       '<button class="icon-btn icon-btn--sm icon-btn--danger" type="button" data-action="delete" aria-label="删除">' + Icons.svg('trash2', { size: 16 }) + '</button>'
            +     '</div>'
            +   '</div>'
            +   '<div class="wishlist-meta">'
            +     '<span class="wishlist-meta__item">' + pin + '<span>' + esc(item.city || '') + '</span></span>'
            +     '<span class="wishlist-meta__item">' + cal + '<span>' + esc(item.season || '') + '</span></span>'
            +     '<span class="wishlist-meta__item">' + clock + '<span>' + esc(item.duration || '') + '</span></span>'
            +   '</div>'
            +   '<p class="wishlist-description">' + esc(item.description || '') + '</p>'
            +   (highlightsHtml ? '<div class="wishlist-highlights chip-group">' + highlightsHtml + '</div>' : '')
            + '</div>';

        card.querySelector('[data-action="edit"]').addEventListener('click', function () {
            showEditForm(item.id);
        });
        card.querySelector('[data-action="delete"]').addEventListener('click', function () {
            deleteItem(item.id);
        });
        return card;
    }

    // ------------------------------------------------------------------
    // Add / Edit form
    // ------------------------------------------------------------------

    function showAddForm() {
        openForm({
            mode: 'add',
            data: { emoji: '✈️', title: '', city: '', season: '', duration: '', description: '', highlights: [] },
        });
    }

    function showEditForm(id) {
        const item = getWishlistItemById(id);
        if (!item) return;
        openForm({ mode: 'edit', id: id, data: item });
    }

    function openForm(opts) {
        const data = opts.data;
        const titleText = opts.mode === 'add' ? '添加心愿' : '编辑心愿';
        const titleId = 'wish-form-title-' + Date.now();
        const highlightsStr = (data.highlights || []).join('、');

        const root = document.createElement('div');
        root.innerHTML = ''
            + '<div class="modal__body">'
            +   '<h2 class="modal__title" id="' + titleId + '">' + esc(titleText) + '</h2>'
            +   '<div class="form-row dense">'
            +     '<div class="form-group"><label for="w-emoji">Emoji</label><input type="text" id="w-emoji" value="' + esc(data.emoji || '') + '" placeholder="✈️"></div>'
            +     '<div class="form-group" style="grid-column: span 2;"><label for="w-title">标题 *</label><input type="text" id="w-title" value="' + esc(data.title || '') + '" placeholder="如：京都赏樱"></div>'
            +   '</div>'
            +   '<div class="form-row">'
            +     '<div class="form-group"><label for="w-city">地点 *</label><input type="text" id="w-city" value="' + esc(data.city || '') + '"></div>'
            +     '<div class="form-group"><label for="w-season">合适季节</label><input type="text" id="w-season" value="' + esc(data.season || '') + '" placeholder="如：4月初"></div>'
            +     '<div class="form-group"><label for="w-duration">预计时长</label><input type="text" id="w-duration" value="' + esc(data.duration || '') + '" placeholder="如：5天"></div>'
            +   '</div>'
            +   '<div class="form-group"><label for="w-description">简介</label><textarea id="w-description" rows="3">' + esc(data.description || '') + '</textarea></div>'
            +   '<div class="form-group"><label for="w-highlights">亮点（用 、或 , 分隔）</label><input type="text" id="w-highlights" value="' + esc(highlightsStr) + '"></div>'
            + '</div>'
            + '<div class="modal__actions">'
            +   '<button type="button" class="btn btn-secondary" data-action="cancel">取消</button>'
            +   '<button type="button" class="btn btn-primary" data-action="save">保存</button>'
            + '</div>';

        const handle = HsnUI.modal.open(root, { size: 'md', titleId: titleId });

        root.querySelector('[data-action="cancel"]').addEventListener('click', function () { handle.close(); });
        root.querySelector('[data-action="save"]').addEventListener('click', function () {
            const item = readForm(root);
            if (!item.title || !item.city) {
                HsnUI.toast('标题和地点为必填项', 'error');
                const focusEl = !item.title ? root.querySelector('#w-title') : root.querySelector('#w-city');
                if (focusEl) focusEl.focus();
                return;
            }
            if (opts.mode === 'add') {
                addWishlistItem(item);
                HsnUI.toast('已添加', 'success');
            } else {
                updateWishlistItem(opts.id, item);
                HsnUI.toast('已保存', 'success');
            }
            renderGrid();
            handle.close();
        });

        // Auto-focus the title field
        setTimeout(function () {
            const t = root.querySelector('#w-title');
            if (t) t.focus();
        }, 50);

        return handle;
    }

    function readForm(root) {
        const get = function (id) { const el = root.querySelector('#' + id); return el ? el.value.trim() : ''; };
        const highlightsStr = get('w-highlights');
        return {
            emoji: get('w-emoji'),
            title: get('w-title'),
            city: get('w-city'),
            season: get('w-season'),
            duration: get('w-duration'),
            description: get('w-description'),
            highlights: highlightsStr
                ? highlightsStr.split(/[、,]/).map(function (h) { return h.trim(); }).filter(Boolean)
                : [],
        };
    }

    function deleteItem(id) {
        const item = getWishlistItemById(id);
        if (!item) return;
        HsnUI.confirm({
            title: '删除心愿',
            message: '确定要删除「' + (item.title || '') + '」吗？',
            confirmText: '删除',
            danger: true,
        }).then(function (ok) {
            if (!ok) return;
            deleteWishlistItem(id);
            HsnUI.toast('已删除', 'success');
            renderGrid();
        });
    }
})();
