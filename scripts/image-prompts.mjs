/**
 * The prompts for the site's images, and the house style appended to each.
 *
 * Shared by both generators — the paid Higgsfield one and the free
 * Pollinations one — so the wording stays identical whichever service ends
 * up making them.
 *
 * No text, ever: image models still render type as mush, and a garbled word
 * on a real page looks worse than no image. Headlines go on afterwards in
 * code, where they are sharp, translatable and readable by a screen reader.
 *
 * No faces that could be mistaken for a client, and nothing that implies we
 * did work we have not done.
 */

export const STYLE =
  "Photographic, natural daylight, shallow depth of field, muted colour, " +
  "British setting. No text, no words, no lettering, no logos, no signage, " +
  "no watermarks. No direct eye contact with the camera. Unposed and " +
  "ordinary rather than stock-photo cheerful.";

/** 16:9 for page headers. */
export const PROMPTS = [
  // --- Services -----------------------------------------------------------
  {
    name: "service-meta-ads",
    ratio: "16:9",
    seed: 101,
    prompt:
      "Over-the-shoulder view of a phone held in one hand, scrolling a social feed, " +
      "in the cab of a working van with the door open onto a grey street.",
  },
  {
    name: "service-google-ads",
    ratio: "16:9",
    seed: 102,
    prompt:
      "A phone on a workbench among tools, screen lit, someone reaching for it with " +
      "a hand that has been working. Late afternoon light through a roller door.",
  },
  {
    name: "service-seo",
    ratio: "16:9",
    seed: 103,
    prompt:
      "A small shopfront on a British high street at dusk, lights on inside, seen " +
      "from across the road. Quiet, ordinary, a little worn.",
  },
  {
    name: "service-web-design",
    ratio: "16:9",
    seed: 104,
    prompt:
      "A laptop and a phone side by side on a kitchen table, both screens bright but " +
      "unreadable at this angle, a mug and a notebook beside them. Morning light.",
  },
  {
    name: "service-social",
    ratio: "16:9",
    seed: 105,
    prompt:
      "Someone filming a short clip on a phone propped against a toolbox in a small " +
      "workshop. Rough, real, not a studio.",
  },

  // --- Industries ---------------------------------------------------------
  {
    name: "industry-automotive",
    ratio: "16:9",
    seed: 106,
    prompt:
      "A car on a lift in a small independent garage, one mechanic underneath, " +
      "strip lighting, oil-stained concrete floor.",
  },
  {
    name: "industry-health-beauty",
    ratio: "16:9",
    seed: 107,
    prompt:
      "A small treatment room in a beauty salon, clean towels folded, a chair and a " +
      "mirror, soft daylight through a frosted window. Nobody in shot.",
  },
  {
    name: "industry-hospitality",
    ratio: "16:9",
    seed: 108,
    prompt:
      "The pass of a small restaurant kitchen mid-service, hands plating, steam, " +
      "warm overhead light. Faces out of frame.",
  },
  {
    name: "industry-home-trades",
    ratio: "16:9",
    seed: 109,
    prompt:
      "A plumber's van with the back doors open on a residential street, tools and " +
      "pipe stacked inside, grey British weather.",
  },
  {
    name: "industry-professional-services",
    ratio: "16:9",
    seed: 110,
    prompt:
      "A small office above a shop, two desks, papers and a desk lamp, net curtains, " +
      "late afternoon. Lived in rather than corporate.",
  },
  {
    name: "industry-property",
    ratio: "16:9",
    seed: 111,
    prompt:
      "A set of keys on the worktop of an empty flat, boxes stacked behind, bare " +
      "walls, light from a window with no curtains.",
  },
  {
    name: "industry-fitness",
    ratio: "16:9",
    seed: 112,
    prompt:
      "A small independent gym early in the morning, racks and plates, nobody there " +
      "yet, low sun through high windows.",
  },
  {
    name: "industry-retail",
    ratio: "16:9",
    seed: 113,
    prompt:
      "The counter of a small independent shop, card machine and packaging, stock on " +
      "shelves behind, daylight from the front window.",
  },
];

/**
 * Brand mock-ups.
 *
 * These are the one exception to the no-text rule: the whole point is the
 * name on a surface. Generate them with Nano Banana Pro or GPT Image 2 —
 * those two are tagged for text rendering; most models turn lettering to
 * mush. Expect to re-roll a few times until the spelling comes out right,
 * and read it letter by letter before using it.
 *
 * The safer route for anything that has to be exact: generate the scene with
 * a BLANK wall or a PLAIN cup, then composite public/logo.png (512x512) on
 * top. Sharp, correctly spelled, and it is the real mark rather than a
 * model's impression of it.
 */
export const BRAND_PROMPTS = [
  {
    name: "brand-wall-sign",
    ratio: "16:9",
    seed: 201,
    prompt:
      "Brushed metal letters reading \"SHAZ MARKETING GROUP\" mounted on a plain " +
      "white plaster wall in a small modern office, lit from above, a corner of a " +
      "desk and a plant just in frame at the edge. Shallow depth of field, " +
      "photographic.",
  },
  {
    name: "brand-cup",
    ratio: "16:9",
    seed: 202,
    prompt:
      "A white ceramic mug on a wooden desk beside a closed laptop and a notebook, " +
      "the words \"SHAZ MARKETING GROUP\" printed small on the side of the mug in a " +
      "clean sans-serif. Morning light from a window, shallow depth of field, " +
      "photographic.",
  },
  {
    name: "brand-desk",
    ratio: "16:9",
    seed: 203,
    prompt:
      "A dark notebook with \"SHAZ MARKETING GROUP\" foil-stamped small on the " +
      "cover, a pen across it, on a desk beside a phone and a coffee. Overhead " +
      "flat lay, natural light, photographic.",
  },
  {
    name: "brand-office-wide",
    ratio: "16:9",
    seed: 204,
    prompt:
      "A group of about twelve people standing together in a bright open-plan " +
      "office, talking and laughing, mid-conversation rather than posed in a row. " +
      "Mixed ages, ordinary work clothes, British. Natural window light, " +
      "photographic, shallow depth of field. No text, no signage, no logos.",
  },
];
