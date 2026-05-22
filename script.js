/* =========================================================
   AI HOUSE BUCHAREST — Landing JS
   - Countdown timer (target date from data-target attr)
   - Mobile menu toggle
   - Header scroll state
   For Elementor: each block here can be replaced by a
   widget (Countdown widget, Nav Menu, sticky header) — JS
   is kept dependency-free and stand-alone.
   ========================================================= */

(function () {
    "use strict";

    // ===== EASTER EGG — styled console banner for curious devs =====
    // Shows up whenever someone opens DevTools (Inspect / View Source).
    // %c lets us apply CSS to the message, including background, padding,
    // border-radius, etc. — works in Chrome, Firefox, Safari, Edge.
    console.log(
        "%c ▲ made with ❤️ by ZUP! ",
        "background:#03D777;color:#000;padding:12px 24px;border-radius:8px;" +
        "font-family:Poppins,system-ui,sans-serif;font-weight:700;" +
        "font-size:20px;letter-spacing:1px;" +
        "text-shadow:0 1px 0 rgba(255,255,255,0.25);"
    );
    console.log(
        "%cCurious? Say hello → contact@zup.digital",
        "color:rgba(255,255,255,0.7);font-family:Poppins,system-ui,sans-serif;" +
        "font-size:13px;padding:6px 0 14px;"
    );

    // ---------- LOW-END DEVICE DETECTION ----------
    // Heuristic: <4 GB RAM or <4 CPU cores → strip expensive effects.
    // Adds `.perf-lite` on <html> for CSS to gate on.
    var deviceMemory = navigator.deviceMemory || 8;
    var hwConcurrency = navigator.hardwareConcurrency || 8;
    if (deviceMemory < 4 || hwConcurrency < 4) {
        document.documentElement.classList.add("perf-lite");
    }

    // ---------- PAUSE OFF-SCREEN ANIMATIONS ----------
    // Animations that run on a constant timer (aurora is fixed and always
    // on-screen, but the CTA cycle, Bolt-perk breathing and chip-dot pulse
    // keep burning frames after they scroll out of view). Pause them when
    // not in the viewport via IntersectionObserver toggling a class.
    if ("IntersectionObserver" in window) {
        var pauseTargets = document.querySelectorAll(
            ".hover-gradient-cta, .zup-credit, .expect-perk, .location-chip, .hero-countdown-livedot"
        );
        if (pauseTargets.length) {
            var pauseObserver = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    entries[i].target.classList.toggle(
                        "is-offscreen",
                        !entries[i].isIntersecting
                    );
                }
            }, { threshold: 0 });

            for (var p = 0; p < pauseTargets.length; p++) {
                pauseObserver.observe(pauseTargets[p]);
            }
        }
    }

    // ---------- COUNTDOWN ----------
    var timerEl = document.getElementById("countdown-timer");
    if (timerEl) {
        var target = new Date(timerEl.getAttribute("data-target")).getTime();
        var daysEl = document.getElementById("cd-days");
        var hoursEl = document.getElementById("cd-hours");
        var minutesEl = document.getElementById("cd-minutes");
        var secondsEl = document.getElementById("cd-seconds");

        function pad(n) { return n < 10 ? "0" + n : "" + n; }

        function tick() {
            var now = Date.now();
            var diff = target - now;
            if (diff <= 0) {
                daysEl.textContent = "00";
                hoursEl.textContent = "00";
                minutesEl.textContent = "00";
                secondsEl.textContent = "00";
                return;
            }
            var d = Math.floor(diff / (1000 * 60 * 60 * 24));
            var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            var m = Math.floor((diff / (1000 * 60)) % 60);
            var s = Math.floor((diff / 1000) % 60);
            daysEl.textContent = pad(d);
            hoursEl.textContent = pad(h);
            minutesEl.textContent = pad(m);
            secondsEl.textContent = pad(s);
        }

        tick();
        setInterval(tick, 1000);
    }

    // ---------- MOBILE NAV TOGGLE ----------
    var header = document.getElementById("site-header");
    var toggle = document.getElementById("navToggle");
    if (header && toggle) {
        toggle.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });

        // Close nav when a link is clicked
        header.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                header.classList.remove("is-open");
            });
        });
    }

    // Header keeps its CSS-defined Liquid Glass background — no JS override.

    // ---------- FADE-IN ON SCROLL ----------
    // The initial hidden state is applied via CSS gated by `html.js`
    // (flag set by an inline script in <head>, before first paint).
    // Here we only set up the observer that flips `is-visible` when a
    // section scrolls into view.
    var fadeInEls = document.querySelectorAll(".fade-in");
    if (fadeInEls.length) {
        if ("IntersectionObserver" in window) {
            var fadeInObserver = new IntersectionObserver(function (entries, obs) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) {
                        entries[i].target.classList.add("is-visible");
                        // One-shot reveal — stop observing once done
                        obs.unobserve(entries[i].target);
                    }
                }
            }, {
                threshold: 0.10,
                rootMargin: "0px 0px -80px 0px"
            });

            for (var j = 0; j < fadeInEls.length; j++) {
                fadeInObserver.observe(fadeInEls[j]);
            }
        } else {
            // No IntersectionObserver — reveal everything immediately
            for (var k = 0; k < fadeInEls.length; k++) {
                fadeInEls[k].classList.add("is-visible");
            }
        }
    }

    // ---------- TIMELINE RAIL FILL ----------
    // Grows the green fill of the "What to expect" timeline as the user
    // scrolls through the section.
    //
    // Math (mirrors framer-motion useScroll with offset
    //       ["start 10%", "end 50%"]):
    //   progress = 0 when timeline.top  is at viewport * 0.10
    //   progress = 1 when timeline.bottom is at viewport * 0.50
    //
    // Total scroll range (in pixels of rect.top change) =
    //   rect.height - viewport * 0.40
    var timeline = document.getElementById("timeline");
    var railFill = document.getElementById("timeline-rail-fill");
    if (timeline && railFill) {
        var ticking = false;

        function updateTimelineFill() {
            var rect = timeline.getBoundingClientRect();
            var vh = window.innerHeight || document.documentElement.clientHeight;

            var startPos = vh * 0.10;
            var endPos = vh * 0.50;
            var totalRange = rect.height - (vh - endPos) - startPos;

            // If the timeline is shorter than the scroll range, just fill it
            if (totalRange <= 0) {
                railFill.style.height = rect.height + "px";
                return;
            }

            var scrolledPast = startPos - rect.top;
            var progress = scrolledPast / totalRange;
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;

            railFill.style.height = (rect.height * progress) + "px";
        }

        function onTimelineScroll() {
            if (!ticking) {
                requestAnimationFrame(function () {
                    updateTimelineFill();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener("scroll", onTimelineScroll, { passive: true });
        window.addEventListener("resize", updateTimelineFill);
        // Initial render
        updateTimelineFill();
    }

    // ---------- SPONSORS: STICKY HORIZONTAL SCROLL (mobile-only) ----------
    // On phones, the sponsors section is 260vh tall and its .sponsors-content
    // child is position:sticky. As the user scrolls the PAGE vertically
    // through that section, JS translates .sponsors-grid horizontally
    // by a matching amount. End result: vertical scroll input feels like
    // it's driving a horizontal sponsor reel ("scrolly-telling" pattern).
    //
    // Dots: clicking jumps the PAGE scroll to the Y position that puts
    // that sponsor card in focus.
    //
    // Desktop is unaffected — grid stays a 4-col flex row, JS short-circuits.
    var sponsorsSection = document.getElementById("sponsors");
    var sponsorsGrid = document.getElementById("sponsorsGrid");
    var sponsorsDots = document.querySelectorAll(".sponsors-dot");

    if (sponsorsSection && sponsorsGrid && sponsorsDots.length) {
        var sponsorCards = sponsorsGrid.querySelectorAll(".sponsor-card");
        var isMobileQuery = window.matchMedia("(max-width: 768px)");
        var sponsorsTicking = false;

        function isMobileNow() { return isMobileQuery.matches; }

        function updateSponsorsSticky() {
            if (!isMobileNow()) {
                // Desktop: ensure no leftover transform from previous mobile session
                sponsorsGrid.style.transform = "";
                return;
            }

            var rect = sponsorsSection.getBoundingClientRect();
            var sectionHeight = sponsorsSection.offsetHeight;
            var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            var scrollableHeight = sectionHeight - viewportHeight;
            if (scrollableHeight <= 0) return;

            // -rect.top = pixels scrolled past the section's top edge
            var scrolled = -rect.top;
            var progress = scrolled / scrollableHeight;
            if (progress < 0) progress = 0;
            else if (progress > 1) progress = 1;

            // Horizontal distance the grid needs to travel so all cards
            // come into view (track width minus what's already visible).
            var trackWidth = sponsorsGrid.scrollWidth;
            var visibleWidth = sponsorsGrid.parentElement
                ? sponsorsGrid.parentElement.clientWidth
                : window.innerWidth;
            var maxTranslate = Math.max(0, trackWidth - visibleWidth);
            sponsorsGrid.style.transform =
                "translate3d(" + (-progress * maxTranslate).toFixed(2) + "px, 0, 0)";

            // Active dot ≈ card closest to current progress slice
            var activeIndex = Math.round(progress * (sponsorCards.length - 1));
            sponsorsDots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === activeIndex);
            });
        }

        // Dot click → jump page scroll to the Y position that focuses that card
        sponsorsDots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (!isMobileNow()) return;
                if (!sponsorCards.length) return;
                var targetProgress = index / (sponsorCards.length - 1);
                var sectionTop = sponsorsSection.getBoundingClientRect().top + window.scrollY;
                var sectionHeight = sponsorsSection.offsetHeight;
                var viewportHeight = window.innerHeight;
                var targetY = sectionTop + targetProgress * (sectionHeight - viewportHeight);
                window.scrollTo({ top: targetY, behavior: "smooth" });
            });
        });

        window.addEventListener("scroll", function () {
            if (sponsorsTicking) return;
            sponsorsTicking = true;
            requestAnimationFrame(function () {
                updateSponsorsSticky();
                sponsorsTicking = false;
            });
        }, { passive: true });

        window.addEventListener("resize", updateSponsorsSticky);
        // Initial paint
        updateSponsorsSticky();
    }

    // ---------- TIMELINE: ACTIVE NUMBER ON SCROLL ----------
    // When a timeline item's center crosses a "reading zone" near the top
    // of the viewport, mark it active so its number turns white.
    var timelineItems = document.querySelectorAll(".timeline-item");
    if (timelineItems.length && "IntersectionObserver" in window) {
        // The rootMargin defines a thin band high in the viewport. An item
        // is "active" while its marker (sticky at top:140px) sits inside that band.
        var activeObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                entries[i].target.classList.toggle("is-active", entries[i].isIntersecting);
            }
        }, {
            // Active zone: roughly viewport top down to 50% — matches where the
            // sticky marker stops, so the number lights up while you're reading it.
            rootMargin: "-15% 0px -50% 0px",
            threshold: 0
        });

        for (var t = 0; t < timelineItems.length; t++) {
            activeObserver.observe(timelineItems[t]);
        }
    }

    // ---------- BOLT PERK: PRESS-TO-REVEAL + CONFETTI ----------
    // Click the cover → burst brand-green confetti, then reveal the
    // actual Bolt callout. One-shot (no re-cover after reveal).
    var perkReveal = document.getElementById("boltPerk");
    var perkCover = document.getElementById("boltPerkCover");
    var perkConfetti = document.getElementById("boltPerkConfetti");
    var perkInner = document.getElementById("boltPerkInner");

    if (perkReveal && perkCover && perkConfetti && perkInner) {
        perkCover.addEventListener("click", function () {
            // Spawn ~30 confetti pieces from the click center, fanning outward
            var pieces = 30;
            for (var i = 0; i < pieces; i++) {
                var piece = document.createElement("span");
                piece.className = "perk-confetti-piece";
                var angle = (Math.PI * 2 * i) / pieces + (Math.random() - 0.5) * 0.4;
                var distance = 140 + Math.random() * 160; // 140 – 300px spread
                var endX = Math.cos(angle) * distance;
                var endY = Math.sin(angle) * distance + Math.random() * 40 + 30; // gravity bias down
                var rot = (Math.random() - 0.5) * 720; // up to ±360° spin
                piece.style.setProperty("--end-x", endX.toFixed(0) + "px");
                piece.style.setProperty("--end-y", endY.toFixed(0) + "px");
                piece.style.setProperty("--end-rot", rot.toFixed(0) + "deg");
                piece.style.animationDelay = (Math.random() * 80) + "ms";
                // Alternate light/dark green for a bit of texture
                if (i % 3 === 0) piece.style.background = "#0B403A"; // emerald 100
                else if (i % 5 === 0) piece.style.background = "#FFFFFF";
                perkConfetti.appendChild(piece);
                // Clean up after the animation finishes to keep DOM lean
                setTimeout(function (el) {
                    return function () { el.remove(); };
                }(piece), 1500);
            }

            // Reveal — adds .is-revealed which the CSS animates
            perkReveal.classList.add("is-revealed");
            perkCover.setAttribute("aria-expanded", "true");
            perkInner.setAttribute("aria-hidden", "false");
        }, { once: true });
    }

    // ---------- HOVER-BORDER-GRADIENT CURSOR TRACKING ----------
    // While the cursor is over the button, project its position to
    // CSS vars (--spot-x / --spot-y) and let the green spot follow.
    // CSS already removes the auto-cycle on :hover, so the inline
    // vars take over and a 0.18s CSS transition smooths the path.
    // mousemove is rAF-throttled — at most one update per frame.
    var hoverCtas = document.querySelectorAll(".hover-gradient-cta");
    hoverCtas.forEach(function (btn) {
        var pending = false;
        var lastX = 0;
        var lastY = 0;

        btn.addEventListener("mousemove", function (e) {
            var rect = btn.getBoundingClientRect();
            lastX = ((e.clientX - rect.left) / rect.width) * 100;
            lastY = ((e.clientY - rect.top) / rect.height) * 100;
            if (lastX < 0) lastX = 0; else if (lastX > 100) lastX = 100;
            if (lastY < 0) lastY = 0; else if (lastY > 100) lastY = 100;

            if (pending) return;
            pending = true;
            requestAnimationFrame(function () {
                btn.style.setProperty("--spot-x", lastX.toFixed(2) + "%");
                btn.style.setProperty("--spot-y", lastY.toFixed(2) + "%");
                pending = false;
            });
        });

        btn.addEventListener("mouseleave", function () {
            // Clear inline vars so the auto-cycle resumes from CSS keyframes
            btn.style.removeProperty("--spot-x");
            btn.style.removeProperty("--spot-y");
        });
    });

})();
