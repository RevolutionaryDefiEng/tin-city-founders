# Tin City Founders — Community, Capital & AI Strategy

**Date:** 29 September 2026
**Scope:** (1) optimal path to a thriving community, (2) honest critique of the current value offering, (3) how to build a capital pool founders can draw from, (4) AI features that make joining TCF obviously worth it.

**Constraints this plan is built around (confirmed):**

| Constraint | Implication |
| --- | --- |
| No legal entity yet | TCF cannot sign contracts, receive grant money, or hold anyone's funds. Every capital mechanism below is designed so TCF never touches money until this changes. |
| Capital = sponsor/grant-funded + brokered | No member deposits, no on-chain pool, no securities exposure. |
| 90-day goal = capital into founders' hands | Community-building work is only justified here where it also produces capital outcomes. |
| AI = WhatsApp-first + web app | Reuse `server/_core/llm.ts` and `server/_core/voiceTranscription.ts`. No new stack. |

---

## 1. The thesis in one paragraph

You are trying to solve two problems — build a community, and get capital to founders — and you are treating them as two projects. They are one project. With no entity, no licence and no legal recourse, the only thing that can de-risk putting money into a Jos founder's hands is **a documented, peer-attested track record of that founder delivering**. Nobody in Plateau is generating that record today. If TCF becomes the place where founder reliability is recorded, then the community mechanism (members giving and asking, publicly, repeatedly) *is* the underwriting infrastructure for the capital pool. The ledger is the collateral. Build the ledger and you get both the thriving community and the fundable pipeline from a single effort — and you own an asset no sponsor, bank or accelerator in the region can replicate, because it can only be accumulated over time in a room people actually show up to.

Everything below follows from that.

---

## 2. Where the current value offering is weak

This is a critique of the product as it stands in this repo, not of the ambition.

### 2.1 The entire product is pointed at sponsors, not founders

The homepage navigation is `Our mandate → Programmes → Built In Jos → Partner with us` (`client/src/pages/Home.tsx:57-60`). Four items; three are institutional framing and one is a sponsor pipeline. The site is a well-executed *partner acquisition instrument*. It is not a founder product.

The clearest proof is a routing decision. On the Funding Board, every opportunity card carries a **"Get help applying"** CTA that links to `/#partner-enquiry` (`client/src/pages/Funding.tsx`). That destination is the sponsor form, whose first question asks whether you are an *"International organization"*, *"Enterprise platform"*, or *"Foundation or impact funder"* (`Home.tsx:161-164`). So a poultry farmer in Bukuru who finds a ₦100m BOI facility she qualifies for, and clicks the one button offering help, lands on a form that does not describe her and cannot capture her request. **The single highest-intent founder action in the product dead-ends in a sponsor funnel.** Fix this before anything else in this document.

### 2.2 The value is episodic — nothing accumulates

The offer today is: come to a gathering, meet people, maybe get a directory listing. When the room empties, the value leaves with it. The only thing that persists for a member is a public profile — and `server/directoryImport.ts:219-223` shows what is being counted: `publicFounderCount`, `ventureProfiles`, `sectorsRepresented`, `locationsRepresented`. Those are inventory metrics. A listing is visibility, not leverage. A founder cannot compound a listing.

Compare what a member would pay for: *"because I am in TCF, I know about opportunities 3 weeks before the market does, I can get a warm intro to a buyer, and my track record here is why the fund said yes."* None of that exists yet.

### 2.3 "Give before you take" is a stated culture with no mechanism

The constitution's core principle is giving before taking, and the roadmap explicitly names *Give/Ask exchanges* and *connection scoreboards* as the things to measure (`research_notes.md`). Neither exists anywhere in the codebase. It is currently an honour code announced from a stage. Honour codes decay; mechanisms compound. **This is the single biggest missed build in the project** — and per §1, it is also the underwriting layer.

### 2.4 No outcome is ever captured, so the sponsor dossier can't be written

Your own research says international partners want *"impact metrics such as connections, products shipped, jobs created, and funding raised"* (`research_notes.md`). There is no surface anywhere in the product that captures a single one of those. The sponsorship prospectus and pitch deck are therefore arguing from narrative and photography, against funders who read hundreds of well-designed decks a year. Three verified founder outcomes with names and numbers outbids the best-designed deck in Plateau.

### 2.5 The programme language is too abstract to be bought

"Founder networks", "Skills in practice", "Shared progress" (`Home.tsx`, `programmeItems`). This is foundation-report register — appropriate for the Plateau Ledger brand direction, and genuinely well-judged for an institutional reader. But it tells a mechanic, a tailor or a supermarket owner nothing about what they get, and those operators are explicitly core members per the Built In Jos walkthrough. You need two registers: institutional on `/`, plain and specific on the founder surfaces. Right now there is only one.

Also note all three programme cards link to `#contact` — the partner contact area. Founder-facing copy routing to sponsor destinations is a pattern, not an accident.

### 2.6 The strongest asset in the repo is undersold

The Funding Board is genuinely excellent and is the most defensible thing TCF owns:

- A **deterministic, explainable, unit-tested matcher** (`shared/funding/match.ts`) that conservatively surfaces unknowns as `toVerify` rather than silently excluding founders. No LLM in the eligibility path. This is exactly right and you should say so publicly.
- Real Plateau-specific intelligence: the **BOI–Plateau ₦4bn MSME matching fund** (up to ₦100m per borrower, single-digit interest, 12-month moratorium) and **UNDP/Mastercard Young Africa Innovates Cohort 2** — both flagged `HIGHEST` Plateau relevance, and the second one open *now*.
- **Scam Watch** (`client/src/data/scamWatch.seed.json`) — fake FG grant portals, fake CREDICORP registration, "Meta grant" DMs, fake NIRSAL intermediaries. Nobody else in the region publishes this. It is the most WhatsApp-shareable asset you have and it builds trust faster than any brand work.

It is linked in the nav (`Home.tsx:301`), so discoverability isn't the problem. The problems are: the help CTA is broken (§2.1), the board decays (entries are stamped `lastChecked: 21 Sep 2026` and a stale funding board is worse than no funding board), and the monetisation layer beneath it — `SUPPORT_SERVICES`: mentoring, pitch deck, CAC registration, grant-writing, web development — is an unpriced list with no funnel, no intake, and no way to pay.

### 2.7 No entity is a hard ceiling, not a paperwork detail

Without registration TCF cannot receive a grant, sign a sponsorship contract, hold a founder's fee, or register as a Nigeria Startup Act ecosystem enabler — and cannot claim the free org-level tooling in Tiers 2–3 of `partnership-outreach-research.md` (Google for Nonprofits/TechSoup, GitHub for Nonprofits, AfriLabs, ANDE). Every partnership pathway on the website currently terminates at something TCF cannot legally execute. This is the top-priority unblock.

---

## 3. Optimal path to a thriving community

A community thrives when **each cycle makes the next cycle more valuable to attend**. That requires five layers, built in this order. Skipping to layer 5 is the standard failure mode.

### Layer 1 — Ritual (fixed, boring, unmissable)

Same slot, every month, indefinitely — e.g. the last Thursday. Never re-invented, never re-negotiated. Same three-part agenda every time so nobody has to ask what happens. Target stays the roadmap's 30–40 in the room; **resist growing it.** A room of 40 that closes deals beats a room of 200 that takes photographs. Scarcity is what makes the ledger in Layer 3 worth building a reputation in.

Fixed agenda: (1) two founder spotlights, 6 minutes each, one Built In Jos operator and one tech/student founder; (2) the **Give/Ask round** — every person in the room states one thing they can give and one thing they need, out loud, no exceptions; (3) closure read-out — last month's matches, what actually happened, named.

The read-out is the part everyone skips and the part that does the work. It converts the room from a networking event into a body that keeps score.

### Layer 2 — Reciprocity engine (the Give/Ask ledger)

Digitise Layer 1's give/ask round so it runs continuously between events, in WhatsApp where members already are. Every member holds a standing give and a standing ask. Matches are proposed, accepted, and — critically — **chased to closure**: *did it happen, and what was the outcome?*

This is what the constitution already promises and the product has never delivered. It is also the cheapest possible retention mechanism: a member with an open ask has a reason to return, and a member whose give was used has status worth defending.

### Layer 3 — Record (the outcome ledger)

Every closed match, deal, hire, contract, naira saved, and naira raised gets logged and attributed to the members involved. This single dataset does four jobs at once:

1. It is the sponsor dossier your roadmap asks for, generated rather than argued.
2. It is the credit file that makes Layer 5 possible without collateral or a licence.
3. It is the retention loop — people protect a record they've built.
4. It is the answer to "what does TCF actually do", in numbers, forever.

Start with a spreadsheet. Do not wait for a product. But log from the very next event.

### Layer 4 — Reputation (standing derived from the record)

Founder standing is *earned from the ledger*, never bought and never awarded by committee: gives delivered, asks closed, spotlights earned, attendance streak. Standing unlocks things that cost TCF nothing to give — speaking slots, first look at opportunities, warm intros, priority in the Deal Desk queue, and eventually access to capital.

This is the mechanism that keeps the room high-quality as it grows, and it is why the capital pool will not be captured by whoever is loudest or best-connected.

### Layer 5 — Resource (capital, allocated on reputation)

Only now does the pool make sense, because now you have a defensible answer to *"why this founder?"* that isn't vibes. See §4.

### What I would do in the next 90 days

Sequenced against the stated goal — capital into founders' hands.

**Days 1–14 — unblock and fix the leak**
- Begin CAC registration: a **limited-by-guarantee not-for-profit** for grant and sponsorship money, and consider a separate **limited company** for paid services. Do not conflate them; institutional funders will look.
- Fix the `/#partner-enquiry` misrouting (§2.1). Ship a real founder intake form: what you're building, stage, CAC status, sector, LGA, what you need. That form is the top of both the services funnel and the fund pipeline.
- Approach **nHub Jos** or **PLACCIMA** (both Tier 1 in `partnership-outreach-research.md`, both already registered) to act as **fiscal host** — they hold and disburse, TCF selects and reports. This is the legitimate way to move money before your own registration completes.
- Verify the YAI Cohort 2 closing date this week. It is marked open with an unconfirmed deadline and it is the single fastest route to real money for a member.

**Days 15–45 — the Deal Desk**
- Select **10 founders** from the 31 public directory profiles. Choose on evidence of delivery, not on pitch quality.
- Run them, in person, through the two highest-relevance live opportunities: **BOI–Plateau ₦4bn** (walk into the BOI Jos business office and the Ministry of Commerce & Industry — your own seed notes say this) and **YAI Cohort 2**.
- Provide the readiness services around each application: CAC registration, deck, grant-writing. Free for this first cohort — you are buying case studies, and they're worth more than the fees.
- Launch the Give/Ask ledger at the next event. Spreadsheet is fine.

**Days 46–90 — prove it and convert**
- Publish the first **three named founder outcomes** with numbers. This is your fundraising asset; nothing else comes close.
- Open the micro-grant pot under the fiscal host (§4, Phase 1).
- Price and launch the services tier. Revenue from founders who *got funded* is the only ethical and durable version of this.
- Generate the sponsor dossier from the ledger and take it to Tier 1 and Tier 5 targets.

**Deliberately not in the 90 days:** demo day, a mobile app, chapter expansion to other states, anything token-related, growing the room past 50.

---

## 4. Building the capital pool

### First, a naming warning

Do not call this a "liquidity pool" publicly. The mechanism you've chosen is sponsor-funded and brokered — there is no pool of paired assets, no LPs and no smart contract. Using DeFi vocabulary for a fiat grant facility, under a GitHub org called `RevolutionaryDefiEng`, invites exactly the CBN/SEC attention you don't want, confuses institutional funders, and — worst — makes TCF sound like the fake-grant-portal pattern its own Scam Watch page warns founders about. Call it the **TCF Founders Capital Desk** (the brokering function) and the **TCF Founders Fund** (the pot). Internally, model it as a revolving facility. Externally, use plain finance language.

### Three non-negotiable rules

1. **Never charge a founder for access to capital.** No application fees, no "processing", no success fee on a grant. Your Scam Watch page says *"NIRSAL MFB charges NO application fee. Any request for payment is fraud."* You do not get to hold a lower standard than the one you publish. Charge for **work** (registration, decks, grant-writing, build) — visibly separated from allocation decisions.
2. **Never pool member deposits** until a cooperative or licensed vehicle exists. Rotating-contribution schemes are culturally native and perfectly legal *when registered*; run one unregistered at scale and you are taking deposits.
3. **Separate selection from money.** Whoever holds the account should not be the person choosing recipients, and the criteria must be published in advance. This is what makes the fund trustworthy in a market saturated with fake ones.

### Phase 0 (now → day 45): Brokered capital — TCF touches nothing

TCF is a readiness and access engine, not a lender. Capital comes entirely from third parties that already exist and already have money.

- **The Deal Desk.** Ten founders, two named facilities, hands-on support, in person.
- **Revenue model:** paid readiness services, *or* a sponsor/government paying TCF to prepare cohorts. Not a cut of the capital — arranging credit for a fee without a licence is a regulated activity and not worth the exposure at this stage.
- **What you're actually building:** the first ledger entries. "TCF got 4 Plateau founders BOI matching-fund facilities" is a sentence that unlocks everything in §4's later phases.

**Reasonable 90-day target:** 10 founders supported, 6 applications submitted, 2–4 approvals. *(Illustrative — set real targets once you've confirmed the BOI and YAI windows.)*

### Phase 1 (day 30 → day 120): Fiscal-host micro-grant pot

The bridge across the no-entity problem.

```
Sponsor / diaspora / government
        ↓ (funds held by registered fiscal host — nHub, PLACCIMA, university centre, or registered NGO)
   Host account
        ↓ (disbursed on TCF's documented recommendation)
   Founder receives micro-grant
        ↓
   Milestone evidence → outcome ledger → host's audit trail + sponsor report
```

- **Structure:** milestone-based, non-dilutive micro-grants. A sensible first band is **₦250k–₦1m** in two tranches — enough to matter for equipment or stock in Jos, small enough that a mistake isn't fatal. *(Assumption; size it against what the first sponsor will actually commit.)*
- **Allocation:** a standing committee of 3–5, at least one member outside TCF's leadership, published criteria, written decisions. Reputation from Layer 4 is an input, never the only input.
- **Why a host works:** it solves receiving money, contracting, and audit in one move, and most institutional funders require 2–3 years of audited accounts that TCF will not have for years. Host relationships are how nearly every young ecosystem organisation starts. Be transparent that it is the arrangement — it reads as competence, not weakness.
- **Best first money:** diaspora and Plateau-origin professionals. Smaller cheques, far shorter diligence, emotionally motivated, and they convert on exactly the founder stories Built In Jos is already producing.

### Phase 2 (day 120 → month 12): TCF Founders Fund, in your own entity

Once registered, ring-fence a fund with its own account, its own committee and its own published reporting.

- **Recoverable grants** rather than loans: repayment triggered by a revenue milestone, not a date. Not legally enforced — enforced by the reputation ledger, because in a 40-person room where standing controls access to future capital, defaulting is expensive in the currency members actually care about. This is the mechanism that makes the fund revolve without a lending licence. Be candid with sponsors that recovery is partial by design.
- **Matching structure:** sponsor money unlocks only against a founder milestone (₦ for ₦ on revenue, or on a signed contract). Sponsors fund outcomes rather than hope, which roughly doubles the conversion rate of the pitch.
- **Tranching:** never disburse in full. Three tranches against evidence, every tranche logged.
- **Recycling target:** a realistic first-cycle recovery rate is 30–50% on recoverable grants. Model the fund as *decaying but extended*, not self-sustaining. Anyone promising a self-sustaining grant fund in year one is guessing.

### Phase 3 (month 12+): Optional and only if the ledger justifies it

- **Arrangement/advisory fees** on brokered facilities — only with the correct licensing advice.
- **Place-based investment SPV** for the third partnership pathway already on the site (equity, properly structured, real legal counsel).
- **Cooperative society registration** if members genuinely want a contribution scheme — by then you'll have the trust and the ledger to run one honestly.

### Sequencing summary

| Phase | TCF holds money? | Entity needed | Capital source | First milestone |
| --- | --- | --- | --- | --- |
| 0 — Deal Desk | No | None | BOI, UNDP/YAI, existing programmes | 2–4 founders funded |
| 1 — Fiscal host pot | No (host does) | Host's | Sponsors, diaspora | First ₦ disbursed |
| 2 — Founders Fund | Yes | CAC ltd-by-guarantee | Sponsors, institutions, government | First recovery |
| 3 — Fees / SPV | Yes | + licensing advice | Commercial | First carried deal |

---

## 5. AI features worth building

### The governing rule

**AI never decides eligibility, allocation, or standing.** `shared/funding/match.ts` is already deterministic, explainable and unit-tested, and deliberately surfaces unknowns as `toVerify` instead of excluding founders. Keep it that way. Use the LLM for **understanding input, extracting data, translating, and drafting** — and let audited code make every decision that affects whether a founder gets money. Then publish that policy. In a market full of fake grant portals, *"our matcher is auditable code, not a chatbot's opinion"* is a trust asset and a genuine differentiator.

### Ranked by (value to founders × capital impact) ÷ effort

**1. WhatsApp Funding Agent — build this first**
A founder sends: *"I do poultry in Bukuru, no CAC, need money for feed."* The LLM extracts a `MatchInput` (sector, LGA, stage, CAC status, need) — NLU only. `rankOpportunities()` then returns the top 3 with its existing human-readable `reasons` and `toVerify` lists. Founder gets an answer in the app they already have open, with no website visit. Cheap, cacheable, and directly serves the 90-day goal. Everything else on this list is downstream of this working.

**2. Opportunity Radar (freshness, not discovery)**
Scheduled job: monitor known sources, LLM-extract candidates into the existing `RawFundingOpportunity` shape with the `confidence` field already in the schema, and queue them for **human verification** before publishing. Simultaneously flag any entry whose `lastChecked` has gone stale and any `statusDeadline` passing. A stale board is worse than no board, and right now freshness depends entirely on someone remembering. Also: "3 weeks of advance warning on opportunities" is the clearest reason to join TCF you will ever have.

**3. Scam Checker**
Forward a suspicious link, DM or voice note; get a verdict. Deterministic first — exact and fuzzy match against `scamWatch.seed.json`, plus domain heuristics (is it really `.gov.ng`? does it ask for a fee, BVN or bank details?) — with the LLM only writing the explanation and the safe alternative. Highest virality-per-line-of-code in this document, it protects members from real financial loss, and it seeds `scamWatch` from user reports. Nobody else in Plateau offers it.

**4. Give/Ask Matchmaker**
The engine from Layer 2. Members post gives and asks by WhatsApp (text or voice); the model normalises them, proposes matches with a stated reason, notifies both sides, then follows up to record the outcome. That follow-up is the whole point — it's what populates the outcome ledger. Highest community-compounding value on the list, and the direct input to Layer 4 standing.

**5. Application Co-pilot — the paid tier**
Founder profile + the selected opportunity's requirements → a structured first draft of the application, in the right register, with gaps explicitly marked as *"you must supply this."* Never auto-submits, never fabricates a number. This is the honest, scalable form of `SUPPORT_SERVICES` — grant-writing assistance without the headcount — and it converts directly into capital in founders' hands.

**6. Voice + language intake (pidgin, Hausa, Nigerian English)**
`server/_core/voiceTranscription.ts` already exists. Market traders, mechanics and tailors send voice notes, not typed forms — and those operators are explicitly core members per Built In Jos. Voice intake plus vernacular replies is what makes features 1, 3 and 4 reach the non-tech half of the community instead of only the founders who were always going to fill in a web form.

**7. Built In Jos Story Engine**
The walkthrough describes a 5–20 minute visit: two people, three questions, a photo, a branded gift. Feed the transcript and photo in; get back WhatsApp-status copy for the founder, the TCF caption, the Built In Jos caption, and alt text. Founder-first publishing order, exactly as the walkthrough specifies. Turns the spotlight loop from a two-people-per-day bottleneck into something the whole community can run — and every story is a new directory profile and a new ledger row.

**8. Outcome Ledger Extractor**
The WhatsApp group already contains the outcomes: *"I got the contract"*, *"we hired two people"*, *"the loan came through."* Detect those signals, ask the member to confirm a structured record, log it. Opt-in, with the member confirming every entry. This converts chat exhaust into precisely the impact metrics (`connections`, `products shipped`, `jobs created`, `funding raised`) your research says international partners demand — with no manual data entry.

**9. Sponsor Dossier Generator**
From the ledger, produce the one-page dossier and six-slide deck the roadmap prescribes, refreshed monthly and per-audience (government vs DFI vs corporate vs diaspora). It stops being a writing project and becomes a report.

**10. Underwriting Assistant (Phase 2 only)**
For each fund applicant, assemble the ledger evidence — gives delivered, asks closed, attendance, prior tranche performance — into a structured brief with reasons for and against. **The committee decides.** The model prepares the pack, and never scores or ranks people. Ships only when the Founders Fund does.

### Suggested build order

- **Sprint 1:** fix the `/#partner-enquiry` misrouting + founder intake form, then ship #1 (WhatsApp Funding Agent) and #3 (Scam Checker).
- **Sprint 2:** #4 (Give/Ask Matchmaker) and #6 (voice/language), so the ledger starts filling from the next event.
- **Sprint 3:** #2 (Opportunity Radar) and #5 (Application Co-pilot — the first thing anyone pays for).
- **Later:** #7, #8, #9, then #10 alongside the fund.

---

## 6. Repeatability notes

Three of these are recurring processes rather than features, and would be better as **Claude Skills** than as one-off work:

- **Funding board refresh** — a monthly verification pass over `fundingBoard.seed.json` and `fundingBoardGlobal.seed.json`: re-check every `officialLink`, update `lastChecked`, downgrade `confidence` where unconfirmed, retire closed windows. This runs forever and should be one command.
- **Built In Jos story production** — visit transcript + photo → the three captions and alt text, in brand voice, founder-first. Identical structure every time.
- **Sponsor dossier generation** — ledger → dossier, per audience. Same inputs, same output shape, monthly.

Worth revisiting your skills set-up once the Give/Ask ledger has a month of real data, since the shape of that data will determine what the dossier and underwriting skills can actually assert.

---

## 7. The five things that matter most

1. **Fix the "Get help applying" → sponsor-form misrouting.** A broken founder funnel makes everything else theoretical.
2. **Start CAC registration this week.** Every partnership pathway on the site currently terminates in something TCF cannot legally do.
3. **Launch the Give/Ask ledger at the very next event, in a spreadsheet.** It is the community engine, the retention loop, and the collateral for the fund — one mechanism, three jobs.
4. **Run the Deal Desk on BOI–Plateau and YAI Cohort 2 now, in person.** Verify the YAI deadline this week; it's the fastest real money available to a member.
5. **Ship the WhatsApp Funding Agent.** Deterministic matcher, LLM only for understanding the message. It puts the best asset you own into the app your members already live in.
