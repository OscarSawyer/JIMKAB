 document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  const yearEls = document.querySelectorAll("#year");
  const faqQuestions = document.querySelectorAll(".faq-question");
  const revealEls = document.querySelectorAll(".reveal");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

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

    // 🔥 REAL SUBMIT LOGIC
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

        const res = await fetch("http://localhost:5000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (data.success) {
          formStatus.textContent = "Request sent successfully.";
          formStatus.className = "form-status success";
          contactForm.reset();
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        console.error(err);
        formStatus.textContent = "Failed. Try again.";
        formStatus.className = "form-status error";
      }
    });
  }
});