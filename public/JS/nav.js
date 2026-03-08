// Mobile navigation toggle
(function () {
  const toggles = document.querySelectorAll('.nav-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.navbar-container');
      if (!container) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      container.classList.toggle('open');
    });
  });

  // Close mobile nav on outside click
  document.addEventListener('click', (e) => {
    const openContainer = document.querySelector('.navbar-container.open');
    if (!openContainer) return;
    if (!openContainer.contains(e.target)) {
      openContainer.classList.remove('open');
      const btn = openContainer.querySelector('.nav-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
