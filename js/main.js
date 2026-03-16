/* ============================================
   TENNY KWON — PORTFOLIO
   js/main.js
   ============================================ */

(function () {
  'use strict';

  // --- Theme Toggle ---
  const root = document.documentElement;
  const themeToggle = document.querySelector('.nav__theme-toggle');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Mobile Menu ---
  const hamburger = document.querySelector('.nav__hamburger');
  const navMenu = document.querySelector('.nav__menu');
  const navLinks = document.querySelectorAll('.nav__links a');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('nav__menu--open');
      hamburger.classList.toggle('nav__hamburger--active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('nav__menu--open');
        hamburger.classList.remove('nav__hamburger--active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Nav Hide/Show on Scroll ---
  var lastScrollY = 0;
  var nav = document.querySelector('.nav');

  if (nav) {
    window.addEventListener('scroll', function () {
      var currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // --- Active Nav Link Highlighting ---
  var sections = document.querySelectorAll('section[id]');

  if (sections.length > 0 && navLinks.length > 0) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
          });
          var activeLink = document.querySelector('.nav__links a[href="#' + entry.target.id + '"]');
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-72px 0px -40% 0px'
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  // --- Scroll-Triggered Animations ---
  var animElements = document.querySelectorAll('.animate-on-scroll');

  if (animElements.length > 0) {
    // Apply stagger delays to grid children
    var grids = document.querySelectorAll('.cards-grid, .projects-grid');
    grids.forEach(function (grid) {
      var children = grid.querySelectorAll('.animate-on-scroll');
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 100) + 'ms';
      });
    });

    // Timeline stagger
    var timelineItems = document.querySelectorAll('.timeline__item.animate-on-scroll');
    timelineItems.forEach(function (item, i) {
      item.style.transitionDelay = (i * 80) + 'ms';
    });

    var animObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    animElements.forEach(function (el) {
      animObserver.observe(el);
    });
  }

  // --- Smooth Scroll with Offset ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var navHeight = nav ? nav.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

})();
