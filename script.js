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

    // ---------- PEOPLE IN THE ROOM: horizontal carousel ----------
    // The 11 speaker cards are a scroll-snap carousel on every viewport. JS
    // syncs the dots + arrow disabled-states with scroll position, handles
    // dot/arrow clicks, and adds drag-to-scroll for mouse users.
    var roomTrack = document.getElementById("roomPeople");
    var roomDots = document.querySelectorAll("#roomDots .room-dot");
    var roomPrev = document.getElementById("roomPrev");
    var roomNext = document.getElementById("roomNext");
    // The reel only exists on phones — on desktop the speakers are a static
    // hover-mosaic, so drag-to-scroll must stay off there.
    var roomMobileMQ = window.matchMedia("(max-width: 768px)");

    if (roomTrack && roomTrack.children.length) {
        var roomCards = roomTrack.children;
        var roomTicking = false;

        function roomStep() {
            if (roomCards.length < 2) return roomTrack.clientWidth;
            return roomCards[1].getBoundingClientRect().left -
                   roomCards[0].getBoundingClientRect().left;
        }

        function roomSync() {
            var step = roomStep() || 1;
            var maxScroll = roomTrack.scrollWidth - roomTrack.clientWidth;
            var idx;
            if (roomTrack.scrollLeft >= maxScroll - 2) {
                idx = roomCards.length - 1;   // at the end: highlight the LAST card
            } else {
                idx = Math.round(roomTrack.scrollLeft / step);
            }
            if (idx < 0) idx = 0;
            else if (idx > roomCards.length - 1) idx = roomCards.length - 1;
            roomDots.forEach(function (d, i) {
                d.classList.toggle("is-active", i === idx);
            });
            if (roomPrev) roomPrev.disabled = roomTrack.scrollLeft <= 2;
            if (roomNext) roomNext.disabled = roomTrack.scrollLeft >= maxScroll - 2;
        }

        roomTrack.addEventListener("scroll", function () {
            if (roomTicking) return;
            roomTicking = true;
            requestAnimationFrame(function () { roomSync(); roomTicking = false; });
        }, { passive: true });

        roomDots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                roomTrack.scrollTo({ left: i * roomStep(), behavior: "smooth" });
            });
        });
        if (roomPrev) roomPrev.addEventListener("click", function () {
            roomTrack.scrollBy({ left: -roomTrack.clientWidth * 0.9, behavior: "smooth" });
        });
        if (roomNext) roomNext.addEventListener("click", function () {
            roomTrack.scrollBy({ left: roomTrack.clientWidth * 0.9, behavior: "smooth" });
        });

        // Drag-to-scroll for mouse users (suppress the click that follows a drag)
        var rDown = false, rStartX = 0, rStartScroll = 0, rMoved = false;
        roomTrack.addEventListener("pointerdown", function (e) {
            if (!roomMobileMQ.matches) return;   // desktop mosaic: no drag
            rDown = true; rMoved = false;
            rStartX = e.clientX; rStartScroll = roomTrack.scrollLeft;
        });
        roomTrack.addEventListener("pointermove", function (e) {
            if (!rDown) return;
            var dx = e.clientX - rStartX;
            if (Math.abs(dx) > 4) rMoved = true;
            roomTrack.scrollLeft = rStartScroll - dx;
        });
        function rEnd() { rDown = false; }
        roomTrack.addEventListener("pointerup", rEnd);
        roomTrack.addEventListener("pointercancel", rEnd);
        roomTrack.addEventListener("pointerleave", rEnd);
        roomTrack.addEventListener("click", function (e) {
            if (rMoved) { e.preventDefault(); e.stopPropagation(); }
        }, true);

        window.addEventListener("resize", roomSync);
        roomSync();
    }

    // ---------- AGENDA PARALLEL EVENTS: swipe carousel (mobile) ----------
    // The two 7:00 PM Day-2 events are a compact horizontal swipe carousel on
    // phones (native scroll-snap) — no full-screen pin, so the block stays
    // card-sized. JS only syncs the dots with scroll position + handles taps.
    var apTrack = document.getElementById("agendaParallelTrack");
    var apDots = document.querySelectorAll("#agendaParallelDots .room-dot");

    if (apTrack && apDots.length) {
        var apCards = apTrack.children;
        var apTicking = false;

        function apStep() {
            // Card width + the 14px flex gap = one snap stride.
            return apCards.length ? apCards[0].offsetWidth + 14 : apTrack.clientWidth;
        }

        apTrack.addEventListener("scroll", function () {
            if (apTicking) return;
            apTicking = true;
            requestAnimationFrame(function () {
                var idx = Math.round(apTrack.scrollLeft / apStep());
                if (idx < 0) idx = 0;
                else if (idx > apCards.length - 1) idx = apCards.length - 1;
                apDots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === idx);
                });
                apTicking = false;
            });
        }, { passive: true });

        apDots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                apTrack.scrollTo({ left: index * apStep(), behavior: "smooth" });
            });
        });
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

    // ---------- AGENDA DAY SWITCHER ----------
    // Tabs toggle which day panel is visible. Pure show/hide, no routing.
    var agendaTabs = document.querySelectorAll("[data-agenda-day]");
    var agendaPanels = document.querySelectorAll("[data-agenda-panel]");
    if (agendaTabs.length && agendaPanels.length) {
        agendaTabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                var day = tab.getAttribute("data-agenda-day");

                agendaTabs.forEach(function (t) {
                    var active = t === tab;
                    t.classList.toggle("is-active", active);
                    t.setAttribute("aria-selected", active ? "true" : "false");
                });

                agendaPanels.forEach(function (panel) {
                    var match = panel.getAttribute("data-agenda-panel") === day;
                    panel.hidden = !match;
                    panel.classList.toggle("is-active", match);
                });
            });
        });
    }

    // ---------- PARTNER MODAL ----------
    // Two-step modal: choice screen → form. Opened by [data-partner-open],
    // closed by [data-partner-close] or ESC / backdrop click.
    var partnerModal = document.getElementById("partnerModal");
    if (partnerModal) {
        var openTriggers = document.querySelectorAll("[data-partner-open]");
        var closeTriggers = partnerModal.querySelectorAll("[data-partner-close]");
        var stepTriggers = partnerModal.querySelectorAll("[data-partner-step-show]");
        var steps = partnerModal.querySelectorAll("[data-partner-step]");
        var form = document.getElementById("partnerForm");
        var submitBtn = document.getElementById("pf-submit");
        var errorEl = document.getElementById("pf-error");
        var successEl = document.getElementById("pf-success");
        var formCard = partnerModal.querySelector(".modal-card--form");
        var confettiHost = document.getElementById("formConfetti");
        var lastFocus = null;

        // Burst ~28 confetti pieces from the center of the form card.
        // Reuses .perk-confetti-piece styling from the Bolt perk.
        function burstConfetti() {
            if (!confettiHost) return;
            if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            var pieces = 28;
            for (var i = 0; i < pieces; i++) {
                var piece = document.createElement("span");
                piece.className = "perk-confetti-piece";
                var angle = (Math.PI * 2 * i) / pieces + (Math.random() - 0.5) * 0.4;
                var distance = 120 + Math.random() * 180;
                var endX = Math.cos(angle) * distance;
                var endY = Math.sin(angle) * distance + Math.random() * 40 + 20;
                var rot = (Math.random() - 0.5) * 720;
                piece.style.setProperty("--end-x", endX.toFixed(0) + "px");
                piece.style.setProperty("--end-y", endY.toFixed(0) + "px");
                piece.style.setProperty("--end-rot", rot.toFixed(0) + "deg");
                piece.style.animationDelay = (Math.random() * 80) + "ms";
                if (i % 3 === 0) piece.style.background = "#03BED7";  // light blue
                else if (i % 5 === 0) piece.style.background = "#FFFFFF";
                confettiHost.appendChild(piece);
                setTimeout(function (el) {
                    return function () { el.remove(); };
                }(piece), 1500);
            }
        }

        function clearConfetti() {
            if (confettiHost) confettiHost.innerHTML = "";
        }

        function showStep(name) {
            for (var i = 0; i < steps.length; i++) {
                steps[i].hidden = steps[i].getAttribute("data-partner-step") !== name;
            }
            // Focus first input when switching to the form step
            if (name === "form") {
                var firstInput = document.getElementById("pf-nume");
                if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
            }
        }

        function openModal() {
            lastFocus = document.activeElement;
            partnerModal.classList.add("is-open");
            partnerModal.setAttribute("aria-hidden", "false");
            document.documentElement.classList.add("modal-open");
            showStep("choice");
            resetForm();
        }

        function closeModal() {
            partnerModal.classList.remove("is-open");
            partnerModal.setAttribute("aria-hidden", "true");
            document.documentElement.classList.remove("modal-open");
            if (lastFocus && typeof lastFocus.focus === "function") {
                lastFocus.focus();
            }
        }

        function resetForm() {
            if (form) form.reset();
            if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }
            if (successEl) successEl.hidden = true;
            if (form) form.hidden = false;
            if (formCard) formCard.classList.remove("is-success-state");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove("is-loading");
            }
            clearConfetti();
        }

        for (var i = 0; i < openTriggers.length; i++) {
            openTriggers[i].addEventListener("click", openModal);
        }
        for (var j = 0; j < closeTriggers.length; j++) {
            closeTriggers[j].addEventListener("click", closeModal);
        }
        for (var k = 0; k < stepTriggers.length; k++) {
            (function (trigger) {
                trigger.addEventListener("click", function () {
                    showStep(trigger.getAttribute("data-partner-step-show"));
                });
            })(stepTriggers[k]);
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && partnerModal.classList.contains("is-open")) {
                closeModal();
            }
        });

        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }

                var data = {
                    nume: form.elements["nume"].value.trim(),
                    prenume: form.elements["prenume"].value.trim(),
                    email: form.elements["email"].value.trim(),
                    company: form.elements["company"].value.trim(),
                    contribution: form.elements["contribution"].value.trim(),
                    website: form.elements["website"].value, // honeypot
                };

                // Lightweight client validation — server validates again
                if (!data.nume || !data.prenume || !data.email || !data.company || !data.contribution) {
                    showError("Please fill in every field.");
                    return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    showError("That email doesn't look right.");
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.classList.add("is-loading");

                fetch("/api/partner", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                .then(function (res) {
                    return res.json().then(function (json) {
                        return { ok: res.ok, status: res.status, body: json };
                    });
                })
                .then(function (result) {
                    if (!result.ok) {
                        var msg = (result.body && result.body.error) || "Something went wrong. Please try again.";
                        showError(msg);
                        return;
                    }
                    form.hidden = true;
                    successEl.hidden = false;
                    if (formCard) formCard.classList.add("is-success-state");
                    burstConfetti();
                })
                .catch(function () {
                    showError("Network error. Please try again.");
                })
                .then(function () {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove("is-loading");
                });
            });
        }

        function showError(msg) {
            if (!errorEl) return;
            errorEl.textContent = msg;
            errorEl.hidden = false;
        }
    }


    // ---------- TICKET ALERT ----------
    // Centered pop-up: only the Day 2 Evening Mixer remains available.
    // Auto-opens ~1.5s after load, once per browser session (suppressed
    // afterwards via sessionStorage). Closes on ×, ESC, backdrop, or the
    // CTA — which then smooth-scrolls to the tickets section.
    var ticketAlert = document.getElementById("ticketAlert");
    if (ticketAlert) {
        var ALERT_KEY = "aihouse:ticket-alert-dismissed";
        var alertCloseTriggers = ticketAlert.querySelectorAll("[data-alert-close]");
        var alertCta = ticketAlert.querySelector("[data-alert-cta]");
        var alertLastFocus = null;

        function alertDismissed() {
            try { return sessionStorage.getItem(ALERT_KEY) === "1"; }
            catch (e) { return false; }
        }

        function markAlertDismissed() {
            try { sessionStorage.setItem(ALERT_KEY, "1"); } catch (e) {}
        }

        function openAlert() {
            if (ticketAlert.classList.contains("is-open")) return;
            alertLastFocus = document.activeElement;
            ticketAlert.classList.add("is-open");
            ticketAlert.setAttribute("aria-hidden", "false");
            document.documentElement.classList.add("modal-open");
            if (alertCta && typeof alertCta.focus === "function") {
                setTimeout(function () { alertCta.focus(); }, 50);
            }
        }

        function closeAlert() {
            ticketAlert.classList.remove("is-open");
            ticketAlert.setAttribute("aria-hidden", "true");
            document.documentElement.classList.remove("modal-open");
            markAlertDismissed();
            if (alertLastFocus && typeof alertLastFocus.focus === "function") {
                alertLastFocus.focus();
            }
        }

        for (var a = 0; a < alertCloseTriggers.length; a++) {
            alertCloseTriggers[a].addEventListener("click", closeAlert);
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && ticketAlert.classList.contains("is-open")) {
                closeAlert();
            }
        });

        if (alertCta) {
            alertCta.addEventListener("click", function (e) {
                e.preventDefault();
                closeAlert();
                var tickets = document.getElementById("tickets");
                if (tickets && typeof tickets.scrollIntoView === "function") {
                    tickets.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        }

        if (!alertDismissed()) {
            setTimeout(openAlert, 1500);
        }
    }

})();
