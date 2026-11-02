/*
 * Henry Montego Homes — site configuration.
 * Everything the owner may need to change without touching the layout lives here.
 */
window.HM_CONFIG = {
  // Where enquiries are delivered when the form falls back to the visitor's own email / WhatsApp.
  leadEmail: "info@henrymontegohomes.com",
  leadPhone: "09025441368",
  whatsappNumber: "2349025441368", // international format, digits only

  // Name used in enquiry messages.
  development: "Oniru Twin Towers (Montego Skyline II)",

  // Enquiry form endpoint. Set to a URL that accepts a JSON POST (Formspree, a CRM webhook,
  // your own API, a Zapier/Make hook ...). While empty, no submission is faked: after validation
  // the visitor is offered a pre-filled email or WhatsApp message to send instead.
  formEndpoint: "",

  // Existing Tally "register interest" form. When set, every [data-register-interest] link opens it.
  // While empty those links fall back to the enquiry form.
  registerInterestUrl: ""
};
