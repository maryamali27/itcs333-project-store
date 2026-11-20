// Campus Marketplace - Auto / Light / Dark theme for every page (Bootstrap 5.3 color modes).
// Load it in <head> so the page never flashes the wrong colors:
//   <script src="../color-mode.js"></script>   (path relative to the page)
// Add a theme button anywhere on the page:
//   <button type="button" class="btn icon-btn" data-theme-toggle></button>
(function () {
  'use strict';

  const MODES = ['auto', 'light', 'dark'];
  const LABELS = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  const ICONS = { auto: 'bi-circle-half', light: 'bi-sun', dark: 'bi-moon-stars' };
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
      btn.innerHTML = `<i class="bi ${ICONS[mode]}" aria-hidden="true"></i>`;
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
