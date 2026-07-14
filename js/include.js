/*
 * Loads the shared site chrome once per page.
 */
(function () {
  'use strict';

  let sharedComponentsPromise;

  async function loadComponent(id, path) {
    const target = document.getElementById(id);
    if (!target) return;

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Unable to load ${path}: ${response.status}`);
    }

    target.innerHTML = await response.text();
  }

  async function loadSharedComponents() {
    if (sharedComponentsPromise) {
      return sharedComponentsPromise;
    }

    sharedComponentsPromise = (async () => {
      await Promise.all([
        loadComponent('header', 'components/header.html'),
        loadComponent('footer', 'components/footer.html')
      ]);

      if (typeof window.initializeSharedComponents === 'function') {
        window.initializeSharedComponents();
      }
    })().catch((error) => {
      sharedComponentsPromise = null;
      console.error('Shared component loading failed.', error);
    });

    return sharedComponentsPromise;
  }

  window.loadSharedComponents = loadSharedComponents;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSharedComponents, { once: true });
  } else {
    loadSharedComponents();
  }
}());
