 document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const yearEls = document.querySelectorAll("#year");
  const faqQuestions = document.querySelectorAll(".faq-question");
  const revealEls = document.querySelectorAll(".reveal");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://jimkab-backend-live.onrender.com";

  const OWNER_WHATSAPP_NUMBER = "256788573000";

  // YEAR
  yearEls.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // NAV
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // FAQ
  faqQuestions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".faq-item");
      const isActive = parent.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
        const plus = item.querySelector(".faq-question span");
        if (plus) plus.textContent = "+";
      });

      if (!isActive) {
        parent.classList.add("active");
        const plus = parent.querySelector(".faq-question span");
        if (plus) plus.textContent = "−";
      }
    });
  });

  // ANIMATION
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // FORM
  if (contactForm) {
    const fields = {
      fullName: {
        input: document.getElementById("fullName"),
        validate: (v) => v.trim().length >= 2,
        message: "Enter your full name."
      },
      phoneNumber: {
        input: document.getElementById("phoneNumber"),
        validate: (v) => /^[0-9+\s()-]{9,}$/.test(v.trim()),
        message: "Enter a valid phone number."
      },
      email: {
        input: document.getElementById("email"),
        validate: (v) =>
          v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
        message: "Enter a valid email address."
      },
      serviceNeeded: {
        input: document.getElementById("serviceNeeded"),
        validate: (v) => v.trim() !== "",
        message: "Select a service."
      },
      location: {
        input: document.getElementById("location"),
        validate: (v) => v.trim().length >= 2,
        message: "Enter your location."
      },
      message: {
        input: document.getElementById("message"),
        validate: (v) => v.trim().length >= 10,
        message: "Write at least 10 characters."
      }
    };

    const setError = (input, message) => {
      const wrapper = input.closest(".form-group");
      const errorEl = wrapper.querySelector(".form-error");
      input.style.borderColor = "#d0312d";
      errorEl.textContent = message;
    };

    const clearError = (input) => {
      const wrapper = input.closest(".form-group");
      const errorEl = wrapper.querySelector(".form-error");
      input.style.borderColor = "";
      errorEl.textContent = "";
    };

    const validateField = (field) => {
      const valid = field.validate(field.input.value);
      valid ? clearError(field.input) : setError(field.input, field.message);
      return valid;
    };

    Object.values(fields).forEach((field) => {
      field.input.addEventListener("input", () => validateField(field));
      field.input.addEventListener("blur", () => validateField(field));
    });

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      let isFormValid = true;
      Object.values(fields).forEach((f) => {
        if (!validateField(f)) isFormValid = false;
      });

      if (!isFormValid) {
        formStatus.textContent = "Fix the highlighted fields.";
        formStatus.className = "form-status error";
        return;
      }

      const formData = {
        fullName: fields.fullName.input.value.trim(),
        phoneNumber: fields.phoneNumber.input.value.trim(),
        email: fields.email.input.value.trim(),
        serviceNeeded: fields.serviceNeeded.input.value,
        location: fields.location.input.value.trim(),
        message: fields.message.input.value.trim()
      };

      try {
        formStatus.textContent = "Sending...";
        formStatus.className = "form-status";

        const res = await fetch(`${API_BASE_URL}/api/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (data.success) {
          formStatus.textContent = "Request sent successfully.";
          formStatus.className = "form-status success";

          const whatsappText = [
            "New JIMKAB quote request",
            "",
            `Name: ${formData.fullName}`,
            `Phone: ${formData.phoneNumber}`,
            `Email: ${formData.email || "Not provided"}`,
            `Service: ${formData.serviceNeeded}`,
            `Location: ${formData.location}`,
            `Message: ${formData.message}`
          ].join("\n");

          const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;

          // Try opening in a new tab first
          const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer");

          // Fallback if popup is blocked
          if (!popup || popup.closed || typeof popup.closed === "undefined") {
            window.location.href = whatsappUrl;
          }

          contactForm.reset();
        } else {
          throw new Error(data.message || "Request failed.");
        }
      } catch (err) {
        console.error(err);
        formStatus.textContent = "Failed. Try again.";
        formStatus.className = "form-status error";
      }
    });
  }

  // 3D SERVICES CUBE CAROUSEL
  const servicesCube = document.getElementById("servicesCube");
  const servicesCubePrev = document.getElementById("servicesCubePrev");
  const servicesCubeNext = document.getElementById("servicesCubeNext");
  const servicesCubeToggle = document.getElementById("servicesCubeToggle");
  const servicesCubePicker = document.getElementById("servicesCubePicker");

  if (
    servicesCube &&
    servicesCubePrev &&
    servicesCubeNext &&
    servicesCubeToggle &&
    servicesCubePicker
  ) {
    const servicesData = [
      {
        title: "Electrical Installation",
        description:
          "Professional installation of new electrical systems for homes, shops, offices and rental properties.",
        image: "images/electrical-installation.jpg",
        alt: "Electrical installation service",
        link: "contact.html"
      },
      {
        title: "Wiring & Rewiring",
        description:
          "Safe wiring for new buildings and rewiring for old or faulty electrical systems that need an upgrade.",
        image: "images/electrical-wiring.jpg",
        alt: "Electrical wiring and rewiring service",
        link: "contact.html"
      },
      {
        title: "Lighting Installation",
        description:
          "Indoor and outdoor lighting solutions that improve visibility, safety and the look of your space.",
        image: "images/lighting-installation.png",
        alt: "Lighting installation service",
        link: "contact.html"
      },
      {
        title: "Socket & Switch Repair",
        description:
          "Repair or replacement of damaged, loose or faulty switches, sockets and electrical fittings.",
        image: "images/socketandswitchrepaire.png",
        alt: "Socket and switch repair service",
        link: "contact.html"
      },
      {
        title: "Fault Finding",
        description:
          "Quick diagnosis and repair of electrical faults, power interruptions, short circuits and unstable connections.",
        image: "images/faultfinding.jpg",
        alt: "Fault finding and diagnosis service",
        link: "contact.html"
      },
      {
        title: "Maintenance",
        description:
          "Routine maintenance and upgrades to keep your electrical systems running safely and efficiently.",
        image: "images/maintenance.png",
        alt: "Electrical maintenance service",
        link: "contact.html"
      }
    ];

    const faces = {
      front: servicesCube.querySelector(".services-cube__face--front"),
      top: servicesCube.querySelector(".services-cube__face--top"),
      back: servicesCube.querySelector(".services-cube__face--back"),
      bottom: servicesCube.querySelector(".services-cube__face--bottom")
    };

    let currentIndex = 0;
    let autoRotate = true;
    let autoRotateId = null;
    let isAnimating = false;

    const getWrappedIndex = (index) => {
      const len = servicesData.length;
      return ((index % len) + len) % len;
    };

    const renderFace = (faceEl, serviceIndex) => {
      const service = servicesData[getWrappedIndex(serviceIndex)];
      faceEl.innerHTML = `
        <div class="services-cube-card__media">
          <img src="${service.image}" alt="${service.alt}">
        </div>
        <div class="services-cube-card__content">
          <span class="services-cube-card__eyebrow">Service option</span>
          <h3>${service.title}</h3>
          <p>${service.description}</p>
          <div class="services-cube-card__actions">
            <a href="${service.link}" class="btn btn--secondary">Request this service</a>
            <a href="tel:0788573000" class="btn btn--outline">Call for help</a>
          </div>
        </div>
      `;
    };

    const updatePickerState = () => {
      servicesCubePicker.querySelectorAll(".services-cube__pick").forEach((btn, idx) => {
        btn.classList.toggle("is-active", idx === getWrappedIndex(currentIndex));
      });
    };

    const renderCubeState = () => {
      renderFace(faces.front, currentIndex);
      renderFace(faces.top, currentIndex + 1);
      renderFace(faces.back, currentIndex + 2);
      renderFace(faces.bottom, currentIndex - 1);

      servicesCube.style.transition = "none";
      servicesCube.style.transform = "rotateX(0deg)";
      servicesCube.offsetHeight;

      updatePickerState();
    };

    const buildPicker = () => {
      servicesCubePicker.innerHTML = servicesData
        .map(
          (service, index) => `
            <button type="button" class="services-cube__pick" data-service-index="${index}">
              ${service.title}
            </button>
          `
        )
        .join("");

      servicesCubePicker.querySelectorAll(".services-cube__pick").forEach((btn) => {
        btn.addEventListener("click", () => {
          stopAutoRotate();
          currentIndex = Number(btn.dataset.serviceIndex);
          renderCubeState();
        });
      });
    };

    const rotateNext = () => {
      if (isAnimating) return;
      isAnimating = true;

      servicesCube.style.transition =
        "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
      servicesCube.style.transform = "rotateX(-90deg)";

      setTimeout(() => {
        currentIndex = getWrappedIndex(currentIndex + 1);
        renderCubeState();
        isAnimating = false;
      }, 820);
    };

    const rotatePrev = () => {
      if (isAnimating) return;
      isAnimating = true;

      servicesCube.style.transition =
        "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
      servicesCube.style.transform = "rotateX(90deg)";

      setTimeout(() => {
        currentIndex = getWrappedIndex(currentIndex - 1);
        renderCubeState();
        isAnimating = false;
      }, 820);
    };

    const startAutoRotate = () => {
      stopAutoRotate(false);
      autoRotateId = setInterval(() => {
        rotateNext();
      }, 3400);
      autoRotate = true;
      servicesCubeToggle.textContent = "Pause";
      servicesCube.classList.remove("is-paused");
    };

    const stopAutoRotate = (setPlayState = true) => {
      if (autoRotateId) {
        clearInterval(autoRotateId);
        autoRotateId = null;
      }

      if (setPlayState) {
        autoRotate = false;
        servicesCubeToggle.textContent = "Play";
        servicesCube.classList.add("is-paused");
      }
    };

    servicesCubeNext.addEventListener("click", () => {
      stopAutoRotate();
      rotateNext();
    });

    servicesCubePrev.addEventListener("click", () => {
      stopAutoRotate();
      rotatePrev();
    });

    servicesCubeToggle.addEventListener("click", () => {
      if (autoRotate) {
        stopAutoRotate();
      } else {
        startAutoRotate();
      }
    });

    servicesCube.addEventListener("mouseenter", stopAutoRotate);
    servicesCube.addEventListener("mouseleave", () => {
      if (!autoRotateId && autoRotate) startAutoRotate();
    });
    servicesCube.addEventListener("touchstart", stopAutoRotate, { passive: true });

    buildPicker();
    renderCubeState();
    startAutoRotate();
  }

  // FLOATING CAROUSELS
  const floatingCarousels = document.querySelectorAll(".floating-carousel");

  floatingCarousels.forEach((carousel) => {
    const track = carousel.querySelector(".floating-carousel__track");
    const items = carousel.querySelectorAll(".floating-chip");
    const dots = carousel.querySelectorAll(".floating-carousel__dot");

    if (!track || items.length <= 1) return;

    let index = 0;
    let intervalId = null;

    const slideTo = (newIndex) => {
      index = newIndex;
      const itemHeight = items[0].offsetHeight;
      track.style.transform = `translateY(-${index * itemHeight}px)`;

      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    };

    const startCarousel = () => {
      stopCarousel();
      intervalId = setInterval(() => {
        const nextIndex = (index + 1) % items.length;
        slideTo(nextIndex);
      }, 2800);
    };

    const stopCarousel = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    window.addEventListener("resize", () => slideTo(index));

    carousel.addEventListener("mouseenter", stopCarousel);
    carousel.addEventListener("mouseleave", startCarousel);
    carousel.addEventListener("touchstart", stopCarousel, { passive: true });
    carousel.addEventListener("touchend", startCarousel);

    slideTo(0);
    startCarousel();
  });
});