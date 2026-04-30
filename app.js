/* ═══════════════════════════════════════════════════════════════
   Election Guide Assistant — Conversational Logic (app.js)
   Pure JS chatbot with an interactive, chip-based election guide.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  // ── DOM refs ──────────────────────────────────────────────
  const chatArea   = document.getElementById("chat-area");
  const chipsTray  = document.getElementById("chips-tray");
  const inputForm  = document.getElementById("input-form");
  const inputField = document.getElementById("user-input");

  // ── State ─────────────────────────────────────────────────
  let currentCountry = null;   // Selected country for context
  let awaitingCountry = false; // Waiting for user country input

  // ═════════════════════════════════════════════════════════
  //  Knowledge Base — factual, neutral election information
  // ═════════════════════════════════════════════════════════

  const COUNTRIES = {
    india: {
      name: "India 🇮🇳",
      registration: `
        <h3>📋 Voter Registration in India</h3>
        <ul>
          <li>You must be <strong>18 years or older</strong>.</li>
          <li>Register online at the <strong>National Voters' Service Portal (NVSP)</strong>.</li>
          <li>You can also visit your local <strong>Electoral Registration Officer</strong>.</li>
          <li>Fill <strong>Form 6</strong> (for new voters) or <strong>Form 8</strong> (for corrections).</li>
          <li>Your name appears in the <strong>Electoral Roll</strong> once approved.</li>
          <li>You receive a <strong>Voter ID card (EPIC)</strong>.</li>
        </ul>`,
      nomination: `
        <h3>📝 Candidate Nomination in India</h3>
        <ul>
          <li>Candidates are picked by <strong>political parties</strong> or can run as <strong>independents</strong>.</li>
          <li>Must file a <strong>nomination paper</strong> with the Returning Officer.</li>
          <li>Requires a <strong>security deposit</strong> (₹25,000 for Lok Sabha).</li>
          <li>Nomination papers are <strong>scrutinised</strong> and can be rejected if invalid.</li>
          <li>Candidates can withdraw within a set deadline.</li>
          <li>Final list of candidates is published by the <strong>Election Commission of India (ECI)</strong>.</li>
        </ul>`,
      campaigning: `
        <h3>📢 Campaigning in India</h3>
        <ul>
          <li>Campaigns run for a <strong>limited period</strong> set by the ECI.</li>
          <li>Campaigning <strong>stops 48 hours</strong> before polling day (silence period).</li>
          <li>Parties use <strong>rallies, advertisements, door-to-door visits</strong>, and social media.</li>
          <li>There is a <strong>spending limit</strong> per candidate set by the ECI.</li>
          <li>A <strong>Model Code of Conduct</strong> must be followed — no hate speech, no bribing.</li>
        </ul>`,
      voting: `
        <h3>🗳️ Voting in India</h3>
        <ul>
          <li>Voting is done using <strong>Electronic Voting Machines (EVMs)</strong>.</li>
          <li>Each voter goes to their assigned <strong>polling booth</strong>.</li>
          <li>Identity is verified using the <strong>Voter ID card</strong> or other valid ID.</li>
          <li>A <strong>VVPAT</strong> (paper trail) lets voters verify their vote.</li>
          <li>Voting is <strong>secret</strong> — no one can see whom you voted for.</li>
          <li>Indelible <strong>ink</strong> is applied on a finger to prevent repeat voting.</li>
        </ul>`,
      results: `
        <h3>📊 Counting & Results in India</h3>
        <ul>
          <li>Counting happens on a <strong>designated date</strong> under ECI supervision.</li>
          <li>EVM votes and VVPAT slips are tallied.</li>
          <li>The candidate with the <strong>most votes wins</strong> (First-Past-the-Post).</li>
          <li>Results are announced <strong>constituency by constituency</strong>.</li>
          <li>The party (or alliance) with a <strong>majority of seats</strong> forms the government.</li>
        </ul>`
    },

    usa: {
      name: "United States 🇺🇸",
      registration: `
        <h3>📋 Voter Registration in the USA</h3>
        <ul>
          <li>You must be a <strong>U.S. citizen</strong> and at least <strong>18</strong>.</li>
          <li>Register online, by mail, or in person — rules <strong>vary by state</strong>.</li>
          <li>Some states allow <strong>same-day registration</strong>.</li>
          <li>North Dakota is the only state that <strong>does not require</strong> registration.</li>
          <li>You may need to provide a <strong>driver's licence</strong> or SSN.</li>
        </ul>`,
      nomination: `
        <h3>📝 Candidate Nomination in the USA</h3>
        <ul>
          <li>Parties choose candidates through <strong>primaries</strong> or <strong>caucuses</strong>.</li>
          <li>Delegates from each state go to a <strong>national convention</strong> to officially nominate.</li>
          <li>Independent candidates can get on the ballot by collecting <strong>petition signatures</strong>.</li>
          <li>Presidential candidates pick a <strong>running mate</strong> (Vice President nominee).</li>
        </ul>`,
      campaigning: `
        <h3>📢 Campaigning in the USA</h3>
        <ul>
          <li>Campaigns can last <strong>over a year</strong> for presidential races.</li>
          <li>Heavy use of <strong>TV ads, social media, rallies</strong>, and debates.</li>
          <li>Campaign finance is regulated by the <strong>Federal Election Commission (FEC)</strong>.</li>
          <li><strong>Super PACs</strong> can raise unlimited money for independent spending.</li>
          <li>Candidates participate in <strong>presidential debates</strong> before Election Day.</li>
        </ul>`,
      voting: `
        <h3>🗳️ Voting in the USA</h3>
        <ul>
          <li>Election Day is the <strong>first Tuesday after the first Monday</strong> in November.</li>
          <li>Many states offer <strong>early voting</strong> and <strong>mail-in / absentee</strong> ballots.</li>
          <li>Voters use <strong>paper ballots</strong>, optical scanners, or touchscreens depending on the state.</li>
          <li>Voting is <strong>not compulsory</strong>.</li>
          <li>The <strong>secret ballot</strong> ensures privacy.</li>
        </ul>`,
      results: `
        <h3>📊 Counting & Results in the USA</h3>
        <ul>
          <li>Votes are counted at <strong>county level</strong> and certified by each state.</li>
          <li>Presidential elections use the <strong>Electoral College</strong> — 538 electors total.</li>
          <li>A candidate needs <strong>270 electoral votes</strong> to win the presidency.</li>
          <li>Most states use a <strong>winner-take-all</strong> system for electors.</li>
          <li>Congress certifies results in <strong>January</strong>.</li>
        </ul>`
    },

    uk: {
      name: "United Kingdom 🇬🇧",
      registration: `
        <h3>📋 Voter Registration in the UK</h3>
        <ul>
          <li>You must be at least <strong>18</strong> (16 in Scotland & Wales for devolved elections).</li>
          <li>Register online at <strong>gov.uk/register-to-vote</strong>.</li>
          <li>Must be a <strong>British, Irish, or qualifying Commonwealth citizen</strong>.</li>
          <li>You need your <strong>National Insurance number</strong> to register.</li>
        </ul>`,
      nomination: `
        <h3>📝 Candidate Nomination in the UK</h3>
        <ul>
          <li>Candidates need <strong>10 signatures</strong> from registered voters in the constituency.</li>
          <li>A <strong>deposit of £500</strong> is required (returned if they get 5 %+ votes).</li>
          <li>Must be at least <strong>18 years old</strong>.</li>
          <li>Parties select candidates through their own <strong>internal processes</strong>.</li>
        </ul>`,
      campaigning: `
        <h3>📢 Campaigning in the UK</h3>
        <ul>
          <li>Official campaign period is about <strong>5–6 weeks</strong>.</li>
          <li>There are strict <strong>spending limits</strong> per candidate and per party.</li>
          <li><strong>Party Election Broadcasts</strong> are given free airtime on TV.</li>
          <li>Regulated by the <strong>Electoral Commission</strong>.</li>
          <li>Leaders' debates are held on television.</li>
        </ul>`,
      voting: `
        <h3>🗳️ Voting in the UK</h3>
        <ul>
          <li>Voting uses a <strong>paper ballot</strong> marked with an X.</li>
          <li>Polling stations are open <strong>7 am – 10 pm</strong>.</li>
          <li>Postal and <strong>proxy voting</strong> are available.</li>
          <li>Voting is <strong>not compulsory</strong>.</li>
          <li>You vote for a <strong>local MP</strong> in your constituency.</li>
        </ul>`,
      results: `
        <h3>📊 Counting & Results in the UK</h3>
        <ul>
          <li>Votes are counted by hand overnight — results often come in by <strong>early morning</strong>.</li>
          <li>Uses <strong>First-Past-the-Post</strong> — highest votes wins the seat.</li>
          <li>The party with a <strong>majority of seats (326 of 650)</strong> forms the government.</li>
          <li>The leader of that party becomes <strong>Prime Minister</strong>.</li>
        </ul>`
    }
  };

  // Generic overview (country-agnostic)
  const GENERIC_OVERVIEW = `
    <h3>🗳️ How Elections Work — A Quick Overview</h3>
    <p>An election is how people choose their leaders. Here's the basic flow:</p>
    <ul>
      <li><strong>1. Voter Registration</strong> — Citizens sign up to be eligible to vote.</li>
      <li><strong>2. Candidate Nomination</strong> — People officially declare they want to run.</li>
      <li><strong>3. Campaigning</strong> — Candidates share their ideas and ask for votes.</li>
      <li><strong>4. Voting</strong> — Citizens cast their ballots on Election Day.</li>
      <li><strong>5. Counting & Results</strong> — Votes are tallied and the winner is announced.</li>
    </ul>
    <p>Would you like a <strong>detailed breakdown</strong> of any step? Pick a topic below 👇</p>`;

  // ═════════════════════════════════════════════════════════
  //  UI Helpers
  // ═════════════════════════════════════════════════════════

  /** Append a message bubble */
  function addMessage(html, sender = "bot") {
    const div = document.createElement("div");
    div.className = `msg msg--${sender}`;
    const label = sender === "bot" ? "🤖 Guide" : "You";
    div.innerHTML = `<span class="msg__label">${label}</span>${html}`;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  /** Show the typing indicator, return its element */
  function showTyping() {
    const div = document.createElement("div");
    div.className = "msg msg--bot msg--typing";
    div.innerHTML = `<span class="msg__label">🤖 Guide</span><span class="dots"><span></span><span></span><span></span></span>`;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
    return div;
  }

  /** Simulate typing delay then post bot message */
  function botReply(html, chips = [], delay = 600) {
    const typing = showTyping();
    setTimeout(() => {
      typing.remove();
      addMessage(html, "bot");
      setChips(chips);
    }, delay);
  }

  /** Render quick-reply chips */
  function setChips(labels) {
    chipsTray.innerHTML = "";
    labels.forEach(label => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = label;
      btn.addEventListener("click", () => handleChip(label));
      chipsTray.appendChild(btn);
    });
  }

  // ═════════════════════════════════════════════════════════
  //  Conversation Handlers
  // ═════════════════════════════════════════════════════════

  const TOPIC_CHIPS_WITH_COUNTRY = [
    "📋 Voter Registration",
    "📝 Candidate Nomination",
    "📢 Campaigning",
    "🗳️ Voting",
    "📊 Counting & Results",
    "🌍 Change Country",
    "🔄 Start Over"
  ];

  const TOPIC_CHIPS_NO_COUNTRY = [
    "📋 Voter Registration",
    "📝 Candidate Nomination",
    "📢 Campaigning",
    "🗳️ Voting",
    "📊 Counting & Results"
  ];

  /** Map a chip/text to a topic key */
  function topicKey(text) {
    const t = text.toLowerCase();
    if (t.includes("registration"))  return "registration";
    if (t.includes("nomination"))    return "nomination";
    if (t.includes("campaign"))      return "campaigning";
    if (t.includes("voting") || t === "🗳️ voting") return "voting";
    if (t.includes("counting") || t.includes("result")) return "results";
    return null;
  }

  /** Detect country from text */
  function detectCountry(text) {
    const t = text.toLowerCase();
    if (t.includes("india"))          return "india";
    if (t.includes("usa") || t.includes("united states") || t.includes("america")) return "usa";
    if (t.includes("uk") || t.includes("united kingdom") || t.includes("britain")) return "uk";
    return null;
  }

  /** Handle a chip click */
  function handleChip(label) {
    handleUserInput(label);
  }

  /** Core input handler */
  function handleUserInput(text) {
    addMessage(text, "user");
    const lower = text.toLowerCase();

    // ── Awaiting country input ──
    if (awaitingCountry) {
      const c = detectCountry(text);
      if (c) {
        currentCountry = c;
        awaitingCountry = false;
        botReply(
          `Great choice! Let's explore elections in <strong>${COUNTRIES[c].name}</strong>.<br>Pick a topic to learn about 👇`,
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
      // If no country selected yet, ask for one first
      if (!currentCountry) {
        askCountry(`I'll explain <strong>${friendlyTopic(topic)}</strong> — but first, which country?`);
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
      botReply(
        `Got it — <strong>${COUNTRIES[country].name}</strong>! Pick a topic 👇`,
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

  function askCountry(prefix = "") {
    awaitingCountry = true;
    const msg = prefix
      ? `${prefix}<br>Choose a country:`
      : `Which country's election process would you like to explore?`;
    botReply(msg, ["🇮🇳 India", "🇺🇸 USA", "🇬🇧 UK"]);
  }

  function friendlyTopic(key) {
    const map = {
      registration: "Voter Registration",
      nomination: "Candidate Nomination",
      campaigning: "Campaigning",
      voting: "Voting",
      results: "Counting & Results"
    };
    return map[key] || key;
  }

  // ── Greeting ──────────────────────────────────────────────
  function greet() {
    botReply(
      `👋 <strong>Welcome to the Election Guide Assistant!</strong><br><br>
       I can explain the election process in a simple, step-by-step way.<br>
       No opinions — just clear, factual info.<br><br>
       How would you like to start?`,
      ["🗳️ Quick Overview", "📖 Detailed Guide"],
      800
    );
  }

  // ── Form submission ───────────────────────────────────────
  inputForm.addEventListener("submit", e => {
    e.preventDefault();
    const val = inputField.value.trim();
    if (!val) return;
    inputField.value = "";
    handleUserInput(val);
  });

  // ── Boot ──────────────────────────────────────────────────
  greet();
})();
