/**
 * The Funding Board — a public, filterable board of grants and opportunities,
 * plus a lightweight self-select matcher. Free trust-builder for founders; the
 * "How we help you win" services block is the natural monetisation layer.
 * Styled with the Plateau Ledger tokens so it reads as part of the site.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Filter,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rankOpportunities } from "@shared/funding/match";
import { CANONICAL_SECTORS, type FundingOpportunity, type MatchInput, type Sector } from "@shared/funding/types";

const STAGE_OPTIONS = [
  "Student / exploring",
  "Building / pre-launch",
  "Growing / established",
  "Launched / early traction",
];
const NEED_OPTIONS: Array<{ value: NonNullable<MatchInput["need"]>; label: string }> = [
  { value: "funding", label: "Funding" },
  { value: "training", label: "Training / mentorship" },
  { value: "customers", label: "Customers / market access" },
  { value: "mentorship", label: "Mentorship" },
];

const SUPPORT_SERVICES = [
  { title: "Mentoring & readiness", text: "Sharpen your model and get application-ready with people who have done it." },
  { title: "Pitch deck & narrative", text: "Turn what you are building into a deck funders actually respond to." },
  { title: "CAC registration support", text: "Get properly registered so you unlock the opportunities that require it." },
  { title: "Grant-writing assistance", text: "Hands-on help filling and strengthening applications, the right way." },
  { title: "Website & app development", text: "Build the product and web presence that make you credible to funders." },
];

function confidenceLabel(c: FundingOpportunity["confidence"]): string {
  return c === "verified" ? "Verified live" : c === "reported" ? "Reported" : "Verify status";
}

function OpportunityCard({
  o,
  reasons,
  toVerify,
}: {
  o: FundingOpportunity;
  reasons?: string[];
  toVerify?: string[];
}) {
  return (
    <article className="fund-card">
      <div className="fund-card-top">
        <div className="fund-card-badges">
          {o.source === "tcf" ? <span className="fund-badge fund-badge-jos">Jos-curated</span> : <span className="fund-badge">Global</span>}
          <span className={`fund-badge fund-conf fund-conf-${o.confidence}`}>
            <BadgeCheck size={12} /> {confidenceLabel(o.confidence)}
          </span>
          {o.isOpen ? <span className="fund-badge fund-badge-open">Open now</span> : null}
        </div>
        {o.relevance === "highest" || o.relevance === "high" ? (
          <span className="fund-relevance"><MapPin size={12} /> {o.relevance === "highest" ? "Highest" : "High"} Plateau relevance</span>
        ) : null}
      </div>

      <h3 className="fund-card-title">{o.opportunity}</h3>
      {o.provider ? <p className="fund-card-provider">{o.provider}</p> : null}
      {o.whatYouGet ? <p className="fund-card-benefit">{o.whatYouGet}</p> : null}

      <div className="fund-card-flags">
        <span>{o.type}</span>
        {o.cacRequired === "no" ? <span className="fund-flag-good">No CAC needed</span> : o.cacRequired === "yes" ? <span>CAC required</span> : null}
        {o.equityFree ? <span className="fund-flag-good">Equity-free</span> : null}
        {o.feeFree === "yes" ? <span className="fund-flag-good">No application fee</span> : null}
        {o.statusDeadline ? <span className="fund-flag-deadline"><Clock size={12} /> {o.statusDeadline}</span> : null}
      </div>

      {reasons && reasons.length ? (
        <ul className="fund-reasons">
          {reasons.map((r) => (
            <li key={r}><BadgeCheck size={13} /> {r}</li>
          ))}
        </ul>
      ) : null}
      {toVerify && toVerify.length ? (
        <ul className="fund-verify">
          {toVerify.map((r) => (
            <li key={r}><TriangleAlert size={13} /> {r}</li>
          ))}
        </ul>
      ) : null}

      <div className="fund-card-actions">
        {o.officialLink ? (
          <a href={o.officialLink} target="_blank" rel="noopener noreferrer" className="fund-card-link">
            Official page <ArrowUpRight size={15} />
          </a>
        ) : <span className="fund-card-link fund-card-link-muted">Link pending verification</span>}
        <a href="/#contact" className="fund-card-help">Get help applying</a>
      </div>
    </article>
  );
}

export default function Funding() {
  const opportunitiesQuery = trpc.funding.list.useQuery(undefined, { refetchOnWindowFocus: false });
  const scamQuery = trpc.funding.scamWatch.useQuery(undefined, { refetchOnWindowFocus: false });
  const all = useMemo(() => opportunitiesQuery.data ?? [], [opportunitiesQuery.data]);

  // ---- matcher state ----
  const [match, setMatch] = useState<MatchInput>({});
  const [showMatches, setShowMatches] = useState(false);
  const matches = useMemo(() => {
    if (!showMatches || !all.length) return [];
    return rankOpportunities(match, all).slice(0, 8);
  }, [showMatches, match, all]);

  // ---- board filters ----
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "tcf" | "global">("all");
  const [sectorFilter, setSectorFilter] = useState<Sector | "">("");
  const [openOnly, setOpenOnly] = useState(false);
  const [noCacOnly, setNoCacOnly] = useState(false);
  const [equityFreeOnly, setEquityFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((o) => {
      if (sourceFilter !== "all" && o.source !== sourceFilter) return false;
      if (sectorFilter && !o.sectors.includes(sectorFilter)) return false;
      if (openOnly && !o.isOpen) return false;
      if (noCacOnly && o.cacRequired === "yes") return false;
      if (equityFreeOnly && !o.equityFree) return false;
      if (q && !`${o.opportunity} ${o.provider} ${o.whatYouGet} ${o.type}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, search, sourceFilter, sectorFilter, openOnly, noCacOnly, equityFreeOnly]);

  return (
    <div className="fund-page">
      <header className="fund-header">
        <Link href="/" className="fund-back"><ArrowLeft size={16} /> Tin City Founders</Link>
        <a href="/#contact" className="fund-header-cta">Start a conversation <ArrowUpRight size={15} /></a>
      </header>

      <section className="fund-hero">
        <span className="eyebrow"><span /> THE FUNDING BOARD</span>
        <h1>Funding that fits <em>where you are.</em></h1>
        <p className="fund-hero-deck">
          A curated, continually verified board of grants, fellowships, and programmes — prioritised for founders
          building in Jos and across Plateau, and extended with a wider global database. Tell us a little about your
          venture and we will surface what you may qualify for.
        </p>
        <ul className="fund-rules">
          <li>No legitimate Nigerian grant charges a fee to <em>apply</em>. Treat any “processing fee” as a red flag.</li>
          <li>Only use the official link on each card. Fake mirror sites exist for many programmes.</li>
          <li>Tin City Founders is not the funder and receives nothing if you apply.</li>
        </ul>
      </section>

      {/* ---- Matcher ---- */}
      <section className="fund-matcher" aria-labelledby="matcher-title">
        <div className="fund-matcher-head">
          <span className="micro-label"><Sparkles size={13} /> FIND YOUR MATCHES</span>
          <h2 id="matcher-title">Funding you may qualify for.</h2>
          <p>Nothing is stored — this runs in your browser. Answer what you can; we flag anything to verify.</p>
        </div>
        <div className="fund-matcher-grid">
          <label>Sector
            <select value={match.sector ?? ""} onChange={(e) => setMatch((m) => ({ ...m, sector: e.target.value as Sector }))}>
              <option value="">Any</option>
              {CANONICAL_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Stage
            <select value={match.stage ?? ""} onChange={(e) => setMatch((m) => ({ ...m, stage: e.target.value }))}>
              <option value="">Any</option>
              {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Most need right now
            <select value={match.need ?? ""} onChange={(e) => setMatch((m) => ({ ...m, need: e.target.value as MatchInput["need"] }))}>
              <option value="">Any</option>
              {NEED_OPTIONS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </label>
          <label>Your age (optional)
            <input type="number" min={15} max={70} value={match.age ?? ""} onChange={(e) => setMatch((m) => ({ ...m, age: e.target.value ? Number(e.target.value) : null }))} placeholder="e.g. 28" />
          </label>
          <label>CAC registered?
            <select value={match.cacRegistered ?? ""} onChange={(e) => setMatch((m) => ({ ...m, cacRegistered: (e.target.value || undefined) as MatchInput["cacRegistered"] }))}>
              <option value="">Not sure</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="fund-check">
            <input type="checkbox" checked={match.womenLed === true} onChange={(e) => setMatch((m) => ({ ...m, womenLed: e.target.checked ? true : null }))} />
            Women-led venture
          </label>
        </div>
        <button type="button" className="button-primary button-primary-forest" onClick={() => setShowMatches(true)}>
          Show my matches <ArrowUpRight size={17} />
        </button>

        {showMatches ? (
          <div className="fund-matches" aria-live="polite">
            <p className="fund-matches-note">{matches.length} match{matches.length === 1 ? "" : "es"} — verify eligibility on the official page before applying.</p>
            <div className="fund-grid">
              {matches.map((m) => <OpportunityCard key={m.opportunity.id} o={m.opportunity} reasons={m.reasons} toVerify={m.toVerify} />)}
            </div>
          </div>
        ) : null}
      </section>

      {/* ---- Services / monetisation layer ---- */}
      <section className="fund-services" aria-labelledby="services-title">
        <div className="fund-services-copy">
          <span className="eyebrow eyebrow-light"><span /> HOW WE HELP YOU WIN</span>
          <h2 id="services-title">Finding the money is half the work.</h2>
          <p>
            Most founders lose funding not because they are not good enough, but because the application, the deck, the
            registration, or the product were not ready. Tin City Founders helps you close that gap — support, insight,
            and delivery beyond any one founder’s capacity. Where there is a fee, it is a token for access and hands-on
            help, never a barrier.
          </p>
          <a href="/#contact" className="button-primary button-primary-amber">Talk to us about support <ArrowUpRight size={17} /></a>
        </div>
        <ul className="fund-services-list">
          {SUPPORT_SERVICES.map((s) => (
            <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
          ))}
        </ul>
      </section>

      {/* ---- Full board ---- */}
      <section className="fund-board" aria-labelledby="board-title">
        <div className="fund-board-head">
          <span className="micro-label"><Filter size={13} /> BROWSE EVERYTHING</span>
          <h2 id="board-title">The full board</h2>
          <p>{opportunitiesQuery.isLoading ? "Loading opportunities…" : `${filtered.length} of ${all.length} opportunities`}</p>
        </div>

        <div className="fund-filters">
          <div className="fund-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search opportunities, funders…" /></div>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}>
            <option value="all">All sources</option>
            <option value="tcf">Jos-curated</option>
            <option value="global">Global database</option>
          </select>
          <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value as Sector | "")}>
            <option value="">All sectors</option>
            {CANONICAL_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="fund-check"><input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open now</label>
          <label className="fund-check"><input type="checkbox" checked={noCacOnly} onChange={(e) => setNoCacOnly(e.target.checked)} /> No CAC</label>
          <label className="fund-check"><input type="checkbox" checked={equityFreeOnly} onChange={(e) => setEquityFreeOnly(e.target.checked)} /> Equity-free</label>
        </div>

        {opportunitiesQuery.isError && !all.length ? (
          <p className="fund-empty">The board is refreshing. Please check back shortly.</p>
        ) : (
          <div className="fund-grid">
            {filtered.map((o) => <OpportunityCard key={o.id} o={o} />)}
          </div>
        )}
      </section>

      {/* ---- Scam watch ---- */}
      {scamQuery.data && scamQuery.data.length ? (
        <section className="fund-scam" aria-labelledby="scam-title">
          <div className="fund-scam-head"><ShieldAlert size={18} /><h2 id="scam-title">Scam watch</h2></div>
          <p>These fake sites and programmes are circulating in Nigeria. Read once, then ignore them.</p>
          <ul>
            {scamQuery.data.map((s) => (
              <li key={s.whatYouWillSee}>
                <strong>{s.whatYouWillSee}</strong>
                <span>{s.whyProblem}</span>
                {s.whatToDoInstead ? <em>{s.whatToDoInstead}</em> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="fund-footer">
        <span>Tin City Founders · Jos · Plateau</span>
        <Link href="/">Back to home <ArrowUpRight size={14} /></Link>
      </footer>
    </div>
  );
}
