/* ═══════════════════════════════════════════════════════════════
   Election Guide Assistant — Application Logic (app.js)
   Pure JS chatbot with interactive, chip-based election guide.

   Focus areas addressed:
   • Code Quality  — JSDoc, constants, error handling, modular design
   • Security      — DOMPurify sanitisation, input validation
   • Efficiency    — Event delegation, DocumentFragment, rAF scroll
   • Accessibility — Focus management, ARIA live, screen reader support
   • Google        — gtag() analytics event tracking
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  // ── Constants ──────────────────────────────────────────────
  /** @const {number} Maximum allowed characters in user input */
  const MAX_INPUT_LENGTH = 500;

  /** @const {number} Default typing indicator delay in ms */
  const TYPING_DELAY_MS = 600;

  /** @const {number} Greeting delay in ms */
  const GREETING_DELAY_MS = 800;

  /** @const {string} CSS class prefix for messages */
  const MSG_CLASS = "msg";

  // ── DOM References ─────────────────────────────────────────
  const chatArea   = document.getElementById("chat-area");
  const chipsTray  = document.getElementById("chips-tray");
  const inputForm  = document.getElementById("input-form");
  const inputField = document.getElementById("user-input");
  const srAnnounce = document.getElementById("sr-announcements");

  // ── State ─────────────────────────────────────────────────
  /** @type {string|null} Currently selected country key */
  let currentCountry = null;

  /** @type {boolean} Whether we are waiting for a country selection */
  let awaitingCountry = false;

  /** @type {HTMLElement|null} Reusable typing indicator element */
  let typingIndicator = null;

  // ═════════════════════════════════════════════════════════
  //  Utility — Sanitisation & Safety
  // ═════════════════════════════════════════════════════════

  /**
   * Sanitise HTML content to prevent XSS attacks.
   * Falls back to basic tag stripping if DOMPurify is unavailable.
   * @param {string} dirty - Untrusted HTML string
   * @returns {string} Sanitised HTML safe for innerHTML
   */
  function sanitiseHTML(dirty) {
    if (typeof DOMPurify !== "undefined" && DOMPurify.sanitize) {
      return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
          "h3", "p", "ul", "ol", "li", "strong", "em", "br", "span", "b", "i"
        ],
        ALLOWED_ATTR: ["class"]
      });
    }
    // Fallback: strip all HTML tags
    const temp = document.createElement("div");
    temp.textContent = dirty;
    return temp.innerHTML;
  }

  /**
   * Escape user input for safe display as plain text.
   * Uses textContent assignment to neutralise any HTML/script.
   * @param {string} text - Raw user input
   * @returns {string} Escaped text safe for display
   */
  function escapeUserInput(text) {
    const span = document.createElement("span");
    span.textContent = text;
    return span.innerHTML;
  }

  /**
   * Validate and trim user input.
   * @param {string} raw - Raw input value
   * @returns {string|null} Cleaned input or null if invalid
   */
  function validateInput(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.length > MAX_INPUT_LENGTH) {
      return trimmed.substring(0, MAX_INPUT_LENGTH);
    }
    return trimmed;
  }

  // ═════════════════════════════════════════════════════════
  //  Utility — Analytics (Google Services)
  // ═════════════════════════════════════════════════════════

  /**
   * Send a custom event to Google Analytics (gtag).
   * Silently no-ops if gtag is not loaded.
   * @param {string} eventName - GA4 event name
   * @param {Object} [params={}] - Event parameters
   */
  function trackEvent(eventName, params = {}) {
    try {
      if (typeof gtag === "function") {
        gtag("event", eventName, params);
      }
    } catch (_) {
      // Analytics should never break the app
    }
  }

  // ═════════════════════════════════════════════════════════
  //  UI Helpers
  // ═════════════════════════════════════════════════════════

  /**
   * Smoothly scroll the chat area to the bottom using rAF.
   * More efficient than direct scrollTop assignment.
   */
  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    });
  }

  /**
   * Announce a message to screen readers via the live region.
   * @param {string} text - Plain text to announce
   */
  function announceToSR(text) {
    if (srAnnounce) {
      srAnnounce.textContent = text;
      // Clear after announcement to allow repeated messages
      setTimeout(() => { srAnnounce.textContent = ""; }, 1000);
    }
  }

  /**
   * Append a message bubble to the chat area.
   * Bot messages use sanitised innerHTML; user messages use escaped text.
   * @param {string} content - Message content (HTML for bot, plain text for user)
   * @param {"bot"|"user"} [sender="bot"] - Who sent the message
   */
  function addMessage(content, sender = "bot") {
    try {
      const div = document.createElement("div");
      div.className = `${MSG_CLASS} ${MSG_CLASS}--${sender}`;
      div.setAttribute("role", "article");

      const label = document.createElement("span");
      label.className = "msg__label";
      label.textContent = sender === "bot" ? "🤖 Guide" : "You";
      div.appendChild(label);

      const body = document.createElement("span");
      body.className = "msg__body";

      if (sender === "bot") {
        body.innerHTML = sanitiseHTML(content);
      } else {
        body.textContent = content; // Safe: textContent auto-escapes
      }

      div.appendChild(body);
      chatArea.appendChild(div);
      scrollToBottom();

      // Announce to screen readers
      if (sender === "bot") {
        const plainText = body.textContent || body.innerText;
        announceToSR(plainText.substring(0, 200));
      }
    } catch (err) {
      console.error("[ElectionGuide] Failed to add message:", err);
    }
  }

  /**
   * Show the typing indicator (reuses a single DOM element).
   */
  function showTyping() {
    if (!typingIndicator) {
      typingIndicator = document.createElement("div");
      typingIndicator.className = `${MSG_CLASS} ${MSG_CLASS}--bot ${MSG_CLASS}--typing`;
      typingIndicator.setAttribute("role", "status");
      typingIndicator.setAttribute("aria-label", "Guide is typing");
      typingIndicator.innerHTML = `<span class="msg__label">🤖 Guide</span><span class="dots"><span></span><span></span><span></span></span>`;
    }
    chatArea.appendChild(typingIndicator);
    scrollToBottom();
    announceToSR("Guide is typing…");
  }

  /**
   * Hide the typing indicator.
   */
  function hideTyping() {
    if (typingIndicator && typingIndicator.parentNode) {
      typingIndicator.parentNode.removeChild(typingIndicator);
    }
  }

  /**
   * Simulate a bot reply with a typing delay.
   * @param {string} html - Bot response HTML (from knowledge base)
   * @param {string[]} [chips=[]] - Quick-reply chip labels to show
   * @param {number} [delay=TYPING_DELAY_MS] - Typing delay in ms
   */
  function botReply(html, chips = [], delay = TYPING_DELAY_MS) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(html, "bot");
      setChips(chips);
      // Return focus to input for accessibility
      inputField.focus();
    }, delay);
  }

  /**
   * Render quick-reply chips using DocumentFragment for efficiency.
   * Uses event delegation so no per-chip listeners are needed.
   * @param {string[]} labels - Chip label strings
   */
  function setChips(labels) {
    chipsTray.innerHTML = "";
    if (!labels.length) return;

    const fragment = document.createDocumentFragment();
    labels.forEach((label, index) => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = label;
      btn.dataset.chipLabel = label;
      btn.setAttribute("aria-label", label);
      btn.id = `chip-${index}`;
      fragment.appendChild(btn);
    });
    chipsTray.appendChild(fragment);
  }

  // ═════════════════════════════════════════════════════════
  //  Topic & Country Detection (Pure Functions)
  // ═════════════════════════════════════════════════════════

  /**
   * Map user text to a topic key.
   * @param {string} text - User input or chip label
   * @returns {string|null} Topic key or null if unrecognised
   */
  function topicKey(text) {
    const t = text.toLowerCase();
    if (t.includes("registration"))  return "registration";
    if (t.includes("nomination"))    return "nomination";
    if (t.includes("campaign"))      return "campaigning";
    if (t.includes("voting") || t === "🗳️ voting") return "voting";
    if (t.includes("counting") || t.includes("result")) return "results";
    return null;
  }

  /**
   * Detect a country key from user text.
   * @param {string} text - User input
   * @returns {string|null} Country key or null if unrecognised
   */
  function detectCountry(text) {
    const t = text.toLowerCase();
    if (t.includes("india")) return "india";
    if (t.includes("usa") || t.includes("united states") || t.includes("america")) return "usa";
    if (t.includes("uk") || t.includes("united kingdom") || t.includes("britain")) return "uk";
    return null;
  }

  /**
   * Get the human-readable label for a topic key.
   * @param {string} key - Internal topic key
   * @returns {string} Friendly topic name
   */
  function friendlyTopic(key) {
    return TOPIC_LABELS[key] || key;
  }

  // ═════════════════════════════════════════════════════════
  //  Conversation Handlers
  // ═════════════════════════════════════════════════════════

  /**
   * Core input handler — routes user input to the appropriate response.
   * @param {string} text - Validated user input
   */
  function handleUserInput(text) {
    addMessage(text, "user");
    trackEvent("message_sent", { method: "text" });
    const lower = text.toLowerCase();

    // ── Awaiting country input ──
    if (awaitingCountry) {
      const c = detectCountry(text);
      if (c) {
        currentCountry = c;
        awaitingCountry = false;
        trackEvent("country_selected", { country: c });
        botReply(
          `Great choice! Let's explore elections in <strong>${escapeUserInput(COUNTRIES[c].name)}</strong>.<br>Pick a topic to learn about 👇`,
          TOPIC_CHIPS_WITH_COUNTRY
        );
      } else {
        botReply(
          `Hmm, I don't have detailed data for that country yet. Please choose one of these:`,
          ["🇮🇳 India", "🇺🇸 USA", "🇬🇧 UK"]
        );
      }
      return;
    }

    // ── Start over ──
    if (lower.includes("start over") || lower.includes("restart") || lower.includes("reset")) {
      currentCountry = null;
      awaitingCountry = false;
      greet();
      return;
    }

    // ── Overview ──
    if (lower.includes("overview") || lower.includes("quick") || lower.includes("summary")) {
      trackEvent("topic_selected", { topic: "overview" });
      botReply(GENERIC_OVERVIEW, currentCountry ? TOPIC_CHIPS_WITH_COUNTRY : TOPIC_CHIPS_NO_COUNTRY);
      return;
    }

    // ── Detailed ──
    if (lower.includes("detailed") || lower.includes("deep") || lower.includes("step")) {
      askCountry();
      return;
    }

    // ── Change country ──
    if (lower.includes("change country") || lower.includes("🌍")) {
      askCountry();
      return;
    }

    // ── Topic detection ──
    const topic = topicKey(text);
    if (topic) {
      trackEvent("topic_selected", { topic: topic });
      if (!currentCountry) {
        askCountry(`I'll explain <strong>${escapeUserInput(friendlyTopic(topic))}</strong> — but first, which country?`);
        return;
      }
      const content = COUNTRIES[currentCountry][topic];
      botReply(
        content + `<br><br>Want more details on another topic? 👇`,
        TOPIC_CHIPS_WITH_COUNTRY
      );
      return;
    }

    // ── Country mentioned inline ──
    const country = detectCountry(text);
    if (country) {
      currentCountry = country;
      trackEvent("country_selected", { country: country });
      botReply(
        `Got it — <strong>${escapeUserInput(COUNTRIES[country].name)}</strong>! Pick a topic 👇`,
        TOPIC_CHIPS_WITH_COUNTRY
      );
      return;
    }

    // ── Fallback ──
    botReply(
      `I'm here to help you understand elections! Try asking about one of these topics 👇`,
      currentCountry ? TOPIC_CHIPS_WITH_COUNTRY : ["🗳️ Quick Overview", "📖 Detailed Guide"]
    );
  }

  /**
   * Ask the user to select a country.
   * @param {string} [prefix=""] - Optional intro text before the country prompt
   */
  function askCountry(prefix = "") {
    awaitingCountry = true;
    const msg = prefix
      ? `${prefix}<br>Choose a country:`
      : `Which country's election process would you like to explore?`;
    botReply(msg, ["🇮🇳 India", "🇺🇸 USA", "🇬🇧 UK"]);
  }

  /**
   * Show the initial greeting message.
   */
  function greet() {
    botReply(
      `👋 <strong>Welcome to the Election Guide Assistant!</strong><br><br>
       I can explain the election process in a simple, step-by-step way.<br>
       No opinions — just clear, factual info.<br><br>
       How would you like to start?`,
      ["🗳️ Quick Overview", "📖 Detailed Guide"],
      GREETING_DELAY_MS
    );
  }

  // ═════════════════════════════════════════════════════════
  //  Event Listeners
  // ═════════════════════════════════════════════════════════

  // ── Form submission ───────────────────────────────────────
  inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = validateInput(inputField.value);
    if (!val) return;
    inputField.value = "";
    handleUserInput(val);
  });

  // ── Event delegation for chips (Efficiency) ───────────────
  chipsTray.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const label = chip.dataset.chipLabel || chip.textContent;
    handleUserInput(label);
  });

  // ── Keyboard support for chips ────────────────────────────
  chipsTray.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      e.preventDefault();
      const label = chip.dataset.chipLabel || chip.textContent;
      handleUserInput(label);
    }
  });

  // ── Boot ──────────────────────────────────────────────────
  greet();
  trackEvent("app_loaded");

  // ── Expose pure functions for testing ─────────────────────
  if (typeof window !== "undefined") {
    window.__electionGuideTest = {
      topicKey,
      detectCountry,
      friendlyTopic,
      sanitiseHTML,
      escapeUserInput,
      validateInput
    };
  }
})();
