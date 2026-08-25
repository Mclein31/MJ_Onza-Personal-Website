/**
 * MCLEIN JEI ONZA — SIGNATURE DEVELOPER PORTFOLIO
 * Main Interactive Module: Typing Effect, 3D Coverflow Carousel, 
 * Trait Card Cycler, Website Stats Widget, macOS Contact Modal, and Theme Management
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initHeroFloatingIcons();
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

  let transitionTimeout = null;

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

      // Enable smooth color/background transition on all visible elements
      root.classList.add('theme-transitioning');

      applyTheme(nextTheme);
      localStorage.setItem('portfolio-theme', nextTheme);

      // Subtle icon rotation feedback
      themeToggleBtn.style.transform = 'scale(0.88) rotate(45deg)';
      setTimeout(() => {
        themeToggleBtn.style.transform = '';
      }, 250);

      // Clean up transition class after animation completes
      if (transitionTimeout) clearTimeout(transitionTimeout);
      transitionTimeout = setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 380);
    });
  }

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      root.classList.add('theme-transitioning');
      applyTheme(e.matches ? 'light' : 'dark');
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 380);
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
   6. INTERACTIVE WEBSITE STATS WIDGET (UNIFIED CLOUD VISITS & LIKES)
   ========================================================================== */
function initStatsWidget() {
  const statsWidget = document.getElementById('statsWidget');
  const visitCountEl = document.getElementById('visitCount');
  const likeCountEl = document.getElementById('likeCount');
  const likeBtn = document.getElementById('likeBtnWidget');
  const likeParticleBox = document.getElementById('likeParticleBox');

  const formatNum = (num) => new Intl.NumberFormat('en-US').format(Math.max(0, num || 0));

  // 1. Initial UI render from cached local values
  let currentVisits = parseInt(localStorage.getItem('site_total_visits'), 10) || 0;
  let currentLikes = parseInt(localStorage.getItem('site_total_likes'), 10) || 0;

  if (visitCountEl) visitCountEl.textContent = formatNum(currentVisits);
  if (likeCountEl) likeCountEl.textContent = formatNum(currentLikes);

  // Helper to fetch from Vercel Serverless API with direct cloud fallback
  async function requestStats(type, metric) {
    // 1. Try first-party Vercel API (Bypasses Safari ITP and CORS)
    try {
      const res = await fetch(`/api/stats?type=${type}&metric=${metric}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === 'number') return data.count;
      }
    } catch (e) {
      // Fallback for local development or non-Vercel environments
    }

    // 2. Direct fallback to Abacus (CounterAPI v1 was deprecated Aug 2026)
    try {
      const key = metric === 'likes' ? 'portfolio_likes' : 'portfolio_visits';
      const endpoint = type === 'increment'
        ? `https://abacus.jasoncameron.dev/hit/mcleinonza/${key}`
        : `https://abacus.jasoncameron.dev/get/mcleinonza/${key}`;
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Abacus returns { value: <number> }
        if (typeof data.value === 'number') return data.value;
      }
    } catch (e) {
      console.warn(`Stats sync offline for ${metric}:`, e);
    }
    return null;
  }

  // 2. Synchronize Visits
  async function syncVisits() {
    const isNewSession = !sessionStorage.getItem('site_session_active');
    const type = isNewSession ? 'increment' : 'get';
    
    if (isNewSession) {
      sessionStorage.setItem('site_session_active', 'true');
    }

    const cloudVisits = await requestStats(type, 'visits');
    if (typeof cloudVisits === 'number') {
      currentVisits = cloudVisits;
      localStorage.setItem('site_total_visits', currentVisits);
      if (visitCountEl) visitCountEl.textContent = formatNum(currentVisits);
    }
  }

  // 3. Synchronize Likes
  async function syncLikes() {
    const cloudLikes = await requestStats('get', 'likes');
    if (typeof cloudLikes === 'number') {
      currentLikes = cloudLikes;
      localStorage.setItem('site_total_likes', currentLikes);
      if (likeCountEl) likeCountEl.textContent = formatNum(currentLikes);
    }
  }

  // 4. Draggable Floating Stats Widget (Desktop Mouse & Mobile Touch)
  let ignoreNextLikeClick = false;

  if (statsWidget) {
    let isDragging = false;
    let hasMoved = false;
    let startPointerX = 0;
    let startPointerY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    statsWidget.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const rect = statsWidget.getBoundingClientRect();
      startPointerX = e.clientX;
      startPointerY = e.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;
      isDragging = true;
      hasMoved = false;

      try {
        statsWidget.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    statsWidget.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startPointerX;
      const dy = e.clientY - startPointerY;

      if (!hasMoved && Math.hypot(dx, dy) > 5) {
        hasMoved = true;
        statsWidget.classList.add('is-dragging');
      }

      if (hasMoved) {
        const width = statsWidget.offsetWidth;
        const height = statsWidget.offsetHeight;
        const margin = 8;
        const maxLeft = window.innerWidth - width - margin;
        const maxTop = window.innerHeight - height - margin;

        const newLeft = Math.min(Math.max(margin, initialLeft + dx), maxLeft);
        const newTop = Math.min(Math.max(margin, initialTop + dy), maxTop);

        statsWidget.style.left = `${newLeft}px`;
        statsWidget.style.top = `${newTop}px`;
        statsWidget.style.bottom = 'auto';
        statsWidget.style.right = 'auto';
      }
    });

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;

      try {
        statsWidget.releasePointerCapture(e.pointerId);
      } catch (err) {}

      statsWidget.classList.remove('is-dragging');

      if (hasMoved) {
        ignoreNextLikeClick = true;
        setTimeout(() => {
          ignoreNextLikeClick = false;
        }, 150);
      }
    };

    statsWidget.addEventListener('pointerup', handlePointerUp);
    statsWidget.addEventListener('pointercancel', handlePointerUp);

    // Keep clamped inside viewport on screen resize / orientation change
    window.addEventListener('resize', () => {
      if (statsWidget.style.top && statsWidget.style.top !== 'auto') {
        const rect = statsWidget.getBoundingClientRect();
        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
        const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);

        const clampedLeft = Math.min(Math.max(margin, rect.left), maxLeft);
        const clampedTop = Math.min(Math.max(margin, rect.top), maxTop);

        statsWidget.style.left = `${clampedLeft}px`;
        statsWidget.style.top = `${clampedTop}px`;
      }
    });
  }

  // 5. Handle Interactive Like Click
  if (likeBtn && likeCountEl) {
    let isLiking = false;

    likeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (ignoreNextLikeClick || isLiking) return;
      isLiking = true;

      // Optimistic instant UI update
      currentLikes += 1;
      localStorage.setItem('site_total_likes', currentLikes);
      likeCountEl.textContent = formatNum(currentLikes);

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

      // Send increment to backend
      const updatedCloudLikes = await requestStats('increment', 'likes');
      if (typeof updatedCloudLikes === 'number') {
        currentLikes = updatedCloudLikes;
        localStorage.setItem('site_total_likes', currentLikes);
        likeCountEl.textContent = formatNum(currentLikes);
      }

      isLiking = false;
    });
  }

  // Initial sync on page load
  syncVisits();
  syncLikes();
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

/* ==========================================================================
   10. INTERACTIVE HERO FLOATING & DRAGGABLE TECH ICONS
   ========================================================================== */
function initHeroFloatingIcons() {
  const stage = document.getElementById('heroIconsStage');
  if (!stage) return;

  const icons = stage.querySelectorAll('.hero-floating-icon');
  if (!icons.length) return;

  let highestZIndex = 30;

  icons.forEach((icon) => {
    // Read computed initial angle or CSS variable
    const styleAttr = icon.getAttribute('style') || '';
    const rotMatch = styleAttr.match(/--init-rot:\s*(-?[\d.]+)deg/);
    const baseRot = rotMatch ? parseFloat(rotMatch[1]) : 0;

    // Prevent default native image drag ghosting
    const img = icon.querySelector('img');
    if (img) {
      img.setAttribute('draggable', 'false');
      img.addEventListener('dragstart', (e) => e.preventDefault());
    }

    let isDragging = false;
    let startPointerX = 0;
    let startPointerY = 0;
    let startElemX = 0;
    let startElemY = 0;

    icon.addEventListener('pointerdown', (e) => {
      // Only handle primary mouse click or touch
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      isDragging = true;
      highestZIndex += 1;
      icon.style.zIndex = highestZIndex;
      icon.classList.add('is-dragging');

      try {
        icon.setPointerCapture(e.pointerId);
      } catch (err) {
        // Fallback for browsers with restricted pointer capture
      }

      startPointerX = e.clientX;
      startPointerY = e.clientY;

      const stageRect = stage.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();

      // Current center point in stage coordinates
      startElemX = iconRect.left - stageRect.left + iconRect.width / 2;
      startElemY = iconRect.top - stageRect.top + iconRect.height / 2;

      e.preventDefault();
    });

    icon.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startPointerX;
      const deltaY = e.clientY - startPointerY;

      let currentX = startElemX + deltaX;
      let currentY = startElemY + deltaY;

      const stageRect = stage.getBoundingClientRect();
      const halfW = icon.offsetWidth / 2;
      const halfH = icon.offsetHeight / 2;

      // Clamp within hero container bounds
      const minX = halfW + 6;
      const maxX = stageRect.width - halfW - 6;
      const minY = halfH + 6;
      const maxY = stageRect.height - halfH - 6;

      currentX = Math.max(minX, Math.min(maxX, currentX));
      currentY = Math.max(minY, Math.min(maxY, currentY));

      // Dynamic responsive tilt based on drag movement
      const dynamicTilt = Math.max(-28, Math.min(28, baseRot + deltaX * 0.07));

      icon.style.left = `${currentX}px`;
      icon.style.top = `${currentY}px`;
      icon.style.transform = `translate(-50%, -50%) rotate(${dynamicTilt}deg)`;
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      icon.classList.remove('is-dragging');

      try {
        if (icon.hasPointerCapture(e.pointerId)) {
          icon.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}

      // Smoothly return to natural base rotation
      icon.style.transform = `translate(-50%, -50%) rotate(${baseRot}deg)`;
    };

    icon.addEventListener('pointerup', endDrag);
    icon.addEventListener('pointercancel', endDrag);

    // Keyboard navigation (Arrow keys nudge the focused icon)
    icon.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 30 : 12;
      const stageRect = stage.getBoundingClientRect();
      const iconRect = icon.getBoundingClientRect();
      let currentX = iconRect.left - stageRect.left + iconRect.width / 2;
      let currentY = iconRect.top - stageRect.top + iconRect.height / 2;

      if (e.key === 'ArrowLeft') currentX -= step;
      else if (e.key === 'ArrowRight') currentX += step;
      else if (e.key === 'ArrowUp') currentY -= step;
      else if (e.key === 'ArrowDown') currentY += step;
      else return;

      e.preventDefault();
      highestZIndex += 1;
      icon.style.zIndex = highestZIndex;

      const halfW = icon.offsetWidth / 2;
      const halfH = icon.offsetHeight / 2;
      currentX = Math.max(halfW + 6, Math.min(stageRect.width - halfW - 6, currentX));
      currentY = Math.max(halfH + 6, Math.min(stageRect.height - halfH - 6, currentY));

      icon.style.left = `${currentX}px`;
      icon.style.top = `${currentY}px`;
    });
  });

  // Keep scattered icons within boundary on viewport resize
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const stageRect = stage.getBoundingClientRect();
      icons.forEach((icon) => {
        const iconRect = icon.getBoundingClientRect();
        let currentX = iconRect.left - stageRect.left + iconRect.width / 2;
        let currentY = iconRect.top - stageRect.top + iconRect.height / 2;
        const halfW = icon.offsetWidth / 2;
        const halfH = icon.offsetHeight / 2;

        if (currentX > stageRect.width - halfW || currentY > stageRect.height - halfH) {
          currentX = Math.max(halfW + 6, Math.min(stageRect.width - halfW - 6, currentX));
          currentY = Math.max(halfH + 6, Math.min(stageRect.height - halfH - 6, currentY));
          icon.style.left = `${currentX}px`;
          icon.style.top = `${currentY}px`;
        }
      });
    }, 150);
  });
}

