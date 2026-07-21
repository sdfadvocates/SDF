/* =============================================
   SDF Associates — Scripts
   Clean, production-ready, no dead code
   ============================================= */

(function () {
    'use strict';

    // ─── Mobile Menu ───────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
            mobileMenuBtn.setAttribute('aria-expanded', isActive);
            // Prevent body scroll when menu is open
            body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close menu on nav link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            });
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            }
        });
    }


    // ─── Header Scroll Effect ──────────────────
    const header = document.querySelector('header');
    let lastScroll = 0;

    if (header) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 60) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = scrollY;
        }, { passive: true });
    }


    // ─── Scroll Spy (Active Nav Link) ──────────
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navAnchors.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }

    if (sections.length && navAnchors.length) {
        window.addEventListener('scroll', updateActiveLink, { passive: true });
        updateActiveLink();
    }


    // ─── Smooth Scroll ─────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerOffset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });


    // ─── Reveal on Scroll (IntersectionObserver) ──
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }


    // ─── 3D Services Slider ──────────────────────
    const track = document.querySelector('.services-slider-track');
    const allSlides = document.querySelectorAll('.service-slide');
    const dots = document.getElementById('services-dots');
    const counter = document.getElementById('services-current');

    if (track && allSlides.length) {
        let idx = 0, perView = innerWidth > 768 ? 3 : 1, timer;
        const total = allSlides.length;
        const maxIdx = () => Math.max(0, total - perView);

        function go(i, animate) {
            idx = i < 0 ? maxIdx() : i > maxIdx() ? 0 : i;
            track.style.transition = animate === false ? 'none' : 'transform .6s cubic-bezier(.22,.68,0,1)';
            track.style.transform = `translateX(-${idx * (100 / perView)}%)`;

            allSlides.forEach((s, n) => {
                s.className = 'service-slide';
                if (perView === 1) {
                    if (n === idx) s.classList.add('slide-active');
                    else if (n === idx - 1 || (!idx && n === total - 1)) s.classList.add('slide-prev');
                    else if (n === idx + 1 || (idx === total - 1 && !n)) s.classList.add('slide-next');
                } else {
                    if (n === idx + 1 && n < total) s.classList.add('slide-active');
                    else if (n === idx) s.classList.add('slide-prev');
                    else if (n === idx + 2 && n < total) s.classList.add('slide-next');
                }
            });

            if (dots) dots.querySelectorAll('.slider-dot').forEach((d, n) =>
                d.classList.toggle('dot-active', n === idx));
            if (counter) counter.textContent = perView === 1 ? idx + 1 : Math.min(idx + 2, total);
        }

        // Build dots
        if (dots) {
            dots.innerHTML = Array.from({ length: total }, (_, i) =>
                `<button class="slider-dot${i ? '' : ' dot-active'}" aria-label="Slide ${i + 1}"></button>`
            ).join('');
            dots.addEventListener('click', e => {
                const d = e.target.closest('.slider-dot');
                if (d) { go([...dots.children].indexOf(d)); play(); }
            });
        }

        // Arrows
        document.getElementById('services-prev')?.addEventListener('click', () => { go(idx - 1); play(); });
        document.getElementById('services-next')?.addEventListener('click', () => { go(idx + 1); play(); });

        // Touch swipe
        let tx = 0;
        track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const dx = tx - e.changedTouches[0].clientX;
            if (Math.abs(dx) > 50) { go(idx + (dx > 0 ? 1 : -1)); play(); }
        }, { passive: true });

        // Auto-play
        const play = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 5000); };
        const wrap = document.querySelector('.services-slider-wrapper');
        if (wrap) {
            wrap.addEventListener('mouseenter', () => clearInterval(timer));
            wrap.addEventListener('mouseleave', play);
        }

        // Resize
        addEventListener('resize', () => {
            const nv = innerWidth > 768 ? 3 : 1;
            if (nv !== perView) { perView = nv; go(Math.min(idx, maxIdx()), false); }
        });

        // Icon pulse
        allSlides.forEach(s => {
            const c = s.querySelector('.service-card'), ic = c?.querySelector('.service-icon');
            if (c && ic) {
                c.addEventListener('mouseenter', () => ic.classList.add('pulse'));
                c.addEventListener('animationend', () => ic.classList.remove('pulse'), true);
            }
        });

        go(0, false);
        play();
    }

})();

