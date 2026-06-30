const services = [
  {
    id: "gelish",
    name: "Gelish",
    price: 380,
    duration: 50,
    description: "Color brillante y sellado uniforme."
  },
  {
    id: "manicure",
    name: "Manicure spa",
    price: 420,
    duration: 60,
    description: "Cuidado completo de manos y cuticula."
  },
  {
    id: "acrilicas",
    name: "Unas acrilicas",
    price: 720,
    duration: 110,
    description: "Largo, forma y estructura personalizada."
  },
  {
    id: "nail-art",
    name: "Nail art avanzado",
    price: 890,
    duration: 130,
    description: "Diseno detallado con efectos o relieve."
  },
  {
    id: "pedicure",
    name: "Pedicure spa",
    price: 560,
    duration: 75,
    description: "Cuidado completo para pies."
  }
];

const techs = [
  {
    id: "all",
    name: "Cualquier nail tech",
    specialty: "Mas horarios disponibles"
  },
  {
    id: "ana",
    name: "Ana",
    specialty: "Gelish y french"
  },
  {
    id: "mariana",
    name: "Mariana",
    specialty: "Acrilico y estructura"
  },
  {
    id: "sofia",
    name: "Sofia",
    specialty: "Nail art detallado"
  }
];

const schedules = {
  ana: ["10:00", "11:00", "12:30", "14:00", "16:30", "18:00"],
  mariana: ["09:30", "11:30", "13:00", "15:30", "17:00", "18:30"],
  sofia: ["10:30", "12:00", "14:30", "16:00", "17:30", "19:00"]
};

const state = {
  serviceId: services[0].id,
  techId: "all",
  dateIndex: 0,
  slot: null
};

const serviceOptions = document.querySelector("#service-options");
const techOptions = document.querySelector("#tech-options");
const dateOptions = document.querySelector("#date-options");
const slotOptions = document.querySelector("#slot-options");
const bookingSummary = document.querySelector("#booking-summary");
const bookingSubmit = document.querySelector("#booking-submit");
const bookingForm = document.querySelector("#booking-form");

function currency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

function upcomingDates() {
  const dates = [];
  const cursor = new Date();

  while (dates.length < 10) {
    const day = cursor.getDay();
    if (day !== 0) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

const dates = upcomingDates();

function selectedService() {
  return services.find((service) => service.id === state.serviceId);
}

function selectedTech() {
  return techs.find((tech) => tech.id === state.techId);
}

function slotsForCurrentSelection() {
  const service = selectedService();
  const date = dates[state.dateIndex];
  const dayOffset = date.getDate() % 3;
  const techIds = state.techId === "all" ? ["ana", "mariana", "sofia"] : [state.techId];
  const slots = new Map();

  techIds.forEach((techId) => {
    schedules[techId].forEach((time, index) => {
      const isLongService = service.duration > 90;
      const isAvailable = isLongService ? (index + dayOffset) % 2 === 0 : (index + dayOffset) % 3 !== 1;

      if (!isAvailable) {
        return;
      }

      const existing = slots.get(time) || [];
      existing.push(techId);
      slots.set(time, existing);
    });
  });

  return [...slots.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, techIdsForSlot]) => ({
      time,
      techIds: techIdsForSlot
    }));
}

function renderServices() {
  serviceOptions.innerHTML = services
    .map((service) => {
      const active = service.id === state.serviceId ? "is-selected" : "";
      return `
        <button class="service-option ${active}" type="button" data-service="${service.id}">
          <strong>${service.name}</strong>
          <span>${service.description}</span>
          <em>${currency(service.price)} · ${service.duration} min</em>
        </button>
      `;
    })
    .join("");
}

function renderTechs() {
  techOptions.innerHTML = techs
    .map((tech) => {
      const active = tech.id === state.techId ? "is-selected" : "";
      return `
        <button class="tech-option ${active}" type="button" data-tech="${tech.id}">
          <strong>${tech.name}</strong>
          <span>${tech.specialty}</span>
        </button>
      `;
    })
    .join("");
}

function renderDates() {
  const dayFormatter = new Intl.DateTimeFormat("es-MX", { weekday: "short" });
  const dateFormatter = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });

  dateOptions.innerHTML = dates
    .map((date, index) => {
      const active = index === state.dateIndex ? "is-selected" : "";
      return `
        <button class="date-option ${active}" type="button" data-date-index="${index}">
          <span>${dayFormatter.format(date)}</span>
          <strong>${dateFormatter.format(date)}</strong>
        </button>
      `;
    })
    .join("");
}

function renderSlots() {
  const slots = slotsForCurrentSelection();

  if (!slots.length) {
    slotOptions.innerHTML = `<p class="empty-slots">No hay horarios para esta combinacion. Prueba otra nail tech o servicio.</p>`;
    return;
  }

  slotOptions.innerHTML = slots
    .map((slot) => {
      const active = state.slot === slot.time ? "is-selected" : "";
      const names = slot.techIds.map((id) => techs.find((tech) => tech.id === id).name);
      const label = state.techId === "all" ? `${names.length} disponible${names.length > 1 ? "s" : ""}` : names[0];
      return `
        <button class="slot-option ${active}" type="button" data-slot="${slot.time}" data-techs="${slot.techIds.join(",")}">
          <strong>${slot.time}</strong>
          <span>${label}</span>
        </button>
      `;
    })
    .join("");
}

function renderSummary() {
  const service = selectedService();
  const tech = selectedTech();
  const date = dates[state.dateIndex];
  const dateLabel = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);

  if (!state.slot) {
    bookingSummary.textContent = `${service.name}: ${currency(service.price)}, ${service.duration} min. Elige un horario para continuar.`;
    bookingSubmit.disabled = true;
    return;
  }

  const slot = slotsForCurrentSelection().find((item) => item.time === state.slot);
  const techLabel =
    state.techId === "all" && slot
      ? `primera disponible: ${slot.techIds.map((id) => techs.find((item) => item.id === id).name).join(", ")}`
      : tech.name;

  bookingSummary.textContent = `${service.name} · ${currency(service.price)} · ${service.duration} min · ${dateLabel} a las ${state.slot} · ${techLabel}.`;
  bookingSubmit.disabled = false;
}

function render() {
  renderServices();
  renderTechs();
  renderDates();
  renderSlots();
  renderSummary();
}

serviceOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-service]");
  if (!button) return;
  state.serviceId = button.dataset.service;
  state.slot = null;
  render();
});

techOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tech]");
  if (!button) return;
  state.techId = button.dataset.tech;
  state.slot = null;
  render();
});

dateOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date-index]");
  if (!button) return;
  state.dateIndex = Number(button.dataset.dateIndex);
  state.slot = null;
  render();
});

slotOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-slot]");
  if (!button) return;
  state.slot = button.dataset.slot;
  render();
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(bookingForm);
  const name = formData.get("name");
  bookingSummary.textContent = `${name}, tu seleccion esta lista. Para confirmar de forma automatica, conecta este formulario a tu sistema de agenda o WhatsApp Business.`;
});

render();
