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
    // Helpers
    // ------------------------------------------------------------------

    function getDays(start, end) {
        if (!start || !end) return 0;
        return Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
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

    function totalCost(cost) {
        if (!cost) return 0;
        return (Number(cost.package) || 0) + (Number(cost.transport) || 0)
            + (Number(cost.accommodation) || 0) + (Number(cost.food) || 0);
    }

    // ------------------------------------------------------------------
    // Primary card
    // ------------------------------------------------------------------

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
            + '<div class="card-body"></div>';

        const primary = wrapper.querySelector('.primary-card');
        const cardBody = wrapper.querySelector('.card-body');
        const editBtn = wrapper.querySelector('.edit-primary-btn');
        const editFormContainer = wrapper.querySelector('.primary-edit-form');

        function toggleBody() {
            if (!editFormContainer.hidden) {
                editFormContainer.hidden = true;
                editFormContainer.innerHTML = '';
            }
            const isOpen = wrapper.classList.toggle('is-expanded');
            primary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen && !cardBody.dataset.loaded) {
                renderCardBody(journey, cardBody);
                cardBody.dataset.loaded = 'true';
            }
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
    // Card body — photo + story (two-column) + location chips
    // ------------------------------------------------------------------

    function renderCardBody(journey, container) {
        container.innerHTML = '';

        // --- media row: photo | story ---
        const mediaRow = document.createElement('div');
        mediaRow.className = 'card-media-row';

        // Photo area
        const photoArea = document.createElement('div');
        photoArea.className = 'card-photo';
        renderPhotoArea(journey, photoArea);
        mediaRow.appendChild(photoArea);

        // Story area
        const storyArea = document.createElement('div');
        storyArea.className = 'card-story';
        renderStoryArea(journey, storyArea);
        mediaRow.appendChild(storyArea);

        container.appendChild(mediaRow);

        // --- location chips ---
        const locations = generateLocations(journey);
        if (locations.length > 1) {
            const chipsRow = document.createElement('div');
            chipsRow.className = 'card-locations';
            chipsRow.innerHTML = '<span class="card-locations__label">' + Icons.svg('mapPin', { size: 14 }) + ' 旅程足迹</span>';
            const chipsList = document.createElement('div');
            chipsList.className = 'card-locations__chips';
            locations.forEach(function (loc) {
                const chip = document.createElement('span');
                chip.className = 'location-chip';
                chip.textContent = loc.name;
                chipsList.appendChild(chip);
            });
            chipsRow.appendChild(chipsList);
            container.appendChild(chipsRow);
        }
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
