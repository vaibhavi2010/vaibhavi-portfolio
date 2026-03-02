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
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwDZwCfxC0K2LLpM_loYbRSKoH2m93lczoiMwu-jmeUrYQUXEFWqmnUJQTfnSBwICA/exec";

async function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus"); // you already added this in HTML
  const fd = new FormData(form);

  // Honeypot spam trap
  if ((fd.get("website") || "").toString().trim() !== "") return;

  btn.textContent = "Sending...";
  btn.disabled = true;
  statusEl.textContent = "";

  const payload = {
    first_name: fd.get("first_name") || "",
    last_name: fd.get("last_name") || "",
    email: fd.get("email") || "",
    subject: fd.get("subject") || "",
    message: fd.get("message") || "",
    page: window.location.href,
    user_agent: navigator.userAgent
  };

  try {
    // no-cors -> cannot read response, but request will be sent
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    btn.textContent = "Submitted ✓";
    btn.style.background = "var(--teal)";
    statusEl.textContent = "✅ Message submitted. ";
    form.reset();

  } catch (err) {
    btn.textContent = "Error ❌";
    btn.style.background = "#ef4444";
    statusEl.textContent = "❌ Failed to submit. Please try again.";
    console.error(err);
  }

  setTimeout(() => {
    btn.textContent = "Send Message";
    btn.style.background = "";
    btn.disabled = false;
  }, 3000);
}