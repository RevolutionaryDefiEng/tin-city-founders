/**
 * Plateau Ledger design system: a warm, editorial partnership dossier rooted in Jos.
 * Use DM Serif Display for high-stakes statements, Manrope for operational clarity,
 * Jos evergreen for trust, Tin Amber for movement, and staggered field-journal layouts.
 */
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpenCheck,
  ChevronRight,
  Globe2,
  Handshake,
  HeartHandshake,
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
const logoImage = "/manus-storage/tcf-symbol_c9e270c1.png";

const navItems = [
  { label: "Our mandate", href: "#mandate" },
  { label: "Programmes", href: "#programmes" },
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
    title: "Programme sponsorship",
    text: "Underwrite a founder cohort, skills series, or learning infrastructure designed around a defined local need.",
    icon: HeartHandshake,
  },
  {
    title: "Strategic collaboration",
    text: "Bring expertise, technology, market access, or research capacity into a community that values practical exchange.",
    icon: Network,
  },
  {
    title: "Place-based investment",
    text: "Help convene solutions that support resilient small businesses and more inclusive local economic development.",
    icon: Globe2,
  },
];

function BrandLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#top" className="brand-lockup" aria-label="Tin City Founders home">
      <img className="brand-mark" src={logoImage} alt="Tin City Founders symbol" />
      <span className={inverse ? "brand-type brand-type-inverse" : "brand-type"}>
        <span>Tin City</span>
        <span>Founders</span>
      </span>
    </a>
  );
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-[#f4efe5] text-[#1f2e25]">
      <header className={isScrolled ? "site-header site-header-scrolled" : "site-header"}>
        <div className="header-inner">
          <BrandLockup inverse={!isScrolled && !isOpen} />
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

        <section id="partnerships" className="partnerships-section" aria-labelledby="partnerships-title">
          <div className="partnerships-heading">
            <div className="section-meta section-meta-dark"><span className="section-index">03</span><span>PARTNERSHIP PATHWAYS</span></div>
            <h2 id="partnerships-title">Bring more of what works <em>within reach.</em></h2>
          </div>
          <div className="partnerships-content">
            <div className="partnerships-copy">
              <p className="lead-copy">We welcome international organizations that see local founders as essential partners in inclusive, practical economic development.</p>
              <p>Every partnership begins with a conversation about the local context, the mutual value of collaboration, and the most responsible way to translate resources into lasting capability.</p>
              <a href="#contact" className="button-primary button-primary-forest">Start a partnership conversation <ArrowUpRight size={18} /></a>
            </div>
            <div className="partnership-cards">
              {partnershipItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article className="partnership-card" key={item.title}>
                    <div className="partnership-card-top"><span>0{index + 1}</span><Icon size={22} strokeWidth={1.7} /></div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <a href="#contact" aria-label={`Learn more about ${item.title}`}><span>Open a dialogue</span><ArrowUpRight size={17} /></a>
                  </article>
                );
              })}
            </div>
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
              <a href="tel:07073425222" className="contact-phone"><Phone size={17} /> 0707 342 5222</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <BrandLockup inverse />
          <span className="footer-location"><MapPin size={15} /> Jos, Plateau State, Nigeria</span>
        </div>
        <div className="footer-grid">
          <div><span className="footer-label">A community association for</span><p>Entrepreneurship, innovation, and shared economic progress.</p></div>
          <div className="footer-links"><a href="#mandate">Our mandate</a><a href="#programmes">Programmes</a><a href="#partnerships">Partnerships</a><a href="#contact">Contact</a></div>
          <div className="footer-contact"><a href="mailto:info@africanintelligence.tech">info@africanintelligence.tech</a><a href="tel:07073425222">0707 342 5222</a></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Tin City Founders</span><span>Made in Jos · Open to the world</span></div>
      </footer>
    </div>
  );
}
