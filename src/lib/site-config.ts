export const siteConfig = {
  name: "Shaz Marketing Group",
  shortName: "Shaz Marketing",
  description:
    "Shaz Marketing Group runs Meta & Instagram ad campaigns that generate qualified leads for businesses of every kind, backed by an all-in-one CRM, unified social inbox, and 24/7 AI receptionist.",
  url: "https://shazmarketing.com",
  email: "info@shazmarketing.com",
  phoneDisplay: "07539 559947",
  phoneE164: "+447539559947",
  whatsappNumber: "447539559947",
  whatsappMessage: "Hi Shaz Marketing Group, I'd like to find out more about your Meta & Instagram ads packages.",
};

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;
