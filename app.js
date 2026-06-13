// ── NAV OVERLAY WAVE ───────────────────────────────────────────────
(function () {
  const cv = document.getElementById('nav-wave-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, menuFrac = 0.45;

  const wSpecs = [
    { yF:.45, aF:.003, wF:.40, seed:1.14, op:.10, s1:1.60, s2:2.20 },
    { yF:.36, aF:.004, wF:.46, seed:5.31, op:.14, s1:2.80, s2:4.20 },
    { yF:.43, aF:.006, wF:.53, seed:2.73, op:.19, s1:1.20, s2:1.80 },
    { yF:.52, aF:.009, wF:.61, seed:0.49, op:.26, s1:3.80, s2:5.60 },
    { yF:.63, aF:.013, wF:.70, seed:3.91, op:.34, s1:2.20, s2:3.20 },
    { yF:.77, aF:.018, wF:.81, seed:7.23, op:.28, s1:1.40, s2:2.40 },
    { yF:.90, aF:.022, wF:.93, seed:4.27, op:.20, s1:1.80, s2:2.80 },
  ];
  const SCROLL_SPEED = 0.018;

  function updateMenuFrac() {}

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = cv.offsetHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', () => { resize(); updateMenuFrac(); });

  const burger = document.getElementById('nav-burger');
  if (burger) burger.addEventListener('click', () => setTimeout(updateMenuFrac, 450));

  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    const t = (ts - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    for (const s of wSpecs) {
      const amp = H * s.aF, wl = W * s.wF;
      const range = H * 0.80;
      const scrollOffset = (t * SCROLL_SPEED * H) % range;
      const baseY = H * 0.20 + ((H * (s.yF - 0.20) + scrollOffset) % range);
      const tPos = baseY / H;
      if (tPos > 1.0) continue;

      const perspective = Math.max(0, (tPos - 0.20) / 0.80);
      const pAmp = H * s.aF * (0.01 + perspective * perspective * 0.99);
      ctx.lineWidth = 0.15 + perspective * perspective * 2.5;
      
      // 螢幕 20%~85% 透明度 0→1.0, 85%~100% 保持 1.0
      // tPos: -0.333=螢幕20%, 0=螢幕40%, 0.75=螢幕85%, 1.0=螢幕100%
      const fadeOp = tPos < 0.75
        ? Math.max(0, (tPos + 0.333) / 1.083)
        : 1.0;
      if (fadeOp < 0.01) continue;

      ctx.globalAlpha = fadeOp;
      ctx.strokeStyle = 'rgba(249,248,247,1)';
      ctx.lineCap = 'round';
      const pts = [];
      for (let x = -10; x <= W + 10; x += 8) {
        pts.push([x, baseY
          + Math.sin((x/wl)*Math.PI*2 + s.seed + t*s.s1)*pAmp
          + Math.sin((x/wl)*Math.PI*2*1.61 + s.seed*1.3 + t*s.s2)*pAmp*.30]);
      }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i][0], pts[i][1],
          (pts[i][0]+pts[i+1][0])/2, (pts[i][1]+pts[i+1][1])/2);
      }
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// ── BURGER MENU ────────────────────────────────────────────────────
(function () {
  const burger   = document.getElementById('nav-burger');
  const dropdown = document.getElementById('nav-dropdown');
  const overlay  = document.getElementById('nav-overlay');
  const navEl    = document.getElementById('nav');
  if (!burger || !dropdown) return;

  const navEmail = document.getElementById('nav-contact-email');
  if (navEmail) {
    const addr = 'alicewbrain' + '\u0040' + 'gmail.com';
    navEmail.textContent = addr;
    navEmail.href = 'mailto:' + addr;
  }

  function closeMenu() {
    dropdown.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    navEl.classList.remove('menu-open');
    if (overlay) overlay.classList.remove('open');
  }

  burger.addEventListener('click', () => {
    const open = dropdown.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    navEl.classList.toggle('menu-open', open);
    if (overlay) overlay.classList.toggle('open', open);
  });

  if (overlay) overlay.addEventListener('click', closeMenu);

  dropdown.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
})();

// ── VIDEO autoplay on scroll ───────────────────────────────────────
(function () {
  const iframe = document.getElementById('furucombo-video');
  if (!iframe) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !iframe.src) {
        iframe.src = iframe.dataset.src;
      }
    });
  }, { threshold: 0.4 });
  observer.observe(iframe);
})();

// ── NAV scroll behaviour ───────────────────────────────────────────
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const hero = document.getElementById('hero');
  let ticking = false;
  
  function update() {
    // On essay page (no #hero), use a fixed threshold instead
    const threshold = hero
      ? hero.offsetTop + hero.offsetHeight
      : 80;
    const scrollY = window.scrollY;
    
    if (scrollY > threshold) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  
  // Initial check
  update();
})();

// ── Email link ────────────────────────────────────────────────────
// ── EMAIL COPY FUNCTIONALITY ───────────────────────────────────────
(function () {
  const addr = 'alicewbrain' + '\u0040' + 'gmail.com';
  
  // Setup email elements
  const emails = [
    { el: document.getElementById('contact-email'), tooltip: document.getElementById('footer-email-tooltip') },
    { el: document.getElementById('nav-contact-email'), tooltip: document.getElementById('nav-email-tooltip') }
  ];
  
  emails.forEach(({ el, tooltip }) => {
    if (!el || !tooltip) return;
    
    el.href = 'mailto:' + addr;
    el.textContent = addr;
    
    // Skip hover effects on touch devices — they would override CSS underline
    const isTouch = window.matchMedia('(hover: none)').matches;
    
    if (!isTouch) {
      // Hover underline effect (desktop only)
      el.addEventListener('mouseenter', function() {
        el.style.textDecoration = 'underline';
        el.style.textDecorationColor = 'rgb(38,38,38)';
        el.style.textUnderlineOffset = '3px';
      });
      el.addEventListener('mouseleave', function() {
        el.style.textDecoration = 'none';
      });
    }
    
    // Copy to clipboard on click (desktop only — touch devices use native mailto)
    const copyHandler = function(e) {
      // Touch device: don't preventDefault, let mailto: open the email app
      if (window.matchMedia('(hover: none)').matches) return;
      
      e.preventDefault();
      navigator.clipboard.writeText(addr).then(() => {
        tooltip.textContent = 'Copied';
        tooltip.style.opacity = '1';
        setTimeout(() => {
          tooltip.textContent = 'Copy';
          tooltip.style.opacity = '';
        }, 2000);
      });
    };
    el.addEventListener('click', copyHandler);
    tooltip.addEventListener('click', copyHandler);
    
    // JS-based hover (more reliable than CSS sibling selector across the gap)
    if (!isTouch) {
      const wrap = el.parentElement;
      let hideTimer;
      const showTooltip = () => {
        clearTimeout(hideTimer);
        tooltip.style.opacity = '1';
        tooltip.style.pointerEvents = 'auto';
      };
      const hideTooltip = () => {
        hideTimer = setTimeout(() => {
          tooltip.style.opacity = '';
          tooltip.style.pointerEvents = '';
        }, 100);
      };
      el.addEventListener('mouseenter', showTooltip);
      el.addEventListener('mouseleave', hideTooltip);
      tooltip.addEventListener('mouseenter', showTooltip);
      tooltip.addEventListener('mouseleave', hideTooltip);
    }
  });
})();

// ── BACK TO TOP ────────────────────────────────────────────────────
(function () {
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    // Hover underline effect
    backToTop.addEventListener('mouseenter', function() {
      backToTop.style.textDecoration = 'underline';
      backToTop.style.textDecorationColor = 'rgb(38,38,38)';
      backToTop.style.textUnderlineOffset = '3px';
    });
    backToTop.addEventListener('mouseleave', function() {
      backToTop.style.textDecoration = 'none';
    });
    
    // Scroll to top on click
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

// ── WAVE BACKGROUND (canvas, boat-panel style) ─────────────────────
(function () {
  const cv  = document.getElementById('wave-canvas');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0;

  // yF spacing: dense at top (far), sparse at bottom (near) — perspective
  const wSpecs = [
    { yF:.45, aF:.003, wF:.40, seed:1.14, op:.10, s1:1.60, s2:2.20 },
    { yF:.36, aF:.004, wF:.46, seed:5.31, op:.14, s1:2.80, s2:4.20 },
    { yF:.43, aF:.006, wF:.53, seed:2.73, op:.19, s1:1.20, s2:1.80 },
    { yF:.52, aF:.009, wF:.61, seed:0.49, op:.26, s1:3.80, s2:5.60 },
    { yF:.63, aF:.013, wF:.70, seed:3.91, op:.34, s1:2.20, s2:3.20 },
    { yF:.77, aF:.018, wF:.81, seed:7.23, op:.28, s1:1.40, s2:2.40 },
    { yF:.90, aF:.022, wF:.93, seed:4.27, op:.20, s1:1.80, s2:2.80 },
  ];
  // Downward scroll speed (fraction of H per second)
  const SCROLL_SPEED = 0.018;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width  = W * dpr; cv.height = H * dpr;
    cv.style.width  = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let t0 = null;
  function frame(ts) {
    if (!t0) t0 = ts;
    const t = (ts - t0) / 1000;

    ctx.clearRect(0, 0, W, H);

    for (const s of wSpecs) {
      const amp = H * s.aF, wl = W * s.wF;
      // downward scroll within 30%~100% range, loops back to 30%
      const range = H * 0.55; // 30% to 100%
      const scrollOffset = (t * SCROLL_SPEED * H) % range;
      const baseY = H * 0.45 + ((H * (s.yF - 0.45) + scrollOffset) % range);
      // fade out near bottom
      const tPos = baseY / H;
      if (tPos > 1.0) continue;

      // Perspective: closer to bottom = larger amp, deeper color
      const perspective = Math.max(0, (tPos - 0.45) / 0.55); // 0 at top, 1 at bottom
      const pAmp = H * s.aF * (0.01 + perspective * perspective * 0.99);
      ctx.lineWidth = 0.15 + perspective * perspective * 2.5;      const fadeOp = tPos > 0.85
        ? s.op * (1 - (tPos - 0.85) / 0.15)
        : s.op * (0.06 + perspective * 0.94);
      if (fadeOp < 0.01) continue;

      ctx.strokeStyle = 'rgba(249,248,247,1)';
      ctx.lineCap = 'round';
      const pts = [];
      for (let x = -10; x <= W + 10; x += 8) {
        pts.push([x, baseY
          + Math.sin((x/wl)*Math.PI*2 + s.seed + t*s.s1)*pAmp
          + Math.sin((x/wl)*Math.PI*2*1.61 + s.seed*1.3 + t*s.s2)*pAmp*.30]);
      }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i][0], pts[i][1],
          (pts[i][0]+pts[i+1][0])/2, (pts[i][1]+pts[i+1][1])/2);
      }
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// ── BOAT PANELS ───────────────────────────────────────────────────
// Looks for boat panel canvases on the page (homepage uses bc1/bc2/bc3 across 3 cols;
// essay page uses essay-cover-canvas as a single wide cover). Each canvas runs its
// own boat loop independently.
(function () {
  // Homepage: 3 canvases, boat travels across all 3
  const homeIDs = ['bc1','bc2','bc3'];
  const homeCanvases = homeIDs.map(id => document.getElementById(id)).filter(Boolean);
  
  // Essay cover: standalone single canvas — boat loops across just this one
  const coverCanvas = document.getElementById('essay-cover-canvas');
  
  if (!homeCanvases.length && !coverCanvas) return;
  
  // Decide which set of canvases to drive in this loop
  const canvases = homeCanvases.length ? homeCanvases : [coverCanvas];
  const CYCLE  = 54;

  function resizeAll() {
    const dpr = window.devicePixelRatio || 1;
    canvases.forEach(cv => {
      const r = cv.parentElement.getBoundingClientRect();
      const cw = Math.round(r.width), ch = Math.round(r.height);
      if (cw < 4 || ch < 4) return;
      cv.width = cw * dpr; cv.height = ch * dpr;
      cv._cw = cw; cv._ch = ch;
    });
  }
  resizeAll();
  const ro = new ResizeObserver(resizeAll);
  canvases.forEach(cv => ro.observe(cv.parentElement));

  const wSpecs = [
    { yF:.18, aF:.004, wF:.45, seed:1.14, op:.12, s1:1.60, s2:2.20 },
    { yF:.24, aF:.005, wF:.50, seed:5.31, op:.16, s1:2.80, s2:4.20 },
    { yF:.31, aF:.007, wF:.56, seed:2.73, op:.22, s1:1.20, s2:1.80 },
    { yF:.40, aF:.011, wF:.64, seed:0.49, op:.32, s1:3.80, s2:5.60 },
    { yF:.55, aF:.017, wF:.75, seed:3.91, op:.46, s1:2.20, s2:3.20 },
    { yF:.76, aF:.026, wF:.92, seed:4.27, op:.58, s1:1.40, s2:2.40 },
  ];
  const BOAT_W = 2;

  // ── Wave drawing ───────────────────────────────────
  function drawWaves(ctx, W, H, panelOffsetX, t) {
    for (const s of wSpecs) {
      const amp = H * s.aF, wl = W * s.wF, baseY = H * s.yF;
      ctx.strokeStyle = 'rgba(249,248,247,' + s.op + ')';
      ctx.lineWidth = 0.9; ctx.lineCap = 'round';
      const pts = [];
      for (let x = -10; x <= W + 10; x += 8) {
        pts.push([x, baseY
          + Math.sin((x/wl)*Math.PI*2 + s.seed + t*s.s1)*amp
          + Math.sin((x/wl)*Math.PI*2*1.61 + s.seed*1.3 + t*s.s2)*amp*.30]);
      }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) {
        ctx.quadraticCurveTo(pts[i][0], pts[i][1],
          (pts[i][0]+pts[i+1][0])/2, (pts[i][1]+pts[i+1][1])/2);
      }
      ctx.stroke();
    }
  }

  // ── Wave Y at local x ──────────────────────────────
  function waveY(x, H, spec, t) {
    const wl = H * spec.wF, amp = H * spec.aF, baseY = H * spec.yF;
    return baseY
      + Math.sin((x/wl)*Math.PI*2 + spec.seed + t*.55)*amp
      + Math.sin((x/wl)*Math.PI*2*1.61 + spec.seed*1.3 + t*.82)*amp*.30;
  }

  // ── Paper boat ─────────────────────────────────────
  function drawBoat(ctx, x, y, angle, sc) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle); ctx.scale(sc, sc);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    function panel(pts, fillA) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = 'rgba(249,248,247,' + fillA + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(249,248,247,0.65)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    panel([[-44,-4],[1,0],[46,-2],[0,12]], 0.30);
    panel([[1,-19],[17,7],[0,12],[-16,6]], 0.22);
    panel([[1,-19],[-25,18],[0,12]], 0.58);
    panel([[1,-19],[25,19],[0,12]], 0.40);
    panel([[46,-2],[25,19],[0,12]], 0.48);
    panel([[-44,-4],[0,12],[-25,18]], 0.70);
    panel([[-25,18],[25,19],[0,12]], 0.35);
    ctx.restore();
  }

  // ── Draw one panel ─────────────────────────────────
  function drawPanel(cv, panelIndex, t) {
    const dpr = window.devicePixelRatio || 1;
    const ctx = cv.getContext('2d');
    const W = cv._cw || (cv.width/dpr);
    const H = cv._ch || (cv.height/dpr);
    const renderH = window.innerHeight * 0.40; // locked to original 40vh
    if (W < 4 || H < 4) return;

    const GRID_GAP = 32;
    const sceneW = canvases.reduce((sum, c) => sum + (c._cw || W), 0)
                 + GRID_GAP * (canvases.length - 1);
    const panelOffsetX = canvases.slice(0, panelIndex).reduce((sum, c) => {
      return sum + (c._cw || W) + GRID_GAP;
    }, 0);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, W, H);

    // 1. Water base mask
    const sp = wSpecs[BOAT_W];
    const wlm = W * sp.wF, ampm = renderH * sp.aF, bym = renderH * sp.yF;
    function maskY(x) {
      return bym
        + Math.sin((x/wlm)*Math.PI*2 + sp.seed + t*.55)*ampm
        + Math.sin((x/wlm)*Math.PI*2*1.61 + sp.seed*1.3 + t*.82)*ampm*.30;
    }
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-10, H + 2);
    for (let px = -10; px <= W + 10; px += 12) ctx.lineTo(px, maskY(px));
    ctx.lineTo(W + 10, H + 2); ctx.closePath();
    ctx.fillStyle = 'rgba(20,22,25,0.72)'; ctx.fill();
    ctx.restore();

    // 2. Wave lines on top
    drawWaves(ctx, W, renderH, panelOffsetX, t);

    // 3. Boat
    const bW = 74 * (renderH/280);
    const isMobile = window.innerWidth <= 900;
    const speed = sceneW / CYCLE; // px per second (desktop reference)
    const effectiveCycle = isMobile
      ? (W + 2*bW) / speed  // same px/s speed, shorter distance
      : CYCLE;
    const phase = (t / effectiveCycle) % 1;
    const boatSceneX = isMobile
      ? -bW + phase * (W + 2*bW)
      : -bW + phase * (sceneW + 2*bW);
    const boatLocalX = boatSceneX - (isMobile ? 0 : panelOffsetX);

    if (boatLocalX > -bW * 2 && boatLocalX < W + bW * 2) {
      const sc = renderH / 280;
      const bob = Math.sin(t * 1.4) * 1.2 * sc;
      const bY  = maskY(boatLocalX) - 14 * sc + bob;
      const slope = (maskY(boatLocalX + 8) - maskY(boatLocalX - 8)) / 16;
      const pitch = Math.atan(slope) * 0.35 + Math.sin(t * 1.4 + 0.4) * 0.02;

      // Clip to waterline
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-10, -2);
      for (let px = -10; px <= W + 10; px += 8) ctx.lineTo(px, maskY(px));
      ctx.lineTo(W + 10, -2); ctx.closePath();
      ctx.clip();

      ctx.globalAlpha = 1;
      drawBoat(ctx, boatLocalX, bY, pitch, sc);
      ctx.restore();
    }
  }

  let lastTs = null;
  let accT = 0;
  let scrolling = false;
  let scrollEndTimer = null;
  
  // Pause animation cleanly during touch scroll on mobile
  // (mobile viewport bar collapse triggers canvas resize, which can blank the canvas mid-frame)
  if ('ontouchstart' in window) {
    const onScroll = () => {
      scrolling = true;
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        scrolling = false;
        lastTs = null; // reset dt so resumed frame doesn't jump
      }, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
  }
  
  function bFrame(ts) {
    // During scroll: skip drawing entirely (avoid mid-resize garbage frames)
    if (scrolling || document.hidden) {
      requestAnimationFrame(bFrame);
      return;
    }
    if (lastTs === null) lastTs = ts;
    let dt = (ts - lastTs) / 1000;
    lastTs = ts;
    // Cap dt to prevent jumps after long pause
    if (dt > 0.1) dt = 0.1;
    accT += dt;
    canvases.forEach((cv, i) => drawPanel(cv, i, accT));
    requestAnimationFrame(bFrame);
  }
  requestAnimationFrame(bFrame);
})();

// ── ARTICLE TOC SCROLL SPY (essay page only) ───────────────────────
// Highlights the current section in the right-side TOC and smooth-scrolls
// when a TOC link is clicked. No-op if .article-toc is not on the page.
(function () {
  const toc = document.getElementById('article-toc');
  if (!toc) return;
  const links = toc.querySelectorAll('a[data-target]');
  const sections = [...links].map(a => document.getElementById(a.dataset.target)).filter(Boolean);
  if (!sections.length) return;

  // Smooth scroll on click (the browser default is fine because of html { scroll-behavior: smooth }
  // but we still preventDefault when JS-driven scroll is desired; keep default for now since
  // CSS scroll-margin-top handles the offset).

  // Highlight section currently in viewport
  function setActive(id) {
    links.forEach(a => {
      a.classList.toggle('active', a.dataset.target === id);
    });
  }

  // Use IntersectionObserver to track which section's H2 area is most visible.
  // rootMargin pulls the trigger zone toward the upper third of viewport so
  // the active state changes as the section header reaches that area.
  const observer = new IntersectionObserver((entries) => {
    // Find the entry that's most visible in the trigger zone
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible.length) {
      setActive(visible[0].target.id);
    }
  }, {
    // Trigger zone: top 30% to top 70% of viewport
    rootMargin: '-30% 0px -50% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });

  sections.forEach(s => observer.observe(s));

  // On page load, highlight the section matching the URL hash (if any),
  // otherwise the first section
  const initialHash = window.location.hash.slice(1);
  const initialId = sections.find(s => s.id === initialHash)?.id || sections[0].id;
  setActive(initialId);
  
  // Hide TOC when footer enters viewport (so it scrolls away with content)
  const footer = document.getElementById('footer');
  if (footer) {
    const footerObserver = new IntersectionObserver(([entry]) => {
      toc.classList.toggle('is-hidden', entry.isIntersecting);
    }, {
      // Trigger as soon as any part of footer enters viewport
      rootMargin: '0px 0px 0px 0px',
      threshold: 0
    });
    footerObserver.observe(footer);
  }
})();

/* ── Breadcrumb sticky detector ─────────────────────────────────── */
(() => {
  const wrap = document.querySelector('.breadcrumb-sticky');
  if (!wrap) return;
  // Place sentinel directly above wrap — when sentinel crosses below nav, wrap is stuck
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'height:1px;width:100%;pointer-events:none;';
  wrap.parentElement.insertBefore(sentinel, wrap);
  const io = new IntersectionObserver(([e]) => {
    const stuck = e.boundingClientRect.top < 64 && !e.isIntersecting;
    wrap.classList.toggle('is-stuck', stuck);
  }, {
    rootMargin: '-64px 0px 0px 0px',
    threshold: [0, 1]
  });
  io.observe(sentinel);
})();

/* ── i18n: language toggle + content swap ───────────────────────── */
(() => {
  // Detect initial language: URL ?lang= > localStorage > navigator.language
  function detectLang() {
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (urlLang === 'en' || urlLang === 'zh') return urlLang;
    const stored = localStorage.getItem('lang');
    if (stored === 'en' || stored === 'zh') return stored;
    const nav = (navigator.language || 'en').toLowerCase();
    return nav.startsWith('zh') ? 'zh' : 'en';
  }

  function applyLang(lang) {
    document.body.setAttribute('data-lang', lang);
    // Swap text for every [data-en][data-zh] element
    document.querySelectorAll('[data-en][data-zh]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text != null) el.textContent = text;
    });
    // Swap HTML for elements that contain nested markup
    document.querySelectorAll('[data-en-html][data-zh-html]').forEach(el => {
      const html = el.getAttribute('data-' + lang + '-html');
      if (html != null) el.innerHTML = html;
    });
    // Swap aria-label for elements with data-en-aria/data-zh-aria
    document.querySelectorAll('[data-en-aria][data-zh-aria]').forEach(el => {
      const val = el.getAttribute('data-' + lang + '-aria');
      if (val != null) el.setAttribute('aria-label', val);
    });
    // Swap meta content for SEO/social tags with data-en-content/data-zh-content
    document.querySelectorAll('meta[data-en-content][data-zh-content]').forEach(el => {
      const val = el.getAttribute('data-' + lang + '-content');
      if (val != null) el.setAttribute('content', val);
    });
    // Swap document title if it has i18n attrs on a <meta data-page-title>
    const titleEl = document.querySelector('title[data-en][data-zh]');
    if (titleEl) {
      const val = titleEl.getAttribute('data-' + lang);
      if (val != null) titleEl.textContent = val;
    }
    // Update button label: show the OTHER language (β design — what you can switch to)
    const labelEl = document.querySelector('.lang-toggle-label');
    if (labelEl) labelEl.textContent = lang === 'en' ? '繁中' : 'EN';
    // Update document <html lang>
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-Hant' : 'en');
    // Update internal links to carry ?lang= so navigation preserves choice
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      // Skip external/hash/mailto links
      if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
      // Skip already-tagged with different lang param? we just rewrite
      let url;
      try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      url.searchParams.set('lang', lang);
      a.setAttribute('href', url.pathname + url.search + url.hash);
    });
    // Persist
    try { localStorage.setItem('lang', lang); } catch (e) {}
    // Update URL silently (skip if sandboxed iframe blocks pushState/replaceState)
    try {
      const newUrl = new URL(location.href);
      newUrl.searchParams.set('lang', lang);
      history.replaceState(null, '', newUrl.pathname + newUrl.search + newUrl.hash);
    } catch (e) { /* sandboxed about:srcdoc — ignore */ }
  }

  const initial = detectLang();
  applyLang(initial);

  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-lang') || 'en';
      const newLang = current === 'en' ? 'zh' : 'en';
      
      // Find an anchor element in current viewport to preserve scroll position
      // (DOM heights change between languages, so absolute scrollY is unreliable)
      const candidates = document.querySelectorAll('h1, h2, h3, p, .bpanel, .boat-strip-simple, .card, li');
      const vpMid = window.innerHeight / 2;
      let anchor = null;
      let anchorOffset = 0;
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        // Element intersects viewport
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          // Prefer element closest to viewport top (more stable)
          if (anchor === null || Math.abs(rect.top) < Math.abs(anchorOffset)) {
            anchor = el;
            anchorOffset = rect.top;
          }
        }
      }
      
      applyLang(newLang);
      
      // Restore: scroll so the anchor element returns to its prior offset from viewport top
      if (anchor) {
        requestAnimationFrame(() => {
          const newRect = anchor.getBoundingClientRect();
          const delta = newRect.top - anchorOffset;
          window.scrollBy({ top: delta, behavior: 'instant' });
        });
      }
    });
  }
})();

/* ── Hide-on-scroll-down / show-on-scroll-up for nav (homepage only) ── */
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastY = window.scrollY;
  let ticking = false;
  const threshold = 8;

  function onScroll() {
    const y = window.scrollY;
    const diff = y - lastY;
    if (Math.abs(diff) < threshold) { ticking = false; return; }
    if (y < 80) {
      nav.classList.remove('nav-hidden');
    } else if (diff > 0) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
})();

/* ── Article close button: click + ESC key → history.back() ──────── */
(() => {
  const closeBtn = document.getElementById('article-close');
  if (!closeBtn) return;
  function close() {
    if (window.history.length > 1) {
      history.back();
    } else {
      // No previous page (direct deep link) → go to homepage
      window.location.href = '/';
    }
  }
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') close();
  });
})();

/* ── GA4 event tracking ───────────────────────────────────────── */
(function() {
  const track = (eventName, params = {}) => {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  };

  // 1. Email copy click
  document.querySelectorAll('#contact-email').forEach(el => {
    el.addEventListener('click', () => {
      track('email_copy', { location: 'footer' });
    });
  });
  document.querySelectorAll('#footer-email-tooltip').forEach(el => {
    el.addEventListener('click', () => {
      track('email_copy', { location: 'footer_tooltip' });
    });
  });

  // 2. Boat cards (3 desktop + 2 mobile strips)
  document.querySelectorAll('.bpanel, .boat-strip-simple').forEach(el => {
    el.addEventListener('click', () => {
      const titleEl = el.querySelector('.bpanel-title-row span:first-child, .boat-strip-title');
      const partEl = el.querySelector('.bpanel-overlay-part, .boat-strip-part');
      const title = titleEl ? titleEl.textContent.trim() : '';
      const part = partEl ? partEl.textContent.trim() : '';
      track('boat_card_click', { article: part + ' ' + title });
    });
  });

  // 3. Social icons
  document.querySelectorAll('.about-socials a').forEach(el => {
    el.addEventListener('click', () => {
      const href = el.getAttribute('href') || '';
      const platform = href.includes('linkedin') ? 'LinkedIn' : 
                       href.includes('x.com') ? 'X' : 'other';
      track('social_click', { platform });
    });
  });

  // 4. External links (Furucombo + sources)
  document.querySelectorAll('a[target="_blank"]').forEach(el => {
    el.addEventListener('click', () => {
      const href = el.getAttribute('href') || '';
      const labelEl = el.querySelector('[data-en]') || el;
      const label = (labelEl.getAttribute('data-en') || labelEl.textContent || '').trim().substring(0, 100);
      track('external_link_click', { url: href, label });
    });
  });

  // 5. Language toggle
  document.querySelectorAll('.lang-toggle, [data-lang-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const newLang = document.documentElement.getAttribute('lang') === 'en' ? 'zh-Hant' : 'en';
      track('language_toggle', { to: newLang });
    });
  });

  // 6. Back to top
  document.querySelectorAll('.back-to-top').forEach(el => {
    el.addEventListener('click', () => {
      track('back_to_top_click');
    });
  });
})();

/* ── View Transition: boat card → article cover morphing ────────── */
/* Only #1 card morphs into article cover (its shape matches the cover region).
   #2 and #3 are smaller / strip-shaped, so morph distorts visually — they
   instead use the default root fade transition. */
(function() {
  const allCards = document.querySelectorAll('.bpanel[href*="essay.html"], .boat-strip-simple[href*="essay.html"]');
  
  // #1 card: doesn't link to #article-2 or #article-3 (lang= query param tolerant)
  function isCard1(card) {
    const href = card.getAttribute('href') || '';
    return !href.includes('#article-2') && !href.includes('#article-3');
  }
  
  allCards.forEach(card => {
    card.addEventListener('click', () => {
      // Clear from all cards first
      allCards.forEach(c => { c.style.viewTransitionName = ''; });
      // Only #1 morphs into cover
      if (isCard1(card)) {
        card.style.viewTransitionName = 'boat-cover';
      }
    });
  });
})();

/* When returning from essay.html (back nav), morph article cover back to #1 card only.
   #2 and #3 get the default root fade — their shapes don't match cover well. */
(function() {
  // Only run on portfolio page
  if (document.body.classList.contains('essay-page')) return;
  
  // Check if we came back from essay (via referrer)
  const cameFromEssay = document.referrer && document.referrer.includes('essay.html');
  if (!cameFromEssay) return;
  
  // Only morph if coming back to article-1 (or no hash = #1)
  const refUrl = new URL(document.referrer);
  const hash = refUrl.hash || '#article-1';
  if (hash !== '#article-1') return; // skip morph for #2/#3 — use default fade
  
  // Find #1 card (the one not linking to #article-2 or #article-3)
  const allCards = document.querySelectorAll('.bpanel[href*="essay.html"], .boat-strip-simple[href*="essay.html"]');
  const card = [...allCards].find(c => {
    const href = c.getAttribute('href') || '';
    return !href.includes('#article-2') && !href.includes('#article-3');
  });
  if (card) {
    card.style.viewTransitionName = 'boat-cover';
    setTimeout(() => { card.style.viewTransitionName = ''; }, 600);
  }
})();
