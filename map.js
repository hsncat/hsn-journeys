const cityCoordinates = [
    { name: "巴黎", country: "法国", lat: 48.8566, lng: 2.3522, type: "international" },
    { name: "苏黎世", country: "瑞士", lat: 47.3769, lng: 8.5417, type: "international" },
    { name: "罗马", country: "意大利", lat: 41.9028, lng: 12.4964, type: "international" },
    { name: "厦门", country: "中国", lat: 24.4798, lng: 118.0894, type: "domestic" },
    { name: "延吉", country: "中国", lat: 42.9048, lng: 129.5089, type: "domestic" },
    { name: "长白山", country: "中国", lat: 42.0413, lng: 128.0579, type: "domestic" },
    { name: "沈阳", country: "中国", lat: 41.8057, lng: 123.4315, type: "domestic" },
    { name: "伊斯坦布尔", country: "土耳其", lat: 41.0082, lng: 28.9784, type: "international" },
    { name: "卡帕多奇亚", country: "土耳其", lat: 38.6431, lng: 34.8303, type: "international" },
    { name: "香港", country: "中国", lat: 22.3193, lng: 114.1694, type: "domestic" },
    { name: "澳门", country: "中国", lat: 22.1987, lng: 113.5439, type: "domestic" },
    { name: "珠海", country: "中国", lat: 22.2710, lng: 113.5670, type: "domestic" },
    { name: "乌鲁木齐", country: "中国", lat: 43.8256, lng: 87.6168, type: "domestic" },
    { name: "喀纳斯", country: "中国", lat: 48.8158, lng: 87.0381, type: "domestic" },
    { name: "禾木", country: "中国", lat: 48.5712, lng: 87.4319, type: "domestic" },
    { name: "北京", country: "中国", lat: 39.9042, lng: 116.4074, type: "domestic" },
    { name: "青岛", country: "中国", lat: 36.0671, lng: 120.3826, type: "domestic" },
    { name: "东京", country: "日本", lat: 35.6762, lng: 139.6503, type: "international" },
    { name: "京都", country: "日本", lat: 35.0116, lng: 135.7681, type: "international" },
    { name: "大阪", country: "日本", lat: 34.6937, lng: 135.5023, type: "international" },
    { name: "大同", country: "中国", lat: 40.0764, lng: 113.3001, type: "domestic" },
    { name: "哈尔滨", country: "中国", lat: 45.8038, lng: 126.5350, type: "domestic" },
    { name: "黄山", country: "中国", lat: 29.7147, lng: 118.3375, type: "domestic" },
    { name: "上海", country: "中国", lat: 31.2304, lng: 121.4737, type: "domestic" },
    { name: "大连", country: "中国", lat: 38.9140, lng: 121.6147, type: "domestic" },
    { name: "威海", country: "中国", lat: 37.5091, lng: 122.1206, type: "domestic" },
    { name: "济南", country: "中国", lat: 36.6512, lng: 117.1201, type: "domestic" },
    { name: "泰安", country: "中国", lat: 36.2002, lng: 117.0876, type: "domestic" },
    { name: "长沙", country: "中国", lat: 28.2280, lng: 112.9388, type: "domestic" },
    { name: "张家界", country: "中国", lat: 29.1171, lng: 110.4792, type: "domestic" },
    { name: "成都", country: "中国", lat: 30.5728, lng: 104.0668, type: "domestic" },
    { name: "重庆", country: "中国", lat: 29.5628, lng: 106.5528, type: "domestic" },
    { name: "苏州", country: "中国", lat: 31.2989, lng: 120.5853, type: "domestic" },
    { name: "南京", country: "中国", lat: 32.0603, lng: 118.7969, type: "domestic" },
    { name: "西安", country: "中国", lat: 34.3416, lng: 108.9398, type: "domestic" },
    { name: "秦皇岛", country: "中国", lat: 39.9354, lng: 119.5965, type: "domestic" },
    { name: "天津", country: "中国", lat: 39.0842, lng: 117.2009, type: "domestic" },
    { name: "兰州", country: "中国", lat: 36.0611, lng: 103.8343, type: "domestic" },
    { name: "南阳", country: "中国", lat: 32.9908, lng: 112.5283, type: "domestic" }
];

function getMapLocations() {
    const map = {};
    journeys.forEach(j => {
        const locations = generateLocations(j);
        locations.forEach(loc => {
            const coord = cityCoordinates.find(c => c.name === loc.name);
            if (!coord) return;
            const key = coord.name;
            if (!map[key]) {
                map[key] = {
                    name: coord.name,
                    country: coord.country,
                    lat: coord.lat,
                    lng: coord.lng,
                    type: coord.type,
                    journeys: []
                };
            }
            if (!map[key].journeys.includes(j.title)) {
                map[key].journeys.push(j.title);
            }
        });
    });
    return Object.values(map);
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        var map = L.map('world-map', {
            zoomControl: true,
            attributionControl: true
        }).setView([35.8617, 104.1954], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);

        var domesticStyle = {
            radius: 8,
            fillColor: '#2563EB',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        };

        var internationalStyle = {
            radius: 8,
            fillColor: '#e53e3e',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        };

        var bounds = L.latLngBounds();
        var locations = getMapLocations();

        locations.forEach(function(city) {
            var style = city.type === 'international' ? internationalStyle : domesticStyle;
            var marker = L.circleMarker([city.lat, city.lng], style).addTo(map);

            var journeysList = city.journeys.join('、');
            var popupContent = '<div class="popup-city">' + city.name + '</div>' +
                '<div class="popup-country">' + city.country + '</div>' +
                '<div class="popup-count">' + city.journeys.length + ' 次旅行</div>' +
                '<div style="margin-top: 0.25rem; font-size: 0.75rem; color: #71717A;">' + journeysList + '</div>';

            marker.bindPopup(popupContent);
            bounds.extend([city.lat, city.lng]);
        });

        if (locations.length > 0) {
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
        }
    } catch (e) {
        console.error('Map initialization error:', e);
        document.getElementById('world-map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#71717A;">地图加载失败，请检查网络连接</div>';
    }
});
