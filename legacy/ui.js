/**
 * HsnUI — Shared UI primitives for HSN Journey Traces
 *
 * Provides:
 *   HsnUI.toast(message, type)             — non-blocking notification
 *   HsnUI.confirm({title, message, ...})   — Promise-based confirm dialog
 *   HsnUI.alert({title, message})          — single-button info dialog
 *   HsnUI.escapeHtml(str)                  — XSS-safe innerHTML helper
 *   HsnUI.compressImage(file, opts)        — resize + compress before localStorage
 *   HsnUI.skeleton(type, count)            — skeleton placeholder HTML
 *   HsnUI.emptyState({...})                — empty-state block HTML
 *   HsnUI.mountTopNav()                    — normalize top navbar (Phase 3)
 *   HsnUI.mountTabbar()                    — inject mobile bottom tab bar (Phase 3)
 *   HsnUI.currentPage()                    — derive page id from pathname
 *
 * Required dependencies (load order in HTML):
 *   data.js → icons.js → ui.js → page-specific.js
 */
(function (root) {
    'use strict';

    // ------------------------------------------------------------------
    // Utilities
    // ------------------------------------------------------------------

    function escapeHtml(str) {
        if (str == null) return '';
        return String(str).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'class') node.className = attrs[k];
                else if (k === 'html') node.innerHTML = attrs[k];
                else if (k === 'text') node.textContent = attrs[k];
                else if (k.startsWith('on') && typeof attrs[k] === 'function') {
                    node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
                } else if (attrs[k] !== false && attrs[k] != null) {
                    node.setAttribute(k, attrs[k]);
                }
            });
        }
        (children || []).forEach(function (child) {
            if (typeof child === 'string') node.appendChild(document.createTextNode(child));
            else if (child) node.appendChild(child);
        });
        return node;
    }

    function currentPage() {
        const path = location.pathname.split('/').pop() || 'index.html';
        const map = {
            '': 'home',
            'index.html': 'home',
            'cities.html': 'cities',
            'map.html': 'map',
            'wishlist.html': 'wishlist',
            'add.html': 'add',
            'detail.html': 'detail',
        };
        return map[path] || 'home';
    }

    // ------------------------------------------------------------------
    // Toast — non-blocking, auto-dismissing notification
    // ------------------------------------------------------------------

    let toastContainer = null;

    function ensureToastContainer() {
        if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
        toastContainer = el('div', {
            class: 'toast-container',
            role: 'region',
            'aria-label': '通知区域',
        });
        document.body.appendChild(toastContainer);
        return toastContainer;
    }

    function toast(message, type) {
        type = type || 'info';
        const icon = type === 'success' ? 'checkCircle'
                   : type === 'error'   ? 'alertCircle'
                                        : 'info';
        const ariaLive = type === 'error' ? 'assertive' : 'polite';
        const ariaRole = type === 'error' ? 'alert' : 'status';

        const node = el('div', {
            class: 'toast toast--' + type,
            role: ariaRole,
            'aria-live': ariaLive,
            html: '<span class="toast__icon">' + (root.HsnIcons ? root.HsnIcons[icon] : '')
                + '</span><span class="toast__msg">' + escapeHtml(message) + '</span>'
                + '<button type="button" class="toast__close icon-btn" aria-label="关闭通知">'
                + (root.HsnIcons ? root.HsnIcons.x : '×') + '</button>',
        });

        ensureToastContainer().appendChild(node);
        // Force reflow so transitions trigger
        // eslint-disable-next-line no-unused-expressions
        node.offsetHeight;
        node.classList.add('is-visible');

        function dismiss() {
            node.classList.remove('is-visible');
            node.classList.add('is-leaving');
            setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 240);
        }

        const timer = setTimeout(dismiss, 4000);
        node.querySelector('.toast__close').addEventListener('click', function () {
            clearTimeout(timer);
            dismiss();
        });

        return dismiss;
    }

    // ------------------------------------------------------------------
    // Modal — generic dialog with focus trap and ESC support
    // ------------------------------------------------------------------

    let modalStack = [];

    function trapFocus(modal, e) {
        if (e.key !== 'Tab') return;
        const focusables = modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
        }
    }

    function openModal(content, opts) {
        opts = opts || {};
        const previousFocus = document.activeElement;
        const overlay = el('div', { class: 'modal-overlay', 'aria-hidden': 'false' });
        const dialog = el('div', {
            class: 'modal modal--' + (opts.size || 'sm'),
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': opts.titleId || '',
            tabindex: '-1',
        });
        if (typeof content === 'string') dialog.innerHTML = content;
        else dialog.appendChild(content);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        document.body.classList.add('has-modal');

        const onKey = function (e) {
            if (e.key === 'Escape' && opts.dismissOnEsc !== false) {
                e.preventDefault();
                close();
            } else {
                trapFocus(dialog, e);
            }
        };
        const onOverlayClick = function (e) {
            if (e.target === overlay && opts.dismissOnBackdrop !== false) close();
        };

        document.addEventListener('keydown', onKey);
        overlay.addEventListener('click', onOverlayClick);

        // Async to allow CSS transition
        requestAnimationFrame(function () {
            overlay.classList.add('is-visible');
            const initialFocus = dialog.querySelector('[autofocus]')
                || dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                || dialog;
            initialFocus.focus();
        });

        function close(result) {
            document.removeEventListener('keydown', onKey);
            overlay.removeEventListener('click', onOverlayClick);
            overlay.classList.remove('is-visible');
            overlay.classList.add('is-leaving');
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (modalStack.length === 0) document.body.classList.remove('has-modal');
                if (previousFocus && previousFocus.focus) previousFocus.focus();
            }, 200);
            modalStack = modalStack.filter(function (h) { return h !== handle; });
            if (typeof opts.onClose === 'function') opts.onClose(result);
        }

        const handle = { close: close, dialog: dialog, overlay: overlay };
        modalStack.push(handle);
        return handle;
    }

    function confirmDialog(opts) {
        opts = opts || {};
        const titleId = 'modal-title-' + Date.now();
        const danger = !!opts.danger;
        const okText = opts.confirmText || (danger ? '删除' : '确认');
        const cancelText = opts.cancelText || '取消';

        const html = ''
            + '<div class="modal__body">'
            + (opts.title ? '<h2 class="modal__title" id="' + titleId + '">' + escapeHtml(opts.title) + '</h2>' : '')
            + (opts.message ? '<p class="modal__message">' + escapeHtml(opts.message) + '</p>' : '')
            + '</div>'
            + '<div class="modal__actions">'
            + '<button type="button" class="btn btn-secondary" data-action="cancel">' + escapeHtml(cancelText) + '</button>'
            + '<button type="button" class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" data-action="confirm" autofocus>' + escapeHtml(okText) + '</button>'
            + '</div>';

        return new Promise(function (resolve) {
            const handle = openModal(html, {
                size: 'sm',
                titleId: opts.title ? titleId : '',
                onClose: function (result) { resolve(!!result); },
            });
            handle.dialog.querySelector('[data-action="cancel"]').addEventListener('click', function () { handle.close(false); });
            handle.dialog.querySelector('[data-action="confirm"]').addEventListener('click', function () { handle.close(true); });
        });
    }

    function alertDialog(opts) {
        opts = opts || {};
        const titleId = 'modal-title-' + Date.now();
        const okText = opts.confirmText || '知道了';
        const html = ''
            + '<div class="modal__body">'
            + (opts.title ? '<h2 class="modal__title" id="' + titleId + '">' + escapeHtml(opts.title) + '</h2>' : '')
            + (opts.message ? '<p class="modal__message">' + escapeHtml(opts.message) + '</p>' : '')
            + '</div>'
            + '<div class="modal__actions">'
            + '<button type="button" class="btn btn-primary" data-action="ok" autofocus>' + escapeHtml(okText) + '</button>'
            + '</div>';

        return new Promise(function (resolve) {
            const handle = openModal(html, {
                size: 'sm',
                titleId: opts.title ? titleId : '',
                onClose: function () { resolve(); },
            });
            handle.dialog.querySelector('[data-action="ok"]').addEventListener('click', function () { handle.close(true); });
        });
    }

    // ------------------------------------------------------------------
    // Image compression — keep base64 under localStorage quota
    // ------------------------------------------------------------------

    function compressImage(file, opts) {
        opts = opts || {};
        const maxW = opts.maxW || 1600;
        const maxH = opts.maxH || 1600;
        const quality = opts.quality != null ? opts.quality : 0.8;
        const mime = opts.mime || 'image/jpeg';

        return new Promise(function (resolve, reject) {
            if (!file) { reject(new Error('No file')); return; }
            const reader = new FileReader();
            reader.onerror = function () { reject(new Error('Read failed')); };
            reader.onload = function (e) {
                const img = new Image();
                img.onerror = function () { reject(new Error('Image decode failed')); };
                img.onload = function () {
                    let w = img.width, h = img.height;
                    const ratio = Math.min(maxW / w, maxH / h, 1);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    try {
                        const dataUrl = canvas.toDataURL(mime, quality);
                        resolve(dataUrl);
                    } catch (err) { reject(err); }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ------------------------------------------------------------------
    // Skeleton + Empty State HTML helpers (return strings)
    // ------------------------------------------------------------------

    function skeleton(type, count) {
        count = count || 1;
        let html = '';
        for (let i = 0; i < count; i++) {
            if (type === 'card') {
                html += '<div class="skeleton-card" aria-hidden="true">'
                    + '<div class="skeleton skeleton--image"></div>'
                    + '<div class="skeleton-card__body">'
                    + '<div class="skeleton skeleton--line skeleton--line-lg"></div>'
                    + '<div class="skeleton skeleton--line skeleton--line-md"></div>'
                    + '<div class="skeleton skeleton--line skeleton--line-sm"></div>'
                    + '</div></div>';
            } else if (type === 'row') {
                html += '<div class="skeleton-row" aria-hidden="true">'
                    + '<div class="skeleton skeleton--avatar"></div>'
                    + '<div class="skeleton-row__body">'
                    + '<div class="skeleton skeleton--line skeleton--line-lg"></div>'
                    + '<div class="skeleton skeleton--line skeleton--line-sm"></div>'
                    + '</div></div>';
            } else { /* line */
                html += '<div class="skeleton skeleton--line" aria-hidden="true"></div>';
            }
        }
        return html;
    }

    function emptyState(opts) {
        opts = opts || {};
        const icon = opts.icon && root.HsnIcons ? root.HsnIcons.svg(opts.icon, { size: 48 }) : '';
        const action = (opts.actionText && opts.actionHref)
            ? '<a class="btn btn-primary" href="' + escapeHtml(opts.actionHref) + '">' + escapeHtml(opts.actionText) + '</a>'
            : '';
        return ''
            + '<div class="empty-state" role="status">'
            + (icon ? '<div class="empty-state__icon">' + icon + '</div>' : '')
            + '<h3 class="empty-state__title">' + escapeHtml(opts.title || '') + '</h3>'
            + (opts.description ? '<p class="empty-state__description">' + escapeHtml(opts.description) + '</p>' : '')
            + (action ? '<div class="empty-state__action">' + action + '</div>' : '')
            + '</div>';
    }

    // ------------------------------------------------------------------
    // Top nav normalization — replace ☰ checkbox hack with a real button
    // ------------------------------------------------------------------

    function mountTopNav() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        // Highlight current nav link via aria-current
        const page = currentPage();
        const links = navbar.querySelectorAll('.nav-links a');
        links.forEach(function (a) {
            const href = (a.getAttribute('href') || '').replace(/^\.\//, '');
            const target = href === '' || href === 'index.html' ? 'home'
                         : href.replace('.html', '');
            if (target === page) {
                a.setAttribute('aria-current', 'page');
                a.classList.add('active');
            }
        });

        // Replace the legacy checkbox-toggle pattern with an accessible button.
        // The HTML still contains <input.nav-toggle> + <label.nav-toggle-label>;
        // hide them on tablet+ and rely on the bottom tab bar on mobile.
        const toggleLabel = navbar.querySelector('.nav-toggle-label');
        const toggleInput = navbar.querySelector('.nav-toggle');
        const navList = navbar.querySelector('.nav-links');
        if (navList && !navList.id) navList.id = 'primary-navigation';
        if (toggleLabel && !toggleLabel.querySelector('svg') && root.HsnIcons) {
            toggleLabel.innerHTML = root.HsnIcons.menu;
            toggleLabel.setAttribute('aria-label', '打开菜单');
            toggleLabel.setAttribute('role', 'button');
            toggleLabel.setAttribute('tabindex', '0');
        }
        if (toggleLabel && toggleInput && navList) {
            toggleLabel.setAttribute('aria-controls', navList.id);
            toggleLabel.setAttribute('aria-expanded', toggleInput.checked ? 'true' : 'false');
            toggleInput.addEventListener('change', function () {
                toggleLabel.setAttribute('aria-expanded', toggleInput.checked ? 'true' : 'false');
                toggleLabel.setAttribute('aria-label', toggleInput.checked ? '关闭菜单' : '打开菜单');
            });
            toggleLabel.addEventListener('keydown', function (e) {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                toggleInput.checked = !toggleInput.checked;
                toggleInput.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }
    }

    // ------------------------------------------------------------------
    // Bottom Tab Bar (mobile only) — Phase 3
    // ------------------------------------------------------------------

    const TABS = [
        { id: 'home',     href: 'index.html',    icon: 'home',      label: '首页' },
        { id: 'cities',   href: 'cities.html',   icon: 'mapPin',    label: '城市' },
        { id: 'add',      href: 'cities.html#add-subcard', icon: 'plus', label: '添加', primary: true },
        { id: 'map',      href: 'map.html',      icon: 'globe',     label: '地图' },
        { id: 'wishlist', href: 'wishlist.html', icon: 'heart',     label: '心愿' },
    ];

    function mountTabbar() {
        if (document.querySelector('.tabbar')) return;
        const page = currentPage();
        const nav = el('nav', { class: 'tabbar', 'aria-label': '主导航' });
        const ul = el('ul', { class: 'tabbar__list' });
        TABS.forEach(function (tab) {
            const isActive = tab.id === page || (tab.id === 'cities' && page === 'detail');
            const li = el('li', { class: 'tabbar__item' + (tab.primary ? ' tabbar__item--primary' : '') });
            const a = el('a', {
                class: 'tabbar__link' + (isActive ? ' is-active' : ''),
                href: tab.href,
                'aria-label': tab.label,
                'aria-current': isActive ? 'page' : false,
            });
            const iconHtml = root.HsnIcons ? root.HsnIcons.svg(tab.icon, { size: tab.primary ? 28 : 24 }) : '';
            a.innerHTML = '<span class="tabbar__icon">' + iconHtml + '</span>'
                + '<span class="tabbar__label">' + tab.label + '</span>';
            li.appendChild(a);
            ul.appendChild(li);
        });
        nav.appendChild(ul);
        document.body.appendChild(nav);
        document.body.classList.add('has-tabbar');
    }

    // ------------------------------------------------------------------
    // Boot
    // ------------------------------------------------------------------

    function boot() {
        var page = currentPage();
        document.body.setAttribute('data-page', page);
        ensureToastContainer();
        mountTopNav();
        mountTabbar();
        injectSkipLink();

        window.addEventListener('journeys-persist', function (e) {
            if (e.detail && e.detail.ok) {
                toast('已保存到 data/journeys.json', 'success');
            } else {
                toast('未连接到本地服务器，数据未持久化到文件', 'error');
            }
        });
    }

    function injectSkipLink() {
        if (document.querySelector('.skip-link')) return;
        const link = el('a', { class: 'skip-link', href: '#main' }, ['跳到主要内容']);
        document.body.insertBefore(link, document.body.firstChild);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    root.HsnUI = {
        toast: toast,
        confirm: confirmDialog,
        alert: alertDialog,
        modal: { open: openModal },
        escapeHtml: escapeHtml,
        compressImage: compressImage,
        skeleton: skeleton,
        emptyState: emptyState,
        mountTabbar: mountTabbar,
        mountTopNav: mountTopNav,
        currentPage: currentPage,
        el: el,
    };
})(typeof window !== 'undefined' ? window : this);
