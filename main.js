/**
 * MCLEIN JEI ONZA — SIGNATURE DEVELOPER PORTFOLIO
 * Main Interactive Module: Typing Effect, 3D Coverflow Carousel, 
 * Trait Card Cycler, Website Stats Widget, macOS Contact Modal, and Theme Management
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTypingEffect();
  initCoverflowCarousel();
  initTraitCard();
  initStatsWidget();
  initContactModal();
  initScrollSpy();
  initTrainingSlider();
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

  let isTransitioning = false;

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (isTransitioning) return;
      isTransitioning = true;

      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

      // Button center coordinates at top right
      const rect = themeToggleBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Create high-performance hardware-accelerated splash canvas
      const splash = document.createElement('div');
      splash.className = 'theme-splash-canvas';
      splash.style.background = nextTheme === 'light' ? '#f7f8fa' : '#090a0f';
      document.body.appendChild(splash);

      const anim = splash.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
        ],
        {
          duration: 520,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards'
        }
      );

      anim.onfinish = () => {
        applyTheme(nextTheme);
        localStorage.setItem('portfolio-theme', nextTheme);
        splash.remove();
        isTransitioning = false;
      };
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

  // Smooth scroll for all anchor navigation links (prevents jarring snap)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.startsWith('#http')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();

        // Close mobile drawer if open
        if (mobileDrawer && mobileDrawer.classList.contains('active')) {
          mobileDrawer.classList.remove('active');
          if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
        }

        const navHeight = document.querySelector('.navbar')?.offsetHeight || 60;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

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
      link: "https://github.com/Mclein31",
      label: "View Source Code on GitHub →"
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

    // Update active project info with smooth crossfade
    const activeInfo = document.querySelector('.coverflow-active-info');
    if (activeInfo) {
      activeInfo.style.opacity = '0.3';
      setTimeout(() => {
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
        activeInfo.style.opacity = '1';
      }, 140);
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

  // Touch Swipe Support for Mobile & Tablets
  const stageWrap = document.querySelector('.coverflow-stage-wrap');
  if (stageWrap) {
    let touchStartX = 0;
    let touchEndX = 0;

    stageWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stageWrap.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 35;
      if (touchEndX < touchStartX - swipeThreshold) {
        updateCoverflow(currentIndex + 1);
      } else if (touchEndX > touchStartX + swipeThreshold) {
        updateCoverflow(currentIndex - 1);
      }
    }, { passive: true });
  }

  // Keyboard navigation on stage
  document.addEventListener('keydown', (e) => {
    const gallerySection = document.getElementById('projects') || document.getElementById('work');
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
  const traitDeckStack = document.getElementById('traitDeckStack');
  if (!traitDeckStack) return;

  const cards = Array.from(traitDeckStack.querySelectorAll('.trait-stack-card'));
  if (cards.length === 0) return;

  // Track the current card order indices
  let order = cards.map((_, i) => i);
  let isAnimating = false;

  function updateCardPositions() {
    cards.forEach((card, i) => {
      const pos = order.indexOf(i);
      card.className = 'trait-stack-card';
      if (pos === 0) {
        card.classList.add('card-pos-0');
      } else if (pos === 1) {
        card.classList.add('card-pos-1');
      } else if (pos === 2) {
        card.classList.add('card-pos-2');
      } else {
        card.classList.add('card-pos-hidden');
      }
    });
  }

  updateCardPositions();

  traitDeckStack.addEventListener('click', () => {
    if (isAnimating) return;
    isAnimating = true;

    const currentFrontCard = cards[order[0]];
    const nextFrontCard = cards[order[1]];
    const nextMiddleCard = cards[order[2]];
    const nextBackCard = order.length > 3 ? cards[order[3]] : null;

    // 1. Slide top card out to the top-right
    currentFrontCard.classList.add('card-sliding-out');

    // 2. Simultaneously step lower cards forward
    setTimeout(() => {
      if (nextFrontCard) {
        nextFrontCard.className = 'trait-stack-card card-pos-0';
      }
      if (nextMiddleCard) {
        nextMiddleCard.className = 'trait-stack-card card-pos-1';
      }
      if (nextBackCard) {
        nextBackCard.className = 'trait-stack-card card-pos-2';
      }
    }, 60);

    // 3. Glide the previous front card smoothly behind the stack
    setTimeout(() => {
      currentFrontCard.classList.remove('card-sliding-out');
      currentFrontCard.classList.add('card-sliding-behind');
    }, 240);

    // 4. Finalize position indices and reset state
    setTimeout(() => {
      order.push(order.shift()); // Shift front card to the very back of the array
      updateCardPositions();
      isAnimating = false;
    }, 520);
  });
}

/* ==========================================================================
   6. INTERACTIVE WEBSITE STATS WIDGET (VISITS & LIKES)
   ========================================================================== */
function initStatsWidget() {
  const visitCountEl = document.getElementById('visitCount');
  const likeCountEl = document.getElementById('likeCount');
  const likeBtn = document.getElementById('likeBtnWidget');
  const likeParticleBox = document.getElementById('likeParticleBox');

  // Format numbers with commas (e.g. 1,248)
  const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);

  // Clean up legacy test keys from previous versions
  if (localStorage.getItem('portfolio-visit-count') || localStorage.getItem('portfolio-like-count') || localStorage.getItem('portfolio-coffee-count')) {
    localStorage.removeItem('portfolio-visit-count');
    localStorage.removeItem('portfolio-like-count');
    localStorage.removeItem('portfolio-coffee-count');
  }

  // 1. Handle Page Visits Count (starts from 0)
  if (visitCountEl) {
    let visits = parseInt(localStorage.getItem('site-visits-count'), 10);
    if (isNaN(visits) || visits < 0) {
      visits = 0;
    }

    // Increment real visit once per browser session
    if (!sessionStorage.getItem('site-session-visited')) {
      visits += 1;
      localStorage.setItem('site-visits-count', visits);
      sessionStorage.setItem('site-session-visited', 'true');
    }

    visitCountEl.textContent = formatNum(visits);
  }

  // 2. Handle Website Likes Counter (starts from 0)
  if (likeCountEl && likeBtn) {
    let likes = parseInt(localStorage.getItem('site-likes-count'), 10);
    if (isNaN(likes) || likes < 0) {
      likes = 0;
    }
    likeCountEl.textContent = formatNum(likes);

    likeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      likes += 1;
      likeCountEl.textContent = formatNum(likes);
      localStorage.setItem('site-likes-count', likes);

      // Heart bounce micro-interaction
      const heartIcon = likeBtn.querySelector('.like-heart-icon');
      if (heartIcon) {
        heartIcon.style.transform = 'scale(1.45)';
        setTimeout(() => {
          heartIcon.style.transform = '';
        }, 220);
      }

      // Spawn floating +1 ❤️ particle
      if (likeParticleBox) {
        const particle = document.createElement('span');
        particle.className = 'like-float-burst';
        particle.textContent = '+1 ❤️';
        likeParticleBox.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 800);
      }
    });
  }
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
      const mobileDrawer = document.getElementById('mobileNavDrawer');
      const hamburgerBtn = document.getElementById('navHamburger');
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');

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

/* ==========================================================================
   9. TRAINING AUTO-SLIDER CAROUSEL (DTI YEP & SEMINARS)
   ========================================================================== */
function initTrainingSlider() {
  const slider = document.getElementById('trainingSlider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.training-slide');
  const dots = slider.querySelectorAll('.slider-dot');
  const counter = document.getElementById('sliderCounter');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');

  if (!slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  const intervalTime = parseInt(slider.getAttribute('data-interval'), 10) || 3500;
  let autoSlideTimer = null;
  let isPaused = false;

  function showSlide(index) {
    if (index >= totalSlides) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = totalSlides - 1;
    } else {
      currentIndex = index;
    }

    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });

    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      if (!isPaused) {
        showSlide(currentIndex + 1);
      }
    }, intervalTime);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  // Next / Prev button event listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(currentIndex + 1);
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showSlide(currentIndex - 1);
      startAutoSlide();
    });
  }

  // Dot navigation
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoSlide();
    });
  });

  // Pause on hover
  slider.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  slider.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 40;
    if (touchEndX < touchStartX - swipeThreshold) {
      showSlide(currentIndex + 1);
      startAutoSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      showSlide(currentIndex - 1);
      startAutoSlide();
    }
  }

  // Start auto-slider
  showSlide(0);
  startAutoSlide();
}

