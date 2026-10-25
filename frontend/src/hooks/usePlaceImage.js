/**
 * usePlaceImage.js
 * -----------------------------------------------------------------
 * Resolves a REAL photo for any place / city name:
 *   1. curated Wikimedia photo (data/placeImages.js)
 *   2. live lookup on Wikipedia (works for any city the user types)
 *   3. curated photo of the parent city/destination (`context`)
 *   4. the fallback URL that came from the API
 * Results are cached in memory + localStorage so each name is only
 * looked up once per browser.
 * -----------------------------------------------------------------
 */
import { useEffect, useState } from 'react';
import { findPlaceImage } from '../data/placeImages';

const CACHE_KEY = 'it_place_img_v1';
const memory = new Map();
const inflight = new Map();

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}
function writeStore(key, value) {
  try {
    const store = readStore();
    store[key] = value;
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — memory cache still works */
  }
}

const STOP = new Set(['the', 'of', 'and', 'in', 'at', 'on', 'to', 'a', 'ride', 'walk', 'trail', 'tour', 'point', 'view']);
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

async function searchWikipedia(name, context) {
  const query = context && !String(name).toLowerCase().includes(String(context).toLowerCase()) ? `${name} ${context}` : name;
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1' +
    '&generator=search&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=960' +
    `&gsrsearch=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const pages = Object.values(json?.query?.pages || {}).sort((a, b) => a.index - b.index);
  const nameWords = words(name);
  // Only accept a result whose title shares a real word with the name,
  // so we never show an unrelated photo.
  const match = pages.find((p) => p.thumbnail?.source && words(p.title).some((w) => nameWords.includes(w)));
  return match?.thumbnail?.source || null;
}

export function resolvePlaceImage(name, context) {
  if (!name) return Promise.resolve(null);
  const curated = findPlaceImage(name);
  if (curated) return Promise.resolve(curated);

  const key = `${String(name).toLowerCase()}|${String(context || '').toLowerCase()}`;
  if (memory.has(key)) return Promise.resolve(memory.get(key));
  const stored = readStore()[key];
  if (stored !== undefined) {
    memory.set(key, stored);
    return Promise.resolve(stored);
  }
  if (inflight.has(key)) return inflight.get(key);

  const p = searchWikipedia(name, context)
    .catch(() => null)
    .then((url) => {
      const result = url || findPlaceImage(context) || null;
      memory.set(key, result);
      writeStore(key, result);
      inflight.delete(key);
      return result;
    });
  inflight.set(key, p);
  return p;
}

/** React hook: returns the best real image URL for `name` (sync for curated names). */
export function usePlaceImage(name, context, fallback) {
  const initial = findPlaceImage(name) || null;
  const [src, setSrc] = useState(initial);

  useEffect(() => {
    let alive = true;
    const curated = findPlaceImage(name);
    if (curated) {
      setSrc(curated);
      return undefined;
    }
    setSrc(null);
    resolvePlaceImage(name, context).then((url) => {
      if (alive) setSrc(url || fallback || null);
    });
    return () => {
      alive = false;
    };
  }, [name, context, fallback]);

  return src;
}
