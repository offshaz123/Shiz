export const siteConfig = {
  name: "SMG Details",
  shortName: "SMG Details",
  legalName: "Shaz Moto Group Details",
  description:
    "SMG Details is Romford's specialist for car window tinting, wrapping and dechroming, car servicing, custom number plates, and alloy wheel & caliper refurbishment.",
  url: "https://smgdetails.co.uk",
  email: "info@smgdetails.co.uk",
  phoneDisplay: "07414 140633",
  phoneE164: "+447414140633",
  whatsappNumber: "447414140633",
  whatsappMessage: "Hi SMG Details, I'd like to find out more about your services.",
  address: {
    line1: "12 Roneo Corner",
    locality: "Romford",
    region: "Essex",
    postcode: "RM12 4TN",
    country: "United Kingdom",
    countryCode: "GB",
  },
  socials: {
    instagram: "https://instagram.com/shazmotorgroup",
    facebook: "https://facebook.com/shazmotorgroup",
    tiktok: "https://tiktok.com/@shazmotorgroup",
  },
  openingHours: [
    { days: "Monday - Friday", hours: "9:00am - 6:00pm" },
    { days: "Saturday", hours: "9:00am - 5:00pm" },
    { days: "Sunday", hours: "Closed" },
  ],
};

export const fullAddress = `${siteConfig.address.line1}, ${siteConfig.address.locality}, ${siteConfig.address.postcode}`;

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;

export const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${siteConfig.legalName} Details, ${fullAddress}`
)}`;
