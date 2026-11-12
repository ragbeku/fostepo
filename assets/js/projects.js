/* FostePo Projects page: category filtering for the complete portfolio. */
(() => {
  'use strict';

  const initialiseProjectFilters = () => {
    const filterBar = document.querySelector('[data-project-filters]');
    const projectGrid = document.querySelector('[data-project-grid]');
    if (!filterBar || !projectGrid) return;

    const filterButtons = [...filterBar.querySelectorAll('button[data-filter]')];
    const projectCards = [...projectGrid.querySelectorAll('[data-category]')];
    if (!filterButtons.length || !projectCards.length) return;

    const applyFilter = requestedFilter => {
      const exists = filterButtons.some(button => button.dataset.filter === requestedFilter);
      const activeFilter = exists ? requestedFilter : 'all';

      filterButtons.forEach(button => {
        const selected = button.dataset.filter === activeFilter;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });

      projectCards.forEach(card => {
        const visible = activeFilter === 'all' || card.dataset.category === activeFilter;
        card.hidden = !visible;
        card.classList.toggle('is-hidden', !visible);
        card.setAttribute('aria-hidden', String(!visible));
      });
    };

    // Delegation means every filter remains responsive, including on touch screens.
    filterBar.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button || !filterBar.contains(button)) return;
      event.preventDefault();
      applyFilter(button.dataset.filter);
    });

    const initialButton = filterButtons.find(button => button.classList.contains('active'));
    applyFilter(initialButton?.dataset.filter || 'all');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseProjectFilters, { once: true });
  } else {
    initialiseProjectFilters();
  }
})();
