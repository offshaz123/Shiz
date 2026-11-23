import type { AreaGroup } from "./areas";

/**
 * Places to search for prospects in the United States.
 *
 * Grouped by state, because that is the unit Walid asked for and it is also
 * the unit that matters commercially: licensing, trade bodies and the way
 * people describe where they are all run on states.
 *
 * Inside each state the entries are cities and suburbs rather than the
 * state itself, for the same reason the UK list is suburbs rather than
 * "London". A Places search for "car detailing in Texas" returns the
 * biggest operators in Houston and Dallas, which are precisely the ones
 * who already have an agency. "Car detailing in Katy" returns the ones who
 * still want the work.
 *
 * Which states, and why these:
 *  - No state income tax and heavy small-business density in Texas and
 *    Florida, which is where most of the trades we already serve live.
 *  - Georgia, North Carolina and Arizona are growing fast and are cheaper
 *    to advertise in than the coasts.
 *  - Ohio and Pennsylvania are older, denser markets where plenty of
 *    established trades still have a website from 2014.
 *  - New Jersey is here and New York is not, deliberately: New York City
 *    is the most fought-over advertising market in the world and the
 *    suburbs across the river are not.
 *
 * This is a starting list, not a finished one. The free-text box takes
 * anything, so a state that turns out to work can be filled in properly
 * and one that does not can be dropped.
 */

export const usAreaGroups: AreaGroup[] = [
  {
    name: "Texas",
    note: "Biggest small-business market of the lot, and no state income tax.",
    areas: [
      "Katy",
      "Sugar Land",
      "Pearland",
      "The Woodlands",
      "Plano",
      "Frisco",
      "Arlington",
      "Irving",
      "Garland",
      "McKinney",
      "Round Rock",
      "Pflugerville",
      "San Marcos",
      "New Braunfels",
      "Schertz",
    ],
  },
  {
    name: "Florida",
    note: "Year-round trade, heavy on auto, pool, lawn and home services.",
    areas: [
      "Kissimmee",
      "Winter Garden",
      "Altamonte Springs",
      "Brandon",
      "Clearwater",
      "Largo",
      "Palm Harbor",
      "Coral Springs",
      "Pembroke Pines",
      "Davie",
      "Boynton Beach",
      "Port St. Lucie",
      "Cape Coral",
      "Bonita Springs",
      "Ocala",
    ],
  },
  {
    name: "Georgia",
    note: "Atlanta's suburbs, where the trades are and the big agencies are not.",
    areas: [
      "Marietta",
      "Roswell",
      "Alpharetta",
      "Smyrna",
      "Duluth",
      "Lawrenceville",
      "Kennesaw",
      "Decatur",
      "Woodstock",
      "Peachtree City",
      "Macon",
      "Augusta",
      "Savannah",
    ],
  },
  {
    name: "North Carolina",
    note: "Growing fast, cheaper to advertise in than anywhere on the coasts.",
    areas: [
      "Cary",
      "Apex",
      "Huntersville",
      "Concord",
      "Matthews",
      "Gastonia",
      "Greensboro",
      "Winston-Salem",
      "Durham",
      "Wilmington",
      "Fayetteville",
      "Asheville",
    ],
  },
  {
    name: "Arizona",
    note: "Phoenix's ring of suburbs. Note the three-hour gap behind New York.",
    areas: [
      "Mesa",
      "Chandler",
      "Gilbert",
      "Glendale",
      "Peoria",
      "Surprise",
      "Tempe",
      "Scottsdale",
      "Goodyear",
      "Queen Creek",
      "Tucson",
    ],
  },
  {
    name: "Ohio",
    note: "Older market. Plenty of established trades on a website from 2014.",
    areas: [
      "Dublin",
      "Westerville",
      "Hilliard",
      "Grove City",
      "Parma",
      "Strongsville",
      "Westlake",
      "Mason",
      "West Chester",
      "Dayton",
      "Toledo",
      "Akron",
    ],
  },
  {
    name: "Pennsylvania & New Jersey",
    note: "Dense, and across the river from the most expensive market there is.",
    areas: [
      "Bensalem",
      "King of Prussia",
      "Norristown",
      "Levittown",
      "Cherry Hill",
      "Toms River",
      "Edison",
      "Woodbridge",
      "Paramus",
      "Hoboken",
      "Bayonne",
      "Pittsburgh",
    ],
  },
];

export const allUsAreas: string[] = usAreaGroups.flatMap((g) => g.areas);

/**
 * Whole metros, for casting wider than a suburb.
 *
 * Same warning as the UK list: a search in the middle of one of these
 * returns the operators with four hundred reviews who need nothing from us.
 */
export const usCities: string[] = [
  "Houston",
  "Dallas",
  "San Antonio",
  "Austin",
  "Jacksonville",
  "Tampa",
  "Orlando",
  "Miami",
  "Atlanta",
  "Charlotte",
  "Raleigh",
  "Phoenix",
  "Columbus",
  "Cleveland",
  "Cincinnati",
  "Philadelphia",
  "Nashville",
  "Indianapolis",
  "Kansas City",
  "Denver",
];
