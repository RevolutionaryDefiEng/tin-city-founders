/**
 * Plateau Ledger design system: a warm, editorial partnership dossier rooted in Jos.
 * Use DM Serif Display for high-stakes statements, Manrope for operational clarity,
 * Jos evergreen for trust, Tin Amber for movement, and staggered field-journal layouts.
 */
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpenCheck,
  ChevronRight,
  Globe2,
  Handshake,
  HeartHandshake,
  FileDown,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Network,
  Phone,
  Sprout,
  UsersRound,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/tcf-hero-group_c84bbe3c.jpg";
const mentorshipImage = "/manus-storage/tcf-group-workshop_baf69e6a.jpg";
const workshopImage = "/manus-storage/tcf-small-group_1d0b1dfb.jpg";
const womanSpeakerImage = "/manus-storage/tcf-speaker-woman_ad8fa94d.jpg";
const manSpeakerImage = "/manus-storage/tcf-speaker-man_06305855.jpg";
const blueSpeakerImage = "/manus-storage/tcf-speaker-blue_568769e1.jpg";
const officialLogoLightImage = "/manus-storage/tcf-logo-transparent-light-exact_25248531.png";
const officialLogoDarkImage = "/manus-storage/tcf-logo-transparent-dark-exact_30f7112d.png";
const sponsorshipProspectusUrl = "/manus-storage/main_62237e25.pdf";
const builtInJosDirectoryUrl = "https://forms.gle/iUmdd3nRt6hbrjhW6";
const builtInJosInvitationImage = "/manus-storage/builtinjos-join-map_a76d634c.png";

const navItems = [
  { label: "Our mandate", href: "#mandate" },
  { label: "Programmes", href: "#programmes" },
  { label: "Built In Jos", href: "#built-in-jos" },
  { label: "Partner with us", href: "#partnerships" },
];

const programmeItems = [
  {
    number: "01",
    title: "Founder networks",
    text: "Regular gatherings that make practical peer connection, market insight, and mutual accountability part of the local entrepreneurial fabric.",
    icon: UsersRound,
  },
  {
    number: "02",
    title: "Skills in practice",
    text: "Mentorship and hands-on learning that help entrepreneurs strengthen the business fundamentals behind sustainable ventures.",
    icon: BookOpenCheck,
  },
  {
    number: "03",
    title: "Shared progress",
    text: "Community-development projects that respond to the economic and social challenges founders experience around them.",
    icon: Sprout,
  },
];

const partnershipItems = [
  {
    id: "programme-sponsorship",
    number: "01",
    title: "Programme sponsorship",
    text: "Underwrite a founder cohort, skills series, or learning infrastructure designed around a defined local need.",
    detailTitle: "Anchor a practical season of founder growth.",
    detailText: "Support a clearly defined series of founder gatherings, capability clinics, or mentor-led learning designed around local business needs.",
    scope: "A defined founder cohort, learning series, or repeatable clinic cycle shaped around one priority need.",
    outcomes: ["A named founder cohort or learning series", "A shared delivery plan and reporting rhythm", "Thoughtful visibility within a trusted local community"],
    icon: HeartHandshake,
  },
  {
    id: "strategic-collaboration",
    number: "02",
    title: "Strategic collaboration",
    text: "Bring expertise, technology, market access, or research capacity into a community that values practical exchange.",
    detailTitle: "Put useful expertise and access in the room.",
    detailText: "Co-design a focused activation that connects founders with tools, specialist knowledge, new market relationships, or relevant research capacity.",
    scope: "A focused activation that brings a partner’s tool, expertise, or market access to a clearly defined founder group.",
    outcomes: ["A locally adapted activation or workshop", "Direct founder access to practical expertise", "Shared learning captured for future programming"],
    icon: Network,
  },
  {
    id: "place-based-investment",
    number: "03",
    title: "Place-based investment",
    text: "Help convene solutions that support resilient small businesses and more inclusive local economic development.",
    detailTitle: "Strengthen the conditions that help enterprise stay.",
    detailText: "Invest in the connective work around small businesses: local convening, community infrastructure, and collaborative responses to shared economic challenges.",
    scope: "A community-facing pilot or convening season that advances one shared condition for stronger local enterprise.",
    outcomes: ["A place-aware scope shaped with local founders", "A coalition approach to shared challenges", "Evidence of participation, learning, and outcomes"],
    icon: Globe2,
  },
];

const organizationTypeOptions = [
  { value: "international_organization", label: "International organization" },
  { value: "enterprise_platform", label: "Enterprise platform" },
  { value: "impact_funder", label: "Impact funder or investor" },
  { value: "foundation", label: "Foundation" },
  { value: "other", label: "Other" },
] as const;

const supportOptions = [
  { value: "programme_sponsorship", label: "Programme sponsorship" },
  { value: "strategic_collaboration", label: "Strategic collaboration" },
  { value: "tool_or_credit_access", label: "Tool or credit access" },
  { value: "founder_visibility", label: "Founder visibility" },
  { value: "showcase_or_demo_day", label: "Showcase or Demo Day" },
  { value: "other", label: "Other" },
] as const;

const activationTimingOptions = [
  { value: "next_30_days", label: "Within 30 days" },
  { value: "one_to_three_months", label: "In 1–3 months" },
  { value: "three_to_six_months", label: "In 3–6 months" },
  { value: "exploring", label: "Exploring possibilities" },
] as const;

function BrandLockup({ variant = "light" }: { variant?: "light" | "dark" }) {
  return (
    <a href="#top" className="brand-lockup" aria-label="Tin City Founders home">
      <img
        className="official-logo"
        src={variant === "dark" ? officialLogoDarkImage : officialLogoLightImage}
        alt="Tin City Founders"
      />
    </a>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const submitPartnerEnquiry = trpc.partnerships.submitEnquiry.useMutation({
    onSuccess: () => {
      setEnquirySent(true);
      toast.success("Your partnership enquiry has been received.");
    },
    onError: () => {
      toast.error("We could not submit your enquiry. Please try again or email the team directly.");
    },
  });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    window.addEventListener("resize", closeMenu);
    return () => window.removeEventListener("resize", closeMenu);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handlePartnerEnquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    submitPartnerEnquiry.mutate({
      organizationName: String(form.get("organizationName") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      organizationType: String(form.get("organizationType") ?? "") as (typeof organizationTypeOptions)[number]["value"],
      intendedSupport: String(form.get("intendedSupport") ?? "") as (typeof supportOptions)[number]["value"],
      activationTiming: String(form.get("activationTiming") ?? "") as (typeof activationTimingOptions)[number]["value"],
      message: String(form.get("message") ?? "") || undefined,
    });
  };

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-[#f4efe5] text-[#1f2e25]">
      <header className={isScrolled ? "site-header site-header-scrolled" : "site-header"}>
        <div className="header-inner">
          <BrandLockup variant={isScrolled || isOpen ? "dark" : "light"} />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#contact" className="header-cta">
            Start a conversation <ArrowUpRight size={16} strokeWidth={2.2} />
          </a>
          <button
            onClick={() => setIsOpen((open) => !open)}
            className="menu-toggle"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={23} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={isOpen ? "mobile-menu mobile-menu-open" : "mobile-menu"}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu}>
              {item.label} <ChevronRight size={18} />
            </a>
          ))}
          <a href="#contact" onClick={closeMenu} className="mobile-menu-cta">
            Start a conversation <ArrowUpRight size={17} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero-section" aria-labelledby="hero-title">
          <img src={heroImage} alt="Tin City Founders community members gathered at an event in Jos" className="hero-image" />
          <div className="hero-overlay" />
          <div className="hero-topography" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-content">
            <div className="eyebrow eyebrow-light"><span /> JOS, PLATEAU STATE · NIGERIA</div>
            <h1 id="hero-title">Where enterprise begins. <em>Opportunity travels.</em></h1>
            <p className="hero-deck">Tin City Founders brings local entrepreneurs together to build stronger businesses, deeper capability, and lasting economic momentum.</p>
            <div className="hero-actions">
              <a href="#partnerships" className="button-primary button-primary-amber">
                Explore partnership pathways <ArrowUpRight size={18} />
              </a>
              <a href="#mandate" className="button-text button-text-light">
                Understand our mandate <ArrowDown size={17} />
              </a>
            </div>
          </div>
          <div className="hero-bottom-note">
            <span>PARTNERSHIP BRIEF</span>
            <span>01 / 05</span>
          </div>
        </section>

        <section id="mandate" className="mandate-section" aria-labelledby="mandate-title">
          <div className="section-meta section-meta-dark">
            <span className="section-index">01</span>
            <span>OUR MANDATE</span>
          </div>
          <div className="mandate-layout">
            <div className="mandate-statement">
              <div className="plateau-rule" />
              <h2 id="mandate-title">A stronger local economy is built <em>in community.</em></h2>
            </div>
            <div className="mandate-copy">
              <p className="lead-copy">Tin City Founders is a community-based association advancing entrepreneurship, innovation, and economic development among founders and small business owners in Jos.</p>
              <p>We create regular points of connection and practical growth: networking events, mentorship programmes, skills-development initiatives, and community projects that address the everyday conditions shaping local enterprise.</p>
              <a href="#programmes" className="button-text button-text-dark">See the work in motion <ArrowDown size={17} /></a>
            </div>
          </div>
          <div className="mandate-footer">
            <MapPin size={16} />
            <span>Our work begins in Jos and connects to a wider ecosystem of opportunity.</span>
          </div>
        </section>

        <section id="programmes" className="programmes-section" aria-labelledby="programmes-title">
          <div className="programmes-intro">
            <div className="section-meta"><span className="section-index">02</span><span>HOW WE SHOW UP</span></div>
            <h2 id="programmes-title">The practical work behind <em>founder momentum.</em></h2>
            <p>We support enterprise as a shared practice: people meeting, learning, and making progress alongside each other.</p>
          </div>
          <div className="programme-list">
            {programmeItems.map((item) => {
              const Icon = item.icon;
              return (
                <article className="programme-row" key={item.number}>
                  <div className="programme-number">{item.number}</div>
                  <div className="programme-icon"><Icon size={21} strokeWidth={1.8} /></div>
                  <div className="programme-body">
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                  <a href="#contact" className="circle-link" aria-label={`Discuss support for ${item.title}`}><ArrowUpRight size={19} /></a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="field-story" aria-label="Founder mentorship and skills development">
          <div className="field-story-photo-wrap">
            <img src={mentorshipImage} alt="Tin City Founders members gathered during a community session" className="field-story-photo" />
            <div className="photo-caption"><span>FIELD NOTE</span><span>Mentorship is knowledge moving person to person.</span></div>
          </div>
          <div className="field-story-panel">
            <div className="micro-label">CAPABILITY IS A COLLECTIVE ASSET</div>
            <p>When founders can test ideas with peers, learn from experience, and access focused guidance, local potential becomes more durable.</p>
            <div className="field-story-line" />
            <span>Community-led. Not-for-profit. Built for the long term.</span>
          </div>
        </section>

        <section className="voices-gallery" aria-labelledby="voices-title">
          <div className="voices-intro">
            <span className="micro-label">INSIDE THE ROOM</span>
            <h2 id="voices-title">Ideas gather strength when more people <em>take the floor.</em></h2>
          </div>
          <div className="voices-photos">
            <figure className="voice-frame voice-frame-a">
              <img src={womanSpeakerImage} alt="A Tin City Founders member speaking at a community gathering" />
              <figcaption><span>01</span> Founder exchange</figcaption>
            </figure>
            <figure className="voice-frame voice-frame-b">
              <img src={manSpeakerImage} alt="A Tin City Founders member sharing an idea at a gathering" />
              <figcaption><span>02</span> Practical insight</figcaption>
            </figure>
            <figure className="voice-frame voice-frame-c">
              <img src={blueSpeakerImage} alt="A Tin City Founders member contributing to a community conversation" />
              <figcaption><span>03</span> Local perspective</figcaption>
            </figure>
          </div>
        </section>

        <section id="built-in-jos" className="directory-invite" aria-labelledby="directory-title">
          <div className="directory-copy">
            <span className="micro-label">BUILT IN JOS · FOUNDER DIRECTORY</span>
            <h2 id="directory-title">Put what you are building <em>on the map.</em></h2>
            <p>Built In Jos is a growing directory of the people, products, and small businesses building across the Plateau. Add your founder profile so new connections, useful introductions, and community visibility can find you.</p>
            <a href={builtInJosDirectoryUrl} target="_blank" rel="noreferrer" className="button-primary button-primary-amber">
              Add your founder profile <ArrowUpRight size={18} />
            </a>
            <span className="directory-footnote">For founders and business owners building in Jos and across Plateau State.</span>
          </div>
          <a href={builtInJosDirectoryUrl} target="_blank" rel="noreferrer" className="directory-visual" aria-label="Open the Built In Jos directory registration form">
            <img src={builtInJosInvitationImage} alt="Built In Jos invitation to join the founder map" />
            <span>Open the directory form <ArrowUpRight size={17} /></span>
          </a>
        </section>

        <section id="partnerships" className="partnerships-section" aria-labelledby="partnerships-title">
          <div className="partnerships-heading">
            <div className="section-meta section-meta-dark"><span className="section-index">03</span><span>PARTNERSHIP PATHWAYS</span></div>
            <h2 id="partnerships-title">Bring more of what works <em>within reach.</em></h2>
          </div>
          <div className="partnership-signals" aria-label="Partner readiness signals">
            <span>Founder-dense local network</span>
            <span>Repeatable community delivery</span>
            <span>Evidence designed into the work</span>
          </div>
          <div className="partnerships-content">
            <div className="partnerships-copy">
              <p className="lead-copy">We welcome international organizations, enterprise platforms, and impact investors that see local founders as essential partners in inclusive, practical economic development.</p>
              <p>Every partnership begins with a conversation about the local context, the mutual value of collaboration, and the most responsible way to translate resources into lasting capability.</p>
              <div className="prospectus-download-card">
                <div className="prospectus-card-meta"><span>PARTNERSHIP BRIEF</span><span>2026 · PDF</span></div>
                <h3>See the community model, sponsorship pathways, and first 90 days.</h3>
                <p>Built from Tin City Founders’ operating roadmap, founder-spotlight model, and community constitution.</p>
                <a href={sponsorshipProspectusUrl} download target="_blank" rel="noreferrer" className="button-primary button-primary-amber">
                  Download sponsorship prospectus <FileDown size={18} />
                </a>
              </div>
              <div id="partner-enquiry" className="partner-enquiry-form-wrap" aria-labelledby="partner-enquiry-title">
                <div className="partner-enquiry-heading">
                  <span className="micro-label">START A DIALOGUE</span>
                  <h3 id="partner-enquiry-title">Tell us where you see the fit.</h3>
                  <p>Share a few details and the partnership team will respond with a locally grounded next step.</p>
                </div>
                {enquirySent ? (
                  <div className="partner-enquiry-success" role="status">
                    <span>ENQUIRY RECEIVED</span>
                    <strong>Thank you. We will review your intended support and follow up using the contact details provided.</strong>
                  </div>
                ) : (
                  <form className="partner-enquiry-form" onSubmit={handlePartnerEnquiry}>
                    <div className="partner-enquiry-grid">
                      <label>
                        <span>Organization name</span>
                        <input name="organizationName" autoComplete="organization" required placeholder="Your organization" />
                      </label>
                      <label>
                        <span>Your name</span>
                        <input name="contactName" autoComplete="name" required placeholder="Full name" />
                      </label>
                      <label className="partner-enquiry-span">
                        <span>Work email</span>
                        <input name="contactEmail" type="email" autoComplete="email" required placeholder="name@organization.org" />
                      </label>
                      <label>
                        <span>Organization type</span>
                        <select name="organizationType" defaultValue="" required>
                          <option value="" disabled>Select one</option>
                          {organizationTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label>
                        <span>Intended support</span>
                        <select name="intendedSupport" defaultValue="" required>
                          <option value="" disabled>Select one</option>
                          {supportOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="partner-enquiry-span">
                        <span>Activation timing</span>
                        <select name="activationTiming" defaultValue="" required>
                          <option value="" disabled>Select one</option>
                          {activationTimingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                      <label className="partner-enquiry-span">
                        <span>What would you like to explore? <em>Optional</em></span>
                        <textarea name="message" rows={3} maxLength={2000} placeholder="A founder clinic, convening season, tool access, visibility programme, or another idea." />
                      </label>
                    </div>
                    <button type="submit" className="partner-enquiry-submit" disabled={submitPartnerEnquiry.isPending}>
                      {submitPartnerEnquiry.isPending ? "Sending enquiry…" : "Send partner enquiry"} <ArrowUpRight size={17} />
                    </button>
                  </form>
                )}
              </div>
              <a href="#contact" className="button-text button-text-dark partnership-conversation-link">Start a partnership conversation <ArrowUpRight size={17} /></a>
            </div>
            <div className="partnership-stage">
              <img src={mentorshipImage} alt="" aria-hidden="true" className="partnership-stage-image" />
              <div className="partnership-cards">
                {partnershipItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a className="partnership-card" href={`#${item.id}`} key={item.title} aria-label={`Explore ${item.title}`}>
                      <div className="partnership-card-top"><span>{item.number}</span><Icon size={22} strokeWidth={1.7} /></div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <span className="bubble-open-label"><span>Explore pathway</span><ArrowDown size={16} /></span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="pathway-details" aria-label="Detailed sponsorship pathways">
            {partnershipItems.map((item) => {
              const Icon = item.icon;
              return (
                <article id={item.id} className="pathway-detail" key={item.id}>
                  <div className="pathway-detail-top"><span>{item.number} · SPONSORSHIP PATHWAY</span><Icon size={20} strokeWidth={1.8} /></div>
                  <h3>{item.detailTitle}</h3>
                  <p>{item.detailText}</p>
                  <div className="pathway-scope"><span>Typical scope</span><strong>{item.scope}</strong></div>
                  <ul>
                    {item.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
                  </ul>
                  <a href="#partner-enquiry" className="pathway-detail-link">Discuss this pathway <ArrowUpRight size={17} /></a>
                </article>
              );
            })}
          </div>
        </section>

        <section className="workshop-section" aria-labelledby="workshop-title">
          <img src={workshopImage} alt="Tin City Founders members gathered together after a community event" className="workshop-image" />
          <div className="workshop-note">
            <span className="micro-label">THE PARTNERSHIP STANDARD</span>
            <h2 id="workshop-title">Grounded in local context. <em>Designed for shared learning.</em></h2>
            <p>Our association operates on a not-for-profit basis, applying income and resources solely to the objectives that strengthen the entrepreneurial community we serve.</p>
          </div>
        </section>

        <section id="contact" className="contact-section" aria-labelledby="contact-title">
          <div className="contact-kicker"><Handshake size={21} strokeWidth={1.8} /><span>LET’S BUILD WITH PURPOSE</span></div>
          <h2 id="contact-title">Ready to invest in the next chapter of <em>local enterprise?</em></h2>
          <div className="contact-bottom">
            <p>Tell us what your organization is working toward. We will bring the local perspective and an open agenda for practical collaboration.</p>
            <div className="contact-actions">
              <a href="mailto:info@africanintelligence.tech" className="button-primary button-primary-amber">Email the partnership team <Mail size={18} /></a>
              <div className="contact-details">
                <a href="tel:07073425222" className="contact-phone"><Phone size={17} /> 0707 342 5222</a>
                <a href="https://www.instagram.com/tincity_founders/" target="_blank" rel="noopener noreferrer" className="contact-phone"><Instagram size={17} /> @tincity_founders</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <BrandLockup />
          <span className="footer-location"><MapPin size={15} /> Jos, Plateau State, Nigeria</span>
        </div>
        <div className="footer-grid">
          <div><span className="footer-label">A community association for</span><p>Entrepreneurship, innovation, and shared economic progress.</p></div>
          <div className="footer-links"><a href="#mandate">Our mandate</a><a href="#programmes">Programmes</a><a href="#partnerships">Partnerships</a><a href="#contact">Contact</a><a href="/admin/enquiries">Partner team</a></div>
          <div className="footer-contact"><a href="mailto:info@africanintelligence.tech">info@africanintelligence.tech</a><a href="tel:07073425222">0707 342 5222</a><a href="https://www.instagram.com/tincity_founders/" target="_blank" rel="noopener noreferrer">@tincity_founders</a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Tin City Founders</span><span>Made in Jos · Open to the world</span></div>
      </footer>
    </div>
  );
}
