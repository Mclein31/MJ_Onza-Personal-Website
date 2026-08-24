/**
 * MCLEIN JEI ONZA — SIGNATURE DEVELOPER PORTFOLIO
 * Main Interactive Module: Typing Effect, 3D Coverflow Carousel, 
 * Trait Card Cycler, Coffee Counter, macOS Contact Modal, and Theme Management
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTypingEffect();
  initCoverflowCarousel();
  initTraitCard();
  initCoffeeCounter();
  initContactModal();
  initScrollSpy();
});

/* ==========================================================================
   1. THEME MANAGEMENT (Dark / Light with System Preference Sync)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const root = document.documentElement;

  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      localStorage.setItem('portfolio-theme', nextTheme);
    });
  }

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      applyTheme(e.matches ? 'light' : 'dark');
    }
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.setAttribute('theme', 'light');
    } else {
      root.removeAttribute('data-theme');
      root.removeAttribute('theme');
    }
  }
}

/* ==========================================================================
   2. FLOATING NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initNavigation() {
  const hamburgerBtn = document.getElementById('navHamburger');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = mobileDrawer.classList.toggle('active');
      hamburgerBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('active') && !mobileDrawer.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        mobileDrawer.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('active')) {
        mobileDrawer.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ==========================================================================
   3. DYNAMIC TYPING HEADLINE EFFECT
   ========================================================================== */
function initTypingEffect() {
  const typingElement = document.getElementById('typingHeadline');
  if (!typingElement) return;

  const phrases = [
    "Aspiring Data Engineer.",
    "Learning Python, SQL & PostgreSQL.",
    "Web Developer & Systems Builder.",
    "Turning Logic into Practical Software."
  ];

  let phraseIndex = 0;
  let letterIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typingElement.textContent = currentPhrase.substring(0, letterIndex - 1);
      letterIndex--;
      typingSpeed = 45;
    } else {
      typingElement.textContent = currentPhrase.substring(0, letterIndex + 1);
      letterIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && letterIndex === currentPhrase.length) {
      // Pause at full word
      typingSpeed = 2200;
      isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 450;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   4. 3D COVERFLOW WORK GALLERY CAROUSEL
   ========================================================================== */
function initCoverflowCarousel() {
  const cards = document.querySelectorAll('.coverflow-card');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const dotsContainer = document.getElementById('carouselIndicators');
  const titleEl = document.getElementById('coverflowTitle');
  const descEl = document.getElementById('coverflowDesc');
  const linkEl = document.getElementById('coverflowLink');

  if (!cards.length) return;

  // Project details data
  const projectData = [
    {
      title: "Mulat Media — Student Publication CMS",
      desc: "Multi-page digital publication platform engineered with article submission workflows, category hierarchies, and role-based editorial access control.",
      link: "https://mulat-media.vercel.app/",
      label: "View Live Publication →"
    },
    {
      title: "Hanguk Grill — Restaurant Web Platform",
      desc: "High-performance web application designed for a Korean samgyupsal restaurant featuring dynamic interactive menus, location mapping, and reservations.",
      link: "https://hanguk-grill.vercel.app/",
      label: "View Live Website →"
    },
    {
      title: "Cipher Shift — Cryptography & OCR Tool",
      desc: "Algorithmic Caesar cipher utility in Python with image OCR text extraction and brute-force frequency heuristics to detect probable plaintext.",
      link: "https://github.com/Mclein31/Caesar-Cipher",
      label: "View Source Code on GitHub →"
    },
    {
      title: "Developer Portfolio — Modern System",
      desc: "Minimalist portfolio engineered with pure CSS design tokens, persistent dark/light theme switching, and sub-second load times.",
      link: "https://onzamj.vercel.app/",
      label: "View Live Site →"
    },
    {
      title: "MedRec — Medical Records Application",
      desc: "Secure medical records management mobile application designed to organize patient histories, consultations, and clinic prescriptions.",
      link: "#archive",
      label: "View in Technical Archive →"
    }
  ];

  let currentIndex = 0;

  // Build indicator dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => updateCoverflow(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function updateCoverflow(newIndex) {
    currentIndex = (newIndex + cards.length) % cards.length;

    cards.forEach((card, i) => {
      card.className = 'coverflow-card';
      const offset = (i - currentIndex + cards.length) % cards.length;

      if (offset === 0) {
        card.classList.add('active');
      } else if (offset === 1) {
        card.classList.add('next');
      } else if (offset === cards.length - 1) {
        card.classList.add('prev');
      } else if (offset > 1 && offset <= Math.floor(cards.length / 2)) {
        card.classList.add('hidden-right');
      } else {
        card.classList.add('hidden-left');
      }
    });

    // Update active project info
    const currentData = projectData[currentIndex];
    if (currentData) {
      if (titleEl) titleEl.textContent = currentData.title;
      if (descEl) descEl.textContent = currentData.desc;
      if (linkEl) {
        linkEl.href = currentData.link;
        linkEl.textContent = currentData.label;
        if (currentData.link.startsWith('http')) {
          linkEl.target = '_blank';
          linkEl.rel = 'noopener noreferrer';
        } else {
          linkEl.removeAttribute('target');
        }
      }
    }

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }
  }

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => updateCoverflow(idx));
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => updateCoverflow(currentIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => updateCoverflow(currentIndex + 1));
  }

  // Keyboard navigation on stage
  document.addEventListener('keydown', (e) => {
    const gallerySection = document.getElementById('work');
    if (!gallerySection) return;
    const rect = gallerySection.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      if (e.key === 'ArrowLeft') updateCoverflow(currentIndex - 1);
      if (e.key === 'ArrowRight') updateCoverflow(currentIndex + 1);
    }
  });

  updateCoverflow(0);
}

/* ==========================================================================
   5. INTERACTIVE TRAIT CARD CYCLER
   ========================================================================== */
function initTraitCard() {
  const traitCard = document.getElementById('interactiveTraitCard');
  const traitTitle = document.getElementById('traitTitle');
  if (!traitCard || !traitTitle) return;

  const traits = [
    "Problem Solver",
    "Clean Code Advocate",
    "Continuous Learner",
    "Fast Builder",
    "Systems Minded",
    "Detail Oriented"
  ];

  let traitIdx = 0;

  traitCard.addEventListener('click', () => {
    traitIdx = (traitIdx + 1) % traits.length;
    traitCard.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      traitTitle.textContent = traits[traitIdx];
      traitCard.style.transform = '';
    }, 150);
  });
}

/* ==========================================================================
   6. INTERACTIVE COFFEE COUNTER WIDGET
   ========================================================================== */
function initCoffeeCounter() {
  const coffeeWidget = document.getElementById('coffeeCounterWidget');
  const coffeeCountEl = document.getElementById('coffeeCount');
  if (!coffeeWidget || !coffeeCountEl) return;

  let currentCount = parseInt(localStorage.getItem('portfolio-coffee-count'), 10);
  if (isNaN(currentCount) || currentCount < 306) {
    currentCount = 306;
  }
  coffeeCountEl.textContent = currentCount;

  coffeeWidget.addEventListener('click', () => {
    currentCount++;
    coffeeCountEl.textContent = currentCount;
    localStorage.setItem('portfolio-coffee-count', currentCount);

    coffeeWidget.style.transform = 'scale(1.2) rotate(8deg)';
    setTimeout(() => {
      coffeeWidget.style.transform = '';
    }, 200);
  });
}

/* ==========================================================================
   7. MACOS STYLE CONTACT MODAL WINDOW
   ========================================================================== */
function initContactModal() {
  const modalOverlay = document.getElementById('contactModalOverlay');
  const openModalBtns = document.querySelectorAll('.trigger-contact-modal');
  const closeModalBtns = document.querySelectorAll('.trigger-close-modal');
  const form = document.getElementById('modalContactForm');
  const submitBtn = document.getElementById('modalSubmitBtn');
  const statusMsg = document.getElementById('modalStatusMsg');

  if (!modalOverlay) return;

  openModalBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      const nameInput = document.getElementById('modalFullName');
      if (nameInput) setTimeout(() => nameInput.focus(), 250);
    });
  });

  closeModalBtns.forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Form submission handling
  if (form && submitBtn && statusMsg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `Sending...`;

      statusMsg.className = 'modal-status-msg';
      statusMsg.style.display = 'none';

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          statusMsg.textContent = '✓ Message sent successfully! I will reply shortly.';
          statusMsg.className = 'modal-status-msg success';
          statusMsg.style.display = 'block';
          form.reset();
          setTimeout(() => {
            closeModal();
            statusMsg.style.display = 'none';
          }, 2400);
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        statusMsg.textContent = '✕ Error sending message. Please email directly at mcleinonza0531@gmail.com';
        statusMsg.className = 'modal-status-msg error';
        statusMsg.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
}

/* ==========================================================================
   8. SCROLL SPY
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach((section) => observer.observe(section));
}
