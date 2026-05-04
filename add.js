/**
 * Add page — create a new journey.
 *
 * Depends on: data.js, icons.js, ui.js
 */
(function () {
    'use strict';

    const Icons = window.HsnIcons;

    const REQUIRED_FIELDS = [
        { id: 'add-province', errId: 'err-province', label: '省份' },
        { id: 'add-city',     errId: 'err-city',     label: '城市' },
        { id: 'add-name',     errId: 'err-name',     label: '旅程名称' },
        { id: 'add-date',     errId: 'err-date',     label: '开始日期' },
    ];

    let photoDataUrl = '';
    let isDirty = false;

    document.addEventListener('DOMContentLoaded', function () {
        injectIcons();
        wireForm();
        updatePreview();
    });

    // ------------------------------------------------------------------
    // Setup
    // ------------------------------------------------------------------

    function injectIcons() {
        const photoIcon = document.querySelector('.photo-input__icon');
        if (photoIcon) photoIcon.innerHTML = Icons.svg('camera', { size: 28 });

        const removeBtn = document.getElementById('add-photo-remove');
        if (removeBtn) removeBtn.innerHTML = Icons.svg('x', { size: 16 });
    }

    function wireForm() {
        const form = document.getElementById('add-form');
        const province = document.getElementById('add-province');
        const city = document.getElementById('add-city');
        const name = document.getElementById('add-name');
        const cancelBtn = document.getElementById('add-cancel-btn');

        // Auto-fill name from province + city until user types it manually
        function autoFillName() {
            if (name.dataset.manual === 'true') return;
            const p = province.value.trim();
            const c = city.value.trim();
            name.value = p && c && p !== c ? p + '·' + c : (p || c);
            updatePreview();
        }
        name.addEventListener('input', function () {
            if (name.value.trim() !== '') name.dataset.manual = 'true';
            else name.dataset.manual = '';
            updatePreview();
        });
        province.addEventListener('input', autoFillName);
        city.addEventListener('input', autoFillName);

        // Live preview on emoji + city changes
        document.getElementById('add-emoji').addEventListener('input', updatePreview);

        // Track dirtiness for cancel-confirm
        form.addEventListener('input', function () { isDirty = true; });

        // Per-field blur validation
        REQUIRED_FIELDS.forEach(function (f) {
            const input = document.getElementById(f.id);
            input.addEventListener('blur', function () { validateField(f); });
            input.addEventListener('input', function () {
                if (input.getAttribute('aria-invalid') === 'true' && input.value.trim()) {
                    clearFieldError(f);
                }
            });
        });

        // Photo upload
        wirePhoto();

        // Cancel
        cancelBtn.addEventListener('click', handleCancel);

        // Submit
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            handleSave();
        });
    }

    function wirePhoto() {
        const input = document.getElementById('add-photo');
        const label = document.getElementById('add-photo-label');
        const preview = document.getElementById('add-photo-preview');
        const img = document.getElementById('add-photo-img');
        const remove = document.getElementById('add-photo-remove');

        input.addEventListener('change', function () {
            const file = input.files && input.files[0];
            if (!file) return;
            if (!/^image\//.test(file.type)) {
                HsnUI.toast('请选择图片文件', 'error');
                input.value = '';
                return;
            }
            HsnUI.compressImage(file, { maxW: 1600, quality: 0.8 })
                .then(function (dataUrl) {
                    photoDataUrl = dataUrl;
                    img.src = dataUrl;
                    preview.classList.remove('is-hidden');
                    label.classList.add('is-hidden');
                    isDirty = true;
                })
                .catch(function () {
                    HsnUI.toast('图片处理失败', 'error');
                });
        });

        remove.addEventListener('click', function () {
            photoDataUrl = '';
            input.value = '';
            img.src = '';
            preview.classList.add('is-hidden');
            label.classList.remove('is-hidden');
        });

        // Drag and drop onto the label
        ['dragenter', 'dragover'].forEach(function (ev) {
            label.addEventListener(ev, function (e) {
                e.preventDefault();
                label.classList.add('is-dragging');
            });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
            label.addEventListener(ev, function (e) {
                e.preventDefault();
                label.classList.remove('is-dragging');
            });
        });
        label.addEventListener('drop', function (e) {
            const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
            if (!file) return;
            if (!/^image\//.test(file.type)) {
                HsnUI.toast('请选择图片文件', 'error');
                return;
            }
            HsnUI.compressImage(file, { maxW: 1600, quality: 0.8 })
                .then(function (dataUrl) {
                    photoDataUrl = dataUrl;
                    img.src = dataUrl;
                    preview.classList.remove('is-hidden');
                    label.classList.add('is-hidden');
                    isDirty = true;
                })
                .catch(function () {
                    HsnUI.toast('图片处理失败', 'error');
                });
        });
    }

    // ------------------------------------------------------------------
    // Live preview
    // ------------------------------------------------------------------

    function updatePreview() {
        const emoji = document.getElementById('add-emoji').value.trim() || '📍';
        const province = document.getElementById('add-province').value.trim();
        const city = document.getElementById('add-city').value.trim();
        const name = document.getElementById('add-name').value.trim();

        const previewEmoji = document.getElementById('add-preview-emoji');
        const previewTitle = document.getElementById('add-preview-title');
        const previewMeta = document.getElementById('add-preview-meta');

        previewEmoji.textContent = emoji;
        previewTitle.textContent = name || (province && city && province !== city ? province + '·' + city : (province || city || '未命名旅程'));

        const metaParts = [];
        if (province && city && province !== city) metaParts.push(province + ' · ' + city);
        else if (province || city) metaParts.push(province || city);
        const date = document.getElementById('add-date').value;
        if (date) metaParts.push(formatDateChinese(date));
        previewMeta.textContent = metaParts.length ? metaParts.join(' · ') : '填写信息以预览';
    }

    function formatDateChinese(iso) {
        const parts = iso.split('-');
        if (parts.length !== 3) return iso;
        return parts[0] + '年' + parseInt(parts[1], 10) + '月' + parseInt(parts[2], 10) + '日';
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------

    function validateField(field) {
        const input = document.getElementById(field.id);
        const errEl = document.getElementById(field.errId);
        if (!input.value.trim()) {
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', field.errId);
            if (errEl) errEl.textContent = field.label + '为必填项';
            return false;
        }
        clearFieldError(field);
        return true;
    }

    function clearFieldError(field) {
        const input = document.getElementById(field.id);
        const errEl = document.getElementById(field.errId);
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        if (errEl) errEl.textContent = '';
    }

    function validateAll() {
        let firstInvalid = null;
        REQUIRED_FIELDS.forEach(function (f) {
            const ok = validateField(f);
            if (!ok && !firstInvalid) firstInvalid = f;
        });
        return firstInvalid;
    }

    // ------------------------------------------------------------------
    // Save / Cancel
    // ------------------------------------------------------------------

    function handleSave() {
        const firstInvalid = validateAll();
        if (firstInvalid) {
            HsnUI.toast('请检查表单中的必填项', 'error');
            const el = document.getElementById(firstInvalid.id);
            if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const province = document.getElementById('add-province').value.trim();
        const city = document.getElementById('add-city').value.trim();
        const emoji = document.getElementById('add-emoji').value.trim() || '📍';
        const name = document.getElementById('add-name').value.trim();
        const date = document.getElementById('add-date').value;
        const endDate = document.getElementById('add-endDate').value || date;
        const highlightsStr = document.getElementById('add-highlights').value.trim();

        const cost = {
            package: numericValue('add-cost-package'),
            transport: numericValue('add-cost-transport'),
            accommodation: numericValue('add-cost-accommodation'),
            food: numericValue('add-cost-food'),
        };

        const highlights = highlightsStr
            ? highlightsStr.split(/[、,]/).map(function (h) { return h.trim(); }).filter(Boolean)
            : [];

        const subCard = { name: name, date: date, endDate: endDate, province: province, city: city, emoji: emoji, highlights: highlights, cost: cost };
        const title = province && province !== city ? province + '·' + city : (province || city);

        const journey = {
            province: province,
            city: city,
            emoji: emoji,
            date: date,
            endDate: endDate,
            title: title,
            highlights: highlights,
            cost: cost,
            subCards: [subCard],
        };

        if (photoDataUrl) journey.photo = photoDataUrl;

        try {
            const newId = addJourney(journey);
            isDirty = false;
            HsnUI.toast('已添加新旅程', 'success');
            setTimeout(function () {
                window.location.href = 'detail.html?id=' + newId;
            }, 300);
        } catch (err) {
            console.error('保存失败：', err);
            HsnUI.toast('保存失败，请重试', 'error');
        }
    }

    function numericValue(id) {
        const v = document.getElementById(id).value;
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    }

    function handleCancel() {
        if (!isDirty) {
            window.location.href = 'index.html';
            return;
        }
        HsnUI.confirm({
            title: '放弃当前编辑？',
            message: '已填写的内容将不会保存。',
            confirmText: '放弃',
            cancelText: '继续编辑',
            danger: true,
        }).then(function (ok) {
            if (ok) {
                isDirty = false;
                window.location.href = 'index.html';
            }
        });
    }

    // Warn before page unload if dirty
    window.addEventListener('beforeunload', function (e) {
        if (!isDirty) return;
        e.preventDefault();
        e.returnValue = '';
    });
})();
