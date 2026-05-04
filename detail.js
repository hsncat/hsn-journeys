document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const journey = getJourneyById(id);

    if (!journey) {
        document.getElementById('journey-detail').innerHTML = `
            <div class="detail-content">
                <h3>未找到该旅行记录</h3>
                <p>抱歉，您查看的旅行记录不存在或已被删除。</p>
            </div>
        `;
        return;
    }

    const pageTitle = journey.province && journey.province !== journey.city
        ? `${journey.province} · ${journey.city}`
        : (journey.province || journey.city);
    document.title = `${pageTitle} - HSN Journey Traces`;

    renderDetail(journey);
    renderActions(journey);
});

function getDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function renderDetail(journey) {
    const title = journey.province && journey.province !== journey.city
        ? `${journey.province} · ${journey.city}`
        : (journey.province || journey.city);

    const highlightsHtml = (journey.highlights || [])
        .map(h => `<span style="display:inline-block;padding:0.25rem 0.75rem;background:#EFF6FF;color:#2563EB;border-radius:9999px;font-size:0.875rem;margin:0 0.5rem 0.5rem 0;">${h}</span>`)
        .join('');

    const cost = journey.cost || {};
    const costHtml = (cost.package || cost.transport || cost.accommodation || cost.food)
        ? `<div style="margin-top:0.5rem;display:flex;gap:1rem;flex-wrap:wrap;font-size:0.875rem;color:#3F3F46;">
            ${cost.package ? `<span>📦 报团 ${Number(cost.package).toLocaleString()}</span>` : ''}
            ${cost.transport ? `<span>🚗 交通 ${Number(cost.transport).toLocaleString()}</span>` : ''}
            ${cost.accommodation ? `<span>🏨 住宿 ${Number(cost.accommodation).toLocaleString()}</span>` : ''}
            ${cost.food ? `<span>🍽️ 餐饮 ${Number(cost.food).toLocaleString()}</span>` : ''}
           </div>`
        : '';

    const photoHtml = journey.photo
        ? `<div style="margin-top:1rem;"><img src="${journey.photo}" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"></div>`
        : '';

    document.getElementById('journey-detail').innerHTML = `
        <div class="detail-header">
            <div style="font-size:4rem;text-align:center;margin-bottom:1rem;">${journey.emoji}</div>
            <h1 class="detail-title">${title}</h1>
            <div class="detail-meta">
                <span>📍 ${journey.city}, ${journey.country}</span>
                <span>📅 ${journey.date} ~ ${journey.endDate}</span>
                <span>⏱️ ${getDays(journey.date, journey.endDate)} 天</span>
            </div>
            ${costHtml}
        </div>
        <div class="detail-content">
            <h3>景点</h3>
            <div style="margin-bottom:1rem;">${highlightsHtml}</div>

            <h3>行程</h3>
            ${renderItineraryTable(journey.itinerary)}

            <h3>精彩瞬间</h3>
            ${photoHtml}
            <div class="detail-gallery" id="photo-gallery" style="${journey.photo ? 'display:none;' : ''}">
                <div class="gallery-item">📷</div>
                <div class="gallery-item">🎞️</div>
                <div class="gallery-item">🏞️</div>
            </div>
        </div>
    `;
}

function renderItineraryTable(itinerary) {
    const rows = (itinerary || []).map(item => `
        <tr>
            <td>${item.date || ''}</td>
            <td>${item.morning || ''}</td>
            <td>${item.afternoon || ''}</td>
            <td>${item.evening || ''}</td>
            <td>${item.note || ''}</td>
        </tr>
    `).join('');

    return `
        <div style="overflow-x:auto;">
            <table class="itinerary-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>上午</th>
                        <th>下午</th>
                        <th>晚上</th>
                        <th>备注</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="text-align:center;color:#A1A1AA;">暂无行程数据</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function renderActions(journey) {
    const actionBar = document.getElementById('action-bar');
    actionBar.innerHTML = `
        <button class="btn btn-primary" onclick="startEdit(${journey.id})">✏️ 编辑</button>
        <button class="btn btn-danger" onclick="deleteCurrent(${journey.id})">🗑️ 删除</button>
    `;
}

function startEdit(id) {
    const journey = getJourneyById(id);
    if (!journey) return;

    const highlightsStr = (journey.highlights || []).join('、');
    const cost = journey.cost || {};

    document.getElementById('journey-detail').style.display = 'none';
    document.getElementById('action-bar').style.display = 'none';
    const formContainer = document.getElementById('edit-form');
    formContainer.style.display = 'block';

    formContainer.innerHTML = `
        <div class="edit-form">
            <h2 style="margin-bottom:1.5rem;color:#18181B;">✏️ 编辑旅程</h2>
            <div class="form-row">
                <div class="form-group">
                    <label>省份</label>
                    <input type="text" id="edit-province" value="${journey.province || ''}">
                </div>
                <div class="form-group">
                    <label>城市</label>
                    <input type="text" id="edit-city" value="${journey.city}">
                </div>
                <div class="form-group">
                    <label>国家</label>
                    <input type="text" id="edit-country" value="${journey.country}">
                </div>
                <div class="form-group">
                    <label>Emoji</label>
                    <input type="text" id="edit-emoji" value="${journey.emoji}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>开始日期</label>
                    <input type="date" id="edit-date" value="${journey.date}">
                </div>
                <div class="form-group">
                    <label>结束日期</label>
                    <input type="date" id="edit-endDate" value="${journey.endDate}">
                </div>
            </div>
            <div class="form-group">
                <label>标题</label>
                <input type="text" id="edit-title" value="${journey.title}">
            </div>
            <div class="form-group">
                <label>简介</label>
                <textarea id="edit-description">${journey.description}</textarea>
            </div>
            <div class="form-group">
                <label>景点（用顿号、分隔）</label>
                <input type="text" id="edit-highlights" value="${highlightsStr}">
            </div>

            <h3 style="margin:1.5rem 0 0.75rem;color:#18181B;">费用</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>报团费 📦</label>
                    <input type="number" id="edit-cost-package" value="${cost.package || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>交通费 🚗</label>
                    <input type="number" id="edit-cost-transport" value="${cost.transport || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>住宿费 🏨</label>
                    <input type="number" id="edit-cost-accommodation" value="${cost.accommodation || ''}" placeholder="0">
                </div>
                <div class="form-group">
                    <label>餐饮费 🍽️</label>
                    <input type="number" id="edit-cost-food" value="${cost.food || ''}" placeholder="0">
                </div>
            </div>

            <h3 style="margin:1.5rem 0 0.75rem;color:#18181B;">行程</h3>
            <div id="itinerary-editor"></div>

            <h3 style="margin:1.5rem 0 0.75rem;color:#18181B;">精彩瞬间</h3>
            <div class="form-group">
                <input type="file" id="edit-photo" accept="image/*" onchange="handlePhotoPreview(this)">
                <div id="photo-preview" style="margin-top:0.75rem;">
                    ${journey.photo ? `<img src="${journey.photo}" style="max-width:200px;border-radius:6px;">` : ''}
                </div>
            </div>

            <div class="btn-group">
                <button class="btn btn-primary" onclick="saveEdit(${journey.id})">💾 保存</button>
                <button class="btn btn-secondary" onclick="cancelEdit()">❌ 取消</button>
            </div>
        </div>
    `;

    renderItineraryEditor(journey.itinerary || []);
}

function renderItineraryEditor(itinerary) {
    const container = document.getElementById('itinerary-editor');
    let rows = itinerary.map((item, idx) => `
        <div class="itinerary-row" data-index="${idx}">
            <input type="date" class="it-date" value="${item.date || ''}">
            <input type="text" class="it-morning" value="${item.morning || ''}" placeholder="上午">
            <input type="text" class="it-afternoon" value="${item.afternoon || ''}" placeholder="下午">
            <input type="text" class="it-evening" value="${item.evening || ''}" placeholder="晚上">
            <input type="text" class="it-note" value="${item.note || ''}" placeholder="备注">
            <button type="button" class="btn btn-danger" onclick="removeItineraryRow(this)" style="padding:0.375rem 0.625rem;font-size:0.75rem;">删除</button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="itinerary-editor">
            <div class="itinerary-header">
                <span>日期</span>
                <span>上午</span>
                <span>下午</span>
                <span>晚上</span>
                <span>备注</span>
                <span></span>
            </div>
            <div id="itinerary-rows">${rows}</div>
            <button type="button" class="btn btn-secondary" onclick="addItineraryRow()" style="margin-top:0.75rem;">+ 添加行程</button>
        </div>
    `;
}

function addItineraryRow() {
    const container = document.getElementById('itinerary-rows');
    const div = document.createElement('div');
    div.className = 'itinerary-row';
    div.innerHTML = `
        <input type="date" class="it-date">
        <input type="text" class="it-morning" placeholder="上午">
        <input type="text" class="it-afternoon" placeholder="下午">
        <input type="text" class="it-evening" placeholder="晚上">
        <input type="text" class="it-note" placeholder="备注">
        <button type="button" class="btn btn-danger" onclick="removeItineraryRow(this)" style="padding:0.375rem 0.625rem;font-size:0.75rem;">删除</button>
    `;
    container.appendChild(div);
}

function removeItineraryRow(btn) {
    btn.closest('.itinerary-row').remove();
}

function handlePhotoPreview(input) {
    const preview = document.getElementById('photo-preview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width:200px;border-radius:6px;">`;
            preview.dataset.photo = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveEdit(id) {
    const province = document.getElementById('edit-province').value.trim();
    const city = document.getElementById('edit-city').value.trim();
    const country = document.getElementById('edit-country').value.trim();
    const emoji = document.getElementById('edit-emoji').value.trim();
    const date = document.getElementById('edit-date').value;
    const endDate = document.getElementById('edit-endDate').value;
    const title = document.getElementById('edit-title').value.trim();
    const description = document.getElementById('edit-description').value.trim();
    const highlightsStr = document.getElementById('edit-highlights').value.trim();

    const cost = {
        package: document.getElementById('edit-cost-package').value,
        transport: document.getElementById('edit-cost-transport').value,
        accommodation: document.getElementById('edit-cost-accommodation').value,
        food: document.getElementById('edit-cost-food').value
    };

    const itinerary = [];
    document.querySelectorAll('.itinerary-row').forEach(row => {
        const d = row.querySelector('.it-date').value;
        if (!d) return;
        itinerary.push({
            date: d,
            morning: row.querySelector('.it-morning').value.trim(),
            afternoon: row.querySelector('.it-afternoon').value.trim(),
            evening: row.querySelector('.it-evening').value.trim(),
            note: row.querySelector('.it-note').value.trim()
        });
    });

    const preview = document.getElementById('photo-preview');
    const photo = preview.dataset.photo || (preview.querySelector('img') ? preview.querySelector('img').src : '');

    if (!city || !title || !date) {
        alert('城市、标题和开始日期为必填项');
        return;
    }

    const highlights = highlightsStr ? highlightsStr.split('、').map(h => h.trim()).filter(h => h) : [];

    updateJourney(id, {
        province, city, country, emoji, date, endDate, title, description, highlights, cost, itinerary, photo
    });

    alert('保存成功！');
    location.reload();
}

function cancelEdit() {
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('journey-detail').style.display = 'block';
    document.getElementById('action-bar').style.display = 'flex';
}

function deleteCurrent(id) {
    if (!confirm('确定要删除这条旅行记录吗？此操作不可恢复。')) return;
    deleteJourney(id);
    alert('已删除');
    window.location.href = 'cities.html';
}
