import { useEffect, useRef } from 'react';
import type { CityCoordRow } from '@/server/db';

interface JourneyMarker {
  name: string;
  country: string | null;
  type: 'domestic' | 'international';
  lat: number;
  lng: number;
  estimated: boolean;
  visits: number;
  titles: string[];
}

interface Props {
  coords: CityCoordRow[];
  locations: Array<{
    name: string;
    country: string | null;
    type: 'domestic' | 'international';
    journeyTitles: string[];
  }>;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
  return h;
}

function estimateCoord(name: string, country: string | null, type: 'domestic' | 'international'): { lat: number; lng: number } {
  const h = hashString(`${name}${country || ''}`);
  if (type === 'domestic') {
    return { lat: 22 + (h % 10000) / 10000 * 26, lng: 78 + ((h >> 13) % 10000) / 10000 * 48 };
  }
  return { lat: -45 + (h % 10000) / 10000 * 110, lng: -170 + ((h >> 13) % 10000) / 10000 * 340 };
}

export default function LeafletMap({ coords, locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let map: any;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      // 注入 leaflet CSS 一次
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.setAttribute('data-leaflet', '1');
        document.head.appendChild(link);
      }
      if (cancelled) return;

      map = L.map(mapRef.current!, {
        center: [35.8617, 104.1954],
        zoom: 4,
        scrollWheelZoom: true,
        zoomControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 聚合 location → marker
      const coordMap = new Map<string, CityCoordRow>();
      coords.forEach(c => coordMap.set(c.name, c));

      const markers: JourneyMarker[] = [];
      const locMap = new Map<string, JourneyMarker>();
      locations.forEach(loc => {
        const known = coordMap.get(loc.name);
        const point = known
          ? { lat: known.lat, lng: known.lng, estimated: false }
          : { ...estimateCoord(loc.name, loc.country, loc.type), estimated: true };
        const key = loc.name;
        if (locMap.has(key)) {
          const m = locMap.get(key)!;
          m.visits++;
          m.titles.push(...loc.journeyTitles);
        } else {
          locMap.set(key, {
            name: loc.name,
            country: loc.country,
            type: loc.type,
            lat: point.lat,
            lng: point.lng,
            estimated: point.estimated,
            visits: 1,
            titles: [...loc.journeyTitles],
          });
        }
      });
      locMap.forEach(m => markers.push(m));

      const bounds = L.latLngBounds([]);
      markers.forEach(m => {
        const color = m.type === 'domestic' ? '#2563EB' : '#DC2626';
        const marker = L.circleMarker([m.lat, m.lng], {
          radius: 8,
          color: '#fff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.92,
        }).addTo(map);
        const titlesHtml = Array.from(new Set(m.titles)).map(t => `<li>${t}</li>`).join('');
        marker.bindPopup(`
          <div class="map-popup">
            <strong>${m.name}</strong>
            ${m.country ? `<div class="muted">${m.country}</div>` : ''}
            <div class="muted">访问 ${m.visits} 次</div>
            <ul>${titlesHtml}</ul>
            ${m.estimated ? '<div class="hint">坐标自动估算，可后台修正</div>' : ''}
          </div>
        `);
        bounds.extend([m.lat, m.lng]);
      });

      if (markers.length) {
        const knownBounds = L.latLngBounds([]);
        markers
          .filter(m => !m.estimated && m.lng >= -20 && m.lng <= 150 && m.lat >= 5 && m.lat <= 65)
          .forEach(m => knownBounds.extend([m.lat, m.lng]));

        if (knownBounds.isValid()) {
          map.fitBounds(knownBounds, { padding: [56, 56], maxZoom: 5 });
        } else {
          map.fitBounds([[15, -10], [58, 145]], { padding: [56, 56], maxZoom: 5 });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [coords, locations]);

  return (
    <>
      <div ref={mapRef} style={{ height: 'calc(100vh - 64px)', width: '100%' }} />
      <style>{`
        .map-popup strong { font-size: 16px; }
        .map-popup .muted { color: #71717A; font-size: 12px; }
        .map-popup ul { margin: 6px 0 0; padding-left: 18px; font-size: 13px; }
        .map-popup .hint { margin-top: 6px; font-size: 11px; color: #EAB308; }
        .leaflet-container { background: #FAFAFA; font-family: var(--font-body); }
      `}</style>
    </>
  );
}
