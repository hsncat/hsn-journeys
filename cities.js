/**
 * Cities — primary cards for each journey, expandable to show secondary cards.
 *
 * Depends on: data.js, icons.js, ui.js
 *
 * Improvements over v1:
 *  - HsnUI.toast / HsnUI.confirm replace alert / confirm
 *  - escapeHtml protects user-entered fields when written via innerHTML
 *  - SVG chevron + class-based expand animation (respects prefers-reduced-motion)
 *  - Live search + country filter chips with empty-state fallback
 *  - Event delegation for chip + toolbar handlers
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

    // ------------------------------------------------------------------
    // Grid render
    // ------------------------------------------------------------------

    function renderGrid() {
        const grid = document.getElementById('city-grid');
        if (!grid) return;
        const list = (typeof journeys !== 'undefined' ? journeys : []).filter(passesFilter);
        grid.innerHTML = '';

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

    // ------------------------------------------------------------------
    // Primary card
    // ------------------------------------------------------------------

    function getDays(start, end) {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        return Math.round((e - s) / 86400000) + 1;
    }

    function formatCost(num) {
        if (num === undefined || num === null || num === '') return '—';
        return Number(num).toLocaleString();
    }

    function metaHtml(date, endDate, days, cost) {
        cost = cost || {};
        return ''
            + '<span title="日期">' + Icons.svg('calendar', { size: 14 }) + ' ' + esc(date || '') + ' ~ ' + esc(endDate || '') + '</span>'
            + '<span title="天数">' + days + ' 天</span>'
            + '<span title="报团">' + Icons.svg('package', { size: 14 }) + ' ' + esc(formatCost(cost.package)) + '</span>'
            + '<span title="交通">' + Icons.svg('car', { size: 14 }) + ' ' + esc(formatCost(cost.transport)) + '</span>'
            + '<span title="住宿">' + Icons.svg('bed', { size: 14 }) + ' ' + esc(formatCost(cost.accommodation)) + '</span>'
            + '<span title="餐饮">' + Icons.svg('utensils', { size: 14 }) + ' ' + esc(formatCost(cost.food)) + '</span>';
    }

    function createPrimaryCard(journey) {
        const wrapper = document.createElement('div');
        wrapper.className = 'primary-card-wrapper';
        wrapper.dataset.id = journey.id;

        const title = journey.province && journey.province !== journey.city
            ? esc(journey.province) + ' · ' + esc(journey.city)
            : esc(journey.province || journey.city);
        const spots = (journey.highlights || []).map(esc).join(' · ');
        const days = getDays(journey.date, journey.endDate);
        const emojiLabel = esc(journey.city || '') + '封面';

        wrapper.innerHTML = ''
            + '<div class="primary-card" tabindex="0" role="button" aria-expanded="false" aria-label="展开 ' + esc(title) + '">'
            +   '<div class="primary-emoji" role="img" aria-label="' + emojiLabel + '">' + esc(journey.emoji || '📍') + '</div>'
            +   '<div class="primary-info">'
            +     '<div class="primary-title">' + title + '</div>'
            +     '<div class="primary-meta">' + metaHtml(journey.date, journey.endDate, days, journey.cost) + '</div>'
            +     (spots ? '<div class="primary-spots"><span class="primary-spots__icon">' + Icons.svg('sparkles', { size: 14 }) + '</span>' + spots + '</div>' : '')
            +   '</div>'
            +   '<div class="primary-actions">'
            +     '<button class="icon-btn icon-btn--sm edit-primary-btn" type="button" aria-label="编辑旅程">' + Icons.svg('edit', { size: 16 }) + '</button>'
            +   '</div>'
            +   '<div class="primary-arrow" aria-hidden="true">' + Icons.svg('chevronDown', { size: 18 }) + '</div>'
            + '</div>'
            + '<div class="primary-edit-form" hidden></div>'
            + '<div class="secondary-cards"></div>';

        const primary = wrapper.querySelector('.primary-card');
        const secondary = wrapper.querySelector('.secondary-cards');
        const editBtn = wrapper.querySelector('.edit-primary-btn');
        const editFormContainer = wrapper.querySelector('.primary-edit-form');

        function toggleSecondary() {
            if (!editFormContainer.hidden) {
                editFormContainer.hidden = true;
                editFormContainer.innerHTML = '';
            }
            const isOpen = wrapper.classList.toggle('is-expanded');
            primary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen && !secondary.dataset.loaded) {
                renderSecondaryCards(journey, secondary);
                secondary.dataset.loaded = 'true';
            }
        }

        primary.addEventListener('click', function (e) {
            if (e.target.closest('.primary-actions')) return;
            toggleSecondary();
        });
        primary.addEventListener('keydown', function (e) {
            if (e.target !== primary) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSecondary();
            }
        });

        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            wrapper.classList.remove('is-expanded');
            primary.setAttribute('aria-expanded', 'false');
            if (editFormContainer.hidden) {
                showEditPrimaryForm(journey, editFormContainer);
                editFormContainer.hidden = false;
            } else {
                editFormContainer.hidden = true;
                editFormContainer.innerHTML = '';
            }
        });

        return wrapper;
    }

    // ------------------------------------------------------------------
    // Secondary cards
    // ------------------------------------------------------------------

    function renderSecondaryCards(journey, container) {
        container.innerHTML = '';
        let cards = [];

        if (journey.subCards && journey.subCards.length > 0) {
            cards = journey.subCards.map(function (sub, idx) {
                const subTitle = sub.province && sub.province !== sub.city
                    ? esc(sub.province) + ' · ' + esc(sub.city)
                    : esc(sub.province || sub.city || sub.name);
                const icon = sub.emoji
                    ? esc(sub.emoji)
                    : (sub.photo
                        ? '<img src="' + esc(sub.photo) + '" alt="' + esc(sub.name || '') + '" class="secondary-photo" loading="lazy" decoding="async">'
                        : (journey.photo
                            ? '<img src="' + esc(journey.photo) + '" alt="' + esc(journey.title || '') + '" class="secondary-photo" loading="lazy" decoding="async">'
                            : Icons.svg('mapPin', { size: 24 })));
                return {
                    idx: idx,
                    icon: icon,
                    title: subTitle,
                    meta: esc(sub.name || '') + ' · ' + esc(sub.date || '') + (sub.endDate ? ' ~ ' + esc(sub.endDate) : ''),
                    sortKey: new Date(sub.date),
                    editable: true,
                };
            });
        } else {
            const locations = generateLocations(journey);
            if (locations.length > 1) {
                cards = locations.map(function (loc) {
                    const icon = journey.photo
                        ? '<img src="' + esc(journey.photo) + '" alt="' + esc(loc.name || '') + '" class="secondary-photo" loading="lazy" decoding="async">'
                        : (loc.type === 'country' ? Icons.svg('globe', { size: 24 })
                            : (loc.type === 'province' ? Icons.svg('mapPin', { size: 24 })
                                : Icons.svg('mapPinned', { size: 24 })));
                    return {
                        idx: null,
                        icon: icon,
                        title: esc(loc.name),
                        meta: esc(journey.title || '') + ' · ' + esc(journey.date || ''),
                        sortKey: new Date(journey.date),
                        editable: false,
                    };
                });
            } else {
                cards = [{
                    idx: null,
                    icon: journey.photo
                        ? '<img src="' + esc(journey.photo) + '" alt="' + esc(journey.title || '') + '" class="secondary-photo" loading="lazy" decoding="async">'
                        : Icons.svg('calendar', { size: 24 }),
                    title: esc(journey.city),
                    meta: esc(journey.title || '') + ' · ' + esc(journey.date || '') + ' ~ ' + esc(journey.endDate || ''),
                    sortKey: new Date(journey.date),
                    editable: false,
                }];
            }
        }

        cards.sort(function (a, b) { return b.sortKey - a.sortKey; });

        cards.forEach(function (card) {
            const el = document.createElement('div');
            el.className = 'secondary-card';
            el.innerHTML = ''
                + '<div class="secondary-emoji" role="img">' + card.icon + '</div>'
                + '<div class="secondary-info">'
                +   '<div class="secondary-title">' + card.title + '</div>'
                +   '<div class="secondary-meta">' + card.meta + '</div>'
                + '</div>';

            if (card.editable && card.idx !== null) {
                const actions = document.createElement('div');
                actions.className = 'card-actions';
                actions.innerHTML = ''
                    + '<button class="icon-btn icon-btn--sm" type="button" data-action="edit" aria-label="编辑">' + Icons.svg('edit', { size: 16 }) + '</button>'
                    + '<button class="icon-btn icon-btn--sm icon-btn--danger" type="button" data-action="delete" aria-label="删除">' + Icons.svg('trash2', { size: 16 }) + '</button>';
                actions.querySelector('[data-action="edit"]').addEventListener('click', function (e) {
                    e.stopPropagation();
                    showEditSubCardForm(journey, card.idx, container);
                });
                actions.querySelector('[data-action="delete"]').addEventListener('click', function (e) {
                    e.stopPropagation();
                    deleteSubCard(journey.id, card.idx, container);
                });
                el.appendChild(actions);
            }

            container.appendChild(el);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-secondary add-subcard-btn';
        addBtn.type = 'button';
        addBtn.innerHTML = Icons.svg('plus', { size: 16 }) + '<span>添加二级卡片</span>';
        addBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showAddSubCardForm(journey, container);
        });
        container.appendChild(addBtn);
    }

    // ------------------------------------------------------------------
    // Edit primary
    // ------------------------------------------------------------------

    function showEditPrimaryForm(journey, container) {
        const cost = journey.cost || {};
        const highlightsStr = (journey.highlights || []).join('、');

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
            +   '<div class="btn-group">'
            +     '<button class="btn btn-primary" type="button" data-action="save-primary">保存</button>'
            +     '<button class="btn btn-secondary" type="button" data-action="cancel">取消</button>'
            +   '</div>'
            + '</div>';

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

        updateJourney(journeyId, { province: province, city: city, emoji: emoji, date: date, endDate: endDate, title: title, highlights: highlights, cost: cost });

        const journey = getJourneyById(journeyId);
        const wrapper = document.querySelector('.primary-card-wrapper[data-id="' + journeyId + '"]');
        if (wrapper && journey) {
            updatePrimaryCard(wrapper, journey);
        }

        container.innerHTML = '';
        container.hidden = true;
        HsnUI.toast('已保存', 'success');
    }

    function updatePrimaryCard(wrapper, journey) {
        const days = getDays(journey.date, journey.endDate);
        const title = journey.province && journey.province !== journey.city
            ? esc(journey.province) + ' · ' + esc(journey.city)
            : esc(journey.province || journey.city);
        const spots = (journey.highlights || []).map(esc).join(' · ');

        wrapper.querySelector('.primary-title').innerHTML = title;
        wrapper.querySelector('.primary-emoji').textContent = journey.emoji || '📍';
        wrapper.querySelector('.primary-emoji').setAttribute('aria-label', (journey.city || '') + '封面');
        wrapper.querySelector('.primary-meta').innerHTML = metaHtml(journey.date, journey.endDate, days, journey.cost);
        const spotsEl = wrapper.querySelector('.primary-spots');
        if (spotsEl) {
            spotsEl.innerHTML = '<span class="primary-spots__icon">' + Icons.svg('sparkles', { size: 14 }) + '</span>' + spots;
        }
        // Reload secondary cards if currently displayed
        const secondary = wrapper.querySelector('.secondary-cards');
        if (secondary && secondary.dataset.loaded === 'true') {
            renderSecondaryCards(journey, secondary);
        }
    }

    // ------------------------------------------------------------------
    // Add / Edit / Delete sub-cards
    // ------------------------------------------------------------------

    function syncPrimaryFromSubCards(journey) {
        if (!journey.subCards || journey.subCards.length === 0) return;
        const provinces = [...new Set(journey.subCards.map(function (s) { return s.province; }).filter(Boolean))];
        const cities = [...new Set(journey.subCards.map(function (s) { return s.city; }).filter(Boolean))];
        const dates = journey.subCards.map(function (s) { return s.date; }).filter(Boolean);
        const endDates = journey.subCards.map(function (s) { return s.endDate || s.date; }).filter(Boolean);
        const province = provinces.length > 0 ? provinces.join('&') : journey.province;
        const city = cities.length > 0 ? cities.join('&') : journey.city;
        const date = dates.length > 0 ? dates.slice().sort()[0] : journey.date;
        const endDate = endDates.length > 0 ? endDates.slice().sort()[endDates.length - 1] : journey.endDate;
        const totalCost = { package: 0, transport: 0, accommodation: 0, food: 0 };
        journey.subCards.forEach(function (s) {
            if (s.cost) {
                totalCost.package += Number(s.cost.package) || 0;
                totalCost.transport += Number(s.cost.transport) || 0;
                totalCost.accommodation += Number(s.cost.accommodation) || 0;
                totalCost.food += Number(s.cost.food) || 0;
            }
        });
        const allHighlights = journey.subCards.flatMap(function (s) { return s.highlights || []; });
        const title = province && province !== city ? province + '·' + city : (province || city);
        updateJourney(journey.id, { province: province, city: city, date: date, endDate: endDate, title: title, cost: totalCost, highlights: allHighlights });
        const updated = getJourneyById(journey.id);
        const wrapper = document.querySelector('.primary-card-wrapper[data-id="' + journey.id + '"]');
        if (wrapper && updated) updatePrimaryCard(wrapper, updated);
    }

    function showAddSubCardForm(journey, container) {
        const existing = container.querySelector('.subcard-form');
        if (existing) existing.remove();

        const form = document.createElement('div');
        form.className = 'subcard-form';
        form.innerHTML = subCardFormHtml('添加二级卡片', {
            province: journey.province || '',
            city: journey.city,
            emoji: journey.emoji,
            name: '',
            date: journey.date,
            endDate: journey.endDate,
            highlights: '',
            cost: {},
        });

        wireSubCardNameAutoFill(form);
        form.querySelector('[data-action="save-sub"]').addEventListener('click', function () {
            saveSubCard(journey.id, form, container, null);
        });
        form.querySelector('[data-action="cancel"]').addEventListener('click', function () {
            form.remove();
        });

        container.appendChild(form);
    }

    function showEditSubCardForm(journey, idx, container) {
        const existing = container.querySelector('.subcard-form');
        if (existing) existing.remove();
        const sub = journey.subCards[idx];
        if (!sub) return;

        const form = document.createElement('div');
        form.className = 'subcard-form';
        form.innerHTML = subCardFormHtml('编辑二级卡片', {
            province: sub.province || '',
            city: sub.city || '',
            emoji: sub.emoji || '',
            name: sub.name || '',
            date: sub.date || '',
            endDate: sub.endDate || '',
            highlights: (sub.highlights || []).join('、'),
            cost: sub.cost || {},
        });

        wireSubCardNameAutoFill(form);
        form.querySelector('[data-action="save-sub"]').addEventListener('click', function () {
            saveSubCard(journey.id, form, container, idx);
        });
        form.querySelector('[data-action="cancel"]').addEventListener('click', function () {
            form.remove();
        });

        container.appendChild(form);
    }

    function subCardFormHtml(title, sub) {
        const cost = sub.cost || {};
        return ''
            + '<div class="edit-form">'
            +   '<h3>' + esc(title) + '</h3>'
            +   '<div class="form-row dense">'
            +     fieldHtml('省份', 'text', 'sub-province', sub.province) + fieldHtml('城市', 'text', 'sub-city', sub.city) + fieldHtml('Emoji', 'text', 'sub-emoji', sub.emoji)
            +   '</div>'
            +   '<div class="form-row">'
            +     fieldHtml('名称', 'text', 'sub-name', sub.name, '如：天津之眼') + fieldHtml('日期', 'date', 'sub-date', sub.date) + fieldHtml('结束日期', 'date', 'sub-endDate', sub.endDate)
            +   '</div>'
            +   '<div class="form-group"><label>景点</label><input type="text" class="sub-highlights" value="' + esc(sub.highlights || '') + '"></div>'
            +   '<div class="form-row dense">'
            +     fieldHtml('报团费', 'number', 'sub-cost-package', cost.package, '0')
            +     fieldHtml('交通费', 'number', 'sub-cost-transport', cost.transport, '0')
            +     fieldHtml('住宿费', 'number', 'sub-cost-accommodation', cost.accommodation, '0')
            +     fieldHtml('餐饮费', 'number', 'sub-cost-food', cost.food, '0')
            +   '</div>'
            +   '<div class="btn-group">'
            +     '<button class="btn btn-primary" type="button" data-action="save-sub">保存</button>'
            +     '<button class="btn btn-secondary" type="button" data-action="cancel">取消</button>'
            +   '</div>'
            + '</div>';
    }

    function wireSubCardNameAutoFill(form) {
        const subProvinceInput = form.querySelector('.sub-province');
        const subCityInput = form.querySelector('.sub-city');
        const subNameInput = form.querySelector('.sub-name');
        function autoFill() {
            if (subNameInput.dataset.manual === 'true') return;
            const p = subProvinceInput.value.trim();
            const c = subCityInput.value.trim();
            subNameInput.value = p && c && p !== c ? p + '·' + c : (p || c);
        }
        subNameInput.addEventListener('input', function () { subNameInput.dataset.manual = 'true'; });
        subProvinceInput.addEventListener('input', autoFill);
        subCityInput.addEventListener('input', autoFill);
    }

    function saveSubCard(journeyId, form, container, editIdx) {
        const province = form.querySelector('.sub-province').value.trim();
        const city = form.querySelector('.sub-city').value.trim();
        const emoji = form.querySelector('.sub-emoji').value.trim();
        const name = form.querySelector('.sub-name').value.trim();
        const subDate = form.querySelector('.sub-date').value;
        const subEndDate = form.querySelector('.sub-endDate').value || subDate;
        const highlightsStr = form.querySelector('.sub-highlights').value.trim();
        const cost = {
            package: form.querySelector('.sub-cost-package').value,
            transport: form.querySelector('.sub-cost-transport').value,
            accommodation: form.querySelector('.sub-cost-accommodation').value,
            food: form.querySelector('.sub-cost-food').value,
        };

        if (!name || !subDate) {
            HsnUI.toast('名称和日期为必填项', 'error');
            return;
        }

        const highlights = highlightsStr
            ? highlightsStr.split(/[、,]/).map(function (h) { return h.trim(); }).filter(Boolean)
            : [];
        const journey = getJourneyById(journeyId);
        if (!journey) return;
        if (!journey.subCards) journey.subCards = [];

        const subEntry = { name: name, date: subDate, endDate: subEndDate, province: province, city: city, emoji: emoji, highlights: highlights, cost: cost };
        if (editIdx == null) {
            journey.subCards.push(subEntry);
        } else {
            journey.subCards[editIdx] = Object.assign({}, journey.subCards[editIdx], subEntry);
        }
        journey.subCards.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
        updateJourney(journey.id, { subCards: journey.subCards });
        syncPrimaryFromSubCards(journey);
        renderSecondaryCards(journey, container);
        HsnUI.toast(editIdx == null ? '已添加' : '已保存', 'success');
    }

    function deleteSubCard(journeyId, idx, container) {
        HsnUI.confirm({
            title: '删除二级卡片',
            message: '确定删除这个二级卡片吗？此操作无法撤销。',
            confirmText: '删除',
            danger: true,
        }).then(function (ok) {
            if (!ok) return;
            const journey = getJourneyById(journeyId);
            if (!journey || !journey.subCards) return;
            journey.subCards.splice(idx, 1);
            if (journey.subCards.length === 0) {
                delete journey.subCards;
                updateJourney(journeyId, { subCards: undefined });
            } else {
                updateJourney(journeyId, { subCards: journey.subCards });
            }
            syncPrimaryFromSubCards(journey);
            renderSecondaryCards(getJourneyById(journeyId), container);
            HsnUI.toast('已删除', 'success');
        });
    }

    // ------------------------------------------------------------------
    // Expand / collapse all
    // ------------------------------------------------------------------

    function expandAll() {
        document.querySelectorAll('.primary-card-wrapper').forEach(function (wrapper) {
            if (!wrapper.classList.contains('is-expanded')) {
                const secondary = wrapper.querySelector('.secondary-cards');
                if (secondary && !secondary.dataset.loaded) {
                    const journey = getJourneyById(wrapper.dataset.id);
                    if (journey) {
                        renderSecondaryCards(journey, secondary);
                        secondary.dataset.loaded = 'true';
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
