/**
 * MapView.jsx
 * -----------------------------------------------------------------
 * Free interactive map using Leaflet + OpenStreetMap tiles.
 *
 * No Google API key, no signup, no billing account needed — this
 * replaces the earlier Google Maps integration entirely.
 * OpenStreetMap is a free, open-data map service, and Leaflet (the
 * map library) is loaded dynamically via CDN <link>/<script> tags,
 * so no extra `npm install` step is required either.
 *
 * Props:
 *   markers: [{ id, name, latitude, longitude, category }]
 *   activeMarkerId: id of the marker to highlight (synced from the
 *                   itinerary timeline)
 *   onMarkerClick(id)
 *   drawRoute: boolean — connect markers with a polyline (day route)
 * -----------------------------------------------------------------
 */
import { useEffect, useRef, useState } from 'react';

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletLoadingPromise = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadingPromise) return leafletLoadingPromise;

  leafletLoadingPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS_URL;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('script-load-failure'));
    document.head.appendChild(script);
  });
  return leafletLoadingPromise;
}

function numberedIcon(L, num, active) {
  const size = active ? 28 : 22;
  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 9999px;
      background: ${active ? '#0d9488' : '#14b8a6'};
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    ">${num}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapView({ markers = [], activeMarkerId, onMarkerClick, drawRoute = false, height = 380 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerObjsRef = useRef({});
  const polylineRef = useRef(null);
  const [status, setStatus] = useState('loading');

  const validMarkers = markers.filter((m) => m.latitude != null && m.longitude != null);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const center = validMarkers[0]
          ? [Number(validMarkers[0].latitude), Number(validMarkers[0].longitude)]
          : [20.5937, 78.9629]; // India

        mapRef.current = L.map(containerRef.current, {
          center,
          zoom: validMarkers.length ? 11 : 5,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever the map or marker list changes
  useEffect(() => {
    if (status !== 'ready' || !window.L || !mapRef.current) return;
    const L = window.L;

    Object.values(markerObjsRef.current).forEach((m) => mapRef.current.removeLayer(m));
    markerObjsRef.current = {};
    if (polylineRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const latLngs = [];

    validMarkers.forEach((m, idx) => {
      const position = [Number(m.latitude), Number(m.longitude)];
      const marker = L.marker(position, { icon: numberedIcon(L, idx + 1, m.id === activeMarkerId) })
        .addTo(mapRef.current)
        .bindTooltip(m.name);
      marker.on('click', () => onMarkerClick && onMarkerClick(m.id));
      markerObjsRef.current[m.id] = marker;
      latLngs.push(position);
    });

    if (drawRoute && validMarkers.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#0d9488',
        opacity: 0.8,
        weight: 3,
      }).addTo(mapRef.current);
    }

    if (latLngs.length > 1) {
      mapRef.current.fitBounds(latLngs, { padding: [60, 60] });
    } else if (latLngs.length === 1) {
      mapRef.current.setView(latLngs[0], 13);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, JSON.stringify(validMarkers), activeMarkerId, drawRoute]);

  if (status === 'error') {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center gap-2 rounded-xl2 border border-dashed border-slate-300 bg-slate-50 px-6 text-center"
      >
        <p className="text-sm font-medium text-slate-500">Map failed to load — check your internet connection.</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="relative overflow-hidden rounded-xl2 border border-slate-100">
      {status === 'loading' && <div className="skeleton absolute inset-0" />}
      <div ref={containerRef} className="h-full w-full" />
      {status === 'ready' && markers.length > 0 && validMarkers.length === 0 && (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg bg-white/95 px-3 py-2 text-center text-xs font-medium text-slate-600 shadow-card">
          Exact map pins aren't available for these activities — use "Open in Google Maps" on each item instead.
        </div>
      )}
    </div>
  );
}
