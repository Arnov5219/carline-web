/* -------------------------------------------------------------
 * CARLine Technologies - Client-side Logic (js/main.js)
 * Metric counters, scroll reveals, responsive navigation & shares
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  setupScrollReveal();
  setupMetricsCounter();
  setupShareButton();
  setupTimelineAnimation();
  setupContactForm();
});

/**
 * Initializes interactions for HTML injected by js/include.js.
 */
window.initializeSharedComponents = function initializeSharedComponents() {
  setupHeaderScroll();
  setupMobileNav();
  setupActiveNavLinks();
};

/**
 * 1. Scroll-triggered Navbar Style Changes
 */
function setupHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Run on load just in case page starts scrolled
  handleScroll();
}

/**
 * 2. Mobile Drawer Navigation with Services Accordion Sub-menu
 */
function setupMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const links = document.querySelectorAll('.nav-mobile-link');
  const subLinks = document.querySelectorAll('.mobile-sub-link');
  const dropdownToggle = document.querySelector('.mobile-dropdown-toggle');
  const dropdownMenu = document.querySelector('.mobile-dropdown-menu');
  
  if (!toggleBtn || !overlay) return;

  const toggleMenu = () => {
    const isOpen = overlay.classList.contains('open');
    if (isOpen) {
      overlay.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      
      // Close dropdown inside menu when overlay closes
      if (dropdownMenu) dropdownMenu.classList.remove('open');
      if (dropdownToggle) dropdownToggle.classList.remove('open');
    } else {
      overlay.classList.add('open');
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent body scroll when open
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Accordion Toggle for mobile "Services" dropdown
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdownMenu.classList.toggle('open');
      dropdownToggle.classList.toggle('open');
    });
  }
  
  // Close menu when clicking on any mobile nav links, EXCEPT the dropdown toggle
  links.forEach(link => {
    if (link !== dropdownToggle) {
      link.addEventListener('click', () => {
        if (overlay.classList.contains('open')) {
          toggleMenu();
        }
      });
    }
  });

  // Close menu when clicking on any mobile dropdown sub links
  subLinks.forEach(subLink => {
    subLink.addEventListener('click', () => {
      if (overlay.classList.contains('open')) {
        toggleMenu();
      }
    });
  });
}

/**
 * 3. Scroll Reveal Animation utilizing IntersectionObserver
 */
function setupScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.12, // Trigger when 12% of the element is visible
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

/**
 * 4. Statistics Metric Count-up Animation
 */
function setupMetricsCounter() {
  const counterElements = document.querySelectorAll('.counter');
  if (counterElements.length === 0) return;

  const runCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500; // 1.5 seconds duration
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const animate = () => {
      frame++;
      // Ease out quadratic progress formula
      const progress = frame / totalFrames;
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);
      
      el.textContent = currentValue;

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = target; // Ensure exact final value is set
      }
    };

    requestAnimationFrame(animate);
  };

  // Trigger metrics count-up when the section becomes visible
  const metricsGrid = document.querySelector('.metrics-grid');
  if (metricsGrid && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counterElements.forEach(counter => runCounter(counter));
          obs.unobserve(entry.target); // Animate only once
        }
      });
    }, { threshold: 0.2 });

    observer.observe(metricsGrid);
  } else {
    // Fallback
    counterElements.forEach(counter => {
      counter.textContent = counter.getAttribute('data-target');
    });
  }
}

/**
 * 5. Track pathname and highlight active navbar link
 */
function setupActiveNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link, .nav-mobile-link, .mobile-sub-link');
  let currentPath = window.location.pathname.split('/').pop();
  
  // Default to index.html if blank (e.g. root URL)
  if (!currentPath) {
    currentPath = 'index.html';
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });
}

/**
 * 6. Social Share Feature Integration
 */
function setupShareButton() {
  const shareBtn = document.getElementById('btn-share');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const shareData = {
      title: 'CARLine Technologies',
      text: 'CARLine Technologies - Engineering the Future of Automotive Design',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        
        // Visual indicator that link is copied
        const originalTitle = shareBtn.getAttribute('aria-label');
        shareBtn.setAttribute('aria-label', 'Link Copied!');
        shareBtn.style.color = '#34d399'; // Green success color
        
        setTimeout(() => {
          shareBtn.setAttribute('aria-label', originalTitle);
          shareBtn.style.color = '';
        }, 2000);
      } catch (err) {
        console.log('Clipboard copy failed:', err);
      }
    }
  });
}

/**
 * 7. Engineering Process Timeline Animation & Scroll Progress
 */
function setupTimelineAnimation() {
  const timeline = document.querySelector('.timeline-container');
  const lineFill = document.querySelector('.timeline-line-fill');
  const items = document.querySelectorAll('.timeline-item');
  
  if (!timeline) return;

  // Scroll Progress line calculation
  const handleTimelineScroll = () => {
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Start filling when top of timeline is at 75% viewport height
    const startOffset = viewportHeight * 0.75;
    const endOffset = viewportHeight * 0.25;
    
    const totalHeight = rect.height;
    const currentProgress = (viewportHeight - rect.top - startOffset) / (totalHeight - (startOffset - endOffset));
    
    const progressPercent = Math.max(0, Math.min(100, currentProgress * 100));
    if (lineFill) {
      lineFill.style.height = `${progressPercent}%`;
    }
  };

  window.addEventListener('scroll', handleTimelineScroll);
  window.addEventListener('resize', handleTimelineScroll);
  handleTimelineScroll();

  // Highlight Active Stage via IntersectionObserver
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1, // Looser threshold
      rootMargin: '-10% 0px -10% 0px' // Looser margin
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed', 'active');
          // Set others to inactive
          items.forEach(item => {
            if (item !== entry.target) {
              item.classList.remove('active');
            }
          });
        } else {
          const rect = entry.target.getBoundingClientRect();
          if (rect.top > window.innerHeight || rect.bottom < 0) {
            entry.target.classList.remove('active');
          }
        }
      });
    }, observerOptions);

    items.forEach(item => observer.observe(item));
  } else {
    items.forEach(item => item.classList.add('revealed', 'active'));
  }
}

/**
 * 8. Contact Form Submission handler for Google Apps Script Web App
 */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitButton = form.querySelector('.contact-button');
  const originalButtonText = submitButton ? submitButton.innerHTML : 'Submit Enquiry';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect values from all form fields
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      enquiry: formData.get('enquiry'),
      message: formData.get('message')
    };

    // Google Apps Script Web App URL placeholder
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzfww4_FR5qLHhg6UooEYOoxoS-c7MTfbwF6VxYmkQ-g4MxjV1dc3zswfLdsi48X34a/exec';

    // Disable button and show loader state to prevent multiple submissions
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = 'Submitting...';
    }

    try {
      // Send the data as JSON using fetch() with the POST method
      const response = await fetch(scriptUrl, {
        method: 'POST',
        // Use text/plain to avoid preflight CORS errors with Google Apps Script
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(data),
        redirect: 'follow'
      });

      // Google Apps Script redirects after post; if redirect: 'follow' succeeds,
      // check response status and report success.
      if (response.ok) {
        alert('Thank you! Your enquiry has been submitted successfully.');
        form.reset();
      } else {
        throw new Error('Server responded with status: ' + response.status);
      }
    } catch (error) {
      console.error('Error submitting form to Google Apps Script:', error);
      alert('An error occurred while submitting your enquiry. Please try again.');
    } finally {
      // Re-enable button and restore original text
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    }
  });
}
