let toast: HTMLElement | null = null;
let onlineTimer: ReturnType<typeof setTimeout> | null = null;

function getToast(): HTMLElement {
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'offline-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  return toast;
}

function showOffline() {
  if (onlineTimer) {
    clearTimeout(onlineTimer);
    onlineTimer = null;
  }
  const el = getToast();
  el.textContent = "you're offline";
  el.classList.remove('is-online');
  // Double rAF ensures the browser renders the element's initial hidden state
  // before the transition class is applied, so the slide-in animation plays.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('is-visible'));
  });
}

function showOnline() {
  const el = getToast();
  el.textContent = 'back online';
  el.classList.add('is-online', 'is-visible');
  onlineTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
}

// navigator.onLine reflects OS network state, not DevTools throttling.
// A real fetch (with sw-bypass so the SW doesn't serve it from cache) is reliable.
async function detectOfflineOnLoad() {
  if (!navigator.onLine) {
    showOffline();
    return;
  }
  try {
    const url = new URL(location.href);
    url.searchParams.set('sw-bypass', '1');
    const resp = await fetch(url.href, { method: 'HEAD', cache: 'no-store' });
    if (!resp.ok) showOffline();
  } catch {
    showOffline();
  }
}

window.addEventListener('offline', showOffline);
window.addEventListener('online', showOnline);

detectOfflineOnLoad();