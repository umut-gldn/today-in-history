"use strict";

/**
 * Configuration Constants
 */
const CONFIG = {
  API_URL: "https://api.zumbo.net/tarihtebugun/",
  CACHE_KEY: "tarihtebugun_cache",
  CACHE_DATE_KEY: "tarihtebugun_cache_date",
  RATE_LIMIT_KEY: "tarihtebugun_requests",
  THEME_KEY: "tarihtebugun_theme",
  CACHE_DURATION: 60 * 60 * 1000, // 60 minutes
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS: 20,
  EVENT_TYPES: ["Tümü", "Olay", "Doğum", "Ölüm"],
  MONTHS: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  DAYS: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
};

/**
 * Application State
 */
const state = {
  allEvents: [],
  currentFilter: "Tümü",
};

/**
 * DOM Elements Cache
 */
const elements = {
  currentDate: document.getElementById("currentDate"),
  stats: document.getElementById("stats"),
  filters: document.getElementById("filters"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  timeline: document.getElementById("timeline"),
  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon"),
};

/**
 * Utility Functions
 */
const Utils = {
  getTodayDate() {
    const now = new Date();
    return `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}`;
  },

  formatDate(date) {
    const dayName = CONFIG.DAYS[date.getDay()];
    const day = date.getDate();
    const month = CONFIG.MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  },

  toggleElement(element, show) {
    element.classList.toggle("hidden", !show);
  },

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },
};

/**
 * Storage Manager - Handles LocalStorage operations
 */
const StorageManager = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  },
};

/**
 * Cache Manager - Handles data caching with date validation
 */
const CacheManager = {
  isValidDate() {
    const today = Utils.getTodayDate();
    const cachedDate = localStorage.getItem(CONFIG.CACHE_DATE_KEY);

    if (cachedDate !== today) {
      console.log("New day detected, clearing cache...");
      this.clear();
      localStorage.setItem(CONFIG.CACHE_DATE_KEY, today);
      return false;
    }
    return true;
  },

  get() {
    if (!this.isValidDate()) return null;

    const cached = StorageManager.get(CONFIG.CACHE_KEY);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CONFIG.CACHE_DURATION) {
      this.clear();
      return null;
    }

    return cached.events;
  },

  set(events) {
    const data = {
      events,
      timestamp: Date.now(),
    };
    StorageManager.set(CONFIG.CACHE_KEY, data);
    localStorage.setItem(CONFIG.CACHE_DATE_KEY, Utils.getTodayDate());
  },

  clear() {
    StorageManager.remove(CONFIG.CACHE_KEY);
  },
};

/**
 * Rate Limiter - Prevents API abuse
 */
const RateLimiter = {
  check() {
    const now = Date.now();
    let requests = StorageManager.get(CONFIG.RATE_LIMIT_KEY) || [];

    // Remove old requests
    requests = requests.filter((time) => now - time < CONFIG.RATE_LIMIT_WINDOW);

    if (requests.length >= CONFIG.MAX_REQUESTS) {
      return false;
    }

    // Add new request
    requests.push(now);
    StorageManager.set(CONFIG.RATE_LIMIT_KEY, requests);
    return true;
  },
};

/**
 * Theme Manager - Handles dark/light mode
 */
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY) || "light";
    this.setTheme(savedTheme, false);
    this.attachEventListener();
  },

  setTheme(theme, animate = true) {
    const html = document.documentElement;
    const icon = elements.themeIcon;

    if (!animate) {
      html.style.transition = "none";
    }

    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
      icon.textContent = "☀️";
    } else {
      html.removeAttribute("data-theme");
      icon.textContent = "🌙";
    }

    localStorage.setItem(CONFIG.THEME_KEY, theme);

    if (!animate) {
      setTimeout(() => {
        html.style.transition = "";
      }, 0);
    }
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  },

  attachEventListener() {
    elements.themeToggle.addEventListener("click", () => {
      this.toggle();
    });
  },
};

/**
 * API Service - Handles API communication
 */
const APIService = {
  async fetchEvents() {
    // Check cache first
    const cachedEvents = CacheManager.get();
    if (cachedEvents) {
      console.log("Data loaded from cache");
      return cachedEvents;
    }

    // Rate limit check
    if (!RateLimiter.check()) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    const response = await fetch(CONFIG.API_URL);

    if (!response.ok) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.tarihtebugun) {
      throw new Error("INVALID_RESPONSE");
    }

    // Cache the data
    CacheManager.set(data.tarihtebugun);

    return data.tarihtebugun;
  },
};

/**
 * UI Manager - Handles all UI rendering
 */
const UIManager = {
  displayCurrentDate() {
    elements.currentDate.textContent = Utils.formatDate(new Date());
  },

  displayStats(events) {
    const stats = events.reduce(
      (acc, event) => {
        if (event.Durum in acc) acc[event.Durum]++;
        return acc;
      },
      { Olay: 0, Doğum: 0, Ölüm: 0 },
    );

    const statsHTML = `
            <div class="stat-card">
                <span class="stat-number">${events.length}</span>
                <span class="stat-label">Toplam Olay</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.Olay}</span>
                <span class="stat-label">Tarihî Olay</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.Doğum}</span>
                <span class="stat-label">Doğum</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.Ölüm}</span>
                <span class="stat-label">Vefat</span>
            </div>
        `;

    elements.stats.innerHTML = statsHTML;
  },

  displayFilters() {
    const filtersHTML = CONFIG.EVENT_TYPES.map(
      (filter) => `
                <button class="filter-btn ${filter === state.currentFilter ? "active" : ""}" 
                        data-filter="${filter}">
                    ${filter}
                </button>
            `,
    ).join("");

    elements.filters.innerHTML = filtersHTML;
    this.attachFilterListeners();
  },

  attachFilterListeners() {
    elements.filters.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        EventController.filterEvents(btn.dataset.filter);
      });
    });
  },

  displayEvents(events) {
    const filtered =
      state.currentFilter === "Tümü"
        ? events
        : events.filter((e) => e.Durum === state.currentFilter);

    const sorted = filtered.sort((a, b) => parseInt(b.Yil) - parseInt(a.Yil));

    if (sorted.length === 0) {
      elements.timeline.innerHTML =
        '<div class="no-events">Bu kategoride olay bulunamadı.</div>';
      return;
    }

    const eventsHTML = sorted
      .map(
        (event) => `
                <div class="timeline-item">
                    <div>
                        <span class="event-year">${Utils.escapeHtml(event.Yil)}</span>
                        <span class="event-type ${event.Durum}">${Utils.escapeHtml(event.Durum)}</span>
                    </div>
                    <div class="event-description">${Utils.escapeHtml(event.Olay)}</div>
                </div>
            `,
      )
      .join("");

    elements.timeline.innerHTML = eventsHTML;
  },

  showLoading(show) {
    Utils.toggleElement(elements.loading, show);
  },

  showError(message) {
    elements.error.textContent = message;
    Utils.toggleElement(elements.error, true);
  },

  hideError() {
    Utils.toggleElement(elements.error, false);
  },
};

/**
 * Event Controller - Manages application logic
 */
const EventController = {
  async init() {
    UIManager.displayCurrentDate();
    await this.loadEvents();
  },

  async loadEvents() {
    try {
      UIManager.showLoading(true);
      UIManager.hideError();

      state.allEvents = await APIService.fetchEvents();

      UIManager.displayStats(state.allEvents);
      UIManager.displayFilters();
      UIManager.displayEvents(state.allEvents);
    } catch (error) {
      this.handleError(error);
    } finally {
      UIManager.showLoading(false);
    }
  },

  filterEvents(filter) {
    state.currentFilter = filter;
    UIManager.displayFilters();
    UIManager.displayEvents(state.allEvents);
  },

  handleError(error) {
    console.error("Application error:", error);

    const errorMessages = {
      RATE_LIMIT_EXCEEDED:
        "⚠️ Çok fazla istek gönderildi. Lütfen 1 dakika bekleyip tekrar deneyin.",
      HTTP_ERROR_429:
        "⚠️ API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.",
      INVALID_RESPONSE: "⚠️ Sunucudan geçersiz yanıt alındı.",
      "Failed to fetch": "🌐 İnternet bağlantınızı kontrol edin.",
    };

    const message =
      errorMessages[error.message] ||
      errorMessages[
        Object.keys(errorMessages).find((key) => error.message.includes(key))
      ] ||
      "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";

    UIManager.showError(message);
  },
};

/**
 * Application Entry Point
 */
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  EventController.init();
});
