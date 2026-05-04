/**
 * Detail page — render a single journey, support inline edit / delete.
 *
 * Depends on: data.js, icons.js, ui.js
 */
(function () {
    'use strict';

    const esc = HsnUI.escapeHtml;
    const Icons = window.HsnIcons;

    let currentJourney = null;
    let editPhotoDataUrl = '';

    document.addEventListener('DOMContentLoaded', function () {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const journey = getJourneyById(id);

        if (!journey) {
            renderNotFound();
            return;
        }

        currentJourney = journey;
        document.title = pageTitle(journey) + ' - HSN Journey Traces';
        renderView(journey);
        renderActions(journey);
    });

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    function pageTitle(j) {
        return j.province && j.province !== j.city
            ? j.province + ' · ' + j.city
            : (j.province || j.city || '未命名旅程');
    }

    function getDays(start, end) {
        if (!start) return 0;
        const s = new Date(start);
        const e = new Date(end || start);
        return Math.round((e - s) / 86400000) + 1;
    }

    function fmtNumber(n) {
        const v = Number(n);
        return isNaN(v) ? '0' : v.toLocaleString();
    }

    function renderNotFound() {
        document.getElementById('detail-view').innerHTML = ''
            + '<div class="detail-content">'
            +   '<h3>未找到该旅行记录</h3>'
            +   '<p>抱歉，您查看的旅行记录不存在或已被删除。</p>'
            +   '<a href="cities.html" class="btn btn-primary" style="margin-top:1rem;">返回城市足迹</a>'
            + '</div>';
    }

    // ------------------------------------------------------------------
    // VIEW mode
    // ------------------------------------------------------------------

    function renderView(journey) {
        const view = document.getElementById('detail-view');
        const title = pageTitle(journey);
        const days = getDays(journey.date, journey.endDate);

        const pin = Icons.svg('mapPin', { size: 16 });
        const cal = Icons.svg('calendar', { size: 16 });
        const clk = Icons.svg('compass', { size: 16 });

        const metaParts = ''
            + '<span><span class="detail-meta__icon">' + pin + '</span>' + esc(journey.city || '')
            +    (journey.country ? '，' + esc(journey.country) : '') + '</span>'
            + '<span><span class="detail-meta__icon">' + cal + '</span>' + esc(journey.date || '')
            +    (journey.endDate && journey.endDate !== journey.date ? ' ~ ' + esc(journey.endDate) : '') + '</span>'
            + (days > 0 ? '<span><span class="detail-meta__icon">' + clk + '</span>' + days + ' 天</span>' : '');

        const cost = journey.cost || {};
        const costRow = (cost.package || cost.transport || cost.accommodation || cost.food)
            ? buildCostRow(cost)
            : '';

        const highlightsHtml = (journey.highlights && journey.highlights.length)
            ? '<ul class="detail-highlights">'
                + journey.highlights.map(function (h) {
                    return '<li><span class="chip">' + esc(h) + '</span></li>';
                }).join('')
            + '</ul>'
            : '<p class="empty-text" style="color:var(--color-text-subtle);">未添加亮点</p>';

        const itineraryHtml = renderItineraryTable(journey.itinerary);

        const photoHtml = journey.photo
            ? '<button type="button" class="detail-photo" id="detail-photo-btn" aria-label="查看大图">'
            +     '<img src="' + esc(journey.photo) + '" alt="' + esc(journey.city || '旅程') + '的照片" loading="lazy" decoding="async">'
            + '</button>'
            : '<div class="detail-gallery">'
            +     '<div class="gallery-item" aria-hidden="true">' + Icons.svg('camera', { size: 32 }) + '</div>'
            + '</div>';

        const descHtml = journey.description
            ? '<p>' + esc(journey.description) + '</p>'
            : '';

        const storyHtml = journey.story
            ? '<h3>旅行故事</h3><p style="white-space:pre-wrap;">' + esc(journey.story) + '</p>'
            : '';

        view.innerHTML = ''
            + '<header class="detail-header">'
            +   '<div class="detail-emoji" role="img" aria-label="' + esc(journey.city || '旅程') + '封面">' + esc(journey.emoji || '📍') + '</div>'
            +   '<h1 class="detail-title">' + esc(title) + '</h1>'
            +   '<div class="detail-meta">' + metaParts + '</div>'
            +   costRow
            + '</header>'
            + '<section class="detail-content">'
            +   descHtml
            +   '<h3>景点亮点</h3>' + highlightsHtml
            +   '<h3>行程安排</h3>' + itineraryHtml
            +   storyHtml
            +   '<h3>精彩瞬间</h3>' + photoHtml
            + '</section>';

        // Attach lightbox handler if photo present
        const photoBtn = document.getElementById('detail-photo-btn');
        if (photoBtn) {
            photoBtn.addEventListener('click', function () { openLightbox(journey.photo, journey.city); });
        }

        document.getElementById('main').setAttribute('data-mode', 'view');
        document.body.classList.remove('is-editing');
        document.getElementById('detail-edit').hidden = true;
        view.hidden = false;
    }

    function buildCostRow(cost) {
        const items = [
            { key: 'package',       icon: 'package',    label: '报团' },
            { key: 'transport',     icon: 'car',        label: '交通' },
            { key: 'accommodation', icon: 'bed',        label: '住宿' },
            { key: 'food',          icon: 'utensils',   label: '餐饮' },
        ];
        const html = items.filter(function (it) { return cost[it.key]; }).map(function (it) {
            return '<span class="detail-cost__item">'
                +    '<span class="detail-cost__icon">' + Icons.svg(it.icon, { size: 14 }) + '</span>'
                +    '<span class="detail-cost__label">' + it.label + '</span>'
                +    '<span class="detail-cost__value">¥' + fmtNumber(cost[it.key]) + '</span>'
                + '</span>';
        }).join('');
        return '<div class="detail-cost">' + html + '</div>';
    }

    function renderItineraryTable(itinerary) {
        const rows = (itinerary || []).map(function (item) {
            return '<tr>'
                +     '<td>' + esc(item.date || '') + '</td>'
                +     '<td>' + esc(item.morning || '') + '</td>'
                +     '<td>' + esc(item.afternoon || '') + '</td>'
                +     '<td>' + esc(item.evening || '') + '</td>'
                +     '<td>' + esc(item.note || '') + '</td>'
                + '</tr>';
        }).join('');

        const body = rows
            ? rows
            : '<tr><td colspan="5" style="text-align:center;color:var(--color-text-subtle);padding:1.5rem;">暂无行程数据，编辑后可添加</td></tr>';

        return ''
            + '<div style="overflow-x:auto;">'
            +   '<table class="itinerary-table">'
            +     '<thead><tr><th>日期</th><th>上午</th><th>下午</th><th>晚上</th><th>备注</th></tr></thead>'
            +     '<tbody>' + body + '</tbody>'
            +   '</table>'
            + '</div>';
    }

    function renderActions(journey) {
        const bar = document.getElementById('action-bar');
        bar.innerHTML = ''
            + '<button class="btn btn-primary" type="button" id="btn-edit">'
            +   Icons.svg('edit', { size: 16 }) + '<span>编辑</span></button>'
            + '<button class="btn btn-danger" type="button" id="btn-delete">'
            +   Icons.svg('trash2', { size: 16 }) + '<span>删除</span></button>';

        document.getElementById('btn-edit').addEventListener('click', function () { startEdit(journey.id); });
        document.getElementById('btn-delete').addEventListener('click', function () { deleteCurrent(journey.id); });
    }

    // ------------------------------------------------------------------
    // EDIT mode
    // ------------------------------------------------------------------

    function startEdit(id) {
        const journey = getJourneyById(id);
        if (!journey) return;

        currentJourney = journey;
        editPhotoDataUrl = journey.photo || '';

        const cost = journey.cost || {};
        const highlightsStr = (journey.highlights || []).join('、');

        const editEl = document.getElementById('detail-edit');
        editEl.innerHTML = ''
            + '<form class="edit-form" id="edit-form" novalidate>'
            +   '<section class="form-section">'
            +     '<h2 class="form-section__title">基本信息</h2>'
            +     '<div class="form-row dense">'
            +       formField('edit-province', '省份 *', 'text', journey.province || '', { required: true })
            +       formField('edit-city', '城市 *', 'text', journey.city || '', { required: true })
            +       formField('edit-country', '国家', 'text', journey.country || '')
            +       formField('edit-emoji', 'Emoji', 'text', journey.emoji || '', { maxlength: 4 })
            +     '</div>'
            +     formField('edit-title', '标题 *', 'text', journey.title || '', { required: true })
            +     formGroup('edit-description', '简介',
            +       '<textarea id="edit-description" name="description" rows="3">' + esc(journey.description || '') + '</textarea>')
            +     formField('edit-highlights', '景点亮点（用 、 或 , 分隔）', 'text', highlightsStr)
            +   '</section>'
            +   '<section class="form-section">'
            +     '<h2 class="form-section__title">时间</h2>'
            +     '<div class="form-row">'
            +       formField('edit-date', '开始日期 *', 'date', journey.date || '', { required: true })
            +       formField('edit-endDate', '结束日期', 'date', journey.endDate || '')
            +     '</div>'
            +   '</section>'
            +   '<section class="form-section">'
            +     '<h2 class="form-section__title">费用（元）</h2>'
            +     '<div class="form-row dense">'
            +       formField('edit-cost-package', '报团费', 'number', cost.package || '', { min: 0 })
            +       formField('edit-cost-transport', '交通费', 'number', cost.transport || '', { min: 0 })
            +       formField('edit-cost-accommodation', '住宿费', 'number', cost.accommodation || '', { min: 0 })
            +       formField('edit-cost-food', '餐饮费', 'number', cost.food || '', { min: 0 })
            +     '</div>'
            +   '</section>'
            +   '<section class="form-section">'
            +     '<h2 class="form-section__title">行程</h2>'
            +     '<div id="itinerary-editor"></div>'
            +     '<button type="button" class="btn btn-secondary itinerary-add" id="btn-add-itinerary">'
            +       Icons.svg('plus', { size: 16 }) + '<span>添加一行</span></button>'
            +   '</section>'
            +   '<section class="form-section">'
            +     '<h2 class="form-section__title">封面照片</h2>'
            +     '<div class="photo-input">'
            +       '<label for="edit-photo-input" class="photo-input__drop' + (editPhotoDataUrl ? ' is-hidden' : '') + '" id="edit-photo-label">'
            +         '<span class="photo-input__icon" aria-hidden="true">' + Icons.svg('camera', { size: 28 }) + '</span>'
            +         '<span class="photo-input__text">点击或拖拽上传照片</span>'
            +         '<span class="photo-input__hint">JPG / PNG · 自动压缩至 1600px</span>'
            +       '</label>'
            +       '<input type="file" id="edit-photo-input" accept="image/*" hidden>'
            +     '</div>'
            +     '<div class="photo-preview' + (editPhotoDataUrl ? '' : ' is-hidden') + '" id="edit-photo-preview">'
            +       '<img id="edit-photo-img" src="' + esc(editPhotoDataUrl) + '" alt="封面照片">'
            +       '<button type="button" class="icon-btn icon-btn--sm photo-preview__remove" id="edit-photo-remove" aria-label="移除照片">'
            +         Icons.svg('x', { size: 16 }) + '</button>'
            +     '</div>'
            +   '</section>'
            +   '<div class="sticky-actions">'
            +     '<div class="sticky-actions__inner">'
            +       '<button type="button" class="btn btn-secondary" id="btn-cancel">取消</button>'
            +       '<button type="button" class="btn btn-danger" id="btn-delete-edit">删除</button>'
            +       '<button type="submit" class="btn btn-primary" id="btn-save">保存</button>'
            +     '</div>'
            +   '</div>'
            + '</form>';

        renderItineraryEditor(journey.itinerary || []);
        wireEditForm(journey.id);

        document.getElementById('main').setAttribute('data-mode', 'edit');
        document.body.classList.add('is-editing');
        document.getElementById('detail-view').hidden = true;
        document.getElementById('action-bar').hidden = true;
        editEl.hidden = false;
        editEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function formField(id, label, type, value, opts) {
        opts = opts || {};
        const attrs = [
            'type="' + type + '"',
            'id="' + id + '"',
            'name="' + id + '"',
            'value="' + esc(value) + '"',
        ];
        if (opts.required) attrs.push('required');
        if (opts.maxlength) attrs.push('maxlength="' + opts.maxlength + '"');
        if (opts.min != null) attrs.push('min="' + opts.min + '"');
        if (type === 'number') attrs.push('inputmode="numeric"');
        return formGroup(id, label, '<input ' + attrs.join(' ') + '>');
    }

    function formGroup(id, label, control) {
        return '<div class="form-group">'
            +    '<label for="' + id + '">' + esc(label) + '</label>'
            +    control
            + '</div>';
    }

    function renderItineraryEditor(itinerary) {
        const container = document.getElementById('itinerary-editor');
        const list = (itinerary || []).map(buildItineraryRowHtml).join('');
        container.innerHTML = ''
            + '<div class="itinerary-editor">'
            +   '<div class="itinerary-header">'
            +     '<span>日期</span><span>上午</span><span>下午</span><span>晚上</span><span>备注</span><span></span>'
            +   '</div>'
            +   '<div id="itinerary-rows">' + list + '</div>'
            + '</div>';
    }

    function buildItineraryRowHtml(item) {
        item = item || {};
        return '<div class="itinerary-row">'
            +   '<span class="field-label">日期</span>'
            +   '<input type="date" class="it-date" value="' + esc(item.date || '') + '">'
            +   '<span class="field-label">上午</span>'
            +   '<input type="text" class="it-morning" value="' + esc(item.morning || '') + '" placeholder="上午">'
            +   '<span class="field-label">下午</span>'
            +   '<input type="text" class="it-afternoon" value="' + esc(item.afternoon || '') + '" placeholder="下午">'
            +   '<span class="field-label">晚上</span>'
            +   '<input type="text" class="it-evening" value="' + esc(item.evening || '') + '" placeholder="晚上">'
            +   '<span class="field-label">备注</span>'
            +   '<input type="text" class="it-note" value="' + esc(item.note || '') + '" placeholder="备注">'
            +   '<button type="button" class="icon-btn icon-btn--sm icon-btn--danger itinerary-row__delete" aria-label="删除该行">'
            +     Icons.svg('trash2', { size: 16 })
            +   '</button>'
            + '</div>';
    }

    function wireEditForm(id) {
        const form = document.getElementById('edit-form');
        document.getElementById('btn-cancel').addEventListener('click', cancelEdit);
        document.getElementById('btn-delete-edit').addEventListener('click', function () { deleteCurrent(id); });
        document.getElementById('btn-add-itinerary').addEventListener('click', function () {
            const rows = document.getElementById('itinerary-rows');
            const wrapper = document.createElement('div');
            wrapper.innerHTML = buildItineraryRowHtml({});
            rows.appendChild(wrapper.firstChild);
        });

        // Itinerary row delete (event delegation)
        document.getElementById('itinerary-rows').addEventListener('click', function (e) {
            const btn = e.target.closest('.itinerary-row__delete');
            if (!btn) return;
            const row = btn.closest('.itinerary-row');
            if (row) row.remove();
        });

        // Photo upload
        wirePhotoInput();

        // Submit
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveEdit(id);
        });
    }

    function wirePhotoInput() {
        const input = document.getElementById('edit-photo-input');
        const label = document.getElementById('edit-photo-label');
        const preview = document.getElementById('edit-photo-preview');
        const img = document.getElementById('edit-photo-img');
        const remove = document.getElementById('edit-photo-remove');

        function setPhoto(dataUrl) {
            editPhotoDataUrl = dataUrl;
            img.src = dataUrl;
            preview.classList.remove('is-hidden');
            label.classList.add('is-hidden');
        }

        function clearPhoto() {
            editPhotoDataUrl = '';
            input.value = '';
            img.src = '';
            preview.classList.add('is-hidden');
            label.classList.remove('is-hidden');
        }

        input.addEventListener('change', function () {
            const file = input.files && input.files[0];
            if (!file) return;
            if (!/^image\//.test(file.type)) {
                HsnUI.toast('请选择图片文件', 'error');
                input.value = '';
                return;
            }
            HsnUI.compressImage(file, { maxW: 1600, quality: 0.8 })
                .then(setPhoto)
                .catch(function () { HsnUI.toast('图片处理失败', 'error'); });
        });

        remove.addEventListener('click', clearPhoto);

        ['dragenter', 'dragover'].forEach(function (ev) {
            label.addEventListener(ev, function (e) { e.preventDefault(); label.classList.add('is-dragging'); });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
            label.addEventListener(ev, function (e) { e.preventDefault(); label.classList.remove('is-dragging'); });
        });
        label.addEventListener('drop', function (e) {
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (!file) return;
            if (!/^image\//.test(file.type)) {
                HsnUI.toast('请选择图片文件', 'error');
                return;
            }
            HsnUI.compressImage(file, { maxW: 1600, quality: 0.8 })
                .then(setPhoto)
                .catch(function () { HsnUI.toast('图片处理失败', 'error'); });
        });
    }

    function readField(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function readNumber(id) {
        const v = readField(id);
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    }

    function saveEdit(id) {
        const province = readField('edit-province');
        const city = readField('edit-city');
        const country = readField('edit-country');
        const emoji = readField('edit-emoji') || '📍';
        const date = readField('edit-date');
        const endDate = readField('edit-endDate') || date;
        const title = readField('edit-title');
        const description = readField('edit-description');
        const highlightsStr = readField('edit-highlights');

        if (!city || !title || !date) {
            HsnUI.toast('城市、标题和开始日期为必填项', 'error');
            const focus = !city ? 'edit-city' : !title ? 'edit-title' : 'edit-date';
            const el = document.getElementById(focus);
            if (el) el.focus();
            return;
        }

        const cost = {
            package: readNumber('edit-cost-package'),
            transport: readNumber('edit-cost-transport'),
            accommodation: readNumber('edit-cost-accommodation'),
            food: readNumber('edit-cost-food'),
        };

        const itinerary = [];
        document.querySelectorAll('#itinerary-rows .itinerary-row').forEach(function (row) {
            const d = row.querySelector('.it-date').value;
            if (!d) return;
            itinerary.push({
                date: d,
                morning: row.querySelector('.it-morning').value.trim(),
                afternoon: row.querySelector('.it-afternoon').value.trim(),
                evening: row.querySelector('.it-evening').value.trim(),
                note: row.querySelector('.it-note').value.trim(),
            });
        });

        const highlights = highlightsStr
            ? highlightsStr.split(/[、,]/).map(function (h) { return h.trim(); }).filter(Boolean)
            : [];

        const updates = {
            province: province,
            city: city,
            country: country,
            emoji: emoji,
            date: date,
            endDate: endDate,
            title: title,
            description: description,
            highlights: highlights,
            cost: cost,
            itinerary: itinerary,
            photo: editPhotoDataUrl,
        };

        const ok = updateJourney(id, updates);
        if (!ok) {
            HsnUI.toast('保存失败：未找到该旅程', 'error');
            return;
        }

        const updated = getJourneyById(id);
        currentJourney = updated;
        document.title = pageTitle(updated) + ' - HSN Journey Traces';
        renderView(updated);
        renderActions(updated);
        document.getElementById('action-bar').hidden = false;
        HsnUI.toast('已保存', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelEdit() {
        const editEl = document.getElementById('detail-edit');
        editEl.hidden = true;
        editEl.innerHTML = '';
        document.getElementById('detail-view').hidden = false;
        document.getElementById('action-bar').hidden = false;
        document.getElementById('main').setAttribute('data-mode', 'view');
        document.body.classList.remove('is-editing');
        editPhotoDataUrl = '';
    }

    // ------------------------------------------------------------------
    // Delete
    // ------------------------------------------------------------------

    function deleteCurrent(id) {
        const j = getJourneyById(id);
        if (!j) return;
        HsnUI.confirm({
            title: '删除旅程',
            message: '确定要删除「' + (j.title || j.city || '此旅程') + '」吗？此操作不可恢复。',
            confirmText: '删除',
            danger: true,
        }).then(function (ok) {
            if (!ok) return;
            deleteJourney(id);
            document.body.classList.remove('is-editing');
            HsnUI.toast('已删除', 'success');
            setTimeout(function () { window.location.href = 'cities.html'; }, 400);
        });
    }

    // ------------------------------------------------------------------
    // Lightbox
    // ------------------------------------------------------------------

    function openLightbox(src, alt) {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox';
        overlay.innerHTML = ''
            + '<button type="button" class="icon-btn icon-btn--lg lightbox__close" aria-label="关闭">'
            +   Icons.svg('x', { size: 22 })
            + '</button>'
            + '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '">';
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('is-visible'); });

        function close() {
            overlay.classList.remove('is-visible');
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                document.removeEventListener('keydown', onKey);
            }, 200);
        }
        function onKey(e) { if (e.key === 'Escape') close(); }

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.closest('.lightbox__close')) close();
        });
        document.addEventListener('keydown', onKey);
    }
})();
