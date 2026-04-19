 document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const yearEls = document.querySelectorAll("#year");
  const faqQuestions = document.querySelectorAll(".faq-question");
  const revealEls = document.querySelectorAll(".reveal");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  yearEls.forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

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

  if (contactForm) {
    const fields = {
      fullName: {
        input: document.getElementById("fullName"),
        validate: (value) => value.trim().length >= 2,
        message: "Enter your full name."
      },
      phoneNumber: {
        input: document.getElementById("phoneNumber"),
        validate: (value) => /^[0-9+\s()-]{9,}$/.test(value.trim()),
        message: "Enter a valid phone number."
      },
      email: {
        input: document.getElementById("email"),
        validate: (value) =>
          value.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        message: "Enter a valid email address."
      },
      serviceNeeded: {
        input: document.getElementById("serviceNeeded"),
        validate: (value) => value.trim() !== "",
        message: "Select a service."
      },
      location: {
        input: document.getElementById("location"),
        validate: (value) => value.trim().length >= 2,
        message: "Enter your location."
      },
      message: {
        input: document.getElementById("message"),
        validate: (value) => value.trim().length >= 10,
        message: "Write a clearer message of at least 10 characters."
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

    const validateField = (fieldConfig) => {
      const value = fieldConfig.input.value;
      const valid = fieldConfig.validate(value);
      if (!valid) {
        setError(fieldConfig.input, fieldConfig.message);
      } else {
        clearError(fieldConfig.input);
      }
      return valid;
    };

    Object.values(fields).forEach((field) => {
      field.input.addEventListener("input", () => validateField(field));
      field.input.addEventListener("blur", () => validateField(field));
    });

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let isFormValid = true;

      Object.values(fields).forEach((field) => {
        const valid = validateField(field);
        if (!valid) isFormValid = false;
      });

      if (!isFormValid) {
        formStatus.textContent = "Please fix the highlighted fields and submit again.";
        formStatus.className = "form-status error";
        return;
      }

      formStatus.textContent =
        "Request submitted successfully. This demo form is front-end only for now, but the structure is ready for Formspree, Netlify Forms, EmailJS or a backend connection.";
      formStatus.className = "form-status success";

      contactForm.reset();
    });
  }
});