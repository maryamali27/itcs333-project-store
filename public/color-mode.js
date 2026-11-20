// Campus Marketplace - Auto / Light / Dark theme for every page (Bootstrap 5.3 color modes).
// Load it in <head> so the page never flashes the wrong colors:
//   <script src="../color-mode.js"></script>   (path relative to the page)
// Add a theme button anywhere on the page:
//   <button type="button" class="btn icon-btn" data-theme-toggle></button>
(function () {
  'use strict';

  const MODES = ['auto', 'light', 'dark'];
  const LABELS = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  // Small line icons (drawn with SVG, so no icon library is needed)
  const ICONS = {
    auto: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    dark: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  };
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  // The user's saved choice (localStorage can be blocked, e.g. private mode).
  function getSaved() {
    try {
      const saved = localStorage.getItem('cm-theme');
      return MODES.includes(saved) ? saved : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function save(mode) {
    try {
      localStorage.setItem('cm-theme', mode);
    } catch (e) {
      // Not saved, but the theme still changes for this page.
    }
  }

  function apply(mode) {
    const dark = mode === 'dark' || (mode === 'auto' && media.matches);
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
  }

  function updateButtons(mode) {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" aria-hidden="true">${ICONS[mode]}</svg>`;
      btn.setAttribute('aria-label', `Theme: ${LABELS[mode]}. Click to change.`);
      btn.title = `Theme: ${LABELS[mode]}`;
    });
  }

  let mode = getSaved();
  apply(mode);

  // In Auto mode, follow the device when its setting changes.
  media.addEventListener('change', () => apply(mode));

  document.addEventListener('DOMContentLoaded', () => {
    updateButtons(mode);
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        save(mode);
        apply(mode);
        updateButtons(mode);
      });
    });
  });
})();
