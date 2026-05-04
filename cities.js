document.addEventListener('DOMContentLoaded', () => {
    const cityGrid = document.getElementById('city-grid');
    journeys.forEach(journey => {
        cityGrid.appendChild(createPrimaryCard(journey));
    });
});

function getDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function formatCost(num) {
    if (num === undefined || num === null || num === '') return '—';
    return Number(num).toLocaleString();
}

function createPrimaryCard(journey) {
    const wrapper = document.createElement('div');
    wrapper.className = 'primary-card-wrapper';
    wrapper.dataset.id = journey.id;

    const title = journey.province && journey.province !== journey.city
        ? `${journey.province} · ${journey.city}`
        : (journey.province || journey.city);

    const spots = (journey.highlights || []).join(' · ');
    const days = getDays(journey.date, journey.endDate);
    const cost = journey.cost || {};

    wrapper.innerHTML = `
        <div class="primary-card">
            <div class="primary-emoji">${journey.emoji}</div>
            <div class="primary-info">
                <div class="primary-title">${title}</div>
                <div class="primary-meta">
                    <span>📅 ${journey.date} ~ ${journey.endDate}</span>
                    <span>⏱️ ${days} 天</span>
                    <span>📦 ${formatCost(cost.package)}</span>
                    <span>🚗 ${formatCost(cost.transport)}</span>
                    <span>🏨 ${formatCost(cost.accommodation)}</span>
                    <span>🍽️ ${formatCost(cost.food)}</span>
                </div>
                <div class="primary-spots">⭐ ${spots}</div>
            </div>
            <div class="primary-actions">
                <button class="btn btn-secondary btn-sm edit-primary-btn">编辑</button>
            </div>
            <div class="primary-arrow">▼</div>
        </div>
        <div class="primary-edit-form" style="display:none;"></div>
        <div class="secondary-cards" style="display:none;"></div>
    `;

    const primary = wrapper.querySelector('.primary-card');
    const secondary = wrapper.querySelector('.secondary-cards');
    const arrow = wrapper.querySelector('.primary-arrow');
    const editBtn = wrapper.querySelector('.edit-primary-btn');
    const editFormContainer = wrapper.querySelector('.primary-edit-form');

    primary.addEventListener('click', () => {
        if (editFormContainer.style.display !== 'none') {
            editFormContainer.style.display = 'none';
            editFormContainer.innerHTML = '';
        }
        if (secondary.style.display === 'none') {
            if (!secondary.dataset.loaded) {
                renderSecondaryCards(journey, secondary);
                secondary.dataset.loaded = 'true';
            }
            secondary.style.display = 'flex';
            arrow.textContent = '▲';
        } else {
            secondary.style.display = 'none';
            arrow.textContent = '▼';
        }
    });

    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        secondary.style.display = 'none';
        arrow.textContent = '▼';
        if (editFormContainer.style.display === 'none') {
            showEditPrimaryForm(journey, editFormContainer);
            editFormContainer.style.display = 'block';
        } else {
            editFormContainer.style.display = 'none';
            editFormContainer.innerHTML = '';
        }
    });

    return wrapper;
}

function renderSecondaryCards(journey, container) {
    container.innerHTML = '';
    let cards = [];

    if (journey.subCards && journey.subCards.length > 0) {
        cards = journey.subCards.map((sub, idx) => {
            const subTitle = sub.province && sub.province !== sub.city
                ? `${sub.province} · ${sub.city}`
                : (sub.province || sub.city || sub.name);
            const icon = sub.emoji
                ? sub.emoji
                : (sub.photo
                    ? `<img src="${sub.photo}" class="secondary-photo">`
                    : (journey.photo
                        ? `<img src="${journey.photo}" class="secondary-photo">`
                        : '📅'));
            return {
                idx,
                icon,
                title: subTitle,
                meta: `${sub.name} · ${sub.date}${sub.endDate ? ' ~ ' + sub.endDate : ''}`,
                sortKey: new Date(sub.date),
                editable: true
            };
        });
    } else {
        const locations = generateLocations(journey);
        if (locations.length > 1) {
            cards = locations.map(loc => {
                const typeIcon = loc.type === 'country' ? '🌍' : (loc.type === 'province' ? '📍' : '🏙️');
                return {
                    idx: null,
                    icon: journey.photo
                        ? `<img src="${journey.photo}" class="secondary-photo">`
                        : typeIcon,
                    title: loc.name,
                    meta: `${journey.title} · ${journey.date}`,
                    sortKey: new Date(journey.date),
                    editable: false
                };
            });
        } else {
            cards = [{
                idx: null,
                icon: journey.photo
                    ? `<img src="${journey.photo}" class="secondary-photo">`
                    : '📅',
                title: journey.city,
                meta: `${journey.title} · ${journey.date} ~ ${journey.endDate}`,
                sortKey: new Date(journey.date),
                editable: false
            }];
        }
    }

    cards.sort((a, b) => b.sortKey - a.sortKey);

    cards.forEach(card => {
        const el = document.createElement('div');
        el.className = 'secondary-card';
        el.innerHTML = `
            <div class="secondary-emoji">${card.icon}</div>
            <div class="secondary-info">
                <div class="secondary-title">${card.title}</div>
                <div class="secondary-meta">${card.meta}</div>
            </div>
        `;

        if (card.editable && card.idx !== null) {
            const actions = document.createElement('div');
            actions.className = 'card-actions';
            actions.innerHTML = `
                <button class="btn btn-secondary btn-sm">编辑</button>
                <button class="btn btn-danger btn-sm">删除</button>
            `;
            actions.querySelector('.btn-secondary').onclick = (e) => {
                e.stopPropagation();
                showEditSubCardForm(journey, card.idx, container);
            };
            actions.querySelector('.btn-danger').onclick = (e) => {
                e.stopPropagation();
                deleteSubCard(journey.id, card.idx, container);
            };
            el.appendChild(actions);
        }

        container.appendChild(el);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-secondary add-subcard-btn';
    addBtn.textContent = '+ 添加二级卡片';
    addBtn.onclick = (e) => {
        e.stopPropagation();
        showAddSubCardForm(journey, container);
    };
    container.appendChild(addBtn);
}

function showEditPrimaryForm(journey, container) {
    const existing = container.querySelector('.edit-form');
    if (existing) {
        container.innerHTML = '';
        container.style.display = 'none';
    }

    const cost = journey.cost || {};
    const highlightsStr = (journey.highlights || []).join('、');

    container.innerHTML = `
        <div class="edit-form">
            <h3>✏️ 编辑旅程信息</h3>
            <div class="form-row dense">
                <div class="form-group">
                    <label>省份</label>
                    <input type="text" class="j-province" value="${journey.province || ''}">
                </div>
                <div class="form-group">
                    <label>城市</label>
                    <input type="text" class="j-city" value="${journey.city}">
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="j-emoji" value="${journey.emoji}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>开始日期</label>
                    <input type="date" class="j-date" value="${journey.date}">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" class="j-endDate" value="${journey.endDate}">
                </div>
            </div>
            <div class="form-group">
                <label>景点</label>
                <input type="text" class="j-highlights" value="${highlightsStr}">
            </div>
            <div class="form-row dense">
                <div class="form-group">
                    <label>报团费 📦</label>
                    <input type="number" class="j-cost-package" value="${cost.package || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>交通费 🚗</label>
                    <input type="number" class="j-cost-transport" value="${cost.transport || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>住宿费 🏨</label>
                    <input type="number" class="j-cost-accommodation" value="${cost.accommodation || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>餐饮费 🍽️</label>
                    <input type="number" class="j-cost-food" value="${cost.food || ''}" placeholder="0">
                </div>
            </div>
            <div class="btn-group">
                <button class="btn btn-primary">保存</button>
                <button class="btn btn-secondary">取消</button>
            </div>
        </div>
    `;

    const saveBtn = container.querySelector('.btn-primary');
    const cancelBtn = container.querySelector('.btn-secondary');

    saveBtn.onclick = () => saveEditPrimary(journey.id, container);
    cancelBtn.onclick = () => {
        container.innerHTML = '';
        container.style.display = 'none';
    };
}

function saveEditPrimary(journeyId, container) {
    const province = container.querySelector('.j-province').value.trim();
    const city = container.querySelector('.j-city').value.trim();
    const emoji = container.querySelector('.j-emoji').value.trim();
    const date = container.querySelector('.j-date').value;
    const endDate = container.querySelector('.j-endDate').value;
    const highlightsStr = container.querySelector('.j-highlights').value.trim();
    const cost = {
        package: container.querySelector('.j-cost-package').value,
        transport: container.querySelector('.j-cost-transport').value,
        accommodation: container.querySelector('.j-cost-accommodation').value,
        food: container.querySelector('.j-cost-food').value
    };

    if (!city || !date) {
        alert('城市和开始日期为必填项');
        return;
    }

    const highlights = highlightsStr ? highlightsStr.split('、').map(h => h.trim()).filter(h => h) : [];
    const title = province && province !== city ? `${province}·${city}` : (province || city);

    updateJourney(journeyId, { province, city, emoji, date, endDate, title, highlights, cost });

    const wrapper = document.querySelector(`.primary-card-wrapper[data-id="${journeyId}"]`);
    const primaryTitle = wrapper.querySelector('.primary-title');
    const primaryMeta = wrapper.querySelector('.primary-meta');
    const primaryEmoji = wrapper.querySelector('.primary-emoji');
    const primarySpots = wrapper.querySelector('.primary-spots');

    const newTitle = province && province !== city ? `${province} · ${city}` : (province || city);
    primaryTitle.textContent = newTitle;
    primaryEmoji.textContent = emoji;

    const days = getDays(date, endDate);
    const spots = highlights.slice(0, 4).join(' · ');
    primaryMeta.innerHTML = `
        <span>📅 ${date} ~ ${endDate}</span>
        <span>⏱️ ${days} 天</span>
        <span>📦 ${formatCost(cost.package)}</span>
        <span>🚗 ${formatCost(cost.transport)}</span>
        <span>🏨 ${formatCost(cost.accommodation)}</span>
        <span>🍽️ ${formatCost(cost.food)}</span>
    `;
    primarySpots.textContent = '⭐ ' + spots;

    container.innerHTML = '';
    container.style.display = 'none';
}

function showAddSubCardForm(journey, container) {
    const existing = container.querySelector('.subcard-form');
    if (existing) existing.remove();

    const form = document.createElement('div');
    form.className = 'subcard-form';

    form.innerHTML = `
        <div class="edit-form">
            <h3>➕ 添加二级卡片</h3>
            <div class="form-row dense">
                <div class="form-group">
                    <label>省份</label>
                    <input type="text" class="sub-province" value="${journey.province || ''}">
                </div>
                <div class="form-group">
                    <label>城市</label>
                    <input type="text" class="sub-city" value="${journey.city}">
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="sub-emoji" value="${journey.emoji}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>名称</label>
                    <input type="text" class="sub-name" placeholder="如：天津之眼">
                </div>
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" class="sub-date" value="${journey.date}">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" class="sub-endDate" value="${journey.endDate}">
                </div>
            </div>
            <div class="form-group">
                <label>景点</label>
                <input type="text" class="sub-highlights">
            </div>
            <div class="form-row dense">
                <div class="form-group">
                    <label>报团费 📦</label>
                    <input type="number" class="sub-cost-package" placeholder="0">
                </div>
                <div class="form-group">
                    <label>交通费 🚗</label>
                    <input type="number" class="sub-cost-transport" placeholder="0">
                </div>
                <div class="form-group">
                    <label>住宿费 🏨</label>
                    <input type="number" class="sub-cost-accommodation" placeholder="0">
                </div>
                <div class="form-group">
                    <label>餐饮费 🍽️</label>
                    <input type="number" class="sub-cost-food" placeholder="0">
                </div>
            </div>
            <div class="btn-group">
                <button class="btn btn-primary">保存</button>
                <button class="btn btn-secondary">取消</button>
            </div>
        </div>
    `;

    const subProvinceInput = form.querySelector('.sub-province');
    const subCityInput = form.querySelector('.sub-city');
    const subNameInput = form.querySelector('.sub-name');

    function autoFillSubName() {
        if (subNameInput.dataset.manual === 'true') return;
        const p = subProvinceInput.value.trim();
        const c = subCityInput.value.trim();
        subNameInput.value = p && c && p !== c ? `${p}·${c}` : (p || c);
    }

    subNameInput.addEventListener('input', () => {
        subNameInput.dataset.manual = 'true';
    });
    subProvinceInput.addEventListener('input', autoFillSubName);
    subCityInput.addEventListener('input', autoFillSubName);

    const saveBtn = form.querySelector('.btn-primary');
    const cancelBtn = form.querySelector('.btn-secondary');

    saveBtn.onclick = () => saveSubCard(journey.id, form, container);
    cancelBtn.onclick = () => form.remove();

    container.appendChild(form);
}

function syncPrimaryFromSubCards(journey) {
    if (!journey.subCards || journey.subCards.length === 0) return;

    const provinces = [...new Set(journey.subCards.map(s => s.province).filter(Boolean))];
    const cities = [...new Set(journey.subCards.map(s => s.city).filter(Boolean))];
    const dates = journey.subCards.map(s => s.date).filter(Boolean);
    const endDates = journey.subCards.map(s => s.endDate || s.date).filter(Boolean);

    const province = provinces.length > 0 ? provinces.join('&') : journey.province;
    const city = cities.length > 0 ? cities.join('&') : journey.city;
    const date = dates.length > 0 ? dates.sort()[0] : journey.date;
    const endDate = endDates.length > 0 ? endDates.sort()[endDates.length - 1] : journey.endDate;

    const totalCost = {
        package: 0,
        transport: 0,
        accommodation: 0,
        food: 0
    };
    journey.subCards.forEach(s => {
        if (s.cost) {
            totalCost.package += Number(s.cost.package) || 0;
            totalCost.transport += Number(s.cost.transport) || 0;
            totalCost.accommodation += Number(s.cost.accommodation) || 0;
            totalCost.food += Number(s.cost.food) || 0;
        }
    });

    const allHighlights = journey.subCards.flatMap(s => s.highlights || []);

    const title = province && province !== city ? `${province}·${city}` : (province || city);
    updateJourney(journey.id, { province, city, date, endDate, title, cost: totalCost, highlights: allHighlights });

    const wrapper = document.querySelector(`.primary-card-wrapper[data-id="${journey.id}"]`);
    if (!wrapper) return;

    const primaryTitle = wrapper.querySelector('.primary-title');
    const primaryMeta = wrapper.querySelector('.primary-meta');

    const newTitle = province && province !== city ? `${province} · ${city}` : (province || city);
    primaryTitle.textContent = newTitle;

    const days = getDays(date, endDate);
    const spots = allHighlights.join(' · ');
    primaryMeta.innerHTML = `
        <span>📅 ${date} ~ ${endDate}</span>
        <span>⏱️ ${days} 天</span>
        <span>📦 ${formatCost(totalCost.package)}</span>
        <span>🚗 ${formatCost(totalCost.transport)}</span>
        <span>🏨 ${formatCost(totalCost.accommodation)}</span>
        <span>🍽️ ${formatCost(totalCost.food)}</span>
    `;
    wrapper.querySelector('.primary-spots').textContent = '⭐ ' + spots;
}

function saveSubCard(journeyId, form, container) {
    const province = form.querySelector('.sub-province').value.trim();
    const city = form.querySelector('.sub-city').value.trim();
    const emoji = form.querySelector('.sub-emoji').value.trim();
    const name = form.querySelector('.sub-name').value.trim();
    const subDate = form.querySelector('.sub-date').value;
    const subEndDate = form.querySelector('.sub-endDate').value;
    const highlightsStr = form.querySelector('.sub-highlights').value.trim();
    const cost = {
        package: form.querySelector('.sub-cost-package').value,
        transport: form.querySelector('.sub-cost-transport').value,
        accommodation: form.querySelector('.sub-cost-accommodation').value,
        food: form.querySelector('.sub-cost-food').value
    };

    if (!name || !subDate) {
        alert('名称和日期为必填项');
        return;
    }

    const highlights = highlightsStr ? highlightsStr.split('、').map(h => h.trim()).filter(h => h) : [];

    const journey = getJourneyById(journeyId);
    if (!journey) return;

    if (!journey.subCards) journey.subCards = [];
    journey.subCards.push({ name, date: subDate, endDate: subEndDate, province, city, emoji, highlights, cost });
    journey.subCards.sort((a, b) => new Date(b.date) - new Date(a.date));
    updateJourney(journeyId, { subCards: journey.subCards });

    syncPrimaryFromSubCards(journey);
    renderSecondaryCards(journey, container);
}

function showEditSubCardForm(journey, idx, container) {
    const existing = container.querySelector('.subcard-form');
    if (existing) existing.remove();
    const sub = journey.subCards[idx];
    if (!sub) return;

    const cost = sub.cost || {};
    const highlightsStr = (sub.highlights || []).join('、');

    const form = document.createElement('div');
    form.className = 'subcard-form';
    form.innerHTML = `
        <div class="edit-form">
            <h3>编辑二级卡片</h3>
            <div class="form-row dense">
                <div class="form-group">
                    <label>省份</label>
                    <input type="text" class="sub-province" value="${sub.province || ''}">
                </div>
                <div class="form-group">
                    <label>城市</label>
                    <input type="text" class="sub-city" value="${sub.city || ''}">
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" class="sub-emoji" value="${sub.emoji || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>名称</label>
                    <input type="text" class="sub-name" value="${sub.name}">
                </div>
                <div class="form-group">
                    <label>日期</label>
                    <input type="date" class="sub-date" value="${sub.date}">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" class="sub-endDate" value="${sub.endDate || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>景点</label>
                <input type="text" class="sub-highlights" value="${highlightsStr}">
            </div>
            <div class="form-row dense">
                <div class="form-group">
                    <label>报团费 📦</label>
                    <input type="number" class="sub-cost-package" value="${cost.package || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>交通费 🚗</label>
                    <input type="number" class="sub-cost-transport" value="${cost.transport || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>住宿费 🏨</label>
                    <input type="number" class="sub-cost-accommodation" value="${cost.accommodation || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>餐饮费 🍽️</label>
                    <input type="number" class="sub-cost-food" value="${cost.food || ''}" placeholder="0">
                </div>
            </div>
            <div class="btn-group">
                <button class="btn btn-primary">保存</button>
                <button class="btn btn-secondary">取消</button>
            </div>
        </div>
    `;

    const subProvinceInput = form.querySelector('.sub-province');
    const subCityInput = form.querySelector('.sub-city');
    const subNameInput = form.querySelector('.sub-name');

    function autoFillSubName() {
        if (subNameInput.dataset.manual === 'true') return;
        const p = subProvinceInput.value.trim();
        const c = subCityInput.value.trim();
        subNameInput.value = p && c && p !== c ? `${p}·${c}` : (p || c);
    }

    subNameInput.addEventListener('input', () => {
        subNameInput.dataset.manual = 'true';
    });
    subProvinceInput.addEventListener('input', autoFillSubName);
    subCityInput.addEventListener('input', autoFillSubName);

    const saveBtn = form.querySelector('.btn-primary');
    const cancelBtn = form.querySelector('.btn-secondary');

    saveBtn.onclick = () => {
        const province = form.querySelector('.sub-province').value.trim();
        const city = form.querySelector('.sub-city').value.trim();
        const emoji = form.querySelector('.sub-emoji').value.trim();
        const name = form.querySelector('.sub-name').value.trim();
        const date = form.querySelector('.sub-date').value;
        const endDate = form.querySelector('.sub-endDate').value;
        const highlightsStr = form.querySelector('.sub-highlights').value.trim();
        const cost = {
            package: form.querySelector('.sub-cost-package').value,
            transport: form.querySelector('.sub-cost-transport').value,
            accommodation: form.querySelector('.sub-cost-accommodation').value,
            food: form.querySelector('.sub-cost-food').value
        };
        if (!name || !date) {
            alert('名称和日期为必填项');
            return;
        }
        const highlights = highlightsStr ? highlightsStr.split('、').map(h => h.trim()).filter(h => h) : [];
        journey.subCards[idx] = { ...journey.subCards[idx], province, city, emoji, name, date, endDate, highlights, cost };
        journey.subCards.sort((a, b) => new Date(b.date) - new Date(a.date));
        updateJourney(journey.id, { subCards: journey.subCards });
        syncPrimaryFromSubCards(journey);
        renderSecondaryCards(journey, container);
    };
    cancelBtn.onclick = () => form.remove();

    container.appendChild(form);
}

function deleteSubCard(journeyId, idx, container) {
    if (!confirm('确定要删除这个二级卡片吗？')) return;
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
    renderSecondaryCards(journey, container);
}

function toggleAll() {
    const btn = document.getElementById('toggle-all-btn');
    const allWrappers = document.querySelectorAll('.primary-card-wrapper');
    const anyHidden = Array.from(allWrappers).some(w => w.querySelector('.secondary-cards').style.display === 'none');

    if (anyHidden) {
        expandAll();
        btn.textContent = '⏫ 一键收缩';
    } else {
        collapseAll();
        btn.textContent = '⏬ 一键展开';
    }
}

function expandAll() {
    document.querySelectorAll('.primary-card-wrapper').forEach(wrapper => {
        const secondary = wrapper.querySelector('.secondary-cards');
        const arrow = wrapper.querySelector('.primary-arrow');
        if (secondary.style.display === 'none') {
            if (!secondary.dataset.loaded) {
                const journey = getJourneyById(wrapper.dataset.id);
                if (journey) {
                    renderSecondaryCards(journey, secondary);
                    secondary.dataset.loaded = 'true';
                }
            }
            secondary.style.display = 'flex';
            arrow.textContent = '▲';
        }
    });
}

function collapseAll() {
    document.querySelectorAll('.primary-card-wrapper').forEach(wrapper => {
        const secondary = wrapper.querySelector('.secondary-cards');
        const arrow = wrapper.querySelector('.primary-arrow');
        if (secondary.style.display !== 'none') {
            secondary.style.display = 'none';
            arrow.textContent = '▼';
        }
    });
}
