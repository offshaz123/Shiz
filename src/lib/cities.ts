// Cities we deliver to, each with its own page (/number-plates/<slug>) for
// people searching "number plates <city>". Every plate is made in our London
// workshop and posted, so the pages say that: no pretending to have a shop there.

export type City = {
  slug: string;
  name: string;
  region: string;
  // A sentence or two about that city, so each page is written for it.
  intro: string;
  // Nearby towns and districts the page also covers.
  areas: string[];
  // Postcode areas, e.g. "B" for Birmingham.
  postcodes: string[];
};

export const cities: City[] = [
  {
    slug: "london",
    name: "London",
    region: "Greater London",
    intro:
      "Our workshop is in East London, so the rest of London is right on our doorstep. Drivers from Croydon to Camden and Ealing to Enfield order from us online and get their plates by tracked post, or by Next Day Delivery when they need them fast.",
    areas: ["East London", "North London", "South London", "West London", "Central London", "Croydon", "Ealing", "Enfield", "Barnet", "Bromley", "Harrow", "Wembley", "Stratford", "Walthamstow", "Hounslow", "Kingston"],
    postcodes: ["E", "EC", "N", "NW", "SE", "SW", "W", "WC", "CR", "BR", "EN", "HA", "UB", "TW", "KT", "IG", "RM", "DA", "SM"],
  },
  {
    slug: "birmingham",
    name: "Birmingham",
    region: "West Midlands",
    intro:
      "Whether you're in Solihull, Sutton Coldfield or the city centre, you can design your plates online in a couple of minutes and have them delivered to your door anywhere in Birmingham and the West Midlands.",
    areas: ["Solihull", "Sutton Coldfield", "Erdington", "Edgbaston", "Small Heath", "Handsworth", "Walsall", "West Bromwich", "Dudley", "Wolverhampton", "Coventry", "Redditch"],
    postcodes: ["B", "WS", "WV", "DY", "CV"],
  },
  {
    slug: "manchester",
    name: "Manchester",
    region: "Greater Manchester",
    intro:
      "From Salford to Stockport and Oldham to Bolton, drivers across Greater Manchester can build road-legal 3D gel and 4D plates online with a live preview and get them sent by tracked delivery.",
    areas: ["Salford", "Stockport", "Oldham", "Bolton", "Bury", "Rochdale", "Wigan", "Trafford", "Altrincham", "Ashton-under-Lyne", "Cheetham Hill", "Didsbury"],
    postcodes: ["M", "SK", "OL", "BL", "WN", "WA"],
  },
  {
    slug: "leeds",
    name: "Leeds",
    region: "West Yorkshire",
    intro:
      "Drivers in Leeds and across West Yorkshire, including Bradford, Wakefield and Huddersfield, can design their plates online and have them made and posted the same working day when they order before 2pm.",
    areas: ["Bradford", "Wakefield", "Huddersfield", "Halifax", "Dewsbury", "Headingley", "Morley", "Pudsey", "Harrogate", "Castleford"],
    postcodes: ["LS", "BD", "WF", "HD", "HX", "HG"],
  },
  {
    slug: "liverpool",
    name: "Liverpool",
    region: "Merseyside",
    intro:
      "Across Liverpool, the Wirral, St Helens and Southport, you can order premium road-legal plates online, see them on your own registration first, and get them delivered by tracked post.",
    areas: ["Wirral", "Birkenhead", "St Helens", "Southport", "Bootle", "Knowsley", "Huyton", "Wallasey", "Widnes", "Runcorn"],
    postcodes: ["L", "CH", "PR", "WA"],
  },
  {
    slug: "sheffield",
    name: "Sheffield",
    region: "South Yorkshire",
    intro:
      "If you're in Sheffield, Rotherham, Barnsley or Doncaster, you can build your number plates online with a live preview and have them sent to you by tracked delivery.",
    areas: ["Rotherham", "Barnsley", "Doncaster", "Chesterfield", "Hillsborough", "Meadowhall", "Dronfield", "Worksop"],
    postcodes: ["S", "DN"],
  },
  {
    slug: "bristol",
    name: "Bristol",
    region: "South West",
    intro:
      "From Bristol city centre to Bath, Weston-super-Mare and South Gloucestershire, order your road-legal or show plates online and have them delivered to your door.",
    areas: ["Bath", "Weston-super-Mare", "Clifton", "Kingswood", "Filton", "Bradley Stoke", "Keynsham", "Portishead", "Yate"],
    postcodes: ["BS", "BA"],
  },
  {
    slug: "newcastle",
    name: "Newcastle",
    region: "North East",
    intro:
      "Drivers in Newcastle, Gateshead, Sunderland and across the North East can design their plates online in minutes and get them by tracked delivery.",
    areas: ["Gateshead", "Sunderland", "South Shields", "North Shields", "Whitley Bay", "Tynemouth", "Durham", "Washington", "Cramlington"],
    postcodes: ["NE", "SR", "DH"],
  },
  {
    slug: "nottingham",
    name: "Nottingham",
    region: "East Midlands",
    intro:
      "Whether you're in Nottingham, Derby or Mansfield, you can build road-legal 3D gel, 4D or standard plates online and have them made and posted to you.",
    areas: ["Derby", "Mansfield", "Beeston", "West Bridgford", "Arnold", "Hucknall", "Long Eaton", "Newark"],
    postcodes: ["NG", "DE"],
  },
  {
    slug: "leicester",
    name: "Leicester",
    region: "East Midlands",
    intro:
      "Across Leicester, Loughborough and Leicestershire, you can design your plates on your phone, see a live preview on your registration, and get them delivered by tracked post.",
    areas: ["Loughborough", "Hinckley", "Wigston", "Oadby", "Melton Mowbray", "Coalville", "Market Harborough", "Belgrave"],
    postcodes: ["LE"],
  },
  {
    slug: "glasgow",
    name: "Glasgow",
    region: "Scotland",
    intro:
      "Number plates in Scotland follow the same DVLA rules as the rest of Great Britain, so drivers in Glasgow and across the west of Scotland can order road-legal plates from us online and get them by tracked delivery.",
    areas: ["Paisley", "East Kilbride", "Hamilton", "Motherwell", "Clydebank", "Cumbernauld", "Kilmarnock", "Ayr", "Greenock"],
    postcodes: ["G", "PA", "ML", "KA"],
  },
  {
    slug: "cardiff",
    name: "Cardiff",
    region: "Wales",
    intro:
      "Drivers in Cardiff, Newport, Swansea and across South Wales can design their plates online and have them delivered by tracked post.",
    areas: ["Newport", "Swansea", "Barry", "Penarth", "Caerphilly", "Pontypridd", "Bridgend", "Merthyr Tydfil"],
    postcodes: ["CF", "NP", "SA"],
  },
];

export const findCity = (slug: string) => cities.find((c) => c.slug === slug) ?? null;
