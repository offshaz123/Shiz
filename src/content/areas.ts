// Local landing pages for the areas we actually serve. Each one exists because
// the ad data showed real search volume for "car tinting near me" from these
// places — not to spray thin doorway pages at Google. Every area gets its own
// intro, route and local detail; if there's nothing genuinely different to say
// about an area, it doesn't get a page.

export type Area = {
  slug: string;
  name: string;
  /** Postcode districts the area covers, shown to help visitors self-identify. */
  postcodes: string;
  /** Honest door-to-door driving time from the unit. */
  driveTime: string;
  /** How people actually get here from that area. */
  route: string;
  /** Opening paragraph. Written per area — no template filling. */
  intro: string;
  /** What's specific about tinting for drivers in this area. */
  local: string;
};

export const areas: Area[] = [
  {
    slug: "walthamstow",
    name: "Walthamstow",
    postcodes: "E17",
    driveTime: "You're already here",
    route:
      "We're on Cecil Road, just off Hoe Street — a few minutes from Walthamstow Central and the Market.",
    intro:
      "Our unit is in Walthamstow, so this is home turf. If you live in E17 you can drop the car in, walk into the Market or up to the Village, and collect it finished the same day.",
    local:
      "Most Walthamstow cars we see are parked on-street rather than in a garage, which means glass takes a full day of sun with nothing to shade it. That's exactly where ceramic earns the extra over dyed film — it's rejecting heat all day, every day, not just looking dark.",
  },
  {
    slug: "leyton",
    name: "Leyton",
    postcodes: "E10, E11",
    driveTime: "About 10 minutes",
    route:
      "Straight up Lea Bridge Road or Hoe Street and you're with us — under three miles from most of Leyton and Leytonstone.",
    intro:
      "Leyton and Leytonstone are a ten-minute drive from the unit, which makes us one of the closest proper tinting shops rather than a general garage that also does tint.",
    local:
      "We get a lot of Leyton drivers who've had a cheap job done elsewhere and want it stripped and redone properly. Removing old bubbled film is fiddly, slow work — we'll quote it honestly rather than pretend it's the same job as tinting fresh glass.",
  },
  {
    slug: "chingford",
    name: "Chingford",
    postcodes: "E4",
    driveTime: "About 12 minutes",
    route: "Straight down the A112 Chingford Road — a clear run most of the day.",
    intro:
      "Chingford is a straight road down to us, and it's one of the areas we see most. Drop-off in the morning, back on the drive the same afternoon.",
    local:
      "Chingford has more driveways and garages than most of the borough, so cars here tend to be looked after. If you're the sort who keeps the paint right, ceramic with a lifetime warranty makes more sense than dyed film you'll be redoing in a few years.",
  },
  {
    slug: "woodford",
    name: "Woodford",
    postcodes: "IG8, E18",
    driveTime: "About 15 minutes",
    route: "Across on the A406 North Circular, or down Woodford New Road if the A406 is heavy.",
    intro:
      "Woodford, South Woodford and Wanstead are a fifteen-minute run across the North Circular. Worth the trip if you want the job done properly rather than quickly.",
    local:
      "We see a lot of newer and leased cars from Woodford. Worth knowing: tint is fully reversible, so it won't cause you a problem at the end of a lease — we can remove it cleanly when the time comes.",
  },
  {
    slug: "loughton",
    name: "Loughton",
    postcodes: "IG10, IG9, IG7",
    driveTime: "About 20 minutes",
    route:
      "Down the A104 Epping New Road, or the M11 and A406 if you're coming from Debden or Chigwell.",
    intro:
      "Loughton, Buckhurst Hill and Chigwell are twenty minutes down the road. It's a slightly longer run than your nearest garage, and the cars we get from there are usually the ones where that matters.",
    local:
      "This is where we fit the most ceramic and the most chameleon. If you want the finish to be a feature rather than just privacy glass, come and look at the chameleon in daylight before you decide — photos don't do the colour shift justice.",
  },
  {
    slug: "ilford",
    name: "Ilford",
    postcodes: "IG1, IG2, IG3",
    driveTime: "About 20 minutes",
    route: "Up the A406 or across the A116 — twenty minutes from most of Ilford.",
    intro:
      "There's no shortage of places advertising tint around Ilford. We're twenty minutes away and we do one thing properly rather than everything cheaply.",
    local:
      "The honest pitch: if all you want is the cheapest dark film going, there'll be someone nearer than us. If you want ceramic that actually rejects heat, backed for as long as you own the car, that's the trip worth making.",
  },
];

export const findArea = (slug: string) => areas.find((a) => a.slug === slug);
