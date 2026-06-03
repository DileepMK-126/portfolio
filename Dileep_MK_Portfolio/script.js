const canvas = document.querySelector("#ai-field");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-navigation");
const navLinks = document.querySelectorAll(".primary-nav a");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const themeToggle = document.querySelector("#theme-toggle");
const year = document.querySelector("#year");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
const tiltTargets = document.querySelectorAll(".portrait-wrap, .project-card, .focus-list article, .skills-column, .contact-details article, .social-links a");

document.body.classList.add("is-ready");

if (year) {
  year.textContent = new Date().getFullYear();
}

function getStoredTheme() {
  try {
    return localStorage.getItem("dileep-portfolio-theme");
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem("dileep-portfolio-theme", theme);
  } catch {
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;

  if (themeToggle) {
    const isDark = nextTheme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }
}

const preferredTheme = getStoredTheme() || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sections = Array.from(document.querySelectorAll("main section[id]"));
const activeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -48% 0px", threshold: 0 }
);

sections.forEach((section) => activeObserver.observe(section));

function updateScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  document.body.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

function setupAnimatedCursor() {
  if (reduceMotion.matches || !finePointer.matches) return;

  const cursor = document.createElement("div");
  const ring = document.createElement("span");
  const core = document.createElement("span");
  const sparks = Array.from({ length: 6 }, () => document.createElement("span"));
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  const sparkState = sparks.map((spark, index) => {
    spark.className = "cursor-spark";
    cursor.appendChild(spark);
    return {
      x: mouseX,
      y: mouseY,
      speed: 0.11 + index * 0.018,
      offset: index * 0.72,
    };
  });

  cursor.className = "cursor-system is-hidden";
  ring.className = "cursor-ring";
  core.className = "cursor-core";
  cursor.append(ring, core);
  document.body.appendChild(cursor);
  document.documentElement.classList.add("has-custom-cursor");

  function moveElement(element, x, y, scale = 1) {
    element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
  }

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    moveElement(core, mouseX, mouseY);
    moveElement(ring, ringX, ringY);

    sparkState.forEach((state, index) => {
      state.x += (mouseX - state.x) * state.speed;
      state.y += (mouseY - state.y) * state.speed;
      const pulse = 0.72 + Math.sin(performance.now() * 0.004 + state.offset) * 0.28;
      moveElement(sparks[index], state.x, state.y, pulse);
    });

    window.requestAnimationFrame(renderCursor);
  }

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.classList.remove("is-hidden");
  }, { passive: true });

  window.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
  window.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));
  window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));

  document.querySelectorAll("a, button, input, textarea, .project-card, .portrait-wrap").forEach((target) => {
    target.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
    target.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
  });

  renderCursor();
}

function setupTiltMotion() {
  if (reduceMotion.matches || !finePointer.matches) return;

  tiltTargets.forEach((target) => {
    target.addEventListener("pointermove", (event) => {
      const bounds = target.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      const tiltX = (x - 0.5) * 9;
      const tiltY = (0.5 - y) * 9;

      target.style.setProperty("--tilt-x", `${tiltX}deg`);
      target.style.setProperty("--tilt-y", `${tiltY}deg`);
      target.style.setProperty("--spot-x", `${x * 100}%`);
      target.style.setProperty("--spot-y", `${y * 100}%`);
    }, { passive: true });

    target.addEventListener("pointerleave", () => {
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      target.style.setProperty("--spot-x", "50%");
      target.style.setProperty("--spot-y", "50%");
    });
  });
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const recipient = contactForm.dataset.recipient || "dileep.m.k126@gmail.com";

    if (!name || !email || !message) {
      formStatus.textContent = "Please complete all fields before sending.";
      return;
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    formStatus.textContent = "Opening your email app with a ready-to-send message.";
  });
}

function setupAiField() {
  if (!canvas || reduceMotion.matches) return;

  const context = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let tick = 0;
  const pointer = { x: 0, y: 0 };

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, bounds.width);
    height = Math.max(480, bounds.height);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particleCount = Math.min(92, Math.max(44, Math.floor(width / 18)));
    particles.length = 0;

    for (let index = 0; index < particleCount; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.9 + 0.8,
        color: index % 4 === 0 ? "244, 180, 0" : index % 3 === 0 ? "239, 71, 111" : index % 2 === 0 ? "58, 134, 255" : "0, 168, 150",
      });
    }
  }

  function draw() {
    tick += 1;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(16, 19, 26, 0.18)";
    context.fillRect(0, 0, width, height);

    const sweepX = ((Math.sin(tick * 0.014) + 1) / 2) * width;
    const sweepGradient = context.createLinearGradient(sweepX - 220, 0, sweepX + 220, height);
    sweepGradient.addColorStop(0, "rgba(124, 246, 200, 0)");
    sweepGradient.addColorStop(0.5, "rgba(124, 246, 200, 0.18)");
    sweepGradient.addColorStop(1, "rgba(239, 71, 111, 0)");
    context.beginPath();
    context.moveTo(sweepX - 260, 0);
    context.lineTo(sweepX + 120, height);
    context.strokeStyle = sweepGradient;
    context.lineWidth = 2;
    context.stroke();

    particles.forEach((particle, index) => {
      const driftX = (pointer.x - width / 2) * 0.00005;
      const driftY = (pointer.y - height / 2) * 0.00005;
      particle.x += particle.vx + driftX;
      particle.y += particle.vy + driftY;

      if (particle.x < -12) particle.x = width + 12;
      if (particle.x > width + 12) particle.x = -12;
      if (particle.y < -12) particle.y = height + 12;
      if (particle.y > height + 12) particle.y = -12;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${particle.color}, 0.82)`;
      context.shadowColor = `rgba(${particle.color}, 0.55)`;
      context.shadowBlur = 12;
      context.fill();
      context.shadowBlur = 0;

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 132) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.strokeStyle = `rgba(130, 242, 223, ${0.16 * (1 - distance / 132)})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    });

    frame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
    } else {
      draw();
    }
  });

  resize();
  draw();
}

setupAnimatedCursor();
setupTiltMotion();
setupAiField();
