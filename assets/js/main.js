// Landing Page Navigation
const exploreBtn = document.getElementById("explore-btn");
const landingPage = document.getElementById("landing");
const mainContent = document.getElementById("main-content");

if (exploreBtn) {
  exploreBtn.addEventListener("click", () => {
    landingPage.classList.add("hidden");
    mainContent.classList.add("visible");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Trigger scroll animations after a short delay
    setTimeout(() => {
      initScrollAnimations();
    }, 100);
  });
}

// Scroll Animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections and cards
  const animatedElements = document.querySelectorAll(
    ".section, .skill-card, .qualification_data, .portfolio_content, .contact_info"
  );
  
  animatedElements.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(50px)";
    el.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
    observer.observe(el);
  });
}

// Header scroll effect
const header = document.getElementById("header");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
  
  lastScroll = currentScroll;
});

// Parallax effect for sections
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll(".section");
  
  parallaxElements.forEach((element, index) => {
    const speed = 0.5;
    const yPos = -(scrolled * speed);
    element.style.backgroundPositionY = `${yPos}px`;
  });
});

// Formspree code
const form = document.getElementById("contact-form");

async function handleSubmit(event) {
  event.preventDefault();
  var status = document.getElementById("alert");
  var data = new FormData(event.target);
  fetch(event.target.action, {
    method: form.method,
    body: data,
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      status.innerHTML = "Your message has been sent.";
      document.querySelector(".alert_style").style.display = "block";

      // hide alert after 3 seconds
      setTimeout(function () {
        document.querySelector(".alert_style").style.display = "none";
      }, 4000);
      form.reset();
    })
    .catch((error) => {
      status.innerHTML =
        "Oops! There was a problem delivering your message, please contact via other means.";
      document.querySelector(".alert_style").style.display = "block";

      // hide alert after 3 seconds
      setTimeout(function () {
        document.querySelector(".alert_style").style.display = "none";
      }, 4000);
    });
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}

// FORM BORDERS 
$("#contact-form input,#contact-form textarea").on("input focusin",(e)=>{
  $(e.target).parent().addClass("focusIn");
  if ($(e.target).val().trim().length > 0) {
    $(e.target).parent().addClass("valid");
    $(e.target).parent().removeClass("invalid");
  } else {
    $(e.target).parent().addClass("invalid");
    $(e.target).parent().removeClass("valid");
  }
});

$("#contact-form input,#contact-form textarea").on("focusout",(e)=>{
    $(e.target).parent().removeClass("focusIn");
});

// NAVIGATION PANEL
let navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

// MENU SHOW
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

// MENU HIDDEN
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

// REMOVE MENU MOBILE
const navLink = document.querySelectorAll(".nav_link");

function linkAction() {
  navMenu = document.getElementById("nav-menu");
  if (navMenu) {
    navMenu.classList.remove("show-menu");
  }
}
navLink.forEach((n) => n.addEventListener("click", linkAction));

// Active link on scroll
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.pageYOffset;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 200;
    const sectionId = current.getAttribute("id");

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelectorAll(".nav_link")
        .forEach((link) => link.classList.remove("active-link"));
      const activeLink = document.querySelector(
        `.nav_link[href*="${sectionId}"]`
      );
      if (activeLink) {
        activeLink.classList.add("active-link");
      }
    }
  });
}

window.addEventListener("scroll", scrollActive);

// Qualification Tabs
let education = document.getElementById("education");
let work = document.getElementById("work");
let educationheader = document.getElementById("educationheader");
let workheader = document.getElementById("workheader");

if (educationheader && workheader) {
  educationheader.addEventListener("click", () => {
    if (work && education) {
      education.classList.remove("qualification-inactive");
      work.classList.add("qualification-inactive");
      workheader.classList.remove("active-tab");
      educationheader.classList.add("active-tab");
    }
  });
  
  workheader.addEventListener("click", () => {
    if (work && education) {
      work.classList.remove("qualification-inactive");
      education.classList.add("qualification-inactive");
      educationheader.classList.remove("active-tab");
      workheader.classList.add("active-tab");
    }
  });
}

// Skill card mouse tracking
const skillCards = document.querySelectorAll(".skill-card");
skillCards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", x + "%");
    card.style.setProperty("--mouse-y", y + "%");
  });
});

// Create particles
function createParticles(containerId, count = 50) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 20 + "s";
    particle.style.animationDuration = (15 + Math.random() * 10) + "s";
    container.appendChild(particle);
  }
}

// Initialize particles when main content is visible
if (mainContent) {
  setTimeout(() => {
    createParticles("particles-about");
    createParticles("particles-contact");
  }, 1000);
}

// Skill bubble mouse tracking
const skillBubbles = document.querySelectorAll(".skill-bubble");
skillBubbles.forEach((bubble) => {
  bubble.addEventListener("mousemove", (e) => {
    const rect = bubble.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    bubble.style.setProperty("--mouse-x", x + "%");
    bubble.style.setProperty("--mouse-y", y + "%");
  });
});

// Smooth scroll for navigation links
const navLinks = document.querySelectorAll(".nav_link");
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement && mainContent.classList.contains("visible")) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition =
          targetElement.offsetTop - headerHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }
  });
});

// DARK/LIGHT THEME (keeping for compatibility, but using black/white theme)
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const lightTheme = "light-theme";
const iconTheme = "uil-sun";

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// obtain the current theme
const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "uil-moon" : "uil-sun";

if (selectedTheme) {
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  document.body.classList[selectedTheme === "light" ? "add" : "remove"](
    lightTheme
  );
  themeButton.classList[selectedIcon === "uil-moon" ? "add" : "remove"](
    iconTheme
  );
}

// Activate/Deactivate the theme manually with the button
if (themeButton) {
  themeButton.addEventListener("click", () => {
    // Toggle themes
    document.body.classList.toggle(darkTheme);
    document.body.classList.toggle(lightTheme);
    themeButton.classList.toggle(iconTheme);
    // We save the theme and the current icon that the user chose
    const currentTheme = document.body.classList.contains(darkTheme)
      ? "dark"
      : "light";
    localStorage.setItem("selected-theme", currentTheme);
    localStorage.setItem("selected-icon", getCurrentIcon());
  });
}

// Typing Animation using Typed JS
if (document.querySelector(".type")) {
  var typed = new Typed(".type", {
    strings: [
      "Working on an Indie Game",
      "Working on being a student",
      "Working on becoming friends with a robot",
    ],
    smartBackspace: true,
    startDelay: 1000,
    typeSpeed: 40,
    backDelay: 1000,
    backSpeed: 30,
    loop: true,
  });
}

// Mouse cursor effect (optional enhancement)
document.addEventListener("mousemove", (e) => {
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  }
});

// Ensure portfolio buttons are clickable
document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = "smooth";
  
  // Fix portfolio button clicks - prevent any event blocking
  const portfolioButtons = document.querySelectorAll(".portfolio_button");
  portfolioButtons.forEach(button => {
    // Remove any event listeners that might be blocking
    button.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      // Ensure the link works
      const href = button.getAttribute('href');
      if (href && href !== '#') {
        window.open(href, button.getAttribute('target') || '_self');
      }
    }, true); // Use capture phase to ensure it fires first
  });
  
  // Also ensure the parent containers don't block clicks
  const portfolioContents = document.querySelectorAll(".portfolio_content");
  portfolioContents.forEach(content => {
    content.addEventListener('click', (e) => {
      // If click is on a button, let it through
      if (e.target.closest('.portfolio_button')) {
        return; // Let the button handle it
      }
    });
  });
});

// PORTFOLIO SWIPER - Initialize if Swiper is available
if (typeof Swiper !== 'undefined') {
  let swiper = new Swiper(".mySwiper", {
    cssMode: false,
    loop: true,
    spaceBetween: 30,
    allowTouchMove: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    mousewheel: {
      forceToAxis: true,
    },
    keyboard: true,
    breakpoints: {
      768: {
        slidesPerView: 1,
      },
      1024: {
        slidesPerView: 1,
      },
    },
    // Allow clicks on buttons inside slides
    simulateTouch: true,
    touchEventsTarget: 'container',
    // Prevent swiper from blocking clicks on interactive elements
    preventClicks: false,
    preventClicksPropagation: false,
  });
}
