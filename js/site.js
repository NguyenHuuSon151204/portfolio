/* =========================================================
   GAME DESIGNER PORTFOLIO — Interactions (Vanilla ES6)
   Effects: Smooth scroll • Sticky nav • Modal (focus trap)
   Theme toggle • Reveal • Lazy • Neon progress • Parallax
   Card ripple • Cursor trail (canvas) • Konami synthwave
   ========================================================= */

(() => {
    const d = document;
    const body = d.body;
    const html = d.documentElement;

    /* ---------- Utilities ---------- */
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const debounce = (fn, wait = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait) } };
    const resolvePath = (p) => (typeof p === 'string' ? p.replace(/^~\//, '/') : p);

    const isModelViewerSupported = () =>
        typeof window.customElements !== 'undefined' && !!window.customElements.get('model-viewer');

    /* ---------- Theme ---------- */
    function initTheme() {
        const saved = localStorage.getItem('theme');
        const useDark = saved ? saved === 'dark' : true;
        html.classList.toggle('theme-dark', useDark);
    }
    function toggleTheme() {
        const nowDark = !html.classList.contains('theme-dark');
        html.classList.toggle('theme-dark', nowDark);
        localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    }

    /* ---------- Smooth scroll ---------- */
    function initSmoothScroll() {
        if (prefersReduce) return;
        d.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                const hash = a.getAttribute('href'); if (!hash || hash === '#') return;
                const target = d.querySelector(hash); if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ---------- Sticky hero nav ---------- */
    function initStickyHeroNav() {
        const nav = d.querySelector('.hero-nav');
        const card = d.querySelector('.hero-card');
        if (!nav || !card) return;
        const onScroll = () => {
            const top = card.getBoundingClientRect().top;
            nav.classList.toggle('is-stuck', top <= 8);
        };
        onScroll();
        window.addEventListener('scroll', debounce(onScroll, 50), { passive: true });
        window.addEventListener('resize', debounce(onScroll, 120));
    }

    /* ---------- Neon scroll progress bar ---------- */
    function initScrollProgress() {
        if (d.getElementById('scrollProgress')) return;
        const bar = d.createElement('div'); bar.id = 'scrollProgress'; d.body.appendChild(bar);
        const update = () => {
            const h = html.scrollHeight - window.innerHeight;
            const p = h > 0 ? (window.scrollY / h) * 100 : 0;
            bar.style.width = `${p}%`;
        };
        update();
        window.addEventListener('scroll', debounce(update, 16), { passive: true });
        window.addEventListener('resize', debounce(update, 120));
    }

    /* ---------- Parallax hero & card ripple ---------- */
    function initParallaxAndRipple() {
        const hero = d.querySelector('.hero-card');
        const cards = d.querySelectorAll('.prod-card');

        const onMove = (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            d.documentElement.style.setProperty('--mx', x.toFixed(3));
            d.documentElement.style.setProperty('--my', y.toFixed(3));
        };
        window.addEventListener('mousemove', onMove);

        // ripple radar per-card
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const rx = ((e.clientX - r.left) / r.width) * 100;
                const ry = ((e.clientY - r.top) / r.height) * 100;
                card.style.setProperty('--rpx', `${rx}%`);
                card.style.setProperty('--rpy', `${ry}%`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.removeProperty('--rpx');
                card.style.removeProperty('--rpy');
            });
            // keyboard Space open support (HTML already has Enter)
            card.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    /* ---------- Modal + focus trap ---------- */
    const modal = d.getElementById('productModal');
    const pmTitle = d.getElementById('pmTitle');
    const pmDesc = d.getElementById('pmDesc');
    const pmModel = d.getElementById('pmModel');
    const pmVideo = d.getElementById('pmVideo');
    let lastFocus = null;

    const mapping = {
        astronaut: {
            title: 'Astronaut Back',
            desc: '2D platform shooter focused on finding your way and upgrading as you progress.',
            model: '~/models/guard-lowpoly.glb',
            video: '~/videos/Astronaut Back.mp4'
        },
        daccong: {
            title: 'Đặc Công 1975 — Prototype',
            desc: 'Stealth + puzzle prototype focusing on rhythm and emotional clarity.',
            model: '~/models/guard-lowpoly.glb',
            video: '~/videos/dc1975-teaser.mp4'
        },
        shipper: {
            title: 'Bánh Mì Xin Chào — Arcade Racing',
            desc: 'Arcade racing with upgrade economy and drift-lite handling.',
            model: '~/models/Dream.glb',
            video: '~/videos/shipper-gameplay.mp4'
        },
        kaito: {
            title: 'Kaito Steal — WebGL Puzzle',
            desc: 'Heist-puzzle micro levels with readable telegraphing.',
            model: '~/models/guard-lowpoly.glb',
            video: '~/videos/demo.mp4'
        }
    };

    function focusablesIn(el) {
        return Array.from(el.querySelectorAll(
            'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        )).filter(n => !n.hasAttribute('disabled') && !n.getAttribute('aria-hidden'));
    }
    function trapFocus(e) {
        if (!modal.classList.contains('is-open') || e.key !== 'Tab') return;
        const f = focusablesIn(modal); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function openProduct(id) {
        // Map id -> URL trang chi tiết (bạn đặt đúng route của bạn)
        const routes = {
            astronaut: '/Portfolio/astronaut',
            daccong: '/Portfolio/daccong',   // ví dụ: /Portfolio/Detail/daccong cũng được
            shipper: '/Portfolio/shipper',
            banhmi: '/Portfolio/banhmi',
            kaito: '/Portfolio/kaito-steal'
        };
        const url = routes[id] || routes.daccong;

        // Mở tab mới (an toàn với noopener)
        window.open(url, '_blank', 'noopener');
    }

    function closeProduct() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        if (pmVideo) pmVideo.pause();
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }
    window.openProduct = openProduct;
    window.closeProduct = closeProduct;

    function toggleGallery(gridId, btn) {
        const grid = d.getElementById(gridId);
        if (!grid) return;
        const isExpanded = grid.classList.toggle('is-expanded');
        btn.textContent = isExpanded ? 'Show Less' : 'View More UI Designs';
    }
    window.toggleGallery = toggleGallery;

    function toggleActivities() {
        const extra = d.getElementById('activitiesExtra');
        const btn = d.getElementById('activitiesToggleBtn');
        if (!extra || !btn) return;
        const isVisible = extra.style.display !== 'none';
        extra.style.display = isVisible ? 'none' : 'block';
        btn.innerHTML = isVisible
            ? 'View All Photos <i class="fas fa-chevron-down"></i>'
            : 'Show Less <i class="fas fa-chevron-up"></i>';
    }
    window.toggleActivities = toggleActivities;

    function toggleActivitiesV2() {
        const items = d.querySelectorAll('.activities-extra-item');
        const btn = d.getElementById('activitiesToggleBtn');
        if (!items.length || !btn) return;
        
        const isHidden = items[0].style.display === 'none';
        items.forEach(item => {
            item.style.display = isHidden ? 'block' : 'none';
        });
        
        btn.innerHTML = isHidden
            ? 'Show Less <i class="fas fa-chevron-up"></i>'
            : 'View All Photos <i class="fas fa-chevron-down"></i>';
    }
    window.toggleActivitiesV2 = toggleActivitiesV2;

    function initModalBindings() {
        if (!modal) return;
        modal.addEventListener('mousedown', (e) => { if (e.target === modal) closeProduct(); });
        d.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeProduct();
            trapFocus(e);
        });
    }

    /* ---------- Lazy-load ---------- */
    function lazyEnhance() {
        d.querySelectorAll('img:not([loading])').forEach(img => {
            img.setAttribute('loading', 'lazy'); img.setAttribute('decoding', 'async');
        });
        d.querySelectorAll('video').forEach(v => { v.setAttribute('preload', 'metadata'); });
    }

    /* ---------- Reveal ---------- */
    function initReveal() {
        const targets = [
            ...d.querySelectorAll('.section'),
            ...d.querySelectorAll('.prod-card'),
            ...d.querySelectorAll('.art-grid > *'),
            ...d.querySelectorAll('.profile-photo img'),
            ...d.querySelectorAll('.hero-right img')
        ];
        targets.forEach(el => el.classList.add('reveal'));
        if (prefersReduce) { targets.forEach(el => el.classList.add('in')); return; }
        const io = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in')),
            { threshold: 0.15 }
        );
        targets.forEach(el => io.observe(el));
    }

    /* ---------- Theme bindings / shortcuts ---------- */
    function initThemeToggle() {
        const brand = d.querySelector('.brand');
        d.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 't' && !e.altKey && !e.ctrlKey && !e.metaKey) toggleTheme(); });
        brand && brand.addEventListener('dblclick', toggleTheme);

        // Toggle grid intensity with "g"
        d.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'g') body.classList.toggle('grid-strong');
        });
    }

    /* ---------- Cursor trail (canvas neon particles) ---------- */
    function initCursorTrail() {
        if (prefersReduce) return;
        const canvas = d.createElement('canvas');
        canvas.id = 'neonTrail';
        Object.assign(canvas.style, {
            position: 'fixed', inset: '0', zIndex: '-5', pointerEvents: 'none', mixBlendMode: 'screen'
        });
        d.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', debounce(onResize, 120));

        const particles = [];
        let mouse = { x: w / 2, y: h / 2 };

        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; spawn(8); });

        function spawn(n = 6) {
            for (let i = 0; i < n; i++) {
                particles.push({
                    x: mouse.x, y: mouse.y,
                    vx: (Math.random() - 0.5) * 1.6,
                    vy: (Math.random() - 0.5) * 1.6,
                    life: 1, decay: 0.02 + Math.random() * 0.02,
                    size: 2 + Math.random() * 2,
                    hue: Math.random() < .5 ? 195 : 270  // cyan/purple
                });
            }
        }

        function step() {
            ctx.clearRect(0, 0, w, h);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy; p.life -= p.decay;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                const alpha = Math.max(p.life, 0);
                ctx.beginPath();
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
                const c = `hsla(${p.hue},100%,60%,`;
                grad.addColorStop(0, `${c}${0.45 * alpha})`);
                grad.addColorStop(1, `${c}0)`);
                ctx.fillStyle = grad;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(step);
        }
        let raf = requestAnimationFrame(step);

        // stop if page hidden
        d.addEventListener('visibilitychange', () => {
            if (d.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(step);
        });
    }

    /* ---------- Model-viewer fallback ---------- */
    function modelViewerFallback() {
        if (isModelViewerSupported()) return;
        d.querySelectorAll('model-viewer').forEach(mv => mv.style.display = 'none');
    }

    /* ---------- Konami code → synthwave palette ---------- */
    function initKonami() {
        const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let idx = 0;
        d.addEventListener('keydown', (e) => {
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (k === seq[idx] || (seq[idx].length === 1 && k === seq[idx])) {
                idx++;
                if (idx === seq.length) {
                    idx = 0;
                    // toggle synthwave mode by flipping theme colors temporarily
                    html.classList.toggle('synthwave');
                    if (html.classList.contains('synthwave')) {
                        html.style.setProperty('--primary', '#ff6ad5');
                        html.style.setProperty('--accent', '#00f5d4');
                    } else {
                        // restore from theme
                        initTheme();
                    }
                }
            } else { idx = 0; }
        });
    }

    /* ---------- Back to top ---------- */
    function initBackToTop() {
        const btn = d.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', debounce(() => {
            btn.classList.toggle('show', window.scrollY > 500);
        }, 100));
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Init ---------- */
    function init() {
        initTheme();
        initSmoothScroll();
        initStickyHeroNav();
        initScrollProgress();
        initBackToTop();
        initParallaxAndRipple();
        initModalBindings();
        initThemeToggle();
        initReveal();
        lazyEnhance();
        modelViewerFallback();
        initKonami();
        initCursorTrail();
    }

    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
    else init();
})();
/* =========================================================
   ✦ BACKGROUND PARTICLE FIELD + HALO ✦
   ========================================================= */
function initBackgroundFX() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Tạo scene container
    const scene = document.createElement('div');
    scene.id = 'bg-scene';
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    scene.appendChild(canvas);
    // Explicitly set z-index to stay way back
    scene.style.zIndex = '-10';
    document.body.prepend(scene);

    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        particles = generateParticles();
    }

    function generateParticles() {
        const arr = [];
        const count = Math.min(140, Math.floor(w * h / 16000)); // adaptive density
        for (let i = 0; i < count; i++) {
            arr.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2 + 0.5,
                s: Math.random() * 0.6 + 0.2, // speed
                a: Math.random() * 2 * Math.PI,
                hue: Math.random() < 0.5 ? 195 : 280
            });
        }
        return arr;
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (let p of particles) {
            p.x += Math.cos(p.a) * p.s * 0.5;
            p.y += Math.sin(p.a) * p.s * 0.5;
            p.a += 0.002;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
            g.addColorStop(0, `hsla(${p.hue},100%,60%,0.7)`);
            g.addColorStop(1, `hsla(${p.hue},100%,60%,0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
}
initBackgroundFX();
