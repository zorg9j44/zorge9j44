// Interactive Functionality for Stroy-Master B2B Landing Page
// Clean & Optimized for Pixel-Perfect Figma & Tilda Zero Block (T123) Standard

document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
  initPhoneMask();
  initModals();
  initMobileMenu();
  initFormSubmissions();
  initFaqAccordion();
  initBackToTop();
  initVideoReviews();
});

/* ==========================================================================
   1. Dynamic Cost Calculator Logic
   ========================================================================== */
function initCalculator() {
  const areaSlider = document.getElementById('calc-area-slider');
  const areaInput = document.getElementById('calc-area-input');
  const objectTypeSelect = document.getElementById('calc-object-type');
  const renovationRadios = document.getElementsByName('calc-renovation-type');
  const optionDesign = document.getElementById('calc-opt-design');
  const optionDemolition = document.getElementById('calc-opt-demolition');
  const optionEngineering = document.getElementById('calc-opt-engineering');

  const totalMinEl = document.getElementById('calc-total-min');
  const totalMaxEl = document.getElementById('calc-total-max');
  const durationEl = document.getElementById('calc-duration');

  if (!areaSlider || !areaInput) return;

  // Sync slider and number input
  areaSlider.addEventListener('input', (e) => {
    areaInput.value = e.target.value;
    calculateEstimate();
  });

  areaInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value, 10) || 10;
    if (val < 10) val = 10;
    if (val > 1000) val = 1000;
    areaSlider.value = val;
    calculateEstimate();
  });

  // Event listeners for options
  if (objectTypeSelect) objectTypeSelect.addEventListener('change', calculateEstimate);
  renovationRadios.forEach(radio => radio.addEventListener('change', calculateEstimate));
  if (optionDesign) optionDesign.addEventListener('change', calculateEstimate);
  if (optionDemolition) optionDemolition.addEventListener('change', calculateEstimate);
  if (optionEngineering) optionEngineering.addEventListener('change', calculateEstimate);

  function calculateEstimate() {
    const area = parseFloat(areaInput.value) || 85;

    // Base rate per m²
    let baseRate = 12000; // Capital default
    renovationRadios.forEach(radio => {
      if (radio.checked) {
        baseRate = parseFloat(radio.value) || 12000;
      }
    });

    // Object type coefficient
    const typeCoeff = objectTypeSelect ? (parseFloat(objectTypeSelect.value) || 1.0) : 1.0;

    // Additional options per m²
    let addOnsRate = 0;
    if (optionDesign && optionDesign.checked) addOnsRate += 1500;
    if (optionDemolition && optionDemolition.checked) addOnsRate += 800;
    if (optionEngineering && optionEngineering.checked) addOnsRate += 2500;

    // Calculation formula
    const baseTotal = area * (baseRate * typeCoeff + addOnsRate);
    const minTotal = Math.round((baseTotal * 0.95) / 1000) * 1000;
    const maxTotal = Math.round((baseTotal * 1.05) / 1000) * 1000;

    // Days estimate
    let days = Math.round(15 + area * 0.45);
    if (baseRate > 15000) days = Math.round(days * 1.3);

    // Format currency & days
    if (totalMinEl) totalMinEl.textContent = formatCurrency(minTotal);
    if (totalMaxEl) totalMaxEl.textContent = formatCurrency(maxTotal);
    if (durationEl) durationEl.textContent = `${days} рабочих дней`;
  }

  // Initial run
  calculateEstimate();
}

function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}

/* ==========================================================================
   2. Telephone Input Mask (+7 (XXX) XXX-XX-XX)
   ========================================================================== */
function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let matrix = '+7 (___) ___-__-__';
      let i = 0;
      let def = matrix.replace(/\D/g, '');
      let val = e.target.value.replace(/\D/g, '');

      if (def.length >= val.length) val = def;

      e.target.value = matrix.replace(/./g, function (a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a;
      });
    });

    input.addEventListener('focus', (e) => {
      if (!e.target.value) {
        e.target.value = '+7 (';
      }
    });

    input.addEventListener('blur', (e) => {
      if (e.target.value === '+7 (' || e.target.value === '+7') {
        e.target.value = '';
      }
    });
  });
}

/* ==========================================================================
   3. Modals Management (Call Modal, Success Modal, Video Modal)
   ========================================================================== */
function initModals() {
  const openButtons = document.querySelectorAll('[data-modal-target]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');
  const modals = document.querySelectorAll('.modal-container');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-modal-target');
      const videoTitle = btn.getAttribute('data-video-title');
      
      if (targetId === 'video-modal' && videoTitle) {
        const titleEl = document.getElementById('video-modal-title');
        if (titleEl) titleEl.textContent = videoTitle;
      }
      
      openModal(targetId);
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-container');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close on backdrop click
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('is-active')) {
          closeModal(modal.id);
        }
      });
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   4. Mobile Navigation Toggle
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.mobile-nav__link, .mobile-nav .button');

  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });

  // Close mobile menu when clicking any nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
    });
  });
}

/* ==========================================================================
   5. Form Submissions & Confirmation
   ========================================================================== */
function initFormSubmissions() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const phoneInput = form.querySelector('input[type="tel"]');
      if (phoneInput && phoneInput.value.length < 18) {
        alert('Пожалуйста, введите полный номер телефона для связи.');
        phoneInput.focus();
        return;
      }

      // Close open modals if any
      const openModalEl = form.closest('.modal-container');
      if (openModalEl) {
        closeModal(openModalEl.id);
      }

      // Open Success Modal
      openModal('success-modal');

      // Reset form
      form.reset();
    });
  });
}

/* ==========================================================================
   6. FAQ Accordion Handler
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        
        // Close all items
        faqItems.forEach(i => i.classList.remove('is-open'));

        // Toggle clicked
        if (!isOpen) {
          item.classList.add('is-open');
        }
      });
    }
  });
}

/* ==========================================================================
   7. Back to Top Button Handler
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   8. Video Reviews Card Click Handler
   ========================================================================== */
function initVideoReviews() {
  const videoCards = document.querySelectorAll('.video-card');
  videoCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Avoid duplicate triggers if clicking directly on a button inside
      const videoTitle = card.getAttribute('data-video-title') || 'Видеоотзыв заказчика';
      const titleEl = document.getElementById('video-modal-title');
      if (titleEl) titleEl.textContent = videoTitle;
      openModal('video-modal');
    });
  });
}
