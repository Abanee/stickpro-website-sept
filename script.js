// StickPro — site-wide interactions
// Covers: nav, scroll-reveal, home purpose tabs, products nav spy,
// materials shelf + decision tool, gallery filter + lightbox + view-more,
// contact form validation & file upload.
(function () {
  "use strict";

  // ─── GLOBAL THEME CONTROLLER ───────────────────────────────────────────────
  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem("stickpro-theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("stickpro-theme", theme);
    } catch (e) {}
    updateThemeButtons(theme);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
    var next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }

  function updateThemeButtons(theme) {
    var isDark = theme === "dark";
    var buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      btn.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  // ─── GLOBAL DIRECTION CONTROLLER (RTL / LTR) ──────────────────────────────
  function getPreferredDirection() {
    try {
      var saved = localStorage.getItem("stickpro-direction");
      if (saved === "rtl" || saved === "ltr") return saved;
    } catch (e) {}
    return "ltr";
  }

  function setDirection(dir) {
    document.documentElement.setAttribute("dir", dir);
    try {
      localStorage.setItem("stickpro-direction", dir);
    } catch (e) {}
    updateDirectionButtons(dir);
  }

  function toggleDirection() {
    var current = document.documentElement.getAttribute("dir") || getPreferredDirection();
    var next = current === "rtl" ? "ltr" : "rtl";
    setDirection(next);
  }

  function updateDirectionButtons(dir) {
    var isRTL = dir === "rtl";
    var buttons = document.querySelectorAll(".dir-toggle");
    buttons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", isRTL ? "true" : "false");
      btn.setAttribute("aria-label", isRTL ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
      btn.setAttribute("title", isRTL ? "Switch to LTR" : "Switch to RTL");
      var textEl = btn.querySelector(".dir-toggle-text");
      if (textEl) {
        textEl.textContent = isRTL ? "LTR" : "RTL";
      }
    });
  }

  // Initialize theme & direction state immediately
  var initialTheme = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
  setTheme(initialTheme);

  var initialDir = document.documentElement.getAttribute("dir") || getPreferredDirection();
  setDirection(initialDir);

  // Click delegation for theme and direction buttons
  document.addEventListener("click", function (e) {
    var themeBtn = e.target.closest(".theme-toggle");
    if (themeBtn) {
      e.preventDefault();
      toggleTheme();
      return;
    }
    var dirBtn = e.target.closest(".dir-toggle");
    if (dirBtn) {
      e.preventDefault();
      toggleDirection();
      return;
    }
  });

  // OS theme change listener
  if (window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (!localStorage.getItem("stickpro-theme")) {
          setTheme(e.matches ? "dark" : "light");
        }
      });
    } catch (err) {}
  }

  // Expose global API
  window.StickProTheme = {
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    setDirection: setDirection,
    toggleDirection: toggleDirection
  };


  // ─── MOBILE NAV TOGGLE ──────────────────────────────────────────────────────
  var toggle = document.getElementById("navToggle");
  var body = document.body;

  if (toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll(".mobile-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  // ─── SCROLL REVEAL ──────────────────────────────────────────────────────────
  var revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ─── HOME 2 — PURPOSE TAB SELECTOR ─────────────────────────────────────────
  var purposeTabs = document.querySelectorAll(".purpose-tab");
  if (purposeTabs.length) {
    purposeTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-purpose");
        purposeTabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        document.querySelectorAll(".purpose-panel").forEach(function (panel) {
          var isMatch = panel.getAttribute("data-panel") === target;
          panel.classList.toggle("active", isMatch);
        });
      });
    });
  }

  // ─── PRODUCTS PAGE — NAV RAIL SCROLL SPY ────────────────────────────────────
  var productNavItems = document.querySelectorAll(".product-nav-item");
  var productSections = document.querySelectorAll(".product-row[id]");
  if (productNavItems.length && productSections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            productNavItems.forEach(function (item) {
              item.classList.toggle("active", item.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );
    productSections.forEach(function (sec) { spy.observe(sec); });

    productNavItems.forEach(function (item) {
      item.addEventListener("click", function () {
        productNavItems.forEach(function (i) { i.classList.remove("active"); });
        item.classList.add("active");
      });
    });
  }

  // ─── MATERIALS PAGE — SHELF SELECTOR ────────────────────────────────────────
  var matCards = document.querySelectorAll(".mat-card[data-material]");

  var matData = {
    paper: {
      code: "M-01",
      name: "Uncoated Paper",
      desc: "A natural, warm surface with a tactile feel. Paper stock prints cleanly with bold colours and crisp text. Best suited for indoor use where a handcrafted, organic aesthetic is desired.",
      surface: "Natural matte",
      texture: "Slightly textured",
      adhesive: "Permanent",
      durability: "Indoor standard",
      writeable: "Yes",
      waterproof: "Not recommended",
      tags: ["Product Packaging", "Retail Labels", "Stationery", "Baked Goods", "Indoor Branding"],
      visualTag: "M-01 — Paper",
      visualBg: "#F1E2D2",
      visualAccent: "rgba(185,122,74,0.08)"
    },
    vinyl: {
      code: "V-02",
      name: "White Vinyl",
      desc: "Flexible, tear-resistant film material designed for product and packaging applications that require stronger performance than paper. Holds colour well and resists moisture.",
      surface: "Smooth white",
      texture: "Smooth / flat",
      adhesive: "Permanent acrylic",
      durability: "Indoor & light outdoor",
      writeable: "Possible with permanent marker",
      waterproof: "Yes — moisture resistant",
      tags: ["Product Labels", "Bottle Labels", "Packaging", "Promotional Stickers", "Indoor Signage"],
      visualTag: "V-02 — Vinyl",
      visualBg: "#2a2d30",
      visualAccent: "rgba(255,255,255,0.08)"
    },
    clear: {
      code: "C-03",
      name: "Transparent PET",
      desc: "Ultra-clear transparent film that lets your packaging surface show through. Creates a 'no-label look' ideal for glass containers, cosmetic packaging, and premium minimal branding.",
      surface: "Transparent / clear",
      texture: "Smooth / glossy",
      adhesive: "Permanent clear acrylic",
      durability: "Indoor, some moisture resistance",
      writeable: "Not recommended",
      waterproof: "Moisture resistant",
      tags: ["Glass Bottles", "Cosmetics", "Beverage Labels", "Candles & Jars", "Minimal Branding"],
      visualTag: "C-03 — Clear",
      visualBg: "rgba(255,255,255,0.4)",
      visualAccent: "rgba(223,216,200,0.5)"
    },
    matte: {
      code: "M-04",
      name: "Matte Laminate",
      desc: "A low-glare satin surface applied over the printed stock. Reads clearly under all lighting conditions. Considered the most versatile and professional finish for product labels and packaging.",
      surface: "Low-glare satin",
      texture: "Smooth / non-reflective",
      adhesive: "Permanent acrylic",
      durability: "Indoor — strong",
      writeable: "Yes — accepts pen",
      waterproof: "Moisture resistant",
      tags: ["Product Packaging", "Premium Labels", "Retail Shelving", "Professional Branding", "Corporate"],
      visualTag: "M-04 — Matte",
      visualBg: "#EDEAE1",
      visualAccent: "rgba(0,0,0,0.03)"
    },
    gloss: {
      code: "G-05",
      name: "Gloss Laminate",
      desc: "A high-shine reflective surface that amplifies colour vibrancy and contrast. The classic product label finish — trusted, bold, and shelf-ready. Resistant to moisture and light handling.",
      surface: "High-shine reflective",
      texture: "Smooth / reflective",
      adhesive: "Permanent acrylic",
      durability: "Indoor — strong",
      writeable: "Difficult — use permanent marker",
      waterproof: "Yes — moisture resistant",
      tags: ["Food & Drink Labels", "Promotional Stickers", "Retail Products", "Bold Branding", "Events"],
      visualTag: "G-05 — Gloss",
      visualBg: "#e8e2d5",
      visualAccent: "rgba(255,255,255,0.5)"
    },
    weather: {
      code: "W-06",
      name: "Weather-Resistant Vinyl",
      desc: "UV-stable, waterproof outdoor vinyl designed for surfaces exposed to sun, rain, temperature changes, and extended handling. Maintains colour integrity outdoors over time.",
      surface: "Matte or gloss outdoor-grade",
      texture: "Smooth / durable",
      adhesive: "Aggressive permanent acrylic",
      durability: "Outdoor — long-term",
      writeable: "Not recommended",
      waterproof: "Yes — fully waterproof",
      tags: ["Outdoor Signage", "Vehicle & Equipment", "Bins & Fixtures", "Exterior Windows", "Long-Term Campaigns"],
      visualTag: "W-06 — Outdoor Vinyl",
      visualBg: "#1a3a2e",
      visualAccent: "rgba(255,255,255,0.04)"
    }
  };

  function renderMatVisual(key) {
    var d = matData[key];
    var svg = document.getElementById("matVisualSvg");
    var tag = document.getElementById("matVisualTag");
    if (!svg || !tag) return;
    tag.textContent = d.visualTag;

    var svgs = {
      paper: '<rect width="500" height="600" fill="#F1E2D2"/><g stroke="rgba(185,122,74,0.07)" stroke-width="1"><line x1="0" y1="30" x2="500" y2="30"/><line x1="0" y1="60" x2="500" y2="60"/><line x1="0" y1="90" x2="500" y2="90"/><line x1="0" y1="120" x2="500" y2="120"/><line x1="0" y1="150" x2="500" y2="150"/><line x1="0" y1="180" x2="500" y2="180"/><line x1="0" y1="210" x2="500" y2="210"/><line x1="0" y1="240" x2="500" y2="240"/><line x1="0" y1="270" x2="500" y2="270"/><line x1="0" y1="300" x2="500" y2="300"/><line x1="0" y1="330" x2="500" y2="330"/><line x1="0" y1="360" x2="500" y2="360"/><line x1="0" y1="390" x2="500" y2="390"/><line x1="0" y1="420" x2="500" y2="420"/><line x1="0" y1="450" x2="500" y2="450"/><line x1="0" y1="480" x2="500" y2="480"/><line x1="0" y1="510" x2="500" y2="510"/><line x1="0" y1="540" x2="500" y2="540"/><line x1="0" y1="570" x2="500" y2="570"/></g><rect x="60" y="80" width="380" height="440" rx="12" fill="white" stroke="rgba(0,0,0,0.07)" stroke-width="1"/><rect x="80" y="110" width="340" height="170" rx="8" fill="#EEEAE0"/><text x="250" y="198" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="34" fill="#17181A">HARVEST</text><text x="250" y="222" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="600" font-size="13" letter-spacing="3" fill="#4B4C4E">ORGANIC BLEND</text><rect x="80" y="300" width="200" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="320" width="280" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="340" width="160" height="9" rx="4.5" fill="#DFD8C8"/>',
      vinyl: '<rect width="500" height="600" fill="#2a2d30"/><rect x="60" y="80" width="380" height="440" rx="12" fill="white" stroke="rgba(255,255,255,0.1)" stroke-width="1"/><rect x="80" y="110" width="340" height="160" rx="8" fill="#E13B2E"/><text x="250" y="192" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="32" fill="white">VELOCITY</text><text x="250" y="215" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="600" font-size="12" letter-spacing="3" fill="rgba(255,255,255,0.8)">SPORTS</text><rect x="80" y="292" width="200" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="312" width="280" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="332" width="160" height="9" rx="4.5" fill="#DFD8C8"/><path d="M435 508 Q445 502 442 526 Q428 530 427 518 Z" fill="#F6F3EC"/>',
      clear: '<rect width="500" height="600" fill="#e8e2d4"/><defs><pattern id="cp2" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="rgba(255,255,255,0.7)"/><rect x="8" y="8" width="8" height="8" fill="rgba(255,255,255,0.7)"/></pattern></defs><rect width="500" height="600" fill="url(#cp2)" opacity="0.4"/><rect x="80" y="100" width="340" height="400" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="250" y="300" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="28" fill="rgba(60,40,20,0.85)">FLORA</text><text x="250" y="328" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="600" font-size="12" letter-spacing="2.5" fill="rgba(60,40,20,0.6)">BOTANICAL</text><rect x="140" y="348" width="220" height="1" fill="rgba(60,40,20,0.2)"/><text x="250" y="368" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="500" font-size="11" fill="rgba(60,40,20,0.5)">250ml &#183; EST. 2021</text>',
      matte: '<rect width="500" height="600" fill="#EDEAE1"/><g stroke="rgba(0,0,0,0.02)" stroke-width="1"><line x1="0" y1="25" x2="500" y2="25"/><line x1="0" y1="50" x2="500" y2="50"/><line x1="0" y1="75" x2="500" y2="75"/><line x1="0" y1="100" x2="500" y2="100"/><line x1="0" y1="125" x2="500" y2="125"/><line x1="0" y1="150" x2="500" y2="150"/><line x1="0" y1="175" x2="500" y2="175"/><line x1="0" y1="200" x2="500" y2="200"/><line x1="0" y1="225" x2="500" y2="225"/><line x1="0" y1="250" x2="500" y2="250"/><line x1="0" y1="275" x2="500" y2="275"/><line x1="0" y1="300" x2="500" y2="300"/><line x1="0" y1="325" x2="500" y2="325"/><line x1="0" y1="350" x2="500" y2="350"/><line x1="0" y1="375" x2="500" y2="375"/><line x1="0" y1="400" x2="500" y2="400"/><line x1="0" y1="425" x2="500" y2="425"/><line x1="0" y1="450" x2="500" y2="450"/><line x1="0" y1="475" x2="500" y2="475"/><line x1="0" y1="500" x2="500" y2="500"/><line x1="0" y1="525" x2="500" y2="525"/><line x1="0" y1="550" x2="500" y2="550"/><line x1="0" y1="575" x2="500" y2="575"/></g><rect x="60" y="80" width="380" height="440" rx="12" fill="white" stroke="rgba(0,0,0,0.07)" stroke-width="1"/><rect x="80" y="108" width="340" height="180" rx="8" fill="#F1E2D2"/><text x="250" y="198" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="32" fill="#17181A">ROOTS</text><text x="250" y="222" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="600" font-size="12" letter-spacing="3" fill="#4B4C4E">COFFEE CO.</text><rect x="80" y="308" width="200" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="328" width="270" height="9" rx="4.5" fill="#DFD8C8"/>',
      gloss: '<defs><linearGradient id="gloss_bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ffffff"/><stop offset="45%" style="stop-color:#ece6d8"/><stop offset="55%" style="stop-color:#ffffff"/><stop offset="100%" style="stop-color:#e8e2d4"/></linearGradient><linearGradient id="gloss_hi" x1="0%" y1="0%" x2="60%" y2="100%"><stop offset="0%" style="stop-color:rgba(255,255,255,0.7)"/><stop offset="100%" style="stop-color:rgba(255,255,255,0)"/></linearGradient></defs><rect width="500" height="600" fill="url(#gloss_bg)"/><rect x="60" y="80" width="380" height="440" rx="12" fill="white" stroke="rgba(0,0,0,0.07)" stroke-width="1"/><rect x="60" y="80" width="380" height="220" rx="12" fill="url(#gloss_hi)"/><rect x="80" y="108" width="340" height="170" rx="8" fill="#23594A"/><text x="250" y="192" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="32" fill="white">VERDE</text><text x="250" y="215" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="600" font-size="12" letter-spacing="3" fill="rgba(255,255,255,0.8)">PREMIUM JUICE</text><rect x="80" y="300" width="200" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="320" width="270" height="9" rx="4.5" fill="#DFD8C8"/>',
      weather: '<rect width="500" height="600" fill="#1a3a2e"/><rect x="0" y="0" width="500" height="600" fill="url(#wp)" opacity="0.3"/><defs><pattern id="wp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.15)"/></pattern></defs><rect x="60" y="80" width="380" height="440" rx="12" fill="rgba(255,255,255,0.96)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/><rect x="80" y="108" width="340" height="170" rx="8" fill="#2d5c46"/><text x="250" y="192" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="28" fill="white">OUTDOOR</text><text x="250" y="216" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="600" font-size="12" letter-spacing="2.5" fill="rgba(255,255,255,0.8)">WEATHER-RESISTANT</text><rect x="80" y="300" width="200" height="9" rx="4.5" fill="#DFD8C8"/><rect x="80" y="320" width="270" height="9" rx="4.5" fill="#DFD8C8"/><circle cx="400" cy="120" r="10" fill="rgba(255,255,255,0.18)" opacity="0.6"/><circle cx="425" cy="145" r="7" fill="rgba(255,255,255,0.15)" opacity="0.5"/>'
    };

    svg.innerHTML = svgs[key] || svgs["paper"];
  }

  function updateMatInspector(key) {
    var d = matData[key];
    if (!d) return;

    var el = function(id) { return document.getElementById(id); };
    if (el("matCode")) el("matCode").textContent = d.code;
    if (el("matName")) el("matName").textContent = d.name;
    if (el("matDesc")) el("matDesc").textContent = d.desc;
    if (el("specSurface")) el("specSurface").textContent = d.surface;
    if (el("specTexture")) el("specTexture").textContent = d.texture;
    if (el("specAdhesive")) el("specAdhesive").textContent = d.adhesive;
    if (el("specDurability")) el("specDurability").textContent = d.durability;
    if (el("specWriteable")) el("specWriteable").textContent = d.writeable;
    if (el("specWaterproof")) el("specWaterproof").textContent = d.waterproof;

    var tagsEl = el("matAppTags");
    if (tagsEl) {
      tagsEl.innerHTML = d.tags.map(function(t) {
        return '<span class="mat-app-tag">' + t + "</span>";
      }).join("");
    }

    renderMatVisual(key);

    // Smooth scroll to inspector
    var inspector = document.getElementById("material-detail");
    if (inspector) {
      inspector.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  if (matCards.length) {
    matCards.forEach(function (card) {
      function activate() {
        matCards.forEach(function (c) {
          c.classList.remove("active");
          c.setAttribute("aria-selected", "false");
        });
        card.classList.add("active");
        card.setAttribute("aria-selected", "true");
        updateMatInspector(card.getAttribute("data-material"));
      }
      card.addEventListener("click", activate);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  // ─── MATERIALS — DECISION TOOL ───────────────────────────────────────────────
  var dOpts = document.querySelectorAll(".decision-opt");
  var answers = { 1: null, 2: null, 3: null };

  var recommendations = [
    {
      match: function(a) { return a[1] === "outdoor" || a[2] === "longterm" || a[3] === "outdoorlook"; },
      name: "Weather-Resistant Vinyl",
      desc: "Your application needs durability against outdoor exposure. Weather-resistant vinyl is UV-stable, waterproof, and designed to maintain colour over extended periods outdoors."
    },
    {
      match: function(a) { return a[3] === "transparent" || a[1] === "packaging"; },
      name: "Clear / Transparent PET",
      desc: "A clear label creates a 'no-label look' that lets your packaging surface or container material speak for itself. Ideal for glass, transparent bottles, and premium minimal branding."
    },
    {
      match: function(a) { return a[3] === "natural" || a[1] === "promo"; },
      name: "Uncoated Paper",
      desc: "An uncoated paper surface with a warm, natural feel. Great for artisan products, handmade goods, stationery, and indoor applications where an organic aesthetic is important."
    },
    {
      match: function(a) { return a[3] === "vibrant" || a[2] === "short"; },
      name: "Gloss Laminate",
      desc: "Gloss finish amplifies colour vibrancy and contrast. The classic product label finish — ideal when you want your sticker to pop on a shelf or grab attention at an event."
    },
    {
      match: function(a) { return a[3] === "soft" || a[1] === "product"; },
      name: "Matte Laminate",
      desc: "Matte finish offers a refined, professional surface that reads well under all lighting. The most versatile finish — particularly suited to premium product labels and packaging."
    },
    {
      match: function(a) { return a[1] === "window" || a[1] === "wall"; },
      name: "White Vinyl",
      desc: "Vinyl is flexible, tear-resistant, and adheres reliably to smooth surfaces like windows and walls. Available in matte or gloss finish depending on your preferred look."
    }
  ];

  function calcRecommendation() {
    for (var i = 0; i < recommendations.length; i++) {
      if (recommendations[i].match(answers)) {
        return recommendations[i];
      }
    }
    return null;
  }

  function renderDecisionResult() {
    var nameEl = document.getElementById("drName");
    var descEl = document.getElementById("drDesc");
    var ctasEl = document.getElementById("drCtas");
    var resultEl = document.getElementById("decisionResult");
    if (!nameEl) return;

    var hasAll = answers[1] && answers[2] && answers[3];
    var hasSome = answers[1] || answers[2] || answers[3];

    if (hasAll || hasSome) {
      var rec = calcRecommendation();
      if (rec) {
        nameEl.textContent = rec.name;
        descEl.textContent = rec.desc;
        if (ctasEl) ctasEl.style.display = "flex";
        if (resultEl) resultEl.classList.add("has-result");
      } else {
        nameEl.textContent = "Keep answering…";
        descEl.textContent = "Select more options above to narrow down the best material for your application.";
        if (ctasEl) ctasEl.style.display = "none";
        if (resultEl) resultEl.classList.remove("has-result");
      }
    } else {
      nameEl.textContent = "Select your answers";
      descEl.textContent = "Answer the three questions to receive a material recommendation. This is a practical guide — not a rigid prescription.";
      if (ctasEl) ctasEl.style.display = "none";
    }
  }

  if (dOpts.length) {
    dOpts.forEach(function (opt) {
      opt.addEventListener("click", function () {
        var q = parseInt(opt.getAttribute("data-q"), 10);
        var val = opt.getAttribute("data-val");

        // Deselect siblings in same question
        document.querySelectorAll(".decision-opt[data-q='" + q + "']").forEach(function (o) {
          o.classList.remove("selected");
        });

        // Toggle selection
        if (answers[q] === val) {
          answers[q] = null;
        } else {
          opt.classList.add("selected");
          answers[q] = val;
        }

        renderDecisionResult();
      });
    });
  }

  // ─── GALLERY PAGE — FILTER + VIEW MORE + LIGHTBOX ────────────────────────────
  var galleryItems = document.querySelectorAll(".gallery-item");
  var filterBtns = document.querySelectorAll(".gallery-filter-btn");
  var viewMoreBtn = document.getElementById("viewMoreBtn");
  var galleryCount = document.getElementById("galleryCount");
  var galleryViewMoreSection = document.getElementById("galleryViewMore");

  var ITEMS_PER_PAGE = 12;
  var currentFilter = "all";
  var visibleCount = 0;

  function getFilteredItems() {
    return Array.from(galleryItems).filter(function (item) {
      return currentFilter === "all" || item.getAttribute("data-category") === currentFilter;
    });
  }

  function updateGallery() {
    var filtered = getFilteredItems();
    var total = filtered.length;
    visibleCount = 0;

    // Hide all first
    galleryItems.forEach(function (item) {
      item.classList.add("hidden");
      item.classList.remove("reveal-item");
    });

    // Show first batch of filtered
    filtered.forEach(function (item, idx) {
      if (idx < ITEMS_PER_PAGE) {
        item.classList.remove("hidden");
        item.classList.add("reveal-item");
        visibleCount++;
      }
    });

    // Update count
    if (galleryCount) {
      galleryCount.textContent = "Showing " + visibleCount + " of " + total + " projects";
    }

    // Show/hide view more button
    if (galleryViewMoreSection) {
      galleryViewMoreSection.style.display = total > ITEMS_PER_PAGE ? "block" : "none";
    }
    if (viewMoreBtn) {
      viewMoreBtn.disabled = visibleCount >= total;
    }
  }

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentFilter = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        updateGallery();
      });
    });
  }

  if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", function () {
      var filtered = getFilteredItems();
      var total = filtered.length;
      var toReveal = filtered.slice(visibleCount, visibleCount + ITEMS_PER_PAGE);

      toReveal.forEach(function (item) {
        item.classList.remove("hidden");
        item.classList.add("reveal-item");
        visibleCount++;
      });

      if (galleryCount) {
        galleryCount.textContent = "Showing " + visibleCount + " of " + total + " projects";
      }

      viewMoreBtn.disabled = visibleCount >= total;
    });
  }

  // Initialize gallery on page load
  if (galleryItems.length) {
    updateGallery();
  }

  // Lightbox
  var lightbox = document.getElementById("galleryLightbox");
  var lightboxClose = document.getElementById("lightboxClose");

  var lbItemData = {
    "product-labels": { tag: "Product Labels", material: "Vinyl or Matte", finish: "Matte Laminate", cut: "Die-cut", env: "Indoor" },
    "die-cut": { tag: "Die-Cut Stickers", material: "White Vinyl", finish: "Matte or Gloss", cut: "Custom die-cut", env: "Indoor & outdoor" },
    "clear-labels": { tag: "Clear Labels", material: "Transparent PET", finish: "Clear UV", cut: "Kiss-cut", env: "Indoor" },
    "holographic": { tag: "Holographic & Foil", material: "Foil Film", finish: "Holographic / Gold foil", cut: "Die-cut", env: "Indoor" },
    "packaging": { tag: "Packaging & Seals", material: "Paper or Kraft", finish: "Matte or Linen", cut: "Straight / rounded", env: "Indoor" }
  };

  galleryItems.forEach(function (item) {
    item.addEventListener("click", function () {
      if (!lightbox) return;
      var cat = item.getAttribute("data-category") || "product-labels";
      var d = lbItemData[cat] || lbItemData["product-labels"];
      var labelEl = item.querySelector(".gallery-item-label");
      var tagEl = item.querySelector(".gallery-item-tag");
      var mediaEl = item.querySelector(".gallery-img-inner img") || item.querySelector(".gallery-img-inner svg");

      if (document.getElementById("lbTag")) document.getElementById("lbTag").textContent = d.tag;
      if (document.getElementById("lbTitle")) document.getElementById("lbTitle").textContent = labelEl ? labelEl.textContent : "Print Project";
      if (document.getElementById("lbMaterial")) document.getElementById("lbMaterial").textContent = d.material;
      if (document.getElementById("lbFinish")) document.getElementById("lbFinish").textContent = d.finish;
      if (document.getElementById("lbCut")) document.getElementById("lbCut").textContent = d.cut;
      if (document.getElementById("lbEnv")) document.getElementById("lbEnv").textContent = d.env;

      var lbVisual = document.getElementById("lbVisual");
      if (lbVisual && mediaEl) {
        var clone = mediaEl.cloneNode(true);
        lbVisual.innerHTML = "";
        lbVisual.appendChild(clone);
      }

      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (lightboxClose) lightboxClose.focus();
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  // ─── CONTACT PAGE — FORM VALIDATION & FILE UPLOAD ───────────────────────────
  var contactForm = document.getElementById("contactForm");
  var formSuccess = document.getElementById("formSuccess");
  var fileDrop = document.getElementById("fileDrop");
  var fileInput = document.getElementById("artworkUpload");
  var fileStatus = document.getElementById("fileDropStatus");

  if (fileDrop && fileInput) {
    ["dragenter", "dragover"].forEach(function (ev) {
      fileDrop.addEventListener(ev, function (e) {
        e.preventDefault();
        fileDrop.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      fileDrop.addEventListener(ev, function (e) {
        e.preventDefault();
        fileDrop.classList.remove("drag-over");
        if (ev === "drop" && e.dataTransfer.files.length) {
          var file = e.dataTransfer.files[0];
          if (fileStatus) fileStatus.textContent = "✓ " + file.name + " (" + (file.size / 1024).toFixed(0) + " KB)";
        }
      });
    });
    fileInput.addEventListener("change", function () {
      if (fileInput.files.length && fileStatus) {
        var file = fileInput.files[0];
        fileStatus.textContent = "✓ " + file.name + " (" + (file.size / 1024).toFixed(0) + " KB)";
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      var requiredFields = contactForm.querySelectorAll("[required]");
      requiredFields.forEach(function (field) {
        field.style.borderColor = "";
        if (!field.value.trim()) {
          field.style.borderColor = "#E13B2E";
          valid = false;
        }
        if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.style.borderColor = "#E13B2E";
          valid = false;
        }
      });

      if (!valid) {
        var firstErr = contactForm.querySelector("[required]");
        requiredFields.forEach(function(f) {
          if (!f.value.trim() && !firstErr) firstErr = f;
        });
        if (firstErr) firstErr.focus();
        return;
      }

      // Simulate successful submission
      contactForm.style.display = "none";
      if (formSuccess) formSuccess.classList.add("visible");
    });
  }

  // ─── HOME 2 — CUSTOMISATION STUDIO ──────────────────────────────────────────
  var studioCtrlBtns = document.querySelectorAll(".h2-ctrl-btn");
  var previewSvg = document.getElementById("studioPreviewSvg");

  // Current state
  var studioState = {
    shape: "round",
    material: "vinyl",
    finish: "matte",
    size: "medium",
    qty: "500"
  };

  // Display labels for spec panel
  var studioLabels = {
    shape: { round: "Round", square: "Square", diecut: "Die-Cut" },
    material: { vinyl: "Vinyl", paper: "Paper", clear: "Clear" },
    finish: { matte: "Matte", gloss: "Gloss" },
    size: { small: "2 \u00d7 2 in", medium: "3 \u00d7 3 in", large: "4 \u00d7 4 in" },
    qty: { "50": "50", "250": "250", "500": "500", "1000": "1,000+" }
  };

  // Background colours per material
  var matBg = {
    vinyl: "#F6F3EC",
    paper: "#F1E2D2",
    clear: "rgba(210,220,215,0.35)"
  };

  // Fill colours per material
  var matFill = {
    vinyl: "#E13B2E",
    paper: "#B97A4A",
    clear: "rgba(35,89,74,0.85)"
  };

  function buildPreviewSvg() {
    var s = studioState;
    var bg = matBg[s.material] || "#F6F3EC";
    var fill = matFill[s.material] || "#E13B2E";
    var textFill = s.material === "clear" ? "rgba(255,255,255,0.9)" : "white";

    // Gloss highlight gradient
    var glossDefs = s.finish === "gloss"
      ? '<defs><linearGradient id="pvGloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,0.55)"/><stop offset="60%" stop-color="rgba(255,255,255,0)"/></linearGradient></defs>'
      : "";
    var glossLayer = s.finish === "gloss" ? '<circle cx="140" cy="140" r="104" fill="url(#pvGloss)"/>' : "";

    var shapeInner = "";

    if (s.shape === "round") {
      shapeInner = [
        glossDefs,
        '<circle cx="140" cy="140" r="118" fill="white" stroke="#DFD8C8" stroke-width="2"/>',
        '<circle cx="140" cy="140" r="104" fill="' + fill + '"/>',
        glossLayer,
        '<text x="140" y="136" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="28" fill="' + textFill + '">YOUR</text>',
        '<text x="140" y="164" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="28" fill="' + textFill + '">BRAND</text>'
      ].join("");
    } else if (s.shape === "square") {
      var rx = s.material === "paper" ? "20" : "8";
      shapeInner = [
        glossDefs,
        '<rect x="22" y="22" width="236" height="236" rx="' + (Number(rx) + 6) + '" fill="white" stroke="#DFD8C8" stroke-width="2"/>',
        '<rect x="38" y="38" width="204" height="204" rx="' + rx + '" fill="' + fill + '"/>',
        s.finish === "gloss" ? '<rect x="38" y="38" width="204" height="120" rx="' + rx + '" fill="url(#pvGloss)"/>' : "",
        '<defs>' + (s.finish === "gloss" ? '<linearGradient id="pvGloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,0.55)"/><stop offset="60%" stop-color="rgba(255,255,255,0)"/></linearGradient>' : '') + '</defs>',
        '<text x="140" y="136" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="28" fill="' + textFill + '">YOUR</text>',
        '<text x="140" y="164" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="28" fill="' + textFill + '">BRAND</text>'
      ].join("");
    } else {
      // Die-cut blob
      shapeInner = [
        glossDefs,
        '<path d="M140 15 C190 15 260 65 265 130 C270 195 225 255 170 268 C140 276 108 272 85 255 C45 228 18 178 22 125 C26 60 90 15 140 15 Z" fill="white" stroke="#DFD8C8" stroke-width="2"/>',
        '<path d="M140 32 C184 32 246 76 250 132 C254 186 214 238 166 250 C138 257 109 253 89 238 C53 214 30 168 33 122 C37 64 96 32 140 32 Z" fill="' + fill + '"/>',
        s.finish === "gloss" ? '<ellipse cx="110" cy="90" rx="60" ry="36" fill="rgba(255,255,255,0.2)" transform="rotate(-15,110,90)"/>' : "",
        '<text x="140" y="136" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="24" fill="' + textFill + '">YOUR</text>',
        '<text x="140" y="162" text-anchor="middle" font-family="Archivo,sans-serif" font-weight="900" font-size="24" fill="' + textFill + '">BRAND</text>'
      ].join("");
    }

    // Clear label: show transparency background
    var stageBg = s.material === "clear"
      ? "rgba(210,225,218,0.5)"
      : bg;

    if (previewSvg) {
      previewSvg.innerHTML = shapeInner;
    }
    var stage = document.getElementById("studioPreviewStage");
    if (stage) stage.style.background = stageBg;
  }

  function updateSpecPanel() {
    var s = studioState;
    var el = function(id) { return document.getElementById(id); };
    if (el("specShape")) el("specShape").textContent = studioLabels.shape[s.shape] || s.shape;
    if (el("specMaterial")) el("specMaterial").textContent = studioLabels.material[s.material] || s.material;
    if (el("specFinish")) el("specFinish").textContent = studioLabels.finish[s.finish] || s.finish;
    if (el("specSize")) el("specSize").innerHTML = studioLabels.size[s.size] || s.size;
    if (el("specQty")) el("specQty").textContent = studioLabels.qty[s.qty] || s.qty;
  }

  if (studioCtrlBtns.length) {
    studioCtrlBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var ctrl = btn.getAttribute("data-ctrl");
        var val = btn.getAttribute("data-val");
        if (!ctrl || !val) return;

        // Deselect siblings
        document.querySelectorAll(".h2-ctrl-btn[data-ctrl='" + ctrl + "']").forEach(function(b) {
          b.classList.remove("h2-selected");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("h2-selected");
        btn.setAttribute("aria-pressed", "true");

        // Update state
        studioState[ctrl] = val;

        // Update preview + spec
        buildPreviewSvg();
        updateSpecPanel();
      });

      btn.addEventListener("keydown", function(e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Initial render
    buildPreviewSvg();
    updateSpecPanel();
  }

  // ─── HOME 2 — BLANK SEQUENCE REVEAL ─────────────────────────────────────────
  var blankSeqTrack = document.getElementById("blankSeqTrack");
  if (blankSeqTrack && "IntersectionObserver" in window) {
    var seqObs = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".h2-seq-step").forEach(function(step) {
              step.classList.add("seq-visible");
            });
            seqObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    seqObs.observe(blankSeqTrack);
  } else if (blankSeqTrack) {
    blankSeqTrack.querySelectorAll(".h2-seq-step").forEach(function(step) {
      step.classList.add("seq-visible");
    });
  }

  // ─── HOME 2 — CREATOR WALL DRAG-SCROLL ───────────────────────────────────────
  var creatorStrip = document.getElementById("creatorStrip");
  if (creatorStrip) {
    var isDragging = false;
    var dragStartX = 0;
    var scrollStartLeft = 0;

    creatorStrip.addEventListener("mousedown", function(e) {
      isDragging = true;
      dragStartX = e.pageX - creatorStrip.offsetLeft;
      scrollStartLeft = creatorStrip.scrollLeft;
      creatorStrip.style.cursor = "grabbing";
      e.preventDefault();
    });

    document.addEventListener("mousemove", function(e) {
      if (!isDragging) return;
      var x = e.pageX - creatorStrip.offsetLeft;
      var delta = x - dragStartX;
      creatorStrip.scrollLeft = scrollStartLeft - delta;
    });

    document.addEventListener("mouseup", function() {
      isDragging = false;
      if (creatorStrip) creatorStrip.style.cursor = "grab";
    });
  }

})();
