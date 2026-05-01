/* ═══════════════════════════════════════════════════════════════
   Election Guide Assistant — Test Suite (tests.js)
   Zero-dependency browser test runner.

   Tests cover:
   • Unit tests for pure functions (topicKey, detectCountry, etc.)
   • Security tests (DOMPurify XSS sanitisation)
   • Input validation tests
   • DOM integration tests
   • Accessibility tests (ARIA attributes, focus management)
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  // ── Test Runner ────────────────────────────────────────────
  const results = { passed: 0, failed: 0, errors: [] };

  /**
   * Run a single test assertion.
   * @param {string} name - Test description
   * @param {Function} fn - Test function (should throw on failure)
   */
  function test(name, fn) {
    try {
      fn();
      results.passed++;
      log(`  ✅ ${name}`, "pass");
    } catch (err) {
      results.failed++;
      results.errors.push({ name, error: err.message });
      log(`  ❌ ${name} — ${err.message}`, "fail");
    }
  }

  /**
   * Assert that two values are strictly equal.
   * @param {*} actual
   * @param {*} expected
   * @param {string} [msg]
   */
  function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Expected "${expected}" but got "${actual}"`);
    }
  }

  /**
   * Assert that a value is truthy.
   * @param {*} value
   * @param {string} [msg]
   */
  function assertTrue(value, msg) {
    if (!value) {
      throw new Error(msg || `Expected truthy but got "${value}"`);
    }
  }

  /**
   * Assert that a value is falsy/null/undefined.
   * @param {*} value
   * @param {string} [msg]
   */
  function assertNull(value, msg) {
    if (value != null) {
      throw new Error(msg || `Expected null/undefined but got "${value}"`);
    }
  }

  /**
   * Assert that a string does NOT contain a substring.
   * @param {string} haystack
   * @param {string} needle
   * @param {string} [msg]
   */
  function assertNotContains(haystack, needle, msg) {
    if (haystack.includes(needle)) {
      throw new Error(msg || `String should not contain "${needle}"`);
    }
  }

  /**
   * Log to the results container and console.
   * @param {string} text
   * @param {"pass"|"fail"|"header"|"info"} type
   */
  function log(text, type = "info") {
    console.log(text);
    const container = document.getElementById("test-results");
    if (container) {
      const div = document.createElement("div");
      div.className = `test-${type}`;
      div.textContent = text;
      container.appendChild(div);
    }
  }

  // ── Get exposed test functions ────────────────────────────
  const fns = window.__electionGuideTest;
  if (!fns) {
    log("⚠️  Test functions not found. Make sure app.js has loaded.", "fail");
    return;
  }

  const { topicKey, detectCountry, friendlyTopic, sanitiseHTML, escapeUserInput, validateInput } = fns;

  // ═════════════════════════════════════════════════════════
  //  1. Unit Tests — topicKey()
  // ═════════════════════════════════════════════════════════
  log("\n📦 topicKey()", "header");

  test("detects 'registration' from chip label", () => {
    assertEqual(topicKey("📋 Voter Registration"), "registration");
  });

  test("detects 'nomination' from text", () => {
    assertEqual(topicKey("tell me about nomination"), "nomination");
  });

  test("detects 'campaigning' from partial match", () => {
    assertEqual(topicKey("How does campaigning work?"), "campaigning");
  });

  test("detects 'voting' from text", () => {
    assertEqual(topicKey("I want to know about voting"), "voting");
  });

  test("detects 'results' from 'counting'", () => {
    assertEqual(topicKey("📊 Counting & Results"), "results");
  });

  test("detects 'results' from 'result' keyword", () => {
    assertEqual(topicKey("show me the result"), "results");
  });

  test("returns null for unrelated text", () => {
    assertNull(topicKey("hello world"));
  });

  test("returns null for empty string", () => {
    assertNull(topicKey(""));
  });

  // ═════════════════════════════════════════════════════════
  //  2. Unit Tests — detectCountry()
  // ═════════════════════════════════════════════════════════
  log("\n📦 detectCountry()", "header");

  test("detects India", () => {
    assertEqual(detectCountry("🇮🇳 India"), "india");
  });

  test("detects USA from 'usa'", () => {
    assertEqual(detectCountry("USA"), "usa");
  });

  test("detects USA from 'United States'", () => {
    assertEqual(detectCountry("United States"), "usa");
  });

  test("detects USA from 'america'", () => {
    assertEqual(detectCountry("Tell me about America"), "usa");
  });

  test("detects UK from 'uk'", () => {
    assertEqual(detectCountry("UK"), "uk");
  });

  test("detects UK from 'united kingdom'", () => {
    assertEqual(detectCountry("United Kingdom"), "uk");
  });

  test("detects UK from 'britain'", () => {
    assertEqual(detectCountry("Great Britain"), "uk");
  });

  test("returns null for unknown country", () => {
    assertNull(detectCountry("Australia"));
  });

  test("returns null for empty string", () => {
    assertNull(detectCountry(""));
  });

  // ═════════════════════════════════════════════════════════
  //  3. Unit Tests — friendlyTopic()
  // ═════════════════════════════════════════════════════════
  log("\n📦 friendlyTopic()", "header");

  test("maps 'registration' to friendly name", () => {
    assertEqual(friendlyTopic("registration"), "Voter Registration");
  });

  test("maps 'nomination' to friendly name", () => {
    assertEqual(friendlyTopic("nomination"), "Candidate Nomination");
  });

  test("maps 'campaigning' to friendly name", () => {
    assertEqual(friendlyTopic("campaigning"), "Campaigning");
  });

  test("maps 'voting' to friendly name", () => {
    assertEqual(friendlyTopic("voting"), "Voting");
  });

  test("maps 'results' to friendly name", () => {
    assertEqual(friendlyTopic("results"), "Counting & Results");
  });

  test("returns key itself for unknown topic", () => {
    assertEqual(friendlyTopic("unknown"), "unknown");
  });

  // ═════════════════════════════════════════════════════════
  //  4. Security Tests — sanitiseHTML()
  // ═════════════════════════════════════════════════════════
  log("\n🔒 sanitiseHTML() — XSS Prevention", "header");

  test("strips <script> tags", () => {
    const result = sanitiseHTML('<script>alert("xss")</script>');
    assertNotContains(result, "<script");
  });

  test("strips onerror event handlers", () => {
    const result = sanitiseHTML('<img src="x" onerror="alert(1)">');
    assertNotContains(result, "onerror");
  });

  test("strips onclick event handlers", () => {
    const result = sanitiseHTML('<div onclick="alert(1)">click me</div>');
    assertNotContains(result, "onclick");
  });

  test("strips javascript: URLs", () => {
    const result = sanitiseHTML('<a href="javascript:alert(1)">link</a>');
    assertNotContains(result, "javascript:");
  });

  test("strips iframe tags", () => {
    const result = sanitiseHTML('<iframe src="https://evil.com"></iframe>');
    assertNotContains(result, "<iframe");
  });

  test("preserves allowed tags (strong, ul, li)", () => {
    const input = "<ul><li><strong>Safe content</strong></li></ul>";
    const result = sanitiseHTML(input);
    assertTrue(result.includes("<strong>"), "should keep <strong>");
    assertTrue(result.includes("<ul>"), "should keep <ul>");
    assertTrue(result.includes("<li>"), "should keep <li>");
  });

  test("preserves <h3> tags", () => {
    const result = sanitiseHTML("<h3>Title</h3>");
    assertTrue(result.includes("<h3>"), "should keep <h3>");
  });

  // ═════════════════════════════════════════════════════════
  //  5. Input Validation Tests — validateInput()
  // ═════════════════════════════════════════════════════════
  log("\n🛡️ validateInput()", "header");

  test("trims whitespace", () => {
    assertEqual(validateInput("  hello  "), "hello");
  });

  test("returns null for empty string", () => {
    assertNull(validateInput(""));
  });

  test("returns null for whitespace-only input", () => {
    assertNull(validateInput("   "));
  });

  test("truncates input exceeding max length", () => {
    const longInput = "a".repeat(600);
    const result = validateInput(longInput);
    assertEqual(result.length, 500);
  });

  test("preserves valid input unchanged", () => {
    assertEqual(validateInput("Hello world"), "Hello world");
  });

  // ═════════════════════════════════════════════════════════
  //  6. Security Tests — escapeUserInput()
  // ═════════════════════════════════════════════════════════
  log("\n🔒 escapeUserInput()", "header");

  test("escapes HTML angle brackets", () => {
    const result = escapeUserInput("<script>alert(1)</script>");
    assertNotContains(result, "<script>");
    assertTrue(result.includes("&lt;"), "should contain &lt;");
  });

  test("escapes ampersands", () => {
    const result = escapeUserInput("Tom & Jerry");
    assertTrue(result.includes("&amp;"), "should escape &");
  });

  test("preserves plain text", () => {
    assertEqual(escapeUserInput("Hello world"), "Hello world");
  });

  // ═════════════════════════════════════════════════════════
  //  7. DOM Integration Tests
  // ═════════════════════════════════════════════════════════
  log("\n🧩 DOM Integration", "header");

  test("chat area exists with role='log'", () => {
    const chat = document.getElementById("chat-area");
    assertTrue(chat, "chat-area should exist");
    assertEqual(chat.getAttribute("role"), "log");
  });

  test("chat area has aria-live attribute", () => {
    const chat = document.getElementById("chat-area");
    assertTrue(chat.getAttribute("aria-live"), "should have aria-live");
  });

  test("chips tray exists with role='group'", () => {
    const tray = document.getElementById("chips-tray");
    assertTrue(tray, "chips-tray should exist");
    assertEqual(tray.getAttribute("role"), "group");
  });

  test("chips tray has aria-label", () => {
    const tray = document.getElementById("chips-tray");
    assertTrue(tray.getAttribute("aria-label"), "should have aria-label");
  });

  test("input field has maxlength attribute", () => {
    const input = document.getElementById("user-input");
    assertTrue(input, "user-input should exist");
    assertEqual(input.getAttribute("maxlength"), "500");
  });

  test("send button has aria-label", () => {
    const btn = document.getElementById("send-btn");
    assertTrue(btn, "send-btn should exist");
    assertTrue(btn.getAttribute("aria-label"), "should have aria-label");
  });

  test("skip link exists", () => {
    const skip = document.getElementById("skip-link");
    assertTrue(skip, "skip-link should exist");
  });

  test("sr-announcements live region exists", () => {
    const sr = document.getElementById("sr-announcements");
    assertTrue(sr, "sr-announcements should exist");
    assertEqual(sr.getAttribute("aria-live"), "assertive");
  });

  // ═════════════════════════════════════════════════════════
  //  8. Accessibility Tests
  // ═════════════════════════════════════════════════════════
  log("\n♿ Accessibility", "header");

  test("input has associated label", () => {
    const label = document.querySelector('label[for="user-input"]');
    assertTrue(label, "should have a <label> for user-input");
  });

  test("background blobs are aria-hidden", () => {
    const blobs = document.querySelector(".bg-blobs");
    assertTrue(blobs, "bg-blobs should exist");
    assertEqual(blobs.getAttribute("aria-hidden"), "true");
  });

  test("header icon is aria-hidden", () => {
    const icon = document.querySelector(".header__icon");
    assertTrue(icon, "header__icon should exist");
    assertEqual(icon.getAttribute("aria-hidden"), "true");
  });

  test("SVG in send button is aria-hidden", () => {
    const svg = document.querySelector("#send-btn svg");
    assertTrue(svg, "SVG should exist in send button");
    assertEqual(svg.getAttribute("aria-hidden"), "true");
  });

  test("greeting message appears in chat area", () => {
    const messages = document.querySelectorAll(".msg--bot");
    assertTrue(messages.length > 0, "should have at least one bot message (greeting)");
  });

  // ═════════════════════════════════════════════════════════
  //  9. Data Integrity Tests
  // ═════════════════════════════════════════════════════════
  log("\n📊 Data Integrity", "header");

  test("COUNTRIES object is frozen", () => {
    assertTrue(Object.isFrozen(COUNTRIES), "COUNTRIES should be frozen");
  });

  test("COUNTRIES has india, usa, uk", () => {
    assertTrue(COUNTRIES.india, "should have india");
    assertTrue(COUNTRIES.usa, "should have usa");
    assertTrue(COUNTRIES.uk, "should have uk");
  });

  test("each country has all 5 topic keys", () => {
    const requiredKeys = ["registration", "nomination", "campaigning", "voting", "results"];
    for (const [countryKey, data] of Object.entries(COUNTRIES)) {
      for (const key of requiredKeys) {
        assertTrue(data[key], `${countryKey} should have '${key}' topic`);
      }
    }
  });

  test("TOPIC_CHIPS_WITH_COUNTRY is frozen", () => {
    assertTrue(Object.isFrozen(TOPIC_CHIPS_WITH_COUNTRY), "should be frozen");
  });

  test("TOPIC_CHIPS_NO_COUNTRY is frozen", () => {
    assertTrue(Object.isFrozen(TOPIC_CHIPS_NO_COUNTRY), "should be frozen");
  });

  // ═════════════════════════════════════════════════════════
  //  Results Summary
  // ═════════════════════════════════════════════════════════
  const total = results.passed + results.failed;
  log(`\n${"═".repeat(50)}`, "info");
  log(`📋 Results: ${results.passed}/${total} passed, ${results.failed} failed`, results.failed ? "fail" : "pass");

  if (results.failed > 0) {
    log("\n⚠️  Failed tests:", "fail");
    results.errors.forEach(e => {
      log(`   • ${e.name}: ${e.error}`, "fail");
    });
  } else {
    log("🎉 All tests passed!", "pass");
  }

  // Update page title with results
  document.title = `Tests: ${results.passed}/${total} passed ${results.failed ? "❌" : "✅"}`;
})();
