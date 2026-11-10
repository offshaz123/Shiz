/**
 * Places to search for prospects in.
 *
 * Separate from locations.ts, which is the site's public city pages — those
 * are London, Birmingham, Manchester and so on, written to be found by
 * someone searching "marketing agency Manchester". They are the wrong list
 * for this job entirely: searching Google for "car detailing in London"
 * returns the big established operators with four hundred reviews, which are
 * exactly the ones we do not want.
 *
 * Prospecting needs the opposite — a suburb, a borough, a town — because that
 * is where the small operators who still want the work actually show up. So
 * this is a list of those, close to home first.
 *
 * Add to it freely. The free-text box on the page still takes anything.
 */

export type AreaGroup = {
  name: string;
  /** Why this grouping, in a few words, for whoever edits this next. */
  note: string;
  areas: string[];
};

export const areaGroups: AreaGroup[] = [
  {
    name: "East London & borders",
    note: "Closest to home. Start here — a short drive makes meeting in person possible.",
    areas: [
      "Barking",
      "Dagenham",
      "Romford",
      "Ilford",
      "Hornchurch",
      "Upminster",
      "Rainham",
      "Walthamstow",
      "Leyton",
      "Stratford",
      "Woodford",
      "Chingford",
      "Enfield",
      "Edmonton",
      "Tottenham",
    ],
  },
  {
    name: "Essex",
    note: "Cheaper to advertise in than London and far less fought over.",
    areas: [
      "Brentwood",
      "Basildon",
      "Grays",
      "Thurrock",
      "Chelmsford",
      "Southend-on-Sea",
      "Colchester",
      "Harlow",
      "Braintree",
      "Loughton",
      "Epping",
      "Billericay",
      "Wickford",
      "Rayleigh",
    ],
  },
  {
    name: "Rest of London",
    note: "Further out, so phone and video only — but the same work.",
    areas: [
      "Croydon",
      "Bromley",
      "Greenwich",
      "Lewisham",
      "Hackney",
      "Islington",
      "Camden",
      "Wembley",
      "Harrow",
      "Ealing",
      "Hounslow",
      "Kingston",
      "Sutton",
      "Barnet",
      "Watford",
    ],
  },
  {
    name: "Kent & Hertfordshire",
    note: "The commuter belt. Worth a look once the closer areas are worked through.",
    areas: [
      "Dartford",
      "Gravesend",
      "Bexleyheath",
      "Sidcup",
      "Orpington",
      "St Albans",
      "Hemel Hempstead",
      "Stevenage",
      "Hertford",
      "Cheshunt",
    ],
  },
];

/** Flat list, for validating what comes back from the page. */
export const allAreas: string[] = areaGroups.flatMap((g) => g.areas);

/**
 * Whole cities, for when you want to cast wider than a suburb.
 *
 * Kept apart from the groups above because they do a different job and come
 * with a warning: searching a city centre returns the big established
 * operators with hundreds of reviews, who have an agency already. The
 * suburbs are where the businesses that still want the work are.
 *
 * Here anyway, because "try Manchester and see what comes back" is a
 * perfectly reasonable thing to want to do, and typing it every time is
 * friction for no reason.
 */
export const cities: string[] = [
  "London",
  "Birmingham",
  "Manchester",
  "Liverpool",
  "Leeds",
  "Sheffield",
  "Bristol",
  "Nottingham",
  "Leicester",
  "Coventry",
  "Newcastle upon Tyne",
  "Glasgow",
  "Edinburgh",
  "Cardiff",
  "Belfast",
  "Southampton",
  "Portsmouth",
  "Brighton",
  "Reading",
  "Milton Keynes",
  "Luton",
  "Oxford",
  "Cambridge",
  "Norwich",
  "Ipswich",
  "Derby",
  "Stoke-on-Trent",
  "Wolverhampton",
  "Plymouth",
  "Aberdeen",
];
