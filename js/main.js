/* Henry Montego Homes — Oniru Twin Towers, v3. Plain JS, no dependencies. */
(() => {
  "use strict";

  const cfg = window.HM_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* ---- Fitted type: the name is set so it spans its tile exactly ------------ */
  function fit(el, container, { maxHeight = Infinity, lines = 1, leading = 0.92 } = {}) {
    if (!el || !container) return;
    el.style.fontSize = "100px";
    const range = document.createRange();
    range.selectNodeContents(el);
    const w100 = range.getBoundingClientRect().width;
    if (!w100) return;
    const avail = container.clientWidth * 0.985;
    let size = (100 * avail) / w100;
    size = Math.min(size, maxHeight / (lines * leading));
    el.style.fontSize = size.toFixed(2) + "px";
    // second pass at the real size: glyph overhang does not scale exactly
    const w = range.getBoundingClientRect().width;
    if (w > avail) el.style.fontSize = (size * avail / w).toFixed(2) + "px";
  }

  function initFit() {
    const foot = $("#footer-name");
    if (!foot) return;
    const lines = $$(".l", foot);
    const run = () => {
      const stacked = window.matchMedia("(max-width: 860px)").matches;
      foot.classList.toggle("is-stacked", stacked);
      if (stacked) {
        foot.style.fontSize = "";
        lines.forEach((l) => fit(l, foot));
      } else {
        lines.forEach((l) => { l.style.fontSize = ""; });
        fit(foot, foot.parentElement);
      }
    };
    run();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(run, 80); });
  }

  /* ---- Hero: the live thing. Four hours of one building ---------------------- */
  function initHours() {
    const stage = $("#stage");
    if (!stage) return;
    const imgs = $$(".hour", stage);
    const btns = $$("[data-pick]");
    const cap = $("#stage-caption");
    const order = ["dusk", "night", "day", "sunset"];
    const text = {
      day: "Oniru Twin Towers by day: curved white terraces against a clear blue sky",
      sunset: "Oniru Twin Towers at sunset, turquoise water on the façade under a pink and orange sky",
      dusk: "Oniru Twin Towers at dusk, the curved terraces of the taller tower glowing warmly from within",
      night: "Oniru Twin Towers at night, outlined in electric blue light, with palm trees in the foreground"
    };
    let current = "dusk";
    const pick = (hour, announce) => {
      current = hour;
      imgs.forEach((img) => {
        const on = img.dataset.hour === hour;
        if (on) img.loading = "eager";
        img.classList.toggle("is-on", on);
        img.alt = on ? text[hour] : "";
        if (on) img.removeAttribute("aria-hidden"); else img.setAttribute("aria-hidden", "true");
      });
      btns.forEach((b) => {
        const on = b.dataset.pick === hour;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      if (cap && announce) cap.textContent = text[hour];
    };

    // Signature move: the light shifts on its own until the visitor chooses an hour.
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
      if (reduceMotion || timer) return;
      timer = setInterval(() => pick(order[(order.indexOf(current) + 1) % order.length], false), 6500);
    };
    btns.forEach((b) => b.addEventListener("click", () => { stop(); stage.dataset.chosen = "1"; pick(b.dataset.pick, true); }));
    // warm the other hours once the first has painted
    window.addEventListener("load", () => imgs.forEach((img) => { img.loading = "eager"; }));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else if (!stage.dataset.chosen) start();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !stage.dataset.chosen) start(); else stop();
      }).observe(stage);
    } else start();
  }

  /* ---- Residences: the story beside the floor plan slides through each use ------ */
  function initSlides() {
    const root = $(".slides");
    if (!root) return;
    const track = $(".slides__track", root);
    const slides = $$(".slide", root);
    const MS = 4000;
    let i = 0, timer = null, focus = false, visible = false;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-100 * i}%)`;
      slides.forEach((el, k) => { const on = k === i; el.inert = !on; el.setAttribute("aria-hidden", String(!on)); });
    };
    const play = () => {
      clearInterval(timer); timer = null;
      if (visible && !focus && !document.hidden) timer = setInterval(() => show(i + 1), MS);
    };
    $(".slides__btn--prev", root).addEventListener("click", () => { show(i - 1); play(); });
    $(".slides__btn--next", root).addEventListener("click", () => { show(i + 1); play(); });
    // keyboard users get a still slide while they are reading inside it
    $(".slides__view", root).addEventListener("focusin", () => { focus = true; play(); });
    $(".slides__view", root).addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) { focus = false; play(); } });
    document.addEventListener("visibilitychange", play);
    let x0 = null;
    track.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
    track.addEventListener("pointerup", (e) => {
      if (x0 === null) return; const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); play(); }
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; play(); }, { threshold: 0.2 }).observe(root);
    } else { visible = true; play(); }
    show(0);
  }

  /* ---- Compact bar: appears once the first screen has gone ------------------- */
  function initBar() {
    const bar = $("#bar");
    const hero = $("#home");
    const toggle = $(".bar__toggle");
    const nav = $("#bar-nav");

    const setOpen = (open) => {
      bar.classList.toggle("nav-open", open);
      document.body.classList.toggle("no-scroll", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!bar.classList.contains("nav-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && bar.classList.contains("nav-open")) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) setOpen(false); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        bar.classList.toggle("is-solid", !e.isIntersecting);
        document.body.classList.toggle("past-hero", !e.isIntersecting);
        if (e.isIntersecting && bar.classList.contains("nav-open")) setOpen(false);
      }, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);
    } else {
      bar.classList.add("is-solid");
      document.body.classList.add("past-hero");
    }

    // Which section is current
    const links = $$('.bar__nav li a[href^="#"]');
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const alias = { atlantic: "development", enquire: null, home: null };
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id in alias ? alias[e.target.id] : e.target.id;
        links.forEach((a) => { if (a === byId.get(id)) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => io.observe(s));
  }

  /* ---- Entrances -------------------------------------------------------------- */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    items.forEach((el) => io.observe(el));
  }

  /* ---- Dialogs ---------------------------------------------------------------- */
  const openDialogs = new Set();
  function openDialog(dlg) {
    if (!dlg || dlg.open) return;
    dlg.showModal();
    openDialogs.add(dlg);
    document.body.classList.add("no-scroll");
  }
  function initDialogs() {
    $$("dialog.modal").forEach((dlg) => {
      dlg.addEventListener("close", () => {
        openDialogs.delete(dlg);
        if (!openDialogs.size && !$("#bar").classList.contains("nav-open")) document.body.classList.remove("no-scroll");
      });
      dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.classList.contains("modal__shell")) dlg.close(); });
      $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", () => dlg.close()));
    });
    $$("[data-open]").forEach((btn) => btn.addEventListener("click", () => openDialog(document.getElementById(btn.dataset.open))));
  }

  function scrollToEnquiry() {
    $("#enquire").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  }

  function initPlan() {
    const dlg = $("#plan-dialog");
    const stage = $("#plan-stage");
    const zoom = $("#plan-zoom");
    const set = (on) => {
      stage.classList.toggle("is-zoomed", on);
      zoom.setAttribute("aria-pressed", String(on));
      zoom.lastChild.textContent = on ? " Fit to screen" : " Zoom in";
    };
    zoom.addEventListener("click", () => set(!stage.classList.contains("is-zoomed")));
    stage.addEventListener("click", () => set(!stage.classList.contains("is-zoomed")));
    dlg.addEventListener("close", () => set(false));

    const enquire = (e) => {
      e.preventDefault();
      if (dlg.open) dlg.close();
      $("#f-type").value = "Floor plans & brochure";
      scrollToEnquiry();
    };
    $("[data-plan-enquire-modal]", dlg).addEventListener("click", enquire);
    const cell = $("[data-plan-enquire]");
    if (cell) cell.addEventListener("click", enquire);
  }

  /* ---- "Register interest" links (Tally) ----------------------------------------- */
  function initRegisterLinks() {
    const url = (cfg.registerInterestUrl || "").trim();
    $$("[data-register-interest]").forEach((a) => {
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else a.addEventListener("click", (e) => { e.preventDefault(); scrollToEnquiry(); });
    });
  }

  /* ---- Enquiry form --------------------------------------------------------------- */
  function initForm() {
    const form = $("#enquiry-form");
    const status = $("#form-status");

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
      phone: (v) => {
        const digits = v.replace(/\D/g, "");
        return /^[+()\d\s.-]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15 ? "" : "Please enter a valid phone number.";
      },
      development: (v) => (v ? "" : "Please choose a development."),
      type: (v) => (v ? "" : "Please select the type of enquiry."),
      message: (v) => (v.length <= 1500 ? "" : "Please keep your message under 1,500 characters.")
    };

    const check = (name) => {
      const field = form.elements[name];
      const msg = rules[name](field.value);
      $("#e-" + name).textContent = msg;
      if (msg) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
      field.setAttribute("aria-describedby", "e-" + name);
      return !msg;
    };

    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      field.addEventListener("blur", () => { if (field.value || field.hasAttribute("aria-invalid")) check(name); });
      field.addEventListener("input", () => { if (field.hasAttribute("aria-invalid")) check(name); });
      field.addEventListener("change", () => check(name));
    });

    const values = () => ({
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      development: form.elements.development.value,
      type: form.elements.type.value,
      message: form.elements.message.value.trim()
    });

    const summary = (v) =>
      `Enquiry: ${v.development}\nType of enquiry: ${v.type}\n\n` +
      `Name: ${v.name}\nEmail: ${v.email}\nPhone: ${v.phone}\n` +
      (v.message ? `\nMessage:\n${v.message}\n` : "");

    const showNotice = (cls, title, text, actionsHtml = "", moveFocus = true) => {
      status.innerHTML = `<div class="notice ${cls}"><strong></strong><span></span>${actionsHtml}</div>`;
      $("strong", status).textContent = title;
      $("span", status).textContent = text;
      if (!moveFocus) return;
      status.focus({ preventScroll: true });
      status.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    };

    // Delivery without a backend: hand the prepared enquiry to the visitor's mail app or WhatsApp.
    const fallbackActions = (v) => {
      const subject = encodeURIComponent(`Enquiry: ${v.development} — ${v.type}`);
      const body = encodeURIComponent(summary(v));
      const mail = `mailto:${cfg.leadEmail}?subject=${subject}&body=${body}`;
      const wa = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(summary(v))}`;
      return `<div class="notice__actions">
        <a class="btn btn--ghost btn--sm" href="${mail}">Send by email</a>
        <a class="btn btn--accent btn--sm" href="${wa}" target="_blank" rel="noopener">Send on WhatsApp</a>
      </div>`;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.innerHTML = "";
      if (form.elements.company.value) return; // honeypot

      const bad = Object.keys(rules).filter((n) => !check(n));
      if (bad.length) {
        showNotice("notice--error", "Please check the highlighted fields.", "Some details are missing or look incorrect.", "", false);
        form.elements[bad[0]].focus();
        return;
      }

      const v = values();
      const endpoint = (cfg.formEndpoint || "").trim();

      if (!endpoint) {
        showNotice("", "Your enquiry is ready.", "Choose how you would like to send it to our sales team, and we will respond personally.", fallbackActions(v));
        return;
      }

      form.classList.add("is-busy");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...v, source: location.href, submittedAt: new Date().toISOString() })
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        showNotice("notice--success", "Thank you.", "Your enquiry has been received. A member of the Henry Montego Homes team will be in touch shortly.");
      } catch (err) {
        showNotice("notice--error", "We could not send your enquiry.", "Please try again, or send it directly using one of the options below.", fallbackActions(v));
      } finally {
        form.classList.remove("is-busy");
      }
    });
  }

  /* ---- Init ------------------------------------------------------------------------ */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  initFit();
  initHours();
  initBar();
  initReveal();
  initDialogs();
  initSlides();
  initPlan();
  initRegisterLinks();
  initForm();
})();
