/* ═══════════════════════════════════════════════════════════════
   Election Guide Assistant — Knowledge Base (election-data.js)
   Factual, neutral election data separated from application logic.
   ═══════════════════════════════════════════════════════════════ */

/**
 * @fileoverview
 * Contains all election-related content data used by the chatbot.
 * Data is frozen to prevent accidental mutation at runtime.
 * To add a new country, add an entry to COUNTRIES with all five topic keys.
 */

"use strict";

/**
 * Country-specific election information.
 * Each country object must have: name, registration, nomination, campaigning, voting, results.
 * @type {Readonly<Object<string, {name: string, registration: string, nomination: string, campaigning: string, voting: string, results: string}>>}
 */
const COUNTRIES = Object.freeze({
  india: Object.freeze({
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
  }),

  usa: Object.freeze({
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
  }),

  uk: Object.freeze({
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
  })
});

/**
 * Country-agnostic election overview content.
 * @type {string}
 */
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

/**
 * Quick-reply chip labels shown when a country is selected.
 * @type {ReadonlyArray<string>}
 */
const TOPIC_CHIPS_WITH_COUNTRY = Object.freeze([
  "📋 Voter Registration",
  "📝 Candidate Nomination",
  "📢 Campaigning",
  "🗳️ Voting",
  "📊 Counting & Results",
  "🌍 Change Country",
  "🔄 Start Over"
]);

/**
 * Quick-reply chip labels shown before a country is selected.
 * @type {ReadonlyArray<string>}
 */
const TOPIC_CHIPS_NO_COUNTRY = Object.freeze([
  "📋 Voter Registration",
  "📝 Candidate Nomination",
  "📢 Campaigning",
  "🗳️ Voting",
  "📊 Counting & Results"
]);

/**
 * Human-readable topic names keyed by internal topic ID.
 * @type {Readonly<Object<string, string>>}
 */
const TOPIC_LABELS = Object.freeze({
  registration: "Voter Registration",
  nomination:   "Candidate Nomination",
  campaigning:  "Campaigning",
  voting:       "Voting",
  results:      "Counting & Results"
});
