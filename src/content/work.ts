// Photographs of actual jobs, supplied by the business. Only real work goes in
// here — no stock photography, and no car we did not tint.
//
// Number plates must be obscured before a photo is added: a plate is personal
// data, and customers do not expect their car to be identifiable on a
// business website.

export type WorkPhoto = {
  src: string;
  /** Describes the photo for screen readers and for image search. */
  alt: string;
  /** Short line shown under the photo. Describe the job, don't sell. */
  caption: string;
  /**
   * CSS object-position, for photos where centring the crop loses the point of
   * the shot — the BMW's tinted glass sits above the centre line, so a centred
   * crop shows bonnet instead of windows.
   */
  position?: string;
};

export const workPhotos: WorkPhoto[] = [
  {
    src: "/work/bmw-5-series-tint-unit.jpg",
    alt: "BMW 5 Series with tinted windows under hexagon lighting inside the Executive Tints & Repairs unit in Walthamstow, rolls of tint film on the wall behind",
    caption: "BMW 5 Series, tinted in our Walthamstow unit",
    position: "50% 92%",
  },
  {
    src: "/work/window-tint-fitting.jpg",
    alt: "Tint film being hand-fitted to the tailgate glass of a black Toyota C-HR",
    caption: "Every tint is hand-fitted, panel by panel",
  },
  {
    src: "/work/vw-golf-r-window-tint.jpg",
    alt: "Grey VW Golf R showing tinted rear side windows alongside clear front glass",
    caption: "Golf R — rear glass tinted, fronts left clear",
  },
  {
    src: "/work/range-rover-sport-window-tint.jpg",
    alt: "Black Range Rover Sport with dark tinted rear windows",
    caption: "Range Rover Sport, dark tint across the rear",
  },
];
