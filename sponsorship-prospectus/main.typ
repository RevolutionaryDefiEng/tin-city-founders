// Tin City Founders Sponsorship Prospectus
// Brand direction: Plateau Ledger — locally rooted, globally fluent, evidence-led.

#import "report-theme.typ": report-accent, report-theme

#let forest = rgb("#183C2E")
#let tin = rgb("#D58C24")
#let sand = rgb("#F4EFE5")
#let clay = rgb("#7D4A24")
#let mist = rgb("#ECE3D4")
#let ink = rgb("#1F2E25")
#let paper = rgb("#FFFDF7")

#let field-label(text-value, fill: tin) = text(
  size: 8.5pt,
  weight: "bold",
  fill: fill,
  tracking: 0.12em,
)[#upper(text-value)]

#let callout(title, body) = block(
  width: 100%,
  inset: 14pt,
  radius: 2pt,
  fill: mist,
  stroke: (left: 3pt + tin),
)[
  #text(size: 11pt, weight: "bold", fill: forest)[#title]
  #v(0.35em)
  #text(size: 9.5pt, fill: ink)[#body]
]

#show: report-theme.with(
  title: "Tin City Founders — Sponsorship Prospectus",
  author: "Tin City Founders",
  rhythm: "report",
  running-header: true,
)

// ---------- Cover ----------
#page(
  margin: (top: 1.35cm, bottom: 1.35cm, x: 1.5cm),
  fill: forest,
  numbering: none,
  header: none,
)[
  #set text(fill: paper)
  #align(center)[
    #image("assets/tcf-logo-transparent-light.png", height: 3.4cm)
    #v(1.6em)
    #field-label("Partnership prospectus · 2026", fill: rgb("#F2C26A"))
    #v(0.7em)
    #text(size: 30pt, font: "Liberation Serif", weight: "regular")[Build with the people already building.]
    #v(0.75em)
    #text(size: 12pt, fill: rgb("#D9E0D8"))[A partnership invitation for organizations seeking a credible, community-led route into the entrepreneurial energy of Jos, Plateau State.]
  ]
  #v(1fr)
  #image("assets/tcf-hero-group.jpg", width: 100%, height: 7.2cm, fit: "cover")
  #v(0.85em)
  #grid(
    columns: (1fr, auto),
    [#text(size: 8.5pt, fill: rgb("#D9E0D8"))[JOS, PLATEAU STATE · NIGERIA]],
    [#text(size: 8.5pt, fill: rgb("#F2C26A"))[TIN CITY FOUNDERS]],
  )
]

// ---------- Main body ----------
#counter(page).update(1)

= The investment case

#field-label("01 · Why Tin City Founders")

Tin City Founders is a community-based association advancing entrepreneurship, innovation, and local economic development among founders and small-business owners in Jos. It is designed as more than an event series: it is a repeatable room where people build trust, exchange practical help, surface enterprise opportunities, and turn local visibility into stronger founder networks.

For a partner, the opportunity is not simply to place a logo in a room. It is to participate in the formation of a durable local founder infrastructure: a trusted convening rhythm, a visible pipeline of operators, and a practical pathway for tools, knowledge, and market access to reach people who are already building.

#callout(
  [A community built for signal, not noise.],
  [The association’s founding culture prioritizes showing up in person, giving before taking, welcoming founders across sectors, protecting trust inside the room, and measuring tangible outcomes rather than attention alone.],
)

== Why this matters now

Jos has a broad but often fragmented base of entrepreneurial activity. Founders operating in technology, trade, creative work, agriculture, services, and informal enterprise do not always share the same access to peers, practical expertise, visibility, or opportunity. Tin City Founders creates an intentional point of connection between these groups and makes the local founder economy easier to see, support, and strengthen.

The association’s working proposition is simple: a founder who is connected, recognized, and able to make a clear ask is more likely to progress than one building alone. A partner can help make that progression more systematic.

#pagebreak()

= A credible local engine

#field-label("02 · How the community works")

The delivery model combines regular founder convenings, practical learning, founder spotlights, and structured Give/Ask exchanges. Each format is designed to produce something more useful than attendance: a relationship, a relevant introduction, a next-step resource, a story that earns visibility, or a record of what founders need.

#table(
  columns: (1fr, 1.7fr),
  inset: 11pt,
  stroke: 0.5pt + rgb("#CFC5B5"),
  fill: (x, y) => if y == 0 { forest } else if calc.even(y) { paper } else { sand },
  table.header(
    [#text(fill: paper, weight: "bold")[Delivery component]],
    [#text(fill: paper, weight: "bold")[What it makes possible]],
  ),
  [Founder convenings], [A reliable, founder-dense room for connection, peer exchange, partner visibility, and local momentum.],
  [Give/Ask exchange], [A structured way to surface concrete needs and make useful introductions, rather than leave networking to chance.],
  [Skills clinics and mentorship], [Practical learning around live founder challenges, from product and talent decisions to access to partner programmes.],
  [Built In Jos founder spotlight], [A repeatable visit-and-feature programme that recognizes local operators, brings them into the community, and makes the region’s enterprise base more visible.],
  [Showcases and Demo Day readiness], [A warm, founder-supportive route toward product visibility, stronger asks, media attention, and future investor or ecosystem engagement.],
)

#v(1.3em)

== The Built In Jos inclusion loop

The Founders Spotlight is a practical example of the association’s community logic. It starts with nomination and a short visit to a founder in their own place of work. The team listens, records a simple story, offers a branded gesture of recognition, asks for further nominations, and shares the story first with the founder before publishing it through the community.

This approach is deliberately designed to recognize founders who may not appear in conventional startup rooms: shop owners, makers, farmers, service operators, and other local builders. For a partner, it creates a grounded route into the full entrepreneurial fabric of Jos, not only the most visible segment of it.

#pagebreak()

= What a partner can unlock

#field-label("03 · A partnership with practical reach")

Tin City Founders is seeking partners that want to contribute expertise, access, resources, or convening capacity in ways that founders can actually use. The association is not structured as an investment vehicle; it is a not-for-profit community platform. Sponsorship is therefore directed toward delivery capacity, founder access, and measurable local progress.

#columns(2, gutter: 1.4em)[
  #callout(
    [A stronger founder pipeline.],
    [Support more regular access to a local network where founders can meet peers, test ideas, identify needs, and stay connected to opportunity.],
  )
  #v(1em)
  #callout(
    [Responsible tool adoption.],
    [Bring relevant partner programmes, credits, platforms, mentorship, or market knowledge into a community that can help members understand and use them well.],
  )
  #colbreak()
  #callout(
    [Visible, locally credible presence.],
    [Co-create useful moments that earn trust: learning clinics, founder spotlights, community conversations, showcases, or a supported convening season.],
  )
  #v(1em)
  #callout(
    [Evidence for future scale.],
    [Help establish the operating proof partners need: attendance records, founder registry growth, asks answered, introductions made, stories captured, and programmes delivered.],
  )
]

== Partnership pathways

#table(
  columns: (0.8fr, 1.3fr, 1.3fr),
  inset: 10pt,
  stroke: 0.5pt + rgb("#CFC5B5"),
  fill: (x, y) => if y == 0 { forest } else if calc.even(y) { paper } else { sand },
  table.header(
    [#text(fill: paper, weight: "bold")[Pathway]],
    [#text(fill: paper, weight: "bold")[A partner can support]],
    [#text(fill: paper, weight: "bold")[The intended community value]],
  ),
  [Convening season], [A sequence of founder gatherings, venue and programme costs, community operations, and documentation.], [A dependable rhythm of connection and a clearer view of the active founder community.],
  [Capability partner], [A practical clinic series, mentor access, specialist content, or a partner tool-access journey.], [More founders able to act on a specific business challenge with useful expertise or resources.],
  [Founder visibility partner], [The Built In Jos spotlight programme, founder storytelling, and community invitation moments.], [Broader recognition of local enterprise and a more inclusive founder pipeline.],
  [Showcase partner], [Founder preparation, product showcases, a quarterly Demo Day, or connection to relevant ecosystem stakeholders.], [Higher-quality founder asks and a visible route from local progress to wider opportunity.],
)

#pagebreak()

= Partnership design: rigorous, local, reportable

#field-label("04 · How we work with partners")

The association’s roadmap is built around distributed ownership with one accountable lead for each critical domain and a central convener who keeps commitments visible. Community experience, growth, content, partnerships, and operations each have a defined operating responsibility. This approach is designed to prevent diffusion, move decisions closer to the work, and create a clear point of accountability for sponsors.

Partnerships should be scoped with care rather than offered as one-size-fits-all packages. Tin City Founders will work with each partner to define the founder group to reach, the practical intervention to deliver, what the partner needs to learn or demonstrate, and the evidence that will be shared back.

#callout(
  [The reporting discipline begins on day one.],
  [Event records, founder registration data, Give/Ask exchanges, captured stories, participation signals, and partner-tool engagement can form the basis of a clear learning and impact narrative. Measures will be agreed with each partner before activation.],
)

== A 90-day activation arc

#table(
  columns: (0.56fr, 1.44fr),
  inset: 10pt,
  stroke: 0.5pt + rgb("#CFC5B5"),
  fill: (x, y) => if y == 0 { forest } else if calc.even(y) { paper } else { sand },
  table.header(
    [#text(fill: paper, weight: "bold")[Stage]],
    [#text(fill: paper, weight: "bold")[What happens]],
  ),
  [1. Align], [Agree the partner objective, target founder profile, activation format, delivery owners, and the evidence to capture.],
  [2. Activate], [Run the first useful community touchpoint, whether a convening, spotlight run, capability clinic, or access-to-tools pathway.],
  [3. Learn], [Review participation, qualitative founder feedback, community requests, and partner-relevant signals; refine the next activation accordingly.],
  [4. Build proof], [Document the first cycle and use the evidence to shape an enduring programme, renewal discussion, or broader ecosystem collaboration.],
)

#pagebreak()

= The invitation

#field-label("05 · Let’s build with purpose")

Tin City Founders is looking for partners who believe that meaningful economic opportunity is built close to the people it is meant to serve. The most useful partnership will not be the loudest. It will be the one that leaves founders with stronger relationships, clearer next steps, better access to tools and knowledge, and a community they can continue to build with.

If your organization wants a credible, locally led route into the entrepreneurial energy of Jos, we invite you to start a conversation. We will bring the community context, a practical activation agenda, and a commitment to learn openly from what works.

#block(
  width: 100%,
  inset: 18pt,
  radius: 2pt,
  fill: forest,
)[
  #set text(fill: paper)
  #field-label("Partnership contact", fill: rgb("#F2C26A"))
  #v(0.65em)
  #text(size: 17pt, font: "Liberation Serif")[Start a conversation that turns local founder momentum into shared progress.]
  #v(1em)
  #grid(
    columns: (1fr, 1fr),
    gutter: 1em,
    [#text(size: 9.5pt, fill: rgb("#D9E0D8"))[Email] #linebreak() #link("mailto:info@africanintelligence.tech")[info\@africanintelligence.tech]],
    [#text(size: 9.5pt, fill: rgb("#D9E0D8"))[Phone] #linebreak() #link("tel:07073425222")[0707 342 5222]],
  )
]

#v(1.4em)
#text(size: 8.5pt, fill: clay)[Source basis: Tin City Founders Constitution; Built In Jos — The Founders Spotlight walkthrough; Tin City Founders Blueprint, Roadmap & Operating Model. This prospectus presents a sponsorship and partnership invitation, not an offer of securities or financial returns.]
