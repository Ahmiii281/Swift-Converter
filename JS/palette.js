// Palette switcher
(function () {
  const palettes = ['default', 'eyecare', 'warm-light'];
  function setPalette(name) {
    document.documentElement.setAttribute('data-palette', name === 'default' ? '' : name);
    try { localStorage.setItem('palette', name); } catch (e) {}
  }

  function loadPalette() {
    try {
      const stored = localStorage.getItem('palette');
      if (stored && palettes.includes(stored)) {
        setPalette(stored);
      }
    } catch (e) { /* ignore */ }
  }

  // simple UI: a small selector added to the header
  function createUI() {
    const container = document.createElement('div');
    container.className = 'palette-switcher';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';

    const label = document.createElement('span');
    label.textContent = 'Palette';
    label.style.fontSize = '0.9rem';
    label.style.color = 'var(--color-text-secondary)';

    const select = document.createElement('select');
    select.style.padding = '6px';
    select.style.borderRadius = '6px';
    select.style.border = '1px solid var(--color-border)';

    const opts = [
      { v: 'default', t: 'Default' },
      { v: 'eyecare', t: 'EyeCare' },
      { v: 'warm-light', t: 'Warm Light' }
    ];
    opts.forEach(o => {
      const el = document.createElement('option');
      el.value = o.v;
      el.textContent = o.t;
      select.appendChild(el);
    });

    select.addEventListener('change', () => setPalette(select.value));

    container.appendChild(label);
    container.appendChild(select);

    // add to all navbars
    document.querySelectorAll('.navbar-container').forEach(nav => {
      const clone = container.cloneNode(true);
      // ensure select shows current value
      clone.querySelector('select').value = localStorage.getItem('palette') || 'default';
      nav.appendChild(clone);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadPalette();
    createUI();
  });

  window.setPalette = setPalette;
})();
