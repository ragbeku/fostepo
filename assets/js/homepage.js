/* FostePo interactions. Uses data-* hooks so layout/content can be edited
   without rewriting the behaviour layer. Keep hooks on replacement elements. */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header, active section link and back-to-top visibility.
  const header = $('[data-header]');
  const topButton = $('[data-back-to-top]');
  const navLinks = $$('.desktop-nav .nav-link');
  const updateScrollUI = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 30);
    topButton?.classList.toggle('is-visible', y > 500);
    // Navigation now opens standalone pages, so only Home remains active here.
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === './#home' || href === './' || href === 'index.html');
    });
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();
  topButton?.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // Full-screen mobile navigation. Bind directly to each control so the close
  // button always receives its own handler on every page (not only backdrop clicks).
  const drawer = $('[data-mobile-drawer]');
  const menuOpen = $('[data-menu-open]');
  const menuClose = $('[data-menu-close]');
  const menuBackdrop = $('[data-menu-backdrop]');

  if (drawer) {
    drawer.inert = true;
    drawer.setAttribute('aria-hidden', 'true');
  }

  const openMenu = () => {
    if (!drawer) return;
    drawer.inert = false;
    drawer.setAttribute('aria-hidden', 'false');
    body.classList.add('menu-open');
    menuOpen?.setAttribute('aria-expanded', 'true');
    menuClose?.focus({ preventScroll: true });
  };

  const closeMenu = (restoreFocus = true) => {
    if (!drawer) return;
    body.classList.remove('menu-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    menuOpen?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuOpen?.focus({ preventScroll: true });
  };

  menuOpen?.addEventListener('click', event => {
    event.preventDefault();
    openMenu();
  });
  menuClose?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
  });
  menuBackdrop?.addEventListener('click', event => {
    event.preventDefault();
    closeMenu();
  });
  $$('[data-drawer-link]', drawer || document).forEach(link => {
    link.addEventListener('click', () => closeMenu(false));
  });

  // Hero slider: automatic, manual arrows and dot navigation.
  const slider = $('[data-hero-slider]');
  const slides = $$('.hero-slide', slider || document);
  const dots = $$('[data-hero-dots] button');
  let activeSlide = 0;
  let sliderTimer;
  const showSlide = index => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeSlide));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeSlide));
  };
  const restartSlider = () => {
    window.clearInterval(sliderTimer);
    if (!reduceMotion && slides.length > 1) sliderTimer = window.setInterval(() => showSlide(activeSlide + 1), 6500);
  };
  $('[data-hero-prev]')?.addEventListener('click', () => { showSlide(activeSlide - 1); restartSlider(); });
  $('[data-hero-next]')?.addEventListener('click', () => { showSlide(activeSlide + 1); restartSlider(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); restartSlider(); }));
  showSlide(0); restartSlider();

  // Scroll reveal.
  const revealElements = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // Project category filtering.
  const filterButtons = $$('[data-project-filters] [data-filter]');
  const projectCards = $$('[data-project-grid] [data-category]');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    projectCards.forEach(card => {
      const visible = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !visible);
    });
  }));

  // Before / after comparison range.
  const compare = $('[data-before-after]');
  const compareRange = $('[data-compare-range]');
  const updateCompare = () => {
    if (compare && compareRange) compare.style.setProperty('--compare', `${compareRange.value}%`);
  };
  compareRange?.addEventListener('input', updateCompare);
  updateCompare();

  // Scroll-linked process timeline.
  const timeline = $('[data-timeline]');
  const timelineProgress = $('[data-timeline-progress]');
  const timelineSteps = $$('[data-timeline-step]');
  const updateTimeline = () => {
    if (!timeline || !timelineProgress) return;
    const rect = timeline.getBoundingClientRect();
    const viewPoint = window.innerHeight * 0.68;
    const progress = Math.max(0, Math.min(1, (viewPoint - rect.top) / rect.height));
    timelineProgress.style.height = `${progress * 100}%`;
    timelineSteps.forEach(step => {
      const stepRect = step.getBoundingClientRect();
      step.classList.toggle('is-active', stepRect.top < viewPoint && stepRect.bottom > 80);
    });
  };
  window.addEventListener('scroll', updateTimeline, { passive: true });
  window.addEventListener('resize', updateTimeline);
  updateTimeline();

  // Enquiry form creates a WhatsApp message. Update the destination number
  // if the company confirms which of its listed numbers should receive leads.
  $('[data-enquiry-form]')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = [
      'Hello FostePo Construction Enterprise,',
      '',
      'I would like to make a project enquiry.',
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Service: ${data.get('service')}`,
      `Project details: ${data.get('message')}`
    ].join('\n');
    const recipient = '233594945201';
    window.open(`https://wa.me/${recipient}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  // Footer year.
  const year = $('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();

  // Keyboard escape and focus-safe overlays.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (body.classList.contains('menu-open')) closeMenu();
    }
  });
})();
