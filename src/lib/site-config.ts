export const siteConfig = {
  name: "Shaz Marketing Group",
  shortName: "Shaz Marketing",
  description:
    "Shaz Marketing Group runs Meta & Instagram ads that generate qualified leads, backed by an all-in-one CRM, social inbox, and 24/7 AI receptionist.",
  url: "https://shazmarketing.com",
  email: "info@shazmarketing.com",
  phoneDisplay: "07539 559947",
  phoneE164: "+447539559947",
  whatsappNumber: "447539559947",
  whatsappMessage: "Hi Shaz Marketing Group, I'd like to find out more about your Meta & Instagram ads packages.",
  // Google Calendar "Appointment schedule" embed URL for the /demo page booking widget.
  // Leave empty until it's set up — the page falls back to the lead form until then.
  demoBookingUrl: "",
  // Demo walkthrough video (YouTube/Vimeo embed URL, or a direct video file URL). Leave empty for now.
  demoVideoUrl: "",
};

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;
