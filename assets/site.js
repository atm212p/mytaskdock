/* Progressive enhancement only. All product copy and image links exist in HTML. */
(() => {
  'use strict';
  const doc = document;
  doc.documentElement.classList.add('js');
  const menuButton = doc.querySelector('.menu-button');
  const mobileNav = doc.querySelector('.mobile-nav');
  function closeMenu() {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
  }
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileNav?.classList.toggle('open', open);
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  const tabs = [...doc.querySelectorAll('.product-tab')];
  const panels = [...doc.querySelectorAll('.product-panel')];
  const tablist = doc.querySelector('.product-tabs');
  if (tablist) tablist.setAttribute('role', 'tablist');
  function selectTab(tab, focus = false) {
    const id = tab.getAttribute('href').slice(1);
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(p => {
      const selected = p.id === id;
      p.setAttribute('aria-hidden', String(!selected));
      p.hidden = !selected;
    });
    if (focus) tab.focus({preventScroll: true});
  }
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.getAttribute('href').slice(1));
    tab.addEventListener('click', e => { e.preventDefault(); selectTab(tab); });
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectTab(tabs[next], true); }
    });
  });
  panels.forEach(panel => { panel.setAttribute('role', 'tabpanel'); });
  if (tabs.length) selectTab(tabs.find(t => t.getAttribute('href') === location.hash) || tabs[0]);

  const dialog = doc.querySelector('.image-dialog');
  const dialogImage = dialog?.querySelector('img');
  const dialogTitle = dialog?.querySelector('h2');
  const imageScroller = dialog?.querySelector('.dialog-image-scroll');
  let returnFocus = null;
  const closeDialog = () => {
    if (dialog?.open) dialog.close();
  };
  if (dialog && typeof dialog.showModal === 'function') {
    doc.querySelectorAll('[data-lightbox]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        returnFocus = link;
        dialogImage.src = link.href;
        dialogImage.alt = link.dataset.imageAlt || link.dataset.title || '';
        dialogTitle.textContent = link.dataset.title || 'MyTaskDock';
        imageScroller.classList.remove('zoomed');
        dialog.showModal();
        doc.body.style.overflow = 'hidden';
      });
    });
    dialog.querySelector('.dialog-close')?.addEventListener('click', closeDialog);
    dialog.addEventListener('click', e => {
      const bounds = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom)) closeDialog();
    });
    dialog.addEventListener('close', () => {
      doc.body.style.overflow = '';
      returnFocus?.focus({preventScroll: true});
    });
    dialogImage?.addEventListener('click', () => imageScroller.classList.toggle('zoomed'));
  }
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const toast = doc.querySelector('.toast');
  let toastTimer;
  doc.querySelectorAll('[data-copy-email]').forEach(button => {
    button.addEventListener('click', async () => {
      const address = button.dataset.copyEmail;
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(address);
        toast.textContent = doc.body.dataset.copySuccess;
      } catch (_) {
        toast.textContent = address;
      }
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
    });
  });
})();
