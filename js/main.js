/* ============================================
   TENNY KWON — PORTFOLIO (Network Graph)
   js/main.js
   ============================================ */
(function () {
  'use strict';

  // ---- THEME TOGGLE ----
  var root = document.documentElement;
  var themeToggle = document.querySelector('.nav__theme-toggle');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  setTheme(localStorage.getItem('theme') || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- MOBILE MENU ----
  var hamburger = document.querySelector('.nav__hamburger');
  var navMenu = document.querySelector('.nav__menu');
  var navLinks = document.querySelectorAll('.nav__links a');

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

  // ---- NAV HIDE/SHOW ON SCROLL ----
  var lastScrollY = 0;
  var nav = document.querySelector('.nav');

  if (nav) {
    window.addEventListener('scroll', function () {
      var cur = window.scrollY;
      if (cur > lastScrollY && cur > 100) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }
      lastScrollY = cur;
    }, { passive: true });
  }

  // ---- ACTIVE NAV LINK ----
  var sections = document.querySelectorAll('.zone[id]');
  if (sections.length && navLinks.length) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var a = document.querySelector('.nav__links a[href="#' + e.target.id + '"]');
          if (a) a.classList.add('active');
        }
      });
    }, { threshold: 0.2, rootMargin: '-72px 0px -40% 0px' });
    sections.forEach(function (s) { sectionObs.observe(s); });
  }

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var off = nav ? nav.offsetHeight : 0;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // NETWORK CANVAS
  // ============================================
  var canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var tooltip = document.getElementById('skill-tooltip');
  var networkPage = document.querySelector('.network-page');
  var heroSection = document.querySelector('.zone--hero');

  // ---- Skill Nodes (read from DOM [data-skill] elements) ----
  var skillIds = ['crossborder', 'program', 'bizdev', 'alignment', 'process'];

  // ---- Connections (core skills → projects) ----
  var connections = [
    // Cross-Border Partnerships → international projects
    { from: 'crossborder', to: 'proj-afan' },
    { from: 'crossborder', to: 'proj-atlanta' },
    { from: 'crossborder', to: 'proj-kopick' },
    // Program & Project Management
    { from: 'program', to: 'proj-atlanta' },
    { from: 'program', to: 'proj-kopick' },
    { from: 'program', to: 'proj-outlist' },
    // Business Development
    { from: 'bizdev', to: 'proj-kopick' },
    { from: 'bizdev', to: 'proj-afan' },
    // Stakeholder Alignment
    { from: 'alignment', to: 'proj-health' },
    { from: 'alignment', to: 'proj-atlanta' },
    { from: 'alignment', to: 'proj-afan' },
    // Process Design
    { from: 'process', to: 'proj-outlist' },
    { from: 'process', to: 'proj-health' },
  ];

  // ---- State ----
  var hoveredProject = null;
  var animProgress = 0;
  var animStartTime = null;
  var animDuration = 2500; // ms
  var dpr = window.devicePixelRatio || 1;

  // ---- Get project node positions from DOM ----
  function getProjectNodePositions() {
    var nodes = document.querySelectorAll('.project-node[data-project]');
    var positions = {};
    nodes.forEach(function (el) {
      var dot = el.querySelector('.project-node__dot');
      if (!dot) return;
      var rect = dot.getBoundingClientRect();
      var scrollY = window.scrollY;
      positions[el.getAttribute('data-project')] = {
        x: rect.left + rect.width / 2,
        y: rect.top + scrollY + rect.height / 2
      };
    });
    return positions;
  }

  // ---- Get skill node absolute positions (from DOM skill list items) ----
  function getSkillPositions() {
    var scrollY = window.scrollY;
    var positions = {};
    skillIds.forEach(function (id) {
      var el = document.querySelector('[data-skill="' + id + '"]');
      if (!el) return;
      var dot = el.querySelector('.hero__skill-dot');
      var target = dot || el;
      var rect = target.getBoundingClientRect();
      positions[id] = {
        x: rect.left + rect.width / 2,
        y: rect.top + scrollY + rect.height / 2
      };
    });
    return positions;
  }

  // ---- Resize canvas ----
  function resizeCanvas() {
    var pageHeight = networkPage ? networkPage.scrollHeight : document.body.scrollHeight;
    canvas.width = window.innerWidth * dpr;
    canvas.height = pageHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = pageHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---- Get accent color from CSS ----
  function getAccentColor(alpha) {
    var style = getComputedStyle(root);
    var rgb = style.getPropertyValue('--accent-rgb').trim();
    return 'rgba(' + rgb + ',' + alpha + ')';
  }

  // ---- Draw ----
  function draw(timestamp) {
    if (!animStartTime) animStartTime = timestamp;
    animProgress = Math.min(1, (timestamp - animStartTime) / animDuration);
    // Ease out
    var ease = 1 - Math.pow(1 - animProgress, 3);

    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    var skillPos = getSkillPositions();
    var projPos = getProjectNodePositions();
    var allPos = {};
    var key;
    for (key in skillPos) allPos[key] = skillPos[key];
    for (key in projPos) allPos[key] = projPos[key];

    var lineColor = getAccentColor(0.12);
    var lineHighlight = getAccentColor(0.5);
    var dotColor = getAccentColor(0.8);
    var dotGlow = getAccentColor(0.3);

    // Draw connections
    connections.forEach(function (conn, idx) {
      var fromPos = allPos[conn.from];
      var toPos = allPos[conn.to];
      if (!fromPos || !toPos) return;

      // Stagger animation per line
      var lineDelay = (idx / connections.length) * 0.4;
      var lineProgress = Math.max(0, Math.min(1, (ease - lineDelay) / (1 - lineDelay)));
      if (lineProgress <= 0) return;

      var endX = fromPos.x + (toPos.x - fromPos.x) * lineProgress;
      var endY = fromPos.y + (toPos.y - fromPos.y) * lineProgress;

      // Highlight if connected to hovered project or skill
      var isHighlighted = (hoveredProject && (conn.from === hoveredProject || conn.to === hoveredProject))
        || (hoveredSkill && (conn.from === hoveredSkill || conn.to === hoveredSkill));

      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = isHighlighted ? lineHighlight : lineColor;
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();
    });

    // Skill dots are now rendered as CSS elements in the hero skills list
    // No canvas drawing needed for skill dots

    // Draw some ambient dots in the about/connect zone for visual continuity
    var aboutSection = document.querySelector('.zone--about');
    if (aboutSection) {
      var aboutRect = aboutSection.getBoundingClientRect();
      var aboutTop = aboutRect.top + window.scrollY;
      var ambientDots = [
        { x: 0.85, y: 0.15 }, { x: 0.1, y: 0.35 }, { x: 0.92, y: 0.55 },
        { x: 0.08, y: 0.7 }, { x: 0.75, y: 0.85 }, { x: 0.2, y: 0.9 }
      ];
      ambientDots.forEach(function (d, i) {
        var ax = d.x * window.innerWidth;
        var ay = aboutTop + d.y * aboutRect.height;
        var aPulse = 3 + Math.sin(time * 1.2 + i * 2) * 1.5;

        ctx.beginPath();
        ctx.arc(ax, ay, aPulse, 0, Math.PI * 2);
        ctx.fillStyle = getAccentColor(0.15 * ease);
        ctx.fill();
      });
    }

    requestAnimationFrame(draw);
  }

  // ---- Skill hover → highlight connected lines ----
  var hoveredSkill = null;
  var skillElements = document.querySelectorAll('[data-skill]');
  skillElements.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      hoveredSkill = el.getAttribute('data-skill');
    });
    el.addEventListener('mouseleave', function () {
      hoveredSkill = null;
    });
  });

  // ---- Project hover → line highlight ----
  var projectNodes = document.querySelectorAll('.project-node[data-project]');
  projectNodes.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      hoveredProject = el.getAttribute('data-project');
    });
    el.addEventListener('mouseleave', function () {
      hoveredProject = null;
    });
  });

  // ---- Start ----
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(draw);

})();
