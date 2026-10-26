const API = process.env.REACT_APP_BACKEND_URL || '';
const CONSENT_KEY = 'beskar_consent_9897ed92-542d-4ec0-b6a3-3a1d20cb1754';
const OPTIONAL_PURPOSE = 'dd8148c9-b59d-4386-b615-b71b7f60ab45';
const COOKIES = ['beskar_vid', 'beskar_src', 'beskar_lang', 'beskar_tz'];

const getCookie = (name) => document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.split('=')[1];
const setCookie = (name, value, days) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
};
const clearCookie = (name) => { document.cookie = `${name}=; max-age=0; path=/`; };

export const hasTrackingConsent = () => {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')?.accepted?.includes(OPTIONAL_PURPOSE) || false;
  } catch (e) {
    return false;
  }
};

export const getVisitorId = () => (hasTrackingConsent() ? getCookie('beskar_vid') || null : null);

const post = (path, body) =>
  fetch(`${API}/api/track/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});

const ensureCookies = () => {
  let vid = getCookie('beskar_vid');
  if (!vid) {
    vid = (crypto.randomUUID ? crypto.randomUUID() : `v${Date.now()}${Math.random().toString(36).slice(2)}`);
    setCookie('beskar_vid', vid, 365);
  }
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(['source', 'medium', 'campaign', 'term', 'content'].map((k) => [k, params.get(`utm_${k}`)]).filter(([, v]) => v));
  if (!getCookie('beskar_src')) setCookie('beskar_src', JSON.stringify({ referrer: document.referrer, utm }), 30);
  setCookie('beskar_lang', navigator.language || '', 365);
  setCookie('beskar_tz', Intl.DateTimeFormat().resolvedOptions().timeZone || '', 365);
  return { vid, utm };
};

export const trackPage = () => {
  if (!hasTrackingConsent()) return;
  const { vid, utm } = ensureCookies();
  post('visit', {
    visitor_id: vid,
    domain: window.location.hostname,
    path: window.location.pathname + window.location.hash,
    referrer: document.referrer || '',
    utm,
    language: navigator.language || '',
    languages: Array.from(navigator.languages || []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screen: `${window.screen.width}x${window.screen.height}`,
  });
};

let observer = null;
let pending = new Set();
let flushTimer = null;
const seen = new Set();

const flushSections = () => {
  const vid = getVisitorId();
  if (vid && pending.size) post('sections', { visitor_id: vid, sections: [...pending] });
  pending = new Set();
};

export const watchSections = () => {
  if (observer || !hasTrackingConsent()) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const id = e.target.id;
      if (e.isIntersecting && id && !seen.has(id)) {
        seen.add(id);
        pending.add(id);
        clearTimeout(flushTimer);
        flushTimer = setTimeout(flushSections, 2000);
      }
    });
  }, { threshold: 0.4 });
  const scan = () => document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));
  scan();
  setTimeout(scan, 3000);
};

const stopTracking = () => {
  const vid = getCookie('beskar_vid');
  if (vid) fetch(`${API}/api/track/${encodeURIComponent(vid)}`, { method: 'DELETE' }).catch(() => {});
  COOKIES.forEach(clearCookie);
  observer?.disconnect();
  observer = null;
  seen.clear();
};

export const initTracking = () => {
  const apply = () => {
    if (hasTrackingConsent()) {
      trackPage();
      watchSections();
    } else if (getCookie('beskar_vid')) {
      stopTracking();
    }
  };
  apply();
  window.addEventListener('beskar:consent-changed', apply);
  return () => window.removeEventListener('beskar:consent-changed', apply);
};
