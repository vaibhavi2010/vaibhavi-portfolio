/* ═══════════════════════════════════════════════════════
   VAIBHAVI HONAGEKAR — DATA ENGINEER PORTFOLIO
   main.js
   ═══════════════════════════════════════════════════════ */

/* ── SCROLL REVEAL ────────────────────────────────────── */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ── ACTIVE NAV HIGHLIGHT ON SCROLL ───────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a:not(.nav-resume)');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 90) {
      current = sec.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === '#' + current;
    link.style.color      = isActive ? 'var(--accent2)' : '';
    link.style.fontWeight = isActive ? '600'            : '';
  });
});

/* ── MOBILE MENU TOGGLE ───────────────────────────────── */
function toggleMobileMenu() {
  const menu = document.getElementById('mobMenu');
  menu.classList.toggle('open');
}

// Close mobile menu when a link is clicked
document.querySelectorAll('.mob-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    document.getElementById('mobMenu').classList.remove('open');
  });
});

/* ── CONTACT FORM SUBMIT ──────────────────────────────── */
const API_URL = "https://vaibhavi-portfolio-tau.vercel.app/api/contact";

async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");
  const fd = new FormData(form);

  // Honeypot spam trap
  if ((fd.get("website") || "").toString().trim() !== "") return;

  btn.textContent = "Sending...";
  btn.disabled = true;
  statusEl.textContent = "";
  statusEl.style.color = "";

  const payload = {
    first_name: (fd.get("first_name") || "").toString().trim(),
    last_name: (fd.get("last_name") || "").toString().trim(),
    email: (fd.get("email") || "").toString().trim(),
    subject: (fd.get("subject") || "").toString().trim(),
    message: (fd.get("message") || "").toString().trim(),
    page: window.location.href,
    user_agent: navigator.userAgent,
    website: (fd.get("website") || "").toString()
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await res.json(); } catch (_) {}

    if (!res.ok || result.success !== true) {
      throw new Error(result.error || `Request failed (${res.status})`);
    }

    btn.textContent = "Submitted ✓";
    btn.style.background = "var(--teal)";
    statusEl.textContent = "✅ Message submitted.";
    statusEl.style.color = "var(--teal)";
    form.reset();
  } catch (err) {
    btn.textContent = "Error ❌";
    btn.style.background = "#ef4444";
    statusEl.textContent = `❌ Failed to submit. ${err.message}`;
    statusEl.style.color = "#ef4444";
    console.error(err);
  }

  setTimeout(() => {
    btn.textContent = "Send Message";
    btn.style.background = "";
    btn.disabled = false;
  }, 3000);
}
