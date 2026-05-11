const slider = document.querySelector("[data-slider]");
const sliderDots = document.querySelector("[data-slider-dots]");
const previousSlideButton = document.querySelector("[data-slider-prev]");
const nextSlideButton = document.querySelector("[data-slider-next]");

const bookingForm = document.querySelector("[data-booking-form]");
const modal = document.querySelector("[data-modal]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");

function initSlider() {
  if (!slider || !sliderDots || !previousSlideButton || !nextSlideButton) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll(".slide"));
  let activeSlideIndex = 0;

  if (!slides.length) {
    return;
  }

  function updateActiveSlide(nextIndex) {
    activeSlideIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide) => {
      slide.classList.toggle("is-active", Number(slide.dataset.slideIndex) === activeSlideIndex);
    });

    sliderDots.querySelectorAll(".slider-dot").forEach((dot, index) => {
      const isActive = index === activeSlideIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  }

  function showSlide(targetIndex) {
    const normalizedIndex = (targetIndex + slides.length) % slides.length;

    while (Number(slider.firstElementChild.dataset.slideIndex) !== normalizedIndex) {
      slider.append(slider.firstElementChild);
    }

    slider.scrollLeft = 0;
    updateActiveSlide(normalizedIndex);
  }

  function rotateSlider(visualDirection) {
    if (visualDirection === "right") {
      slider.prepend(slider.lastElementChild);
      updateActiveSlide(activeSlideIndex + 1);
    } else {
      slider.append(slider.firstElementChild);
      updateActiveSlide(activeSlideIndex - 1);
    }

    slider.scrollLeft = 0;
  }

  function createSliderDots() {
    slides.forEach((_, index) => {
      const dot = document.createElement("button");

      dot.className = "slider-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Показать слайд ${index + 1}`);
      dot.setAttribute("aria-selected", String(index === 0));
      dot.addEventListener("click", () => showSlide(index));

      sliderDots.append(dot);
    });
  }

  slides.forEach((slide, index) => {
    slide.dataset.slideIndex = index;
  });

  createSliderDots();
  updateActiveSlide(0);

  previousSlideButton.addEventListener("click", () => rotateSlider("left"));
  nextSlideButton.addEventListener("click", () => rotateSlider("right"));

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      rotateSlider("left");
    }

    if (event.key === "ArrowRight") {
      rotateSlider("right");
    }
  });
}

function getFieldError(field) {
  if (field.validity.valueMissing) {
    return "Заполните это поле";
  }

  if ((field.name === "name" || field.name === "surname") && field.validity.tooShort) {
    return "Минимум 2 символа";
  }

  if (field.name === "email" && field.validity.typeMismatch) {
    return "Введите корректный email";
  }

  if (field.name === "phone" && field.value.replace(/\D/g, "").length < 10) {
    return "Введите корректный номер телефона";
  }

  return "";
}

function setFieldError(field, message) {
  const fieldWrapper = field.closest(".form-field");
  const errorElement = bookingForm.querySelector(`[data-error-for="${field.name}"]`);

  fieldWrapper.classList.toggle("is-invalid", Boolean(message));

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function validateField(field) {
  const errorMessage = getFieldError(field);
  setFieldError(field, errorMessage);
  return !errorMessage;
}

function openModal() {
  if (!modal) {
    return;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector(".modal__close")?.focus();
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function initBookingForm() {
  if (!bookingForm) {
    return;
  }

  const formFields = Array.from(bookingForm.querySelectorAll("input"));

  formFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-field").classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const validationResults = formFields.map((field) => ({
      field,
      isValid: validateField(field),
    }));
    const firstInvalidField = validationResults.find((result) => !result.isValid)?.field;

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    bookingForm.reset();
    openModal();
  });
}

function initModal() {
  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) {
      closeModal();
    }
  });
}

initSlider();
initBookingForm();
initModal();
