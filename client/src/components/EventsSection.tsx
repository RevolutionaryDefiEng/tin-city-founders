/**
 * Editorial archive of past Tin City Founders gatherings — theme, participants,
 * sectors, partners, outcomes. Investor-facing proof of momentum. Data comes
 * from the sheet-synced `events.list` endpoint; renders nothing until there is
 * at least one event, so it never shows an empty shell.
 */
import { trpc } from "@/lib/trpc";
import { CalendarDays, MapPin, Users } from "lucide-react";

function formatDate(date: string): string {
  const m = date.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return date;
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const label = `${months[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
  return label || date;
}

export default function EventsSection() {
  const events = trpc.events.list.useQuery(undefined, { refetchOnWindowFocus: false });
  const list = events.data ?? [];
  if (!list.length) return null;

  return (
    <section id="gatherings" className="events-section" aria-labelledby="events-title">
      <div className="events-inner">
        <div className="events-head">
          <span className="eyebrow"><span /> GATHERINGS · FIELD NOTES</span>
          <h2 id="events-title">What the community has <em>built together.</em></h2>
          <p>
            Every gathering is a room where founders share practical insight, open doors, and turn mutual support into
            momentum. A record of who showed up, what they worked on, and what came of it.
          </p>
        </div>
        <div className="events-grid">
          {list.map((e) => (
            <article className="event-card" key={e.id}>
              <div className="event-card-media">
                {e.photoUrl ? (
                  <img src={e.photoUrl} alt={e.title} loading="lazy" />
                ) : (
                  <div className="event-card-media-fallback" aria-hidden="true">{e.title.charAt(0)}</div>
                )}
              </div>
              <div className="event-card-body">
                <div className="event-card-meta">
                  {e.date ? <span><CalendarDays size={12} /> {formatDate(e.date)}</span> : null}
                  {e.location ? <span><MapPin size={12} /> {e.location}</span> : null}
                  {e.participantCount ? <span className="event-count"><Users size={12} /> {e.participantCount} founders</span> : null}
                </div>
                <h3>{e.title}</h3>
                {e.summary ? <p className="event-card-summary">{e.summary}</p> : null}
                {e.sectors.length ? (
                  <div className="event-card-sectors">
                    {e.sectors.map((s) => <span key={s}>{s}</span>)}
                  </div>
                ) : null}
                {e.outcome ? <p className="event-card-outcome"><strong>Outcome · </strong>{e.outcome}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
